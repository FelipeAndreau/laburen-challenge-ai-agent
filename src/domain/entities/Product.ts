/**
 * Product entity representing items in the store catalog.
 * Fields match the products.xlsx structure.
 */
export interface Product {
    id: string;
    tipo_prenda: string;
    talla: string;
    color: string;
    cantidad_disponible: number;
    precio_50_u: number;
    precio_100_u: number;
    precio_200_u: number;
    disponible: boolean;
    categoria: string;
    descripcion: string;
}
