import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Container } from "../../di/container";

/**
 * Registers the tool for adding or updating products in a cart.
 */
export function registerAddProductsToCartTool(server: McpServer, container: Container) {
    server.registerTool(
        "add_products_to_cart",
        {
            description: "Agrega un producto al carrito o actualiza su cantidad. Solo para agregar/incrementar.",
            inputSchema: {
                cart_id: z.string().describe(
                    "ID del carrito al que se desea agregar el producto."
                ),
                product_id: z.string().describe(
                    "ID del producto a agregar o actualizar en el carrito."
                ),
                qty: z.number().int().min(1).describe(
                    "Cantidad a establecer para el producto. Debe ser minimo 50."
                ),
            },
        },
        async ({ cart_id, product_id, qty }) => {
            const cart = await container.addToCart.execute(cart_id, product_id, qty);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "Producto agregado/actualizado en el carrito.",
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
