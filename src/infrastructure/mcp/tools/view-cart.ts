import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Container } from "../../di/container";

export function registerViewCartTool(server: McpServer, container: Container) {
    server.registerTool(
        "view_cart",
        {
            description: "Consulta el contenido y estado de un carrito de compras existente.",
            inputSchema: {
                cart_id: z.string().describe(
                    "ID del carrito a consultar."
                ),
            },
        },
        async ({ cart_id }) => {
            const cart = await container.viewCart.execute(cart_id);

            if (!cart) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: "Carrito no encontrado.",
                        }),
                    }],
                };
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        cart: {
                            id: cart.id,
                            items: cart.items,
                            created_at: cart.created_at,
                            updated_at: cart.updated_at,
                        },
                    }),
                }],
            };
        }
    );
}
