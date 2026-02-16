import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Container } from "../../di/container";

/**
 * Parsea el conversation_id compuesto de Laburen.
 * Formato: "chatwoot_<laburen_id>_<chatwoot_conv_id>_<account_id>_<inbox_id>"
 * Ejemplo: "chatwoot_cmlo1t09p2iu7bre2f363spil_145_162_11"
 * Retorna { chatwootConvId: "145", accountId: "162" } o null si no matchea.
 */
function parseChatwootConversationId(rawId: string): { chatwootConvId: string; accountId: string } | null {
    const parts = rawId.split("_");
    // Formato esperado: chatwoot _ laburenId _ convId _ accountId _ inboxId
    if (parts.length >= 4 && parts[0] === "chatwoot") {
        const chatwootConvId = parts[parts.length - 3];
        const accountId = parts[parts.length - 2];
        if (/^\d+$/.test(chatwootConvId) && /^\d+$/.test(accountId)) {
            return { chatwootConvId, accountId };
        }
    }
    // Si ya es numérico, usarlo directo
    if (/^\d+$/.test(rawId)) {
        return { chatwootConvId: rawId, accountId: "162" };
    }
    return null;
}

export function registerHumanHandoffTool(server: McpServer, container: Container) {
    server.registerTool(
        "request_human_handoff",
        {
            description: "Solicita la intervención de un agente humano. Usar cuando el usuario pida hablar con algun superior, o este enojado. Es la ultima opcion a utilizar, no utilizarla por no haber encontrado algun producto",
            inputSchema: {
                conversation_id: z.string().describe("ID de la conversación (se obtiene del contexto)."),
                reason: z.string().describe("Motivo breve de la derivación (ej: 'cliente enojado', 'consulta compleja', 'solicitud explícita')."),
                summary: z.string().describe("Resumen de lo que el cliente necesita para que el humano tenga contexto.")
            },
        },
        async ({ conversation_id, reason, summary }) => {
            console.log("--- MCP TOOL: request_human_handoff ---");
            console.log("Arguments:", { conversation_id, reason, summary });

            const { apiUrl, apiToken } = container.chatwootConfig;

            if (!apiUrl || !apiToken) {
                console.warn("Chatwoot credentials not configured.");
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            message: "Error de configuración: Faltan credenciales de Chatwoot. Por favor contactar a soporte."
                        })
                    }]
                };
            }

            // Parsear el conversation_id compuesto de Laburen
            const parsed = parseChatwootConversationId(conversation_id);
            if (!parsed) {
                console.error("Could not parse conversation_id:", conversation_id);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            message: "No se pudo identificar la conversación de Chatwoot. Un agente humano te atenderá en breve."
                        })
                    }]
                };
            }

            const { chatwootConvId, accountId } = parsed;
            console.log(`Parsed: chatwootConvId=${chatwootConvId}, accountId=${accountId}`);

            try {
                // Agregar label "human-assistance" a la conversación
                const url = `${apiUrl}/api/v1/accounts/${accountId}/conversations/${chatwootConvId}/labels`;
                console.log("Adding label to:", url);

                const labelResponse = await fetch(url, {
                    method: "POST",
                    headers: {
                        "api_access_token": apiToken,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        labels: ["human-assistance"]
                    })
                });

                if (!labelResponse.ok) {
                    const errorText = await labelResponse.text();
                    console.error("Failed to add label:", errorText);
                    return {
                        content: [{
                            type: "text",
                            text: JSON.stringify({
                                success: false,
                                message: "No se pudo etiquetar la conversación, pero un agente humano te atenderá en breve."
                            })
                        }]
                    };
                }

                console.log("Label added successfully");
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: "Derivación solicitada correctamente. Un agente humano revisará la conversación."
                        })
                    }]
                };

            } catch (error: any) {
                console.error("Error in human handoff:", error);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            message: "Hubo un error al procesar la derivación, pero un agente humano te atenderá en breve."
                        })
                    }]
                };
            }
        }
    );
}
