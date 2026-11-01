export interface Product {
  id?: number;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  category: ProductCategory;
  unitOfMeasure: UnitOfMeasure;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductCategory = 'Electronics' | 'Mechanical' | 'Chemical' | 'Textile' | 'Food' | 'Other';

export type UnitOfMeasure = 'PCS' | 'KG' | 'LTR' | 'MTR' | 'SET';

export const PRODUCT_CATEGORIES: ProductCategory[] = ['Electronics', 'Mechanical', 'Chemical', 'Textile', 'Food', 'Other'];

export const UNITS_OF_MEASURE: UnitOfMeasure[] = ['PCS', 'KG', 'LTR', 'MTR', 'SET'];
