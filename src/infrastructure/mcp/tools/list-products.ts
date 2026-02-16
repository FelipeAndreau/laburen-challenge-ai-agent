import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Container } from "../../di/container";

export function registerListProductsTool(server: McpServer, container: Container) {
    server.registerTool(
        "list_products",
        {
            description: "Busca productos del catálogo mayorista. Soporta búsqueda FTS5 y filtros por categoría, talla, color y precio.",
            inputSchema: {
                query: z.string().optional().describe(
                    "Búsqueda flexible FTS5. Se usa para buscar términos que no están en los filtros ENUM (ej: nuevos tipos de prendas, colores nuevos o raros). Usar OR para variantes: '(sudadera OR buzo)'. Si el usuario pide un tipo de prenda o color que NO está en la lista de valores permitidos, ÚSALO AQUÍ. EN SINGULAR"
                ),
                tipo_prenda: z.enum(["Pantalón", "Camiseta", "Falda", "Sudadera", "Chaqueta", "Camisa"]).optional().describe(
                    "Filtrar por tipo de prenda Singular. Solo usar si coincide con uno de estos valores (ej Pantalon == Pantalones/Joggings/Cargo) Si se pide otro tipo usarlo en Query (ej: Pantalon OR Jogging)."
                ),
                categoria: z.enum(["Deportivo", "Casual", "Formal"]).optional().describe(
                    "Filtrar por categoría exacta (Gym=Deportivo)."
                ),
                talla: z.enum(["S", "M", "L", "XL", "XXL"]).optional().describe(
                    "Filtrar por talle. Solo si el usuario lo pide explícitamente (ej: 'necesito en talle L')."
                ),
                color: z.enum([
                    "Verde", "Blanco", "Negro", "Azul", "Rojo", "Amarillo", "Gris"
                ]).optional().describe(
                    "Color exacto. Si el usuario dice 'verdoso' o 'clarito', NO usar este filtro, ponerlo en 'query'."
                ),
                precio_max: z.number().optional().describe(
                    "Precio máximo por unidad (precio_50_u)."
                ),
            },
        },
        async ({ query, tipo_prenda, categoria, talla, color, precio_max }) => {
            console.log("--- MCP TOOL: list_products ---");
            console.log("Arguments received:", JSON.stringify({ query, tipo_prenda, categoria, talla, color, precio_max }));

            const products = await container.listProducts.execute({
                query,
                tipo_prenda,
                categoria,
                talla,
                color,
                precio_max,
            });

            if (products.length === 0) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: "No se encontraron productos con esos criterios.",
                            products: [],
                        }),
                    }],
                };
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        count: products.length,
                        products: products.map(p => ({
                            id: p.id,
                            tipo_prenda: p.tipo_prenda,
                            talla: p.talla,
                            color: p.color,
                            categoria: p.categoria,
                            descripcion: p.descripcion,
                            stock: p.cantidad_disponible,
                            precios: {
                                "50_unidades": p.precio_50_u,
                                "100_unidades": p.precio_100_u,
                                "200_unidades": p.precio_200_u,
                            },
                        })),
                    }),
                }],
            };
        }
    );
}
