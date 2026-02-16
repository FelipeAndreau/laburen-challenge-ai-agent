import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { Cart, CartWithItems, CartItemDetail } from "../../domain/entities/Cart";
import { IDatabase } from "../database/db";

/**
 * D1 implementation of the cart repository.
 */
export class D1CartRepository implements ICartRepository {
    constructor(private db: IDatabase) { }

    async create(conversationId: string): Promise<Cart> {
        // Check if cart already exists for this conversation
        const existing = await this.findByConversationId(conversationId);
        if (existing) {
            return existing;
        }

        // Generate a unique cart ID
        const cartId = crypto.randomUUID();

        // @ts-ignore: D1 types
        const result = await this.db.d1.prepare(`
            INSERT INTO carts (id, conversation_id, created_at, updated_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
            RETURNING *
        `).bind(cartId, conversationId).first();

        return result as unknown as Cart;
    }

    async addToCart(cartId: string, productId: string, qty: number): Promise<CartWithItems> {
        // Update timestamp on cart
        await this.db.d1.prepare(`
            UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).bind(cartId).run();

        // Check if item already exists
        // @ts-ignore: D1 types
        const existing = await this.db.d1.prepare(`
            SELECT id FROM cart_items WHERE cart_id = ? AND product_id = ?
        `).bind(cartId, productId).first();

        if (existing) {
            // Update quantity
            await this.db.d1.prepare(`
                UPDATE cart_items SET qty = ? WHERE cart_id = ? AND product_id = ?
            `).bind(qty, cartId, productId).run();
        } else {
            // Insert new item
            await this.db.d1.prepare(`
                INSERT INTO cart_items (cart_id, product_id, qty) VALUES (?, ?, ?)
            `).bind(cartId, productId, qty).run();
        }

        // Return full cart with items
        return (await this.getCartWithItems(cartId))!;
    }

    async removeFromCart(cartId: string, productId: string): Promise<CartWithItems> {
        // Update timestamp on cart
        await this.db.d1.prepare(`
            UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).bind(cartId).run();

        // Remove item from cart
        await this.db.d1.prepare(`
            DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?
        `).bind(cartId, productId).run();

        // Return full cart with remaining items
        return (await this.getCartWithItems(cartId))!;
    }

    async getCartWithItems(cartId: string): Promise<CartWithItems | null> {
        // Get cart
        // @ts-ignore: D1 types
        const cart = await this.db.d1.prepare(`
            SELECT * FROM carts WHERE id = ?
        `).bind(cartId).first();

        if (!cart) {
            return null;
        }

        // Get items with product details
        // @ts-ignore: D1 types
        const { results: items } = await this.db.d1.prepare(`
            SELECT 
                ci.id,
                ci.product_id,
                ci.qty,
                p.tipo_prenda,
                p.talla,
                p.color,
                p.precio_50_u as precio_unitario,
                (ci.qty * p.precio_50_u) as subtotal
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `).bind(cartId).all();

        return {
            ...(cart as unknown as Cart),
            items: items as unknown as CartItemDetail[],
        };
    }

    async findByConversationId(conversationId: string): Promise<Cart | null> {
        // @ts-ignore: D1 types
        const cart = await this.db.d1.prepare(`
            SELECT * FROM carts WHERE conversation_id = ?
        `).bind(conversationId).first();

        return cart as unknown as Cart | null;
    }
}
