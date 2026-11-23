export type CafeCategory = 'Biji Kopi & Teh' | 'Susu & Sirup' | 'Pastry & Kemasan';

export const CAFE_CATEGORIES: CafeCategory[] = [
  'Biji Kopi & Teh',
  'Susu & Sirup',
  'Pastry & Kemasan',
];

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: CafeCategory;
  stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  price: number;
  supplier: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryPayload {
  sku: string;
  name: string;
  category: CafeCategory;
  stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  price: number;
  supplier: string;
  notes: string;
}

export interface CategoryStat {
  name: CafeCategory;
  itemCount: number;
  totalStock: number;
  fillPercent: number;
  lowCount: number;
}

export interface DashboardData {
  summary: {
    totalItems: number;
    totalStockUnits: number;
    lowStockCount: number;
    totalValue: number;
    healthyPercent: number;
  };
  categories: CategoryStat[];
  lowStockItems: InventoryItem[];
  recentUpdates: InventoryItem[];
}

export type ActiveTab = 'dashboard' | 'inventory' | 'low-stock' | 'settings';

export function getCategoryTheme(category: string) {
  switch (category) {
    case 'Biji Kopi & Teh':
      return {
        cardBg: 'bg-[#6E3580]',
        accentBar: 'bg-[#6E3580]',
        softBadge: 'bg-[#6E3580]/12 text-[#6E3580]',
        dot: 'bg-[#6E3580]',
      };
    case 'Susu & Sirup':
      return {
        cardBg: 'bg-[#86C4CB]',
        accentBar: 'bg-[#86C4CB]',
        softBadge: 'bg-[#86C4CB]/20 text-[#2E7D86]',
        dot: 'bg-[#86C4CB]',
      };
    case 'Pastry & Kemasan':
    default:
      return {
        cardBg: 'bg-[#FA744F]',
        accentBar: 'bg-[#FA744F]',
        softBadge: 'bg-[#FA744F]/15 text-[#D94E2A]',
        dot: 'bg-[#FA744F]',
      };
  }
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}
