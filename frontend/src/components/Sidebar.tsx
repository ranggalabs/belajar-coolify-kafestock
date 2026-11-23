import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  Settings,
  Coffee,
} from 'lucide-react';
import type { ActiveTab } from '../types/inventory';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  lowStockCount: number;
  dbConnected: boolean | null;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  lowStockCount,
  dbConnected,
}: SidebarProps) {
  const navItems: { id: ActiveTab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Daftar Stok', icon: Package },
    { id: 'low-stock', label: 'Stok Menipis', icon: AlertTriangle, badge: lowStockCount },
    { id: 'settings', label: 'Info Server', icon: Settings },
  ];

  return (
    <aside className="relative flex flex-col justify-between w-full lg:w-[230px] shrink-0 bg-white lg:border-r border-[#F1ECE7] px-6 py-7 overflow-hidden">
      {/* Top section */}
      <div className="relative z-10">
        {/* Brand Logo (inspired by Chaart mini-bars logo) */}
        <div className="flex items-center gap-2.5 mb-9">
          <div className="flex items-end gap-[3px] h-5">
            <span className="w-[4px] h-2.5 rounded-full bg-[#FA744F]" />
            <span className="w-[4px] h-4 rounded-full bg-[#86C4CB]" />
            <span className="w-[4px] h-5 rounded-full bg-[#6E3580]" />
          </div>
          <span className="text-[19px] font-extrabold tracking-tight text-[#1A1A2E]">
            KafeStock
          </span>
        </div>

        {/* Profile Avatar Block */}
        <div className="flex flex-col items-center text-center mb-9">
          <div className="relative mb-3">
            <div className="w-18 h-18 rounded-full bg-[#86C4CB]/25 p-1.5 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#6E3580] to-[#FA744F] flex items-center justify-center text-white shadow-sm">
                <Coffee className="w-7 h-7" />
              </div>
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white shadow-sm border border-[#F1ECE7] text-[10px] font-semibold text-[#6E3580] whitespace-nowrap">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  dbConnected === false ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              />
              {dbConnected === false ? 'DB Off' : 'Barista'}
            </span>
          </div>
          <h3 className="mt-2 text-[14px] font-bold text-[#1A1A2E]">Kopi Senja</h3>
          <p className="text-[11px] text-[#9A96A6]">inventory@kopisenja.id</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#F8F4F0] text-[#1A1A2E] font-bold'
                    : 'text-[#8E8A9B] font-medium hover:text-[#1A1A2E] hover:bg-[#FAF7F4]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`w-[17px] h-[17px] ${
                      isActive ? 'text-[#1A1A2E]' : 'text-[#A29EAE]'
                    }`}
                  />
                  <span>{item.label}</span>
                </span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#FA744F]/15 text-[#E1552E]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom decorative wave accent (matching reference bottom-left organic shape) */}
      <div className="hidden lg:block pointer-events-none absolute -bottom-6 -left-6 w-40 h-32 opacity-90">
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="70" cy="110" r="52" fill="#F7ECE3" />
          <path
            d="M0 40C35 55 48 92 92 108C136 124 162 135 178 160H0V40Z"
            fill="url(#waveGrad)"
          />
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="40" x2="150" y2="160" gradientUnits="userSpaceOnUse">
              <stop stopColor="#86C4CB" />
              <stop offset="1" stopColor="#B8DDE2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </aside>
  );
}
