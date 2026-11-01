export interface PurchaseOrder {
  id?: number;
  poNumber: string;
  supplier: {
    id: number;
    name: string;
    contactPerson?: string;
    email?: string;
  };
  manufacturingOrder?: {
    id: number;
    orderNumber: string;
  };
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderItem {
  id?: number;
  rawMaterial: {
    id: number;
    name: string;
    unitOfMeasure?: string;
  };
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'ACKNOWLEDGED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export const PO_STATUSES: PurchaseOrderStatus[] = ['DRAFT', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'];
