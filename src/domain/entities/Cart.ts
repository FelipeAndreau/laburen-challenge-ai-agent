/**
 * Shopping cart entity linked to a Chatwoot conversation.
 */
export interface Cart {
    id: string;
    conversation_id: string;
    created_at: string;
    updated_at: string;
}

/**
 * Cart item linking a product to a cart with quantity.
 */
export interface CartItem {
    id: number;
    cart_id: string;
    product_id: string;
    qty: number;
}

/**
 * Full cart with all items and their details.
 */
export interface CartWithItems extends Cart {
    items: CartItemDetail[];
}

/**
 * Detailed cart item including product info for display.
 */
export interface CartItemDetail {
    id: number;
    product_id: string;
    qty: number;
    tipo_prenda: string;
    talla: string;
    color: string;
    precio_unitario: number;
    subtotal: number;
}
