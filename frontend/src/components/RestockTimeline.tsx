import { Bell, RefreshCw, PlusCircle } from 'lucide-react';
import { getCategoryTheme, type InventoryItem } from '../types/inventory';

interface RestockTimelineProps {
  lowStockItems: InventoryItem[];
  recentUpdates: InventoryItem[];
  onQuickRestock: (item: InventoryItem) => void;
  onRefresh: () => void;
  busyId: number | null;
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

export function RestockTimeline({
  lowStockItems,
  recentUpdates,
  onQuickRestock,
  onRefresh,
  busyId,
}: RestockTimelineProps) {
  return (
    <aside className="w-full xl:w-[300px] shrink-0 bg-[#FDF5EF] px-6 py-7 flex flex-col justify-between border-t xl:border-t-0 xl:border-l border-[#F4E9DF]">
      <div>
        {/* Header (matching "Calendar" + bell button in reference) */}
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-[18px] font-bold text-[#1A1A2E]">Jadwal Restock</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              title="Muat ulang data"
              className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="relative w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#1A1A2E]">
              <Bell className="w-4 h-4" />
              {lowStockItems.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FA744F]" />
              )}
            </div>
          </div>
        </div>

        {/* Section 1: Prioritas Restock (Low stock alerts) */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11.5px] font-semibold text-[#9B93A0]">
              Prioritas Hari Ini
            </span>
            <span className="text-[11px] font-bold text-[#FA744F]">
              {lowStockItems.length} item
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="rounded-xl bg-white/75 p-3.5 text-[12px] text-[#7D788A]">
              Semua stok dalam kondisi aman. Tidak ada item yang menipis!
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockItems.slice(0, 4).map((item) => {
                const theme = getCategoryTheme(item.category);
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-12 shrink-0 text-[12px] font-extrabold text-[#1A1A2E] pt-0.5">
                      {item.stock} {item.unit}
                    </div>
                    <span
                      className={`w-[3px] self-stretch rounded-full shrink-0 ${theme.accentBar}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-[#9A93A1] truncate">
                        {item.category} • Min {item.min_stock}
                      </p>
                      <p className="text-[13px] font-bold text-[#1A1A2E] truncate">
                        {item.name}
                      </p>
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => onQuickRestock(item)}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#6E3580] hover:text-[#FA744F] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <PlusCircle className="w-3 h-3" />
                        Restock +10 {item.unit}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Aktivitas Update Terbaru */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11.5px] font-semibold text-[#9B93A0]">
              Pembaruan Terbaru
            </span>
            <span className="text-[#9B93A0] text-xs">•••</span>
          </div>

          <div className="space-y-4">
            {recentUpdates.slice(0, 5).map((item) => {
              const theme = getCategoryTheme(item.category);
              return (
                <div key={`recent-${item.id}`} className="flex items-start gap-3">
                  <div className="w-12 shrink-0 text-[12px] font-bold text-[#1A1A2E] pt-0.5">
                    {formatTime(item.updated_at)}
                  </div>
                  <span
                    className={`w-[3px] self-stretch rounded-full shrink-0 ${theme.accentBar}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-[#9A93A1] truncate">
                      {item.sku} • {item.supplier || 'Supplier Umum'}
                    </p>
                    <p className="text-[13px] font-bold text-[#1A1A2E] truncate">
                      {item.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Coolify badge footer */}
      <div className="mt-8 pt-4 border-t border-[#EFE3D8] text-[11px] text-[#9B93A0] flex items-center justify-between">
        <span>PostgreSQL + Express</span>
        <span className="font-semibold text-[#6E3580]">Coolify Ready</span>
      </div>
    </aside>
  );
}
