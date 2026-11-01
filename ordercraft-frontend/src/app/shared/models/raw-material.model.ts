export interface RawMaterial {
  id?: number;
  sku: string;
  name: string;
  description: string;
  unitOfMeasure: string;
  unitCost: number;
  unitPrice: number;
  currentStock: number;
  reorderLevel: number;
  supplier?: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
