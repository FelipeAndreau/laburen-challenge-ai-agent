import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { CartWithItems } from "../../domain/entities/Cart";

/**
 * Use case for adding or updating items in a cart.
 */
export class AddToCart {
    constructor(private cartRepository: ICartRepository) { }

    /**
     * Add or update a product in the cart.
     * qty must be >= 1. For removal, use RemoveFromCart.
     * Returns the full cart with all items.
     */
    async execute(cartId: string, productId: string, qty: number): Promise<CartWithItems> {
        return this.cartRepository.addToCart(cartId, productId, qty);
    }
}
