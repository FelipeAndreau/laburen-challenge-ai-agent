import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { Product } from "../../domain/entities/Product";

export class GetProductDetails {
    constructor(private productRepository: IProductRepository) { }

    async execute(id: string): Promise<Product | null> {
        return this.productRepository.findById(id);
    }
}
