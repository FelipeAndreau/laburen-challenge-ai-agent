import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { Cart } from "../../domain/entities/Cart";

/**
 * Use case for creating a shopping cart linked to a conversation.
 */
export class CreateCart {
    constructor(private cartRepository: ICartRepository) { }

    /**
     * Create a new cart for the given conversation ID.
     * Returns existing cart if one already exists.
     */
    async execute(conversationId: string): Promise<Cart> {
        return this.cartRepository.create(conversationId);
    }
}
