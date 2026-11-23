import { Plus, TrendingUp } from 'lucide-react';
import { formatRupiah, type DashboardData } from '../types/inventory';

interface StatsPanelProps {
  summary: DashboardData['summary'];
  onQuickAdd: () => void;
}

export function StatsPanel({ summary, onQuickAdd }: StatsPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-[16px] font-bold text-[#1A1A2E]">Statistik</h3>

      {/* 3 compact tiles (matching 28h / 18 / + New widget from reference) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#F7F5F4] p-4 flex flex-col justify-between min-h-[104px]">
          <span className="text-[20px] font-extrabold text-[#1A1A2E] leading-none">
            {summary.totalItems}
          </span>
          <span className="text-[11px] font-medium text-[#8E8A9B] leading-tight mt-3">
            Total SKU
            <br />
            terdaftar
          </span>
        </div>

        <div className="rounded-2xl bg-[#F7F5F4] p-4 flex flex-col justify-between min-h-[104px]">
          <span
            className={`text-[20px] font-extrabold leading-none ${
              summary.lowStockCount > 0 ? 'text-[#FA744F]' : 'text-[#1A1A2E]'
            }`}
          >
            {summary.lowStockCount}
          </span>
          <span className="text-[11px] font-medium text-[#8E8A9B] leading-tight mt-3">
            Perlu
            <br />
            restock
          </span>
        </div>

        <button
          type="button"
          onClick={onQuickAdd}
          className="rounded-2xl border border-dashed border-[#D7CFC7] bg-white hover:bg-[#FAF6F2] p-4 flex flex-col items-center justify-center gap-2 min-h-[104px] transition-colors cursor-pointer group"
        >
          <span className="w-7 h-7 rounded-full bg-[#4A225A] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plus className="w-4 h-4" />
          </span>
          <span className="text-[11px] font-semibold text-[#6F6A7C] text-center leading-tight">
            Tambah
            <br />
            item
          </span>
        </button>
      </div>

      {/* Valuation Highlight Card (inspired by the Pro Plan card in reference) */}
      <div className="relative rounded-2xl bg-white p-5 shadow-[0_8px_28px_-10px_rgba(26,26,46,0.1)] border border-[#F4EFEA] overflow-hidden">
        <div className="relative z-10 max-w-[68%]">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6E3580] bg-[#6E3580]/10 px-2.5 py-0.5 rounded-full mb-2">
            <TrendingUp className="w-3 h-3" />
            {summary.healthyPercent}% Stok Sehat
          </div>
          <div className="text-[20px] font-extrabold text-[#1A1A2E] tracking-tight">
            {formatRupiah(summary.totalValue)}
          </div>
          <p className="text-[12px] font-bold text-[#1A1A2E] mt-1">
            Estimasi Nilai Aset
          </p>
          <p className="text-[11px] text-[#8E8A9B] mt-0.5 leading-relaxed">
            Total {summary.totalStockUnits.toLocaleString('id-ID')} unit bahan baku aktif di gudang kafe.
          </p>
        </div>

        {/* Clean geometric cafe illustration on right side */}
        <div className="pointer-events-none absolute right-2 bottom-0 w-28 h-28 opacity-95">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="76" cy="48" r="34" fill="#86C4CB" fillOpacity="0.28" />
            <rect x="40" y="54" width="44" height="42" rx="10" fill="#FA744F" />
            <path
              d="M84 62H92C96.4 62 100 65.6 100 70V74C100 78.4 96.4 82 92 82H84"
              stroke="#6E3580"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <rect x="34" y="96" width="56" height="8" rx="4" fill="#181828" />
            <path
              d="M52 44C52 38 57 38 57 32M64 44C64 38 69 38 69 32"
              stroke="#6E3580"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
