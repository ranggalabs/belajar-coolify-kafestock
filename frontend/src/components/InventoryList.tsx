import { Minus, Plus, Pencil, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  formatRupiah,
  getCategoryTheme,
  type InventoryItem,
} from '../types/inventory';

interface InventoryListProps {
  items: InventoryItem[];
  compact?: boolean;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem, delta: number) => void;
  busyId: number | null;
}

export function InventoryList({
  items,
  compact = false,
  onEdit,
  onDelete,
  onAdjustStock,
  busyId,
}: InventoryListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E2D9D0] bg-[#FAF8F6] p-8 text-center">
        <p className="text-[14px] font-semibold text-[#1A1A2E]">
          Belum ada item yang cocok
        </p>
        <p className="text-[12px] text-[#8E8A9B] mt-1">
          Coba ubah filter pencarian atau tambahkan item inventaris baru.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const theme = getCategoryTheme(item.category);
        const isLow = item.stock <= item.min_stock;
        const isBusy = busyId === item.id;

        return (
          <div
            key={item.id}
            className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-[0_6px_24px_-8px_rgba(26,26,46,0.08)] border border-[#F5F0EB] hover:border-[#E7DDD3] transition-all overflow-hidden"
          >
            {/* Left vertical colored accent bar (exact signature from reference) */}
            <span
              className={`absolute left-0 top-3 bottom-3 w-[4px] rounded-r-full ${theme.accentBar}`}
            />

            {/* Main Item Info */}
            <div className="pl-2.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-[14px] font-bold text-[#1A1A2E] truncate">
                  {item.name}
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F6F2EE] text-[#7D788A]">
                  {item.sku}
                </span>
                {isLow ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FA744F]/15 text-[#D94E2A]">
                    <AlertCircle className="w-3 h-3" />
                    Menipis
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" />
                    Aman
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap mt-1 text-[11.5px] text-[#8E8A9B]">
                <span>{item.category}</span>
                {!compact && item.supplier && (
                  <>
                    <span>•</span>
                    <span>{item.supplier}</span>
                  </>
                )}
                <span>•</span>
                <span className="font-semibold text-[#5E5A6B]">
                  {formatRupiah(item.price)}/{item.unit}
                </span>
              </div>
            </div>

            {/* Right controls: Stock stepper + CRUD actions */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5 pl-2.5 sm:pl-0">
              {/* Quick stock +/- stepper */}
              <div className="inline-flex items-center gap-1.5 bg-[#F8F5F2] rounded-xl p-1">
                <button
                  type="button"
                  disabled={isBusy || item.stock <= 0}
                  onClick={() => onAdjustStock(item, -1)}
                  title="Kurangi 1 stok"
                  className="w-6 h-6 rounded-lg bg-white text-[#1A1A2E] flex items-center justify-center shadow-2xs hover:bg-[#1A1A2E] hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="min-w-[54px] text-center text-[12px] font-bold text-[#1A1A2E]">
                  {item.stock}{' '}
                  <span className="text-[10.5px] font-medium text-[#8E8A9B]">
                    {item.unit}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onAdjustStock(item, 1)}
                  title="Tambah 1 stok"
                  className="w-6 h-6 rounded-lg bg-white text-[#1A1A2E] flex items-center justify-center shadow-2xs hover:bg-[#1A1A2E] hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Edit & Delete */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  title="Edit item"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#7D788A] hover:text-[#6E3580] hover:bg-[#6E3580]/10 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  title="Hapus item"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#7D788A] hover:text-[#E1552E] hover:bg-[#FA744F]/15 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
