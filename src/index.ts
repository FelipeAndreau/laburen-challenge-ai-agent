import { DurableObject } from "cloudflare:workers";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Container } from "./infrastructure/di/container";
import { registerTools } from "./infrastructure/mcp";

// Environment bindings
export interface Env {
    DB: D1Database;
    MCP: DurableObjectNamespace<LaburenMCP>;
    MCP_AUTH_TOKEN?: string;
    CHATWOOT_API_URL?: string;
    CHATWOOT_API_TOKEN?: string;
}

interface Transport {
    send(message: any): Promise<void>;
    start(): Promise<void>;
    close(): Promise<void>;
    onclose?: () => void;
    onerror?: (error: Error) => void;
    onmessage?: (message: any) => void;
}

/**
 * LaburenMCP - Durable Object implementation of MCP Server
 * Complete SSEServerTransport implementation for Cloudflare Workers
 * Supports multiple concurrent sessions by instantiating McpServer per connection.
 */
export class LaburenMCP extends DurableObject {
    private container: Container;
    // Store both transport and server per session to keep them alive
    private sessions = new Map<string, { transport: Transport, server: McpServer }>();

    constructor(state: DurableObjectState, env: Env) {
        super(state, env);

        // Initialize DI Container
        let db = env.DB;
        if (!db) {
            console.warn("[DO] DB binding missing (using mock)");
            const mockResult = { results: [] };
            const mockStmt = {
                bind: () => mockStmt,
                all: async () => mockResult,
                run: async () => ({ success: true })
            };
            db = { prepare: () => mockStmt } as any;
        }

        this.container = new Container(
            { d1: db },
            {
                apiUrl: env.CHATWOOT_API_URL,
                apiToken: env.CHATWOOT_API_TOKEN
            }
        );
    }

    // Helper to create a fresh McpServer instance for a new connection
    private createServer(): McpServer {
        const server = new McpServer({
            name: "laburen-mcp",
            version: "0.2.0",
        });

        registerTools(server, this.container);

        server.tool("ping", {}, async () => ({
            content: [{ type: "text", text: "pong" }]
        }));

        return server;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        // Debug Log
        console.log(`[DO] Request: ${request.method} ${url.pathname}`);

        // Handle SSE Connection
        if (url.pathname === "/sse") {
            return this.handleSSE(request);
        }

        // Handle Client Messages (POST)
        if (url.pathname === "/message" || url.pathname === "/messages") {
            return this.handleMessage(request);
        }

        return new Response("Laburen MCP Agent (Active)", { status: 200 });
    }

    private async handleSSE(request: Request): Promise<Response> {
        const sessionId = crypto.randomUUID();
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();

        // Instantiate a NEW server for this connection
        const server = this.createServer();

        const transport: Transport = {
            send: async (message: any) => {
                try {
                    const data = JSON.stringify(message);
                    await writer.write(encoder.encode(`event: message\ndata: ${data}\n\n`));
                } catch (err) {
                    console.error(`[DO] Session ${sessionId} write error:`, err);
                    // If write fails, we assume connection is dead
                    this.sessions.delete(sessionId);
                }
            },
            start: async () => {
                // Return the POST endpoint with session ID
                const endpoint = `/messages?sessionId=${sessionId}`;
                await writer.write(encoder.encode(`event: endpoint\ndata: ${endpoint}\n\n`));
                console.log(`[DO] Session ${sessionId} started`);
            },
            close: async () => {
                console.log(`[DO] Session ${sessionId} closing transport`);
                await writer.close();
                this.sessions.delete(sessionId);
            },
            // onmessage will be set by server.connect()
        };

        this.sessions.set(sessionId, { transport, server });

        // Connect specific transport instance to server
        // This sets transport.onmessage to the server's handler
        // Do NOT await to avoid deadlock if stream buffer fills before response
        server.connect(transport as any).catch((err: any) => {
            console.error(`[DO] Session ${sessionId} connect error:`, err);
        });

        return new Response(readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }

    private async handleMessage(request: Request): Promise<Response> {
        if (request.method !== "POST") {
            return new Response("Method not allowed", { status: 405 });
        }

        const url = new URL(request.url);
        const sessionId = url.searchParams.get("sessionId");

        if (!sessionId || !this.sessions.has(sessionId)) {
            console.warn(`[DO] Session not found: ${sessionId}`);
            return new Response("Session not found", { status: 404 });
        }

        const { transport } = this.sessions.get(sessionId)!;

        try {
            const message = await request.json();
            // Pass the message to the transport's onmessage handler (which calls server.receive)
            if (transport.onmessage) {
                transport.onmessage(message);
            }
            return new Response("Accepted", {
                status: 202,
                headers: { "Access-Control-Allow-Origin": "*" }
            });
        } catch (err) {
            console.error(`[DO] Error processing message for session ${sessionId}:`, err);
            return new Response("Bad Request", { status: 400 });
        }
    }
}

// Worker Entrypoint
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url);

        // CORS Handling
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "*"
                }
            });
        }

        // Authentication (Bearer Token)
        // Only enforced if MCP_AUTH_TOKEN is configured in environment/secrets
        if (env.MCP_AUTH_TOKEN) {
            const authHeader = request.headers.get("Authorization");

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return new Response("Unauthorized: Missing Bearer token", { status: 401 });
            }

            const token = authHeader.split(" ")[1];

            // Constant-time comparison desirable normally, but string match is fine here for now
            if (token !== env.MCP_AUTH_TOKEN) {
                return new Response("Unauthorized: Invalid token", { status: 401 });
            }
        }

        // Delegate to Durable Object
        const id = env.MCP.idFromName("singleton");
        const stub = env.MCP.get(id);

        return stub.fetch(request);
    },
};
