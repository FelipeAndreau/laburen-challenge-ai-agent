import { IProductRepository, ProductFilters } from "../../domain/repositories/IProductRepository";
import { Product } from "../../domain/entities/Product";

/**
 * Use case for listing/searching products.
 */
export class ListProducts {
    constructor(private productRepository: IProductRepository) { }

    /**
     * Execute product search with optional filters.
     * The agent should expand synonyms in filters.query before calling.
     */
    async execute(filters: ProductFilters = {}): Promise<Product[]> {
        return this.productRepository.search(filters);
    }
}
