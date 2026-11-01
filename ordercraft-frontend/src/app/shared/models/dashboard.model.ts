export interface DashboardStats {
  totalOrders: number;
  ordersByStatus: { [key: string]: number };
  revenueThisMonth: number;
  pendingPurchaseOrders: number;
  overdueInvoices: number;
  monthlyRevenue: MonthlyRevenue[];
  recentOrders: any[];
  lowStockMaterials: any[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}
