import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Container } from "../../di/container";

export function registerCreateCartTool(server: McpServer, container: Container) {
    server.registerTool(
        "create_cart",
        {
            description: "Crea un nuevo carrito de compras para una conversación específica.",
            inputSchema: {
                conversation_id: z.string().describe(
                    "ID de la conversación de Chatwoot para vincular el carrito."
                ),
            },
        },
        async ({ conversation_id }) => {
            const cart = await container.createCart.execute(conversation_id);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "Carrito creado exitosamente.",
                        cart: {
                            id: cart.id,
                            conversation_id: cart.conversation_id,
                            created_at: cart.created_at,
                        },
                    }),
                }],
            };
        }
    );
}
