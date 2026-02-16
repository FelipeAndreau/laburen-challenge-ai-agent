import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { CartWithItems } from "../../domain/entities/Cart";

/**
 * Use case for viewing cart contents.
 */
export class ViewCart {
    constructor(private cartRepository: ICartRepository) { }

    /**
     * Get the full cart with all items and product details.
     */
    async execute(cartId: string): Promise<CartWithItems | null> {
        return this.cartRepository.getCartWithItems(cartId);
    }
}
