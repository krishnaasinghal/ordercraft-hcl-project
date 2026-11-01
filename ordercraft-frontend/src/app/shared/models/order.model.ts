export interface ManufacturingOrder {
  id?: number;
  orderNumber: string;
  customer: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    gstNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  status: OrderStatus;
  priority: OrderPriority;
  orderDate: string;
  dueDate: string;
  completedDate?: string;
  notes: string;
  items: OrderItem[];
  totalAmount: number;
  purchaseOrders?: any[];
  invoice?: any;
  statusHistory?: StatusHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id?: number;
  product: {
    id: number;
    name: string;
    sku?: string;
    unitPrice?: number;
  };
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface StatusHistoryEntry {
  id?: number;
  fromStatus: string;
  toStatus: string;
  changedAt: string;
  changedBy: string;
  notes: string;
}

export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'IN_PRODUCTION' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';

export type OrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const ORDER_STATUSES: OrderStatus[] = ['DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'COMPLETED', 'DELIVERED', 'CANCELLED'];

export const ORDER_PRIORITIES: OrderPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
