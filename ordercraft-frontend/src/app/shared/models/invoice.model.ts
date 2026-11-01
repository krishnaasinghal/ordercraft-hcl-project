export interface Invoice {
  id?: number;
  invoiceNumber: string;
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
    country?: string;
  };
  manufacturingOrder: {
    id: number;
    orderNumber: string;
  };
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  payments?: any[];
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';

export const INVOICE_STATUSES: InvoiceStatus[] = ['DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED'];
