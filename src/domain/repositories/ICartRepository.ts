import { Cart, CartWithItems } from "../entities/Cart";

export interface ICartRepository {
    /**
     * Create a new cart for a conversation.
     * Returns existing cart if one already exists for this conversation.
     */
    create(conversationId: string): Promise<Cart>;

    /**
     * Add or update a product in the cart.
     * qty must be >= 1.
     * Returns the full cart with all items.
     */
    addToCart(cartId: string, productId: string, qty: number): Promise<CartWithItems>;

    /**
     * Remove a product from the cart entirely.
     * Returns the full cart with remaining items.
     */
    removeFromCart(cartId: string, productId: string): Promise<CartWithItems>;

    /**
     * Get cart with all items and product details.
     */
    getCartWithItems(cartId: string): Promise<CartWithItems | null>;

    /**
     * Find cart by conversation ID.
     */
    findByConversationId(conversationId: string): Promise<Cart | null>;
}
