import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Container } from "../../di/container";

/**
 * Registers the tool for removing a product from a cart.
 */
export function registerDeleteProductFromCartTool(server: McpServer, container: Container) {
    server.registerTool(
        "delete_product_from_cart",
        {
            description: "Elimina un producto del carrito de compras.",
            inputSchema: {
                cart_id: z.string().describe(
                    "ID del carrito del cual se desea eliminar el producto."
                ),
                product_id: z.string().describe(
                    "ID del producto a eliminar del carrito."
                ),
            },
        },
        async ({ cart_id, product_id }) => {
            const cart = await container.removeFromCart.execute(cart_id, product_id);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "Producto eliminado del carrito.",
                        cart: {
                            id: cart.id,
                            items: cart.items,
                            updated_at: cart.updated_at,
                        },
                    }),
                }],
            };
        }
    );
}
