import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Container } from "../di/container";
import { registerListProductsTool } from "./tools/list-products";
import { registerCreateCartTool } from "./tools/create-cart";
import { registerAddProductsToCartTool } from "./tools/add-products-to-cart";
import { registerDeleteProductFromCartTool } from "./tools/delete-product-from-cart";
import { registerViewCartTool } from "./tools/view-cart";
import { registerHumanHandoffTool } from "./tools/human-handoff";

/**
 * Register all MCP tools with the server by importing them from the tools directory.
 */
export function registerTools(server: McpServer, container: Container): void {
    registerListProductsTool(server, container);
    registerCreateCartTool(server, container);
    registerAddProductsToCartTool(server, container);
    registerDeleteProductFromCartTool(server, container);
    registerViewCartTool(server, container);
    registerHumanHandoffTool(server, container);
}
