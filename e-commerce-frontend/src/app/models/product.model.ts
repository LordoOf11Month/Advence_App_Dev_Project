export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    inStock: boolean;
    stockQuantity: number;
    createdAt: string;
    updatedAt: string;
    freeShipping: boolean;
    fastDelivery: boolean;
    storeId: number;
    storeName: string;
    sellerId: number;
    sellerName: string;
    images: string[];
} 