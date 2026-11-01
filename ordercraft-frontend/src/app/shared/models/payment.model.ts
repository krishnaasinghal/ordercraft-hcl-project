export interface Payment {
  id?: number;
  invoice: {
    id: number;
    invoiceNumber: string;
    customer?: {
      id: number;
      name: string;
    };
    balance?: number;
    totalAmount?: number;
  };
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber: string;
  status: PaymentStatus;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD'];

export const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
