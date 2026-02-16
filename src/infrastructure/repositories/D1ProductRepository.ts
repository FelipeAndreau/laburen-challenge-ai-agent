import { IProductRepository, ProductFilters } from "../../domain/repositories/IProductRepository";
import { Product } from "../../domain/entities/Product";
import { IDatabase } from "../database/db";

/**
 * D1 implementation of the product repository.
 * Uses FTS5 for full-text search with BM25 ranking.
 */
export class D1ProductRepository implements IProductRepository {
    constructor(private db: IDatabase) { }

    /**
     * Search products using FTS5 full-text search.
     * Supports multi-term queries like "camiseta OR remera".
     */
    async search(filters: ProductFilters): Promise<Product[]> {
        const conditions: string[] = ["p.disponible = 1"];
        const params: (string | number)[] = [];
        let usesFts = false;

        // Build FTS5 query if search terms provided
        if (filters.query && filters.query.trim()) {
            const rawQuery = filters.query.trim();
            // Basic sanitization: escape double quotes if needed, 
            // but we trust the Agent to form valid FTS5 queries (e.g. using OR, AND/space, parens).
            // D1/SQLite usually handles these safely as bind params, but we ensure broad matching.

            // We pass the raw query directly to MATCH.
            // Expected Agent output: "(pantalon OR jean) AND (negro OR black)"
            // Use table name directly for MATCH to avoid alias issues
            conditions.push("products_fts MATCH ?");
            params.push(rawQuery);
            usesFts = true;
        }

        // Structured filters
        if (filters.categoria) {
            conditions.push("p.categoria = ?");
            params.push(filters.categoria);
        }
        if (filters.tipo_prenda) {
            conditions.push("p.tipo_prenda = ?");
            params.push(filters.tipo_prenda);
        }
        if (filters.talla) {
            conditions.push("p.talla = ?");
            params.push(filters.talla);
        }
        if (filters.color) {
            conditions.push("p.color = ?");
            params.push(filters.color);
        }
        if (filters.precio_max !== undefined) {
            conditions.push("p.precio_50_u <= ?");
            params.push(filters.precio_max);
        }

        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        // Use FTS5 join and BM25 ranking when searching, otherwise simple query
        const queryStr = usesFts
            ? `
                SELECT p.* FROM products p
                JOIN products_fts ON p.rowid = products_fts.rowid
                ${whereClause}
                ORDER BY bm25(products_fts)
                LIMIT 10
            `
            : `
                SELECT * FROM products p
                ${whereClause}
                LIMIT 10
            `;

        console.log("--- D1ProductRepository Search Debug ---");
        console.log("Filters:", JSON.stringify(filters));
        console.log("SQL Query:", queryStr);
        console.log("Params:", JSON.stringify(params));
        console.log("----------------------------------------");

        const stmt = this.db.d1.prepare(queryStr);
        const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;

        // @ts-ignore: D1 types
        const { results } = await boundStmt.all();
        console.log(`Found ${results.length} products.`);
        return results as unknown as Product[];
    }

    async findById(id: string): Promise<Product | null> {
        // @ts-ignore: D1 types
        const product = await this.db.d1
            .prepare("SELECT * FROM products WHERE id = ?")
            .bind(id)
            .first();
        return product as unknown as Product | null;
    }
}
