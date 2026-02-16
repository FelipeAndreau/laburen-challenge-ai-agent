import { IDatabase } from "../database/db";
import { D1ProductRepository } from "../repositories/D1ProductRepository";
import { D1CartRepository } from "../repositories/D1CartRepository";
import { ListProducts } from "../../application/usecases/ListProducts";
import { GetProductDetails } from "../../application/usecases/GetProductDetails";
import { CreateCart } from "../../application/usecases/CreateCart";
import { AddToCart } from "../../application/usecases/AddToCart";
import { RemoveFromCart } from "../../application/usecases/RemoveFromCart";
import { ViewCart } from "../../application/usecases/ViewCart";

export class Container {
    public readonly listProducts: ListProducts;
    public readonly getProductDetails: GetProductDetails;
    public readonly createCart: CreateCart;
    public readonly addToCart: AddToCart;
    public readonly removeFromCart: RemoveFromCart;
    public readonly viewCart: ViewCart;

    public readonly chatwootConfig: { apiUrl?: string; apiToken?: string };

    constructor(db: IDatabase, chatwootConfig: { apiUrl?: string; apiToken?: string } = {}) {
        const productRepository = new D1ProductRepository(db);
        const cartRepository = new D1CartRepository(db);

        this.chatwootConfig = chatwootConfig;

        this.listProducts = new ListProducts(productRepository);
        this.getProductDetails = new GetProductDetails(productRepository);
        this.createCart = new CreateCart(cartRepository);
        this.addToCart = new AddToCart(cartRepository);
        this.removeFromCart = new RemoveFromCart(cartRepository);
        this.viewCart = new ViewCart(cartRepository);
    }
}
