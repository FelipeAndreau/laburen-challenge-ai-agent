import { Product } from "../entities/Product";

/**
 * Filters for product search queries.
 * The agent provides synonyms in `query` for FTS5 multi-term search.
 */
export interface ProductFilters {
    /** 
     * Search terms separated by space for FTS5.
     * The agent should expand synonyms before calling.
     * Example: "camiseta remera polera" for a t-shirt search.
     */
    query?: string;
    categoria?: string;
    tipo_prenda?: string;
    talla?: string;
    color?: string;
    precio_max?: number;
}

export interface IProductRepository {
    /**
     * Search products using FTS5 full-text search with optional filters.
     * Results are ordered by relevance (BM25 ranking).
     */
    search(filters: ProductFilters): Promise<Product[]>;

    /**
     * Find a single product by its ID.
     */
    findById(id: string): Promise<Product | null>;
}
