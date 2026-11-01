export interface BillOfMaterial {
  id?: number;
  product: {
    id: number;
    name: string;
    sku?: string;
  };
  version: string;
  status: BomStatus;
  effectiveDate: string;
  notes: string;
  items: BomItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BomItem {
  id?: number;
  rawMaterial: {
    id: number;
    name: string;
    unitOfMeasure?: string;
  };
  quantityRequired: number;
  unitOfMeasure: string;
  scrapFactor: number;
}

export type BomStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
