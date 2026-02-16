import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { CartWithItems } from "../../domain/entities/Cart";

/**
 * Use case for removing a product from a cart.
 */
export class RemoveFromCart {
    constructor(private cartRepository: ICartRepository) { }

    /**
     * Remove a product from the cart entirely.
     * Returns the full cart with remaining items.
     */
    async execute(cartId: string, productId: string): Promise<CartWithItems> {
        return this.cartRepository.removeFromCart(cartId, productId);
    }
}
