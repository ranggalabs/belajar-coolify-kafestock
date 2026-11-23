import { useCallback, useEffect, useState } from 'react';
import { Search, Plus, Database, Server, CheckCircle2, XCircle } from 'lucide-react';
import { inventoryApi } from './services/api';
import type {
  ActiveTab,
  DashboardData,
  InventoryItem,
  InventoryPayload,
} from './types/inventory';
import { Sidebar } from './components/Sidebar';
import { CategoryCards } from './components/CategoryCards';
import { InventoryList } from './components/InventoryList';
import { StatsPanel } from './components/StatsPanel';
import { RestockTimeline } from './components/RestockTimeline';
import { ItemModal } from './components/ItemModal';

const EMPTY_DASHBOARD: DashboardData = {
  summary: {
    totalItems: 0,
    totalStockUnits: 0,
    lowStockCount: 0,
    totalValue: 0,
    healthyPercent: 100,
  },
  categories: [
    { name: 'Biji Kopi & Teh', itemCount: 0, totalStock: 0, fillPercent: 0, lowCount: 0 },
    { name: 'Susu & Sirup', itemCount: 0, totalStock: 0, fillPercent: 0, lowCount: 0 },
    { name: 'Pastry & Kemasan', itemCount: 0, totalStock: 0, fillPercent: 0, lowCount: 0 },
  ],
  lowStockItems: [],
  recentUpdates: [],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [dashboard, setDashboard] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [healthTimestamp, setHealthTimestamp] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const loadAll = useCallback(async () => {
    try {
      setError('');
      const [healthRes, dashRes, listRes] = await Promise.all([
        inventoryApi.health().catch(() => null),
        inventoryApi.getDashboard(),
        inventoryApi.list({
          search: search.trim() || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status: activeTab === 'low-stock' ? 'low' : undefined,
        }),
      ]);
      setDbConnected(healthRes?.database === 'connected');
      if (healthRes?.timestamp) setHealthTimestamp(healthRes.timestamp);
      setDashboard(dashRes);
      setItems(listRes);
    } catch (err) {
      setDbConnected(false);
      setError(
        err instanceof Error
          ? err.message
          : 'Tidak dapat terhubung ke server API. Pastikan backend dan PostgreSQL aktif.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, activeTab]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleSaveItem(payload: InventoryPayload, id?: number) {
    if (id) {
      await inventoryApi.update(id, payload);
    } else {
      await inventoryApi.create(payload);
    }
    await loadAll();
  }

  async function handleAdjustStock(item: InventoryItem, delta: number) {
    setBusyId(item.id);
    try {
      await inventoryApi.adjustStock(item.id, delta);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui stok.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item: InventoryItem) {
    const confirmed = window.confirm(`Hapus "${item.name}" (${item.sku}) dari inventaris?`);
    if (!confirmed) return;
    setBusyId(item.id);
    try {
      await inventoryApi.remove(item.id);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus item.');
    } finally {
      setBusyId(null);
    }
  }

  function openCreateModal() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function openEditModal(item: InventoryItem) {
    setEditingItem(item);
    setModalOpen(true);
  }

  const displayedItems = activeTab === 'dashboard' ? items.slice(0, 5) : items;

  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8 flex items-center justify-center">
      {/* Main Floating Rounded Shell (matching reference mockup) */}
      <div className="w-full max-w-[1360px] min-h-[760px] rounded-[28px] bg-white shadow-[0_28px_70px_-24px_rgba(62,42,28,0.22)] flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'inventory') setSelectedCategory('all');
          }}
          lowStockCount={dashboard.summary.lowStockCount}
          dbConnected={dbConnected}
        />

        {/* Center Main Content */}
        <main className="flex-1 bg-white px-5 sm:px-8 py-7 min-w-0">
          {/* Header Row */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <h1 className="text-[22px] sm:text-[24px] font-extrabold text-[#1A1A2E] tracking-tight">
                {activeTab === 'dashboard' && 'Halo, Barista'}
                {activeTab === 'inventory' && 'Daftar Stok Kafe'}
                {activeTab === 'low-stock' && 'Stok Perlu Restock'}
                {activeTab === 'settings' && 'Status Server & Coolify'}
              </h1>
              <p className="text-[12.5px] text-[#9A96A6] mt-0.5">
                Hari ini, {todayLabel}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {showSearchInput ? (
                <div className="relative">
                  <Search className="w-4 h-4 text-[#9A96A6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari item atau SKU..."
                    autoFocus
                    className="w-48 sm:w-56 pl-9 pr-3 py-2.5 rounded-xl bg-[#F6F3F0] text-[13px] text-[#1A1A2E] placeholder:text-[#A19CAD] focus:outline-none focus:ring-2 focus:ring-[#6E3580]/30"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSearchInput(true)}
                  title="Cari inventaris"
                  className="w-10 h-10 rounded-xl bg-[#F7F4F1] hover:bg-[#EFE9E3] flex items-center justify-center text-[#1A1A2E] transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#181828] hover:bg-[#2B2B44] text-white text-[13px] font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Item</span>
              </button>
            </div>
          </header>

          {error && (
            <div className="mb-5 rounded-2xl bg-[#FA744F]/12 border border-[#FA744F]/30 px-4 py-3 text-[13px] text-[#B83E1B] flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={loadAll}
                className="px-3 py-1 rounded-lg bg-[#FA744F] text-white text-[11.5px] font-semibold cursor-pointer shrink-0"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {activeTab === 'settings' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#EFE9E2] bg-[#FAF7F4] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6E3580]/12 text-[#6E3580] flex items-center justify-center">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#1A1A2E]">PostgreSQL</h3>
                      <p className="text-[11.5px] text-[#8E8A9B]">Status koneksi database</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[13px] font-bold">
                    {dbConnected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Terhubung (Connected)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-600">Terputus (Disconnected)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#EFE9E2] bg-[#FAF7F4] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#86C4CB]/25 text-[#2E7D86] flex items-center justify-center">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#1A1A2E]">Health Endpoint</h3>
                      <p className="text-[11.5px] text-[#8E8A9B]">Siap untuk Coolify Healthcheck</p>
                    </div>
                  </div>
                  <p className="text-[12.5px] font-mono bg-white px-3 py-1.5 rounded-lg border border-[#EAE2DA] text-[#1A1A2E]">
                    GET /api/health
                  </p>
                  {healthTimestamp && (
                    <p className="text-[11px] text-[#8E8A9B] mt-2">
                      Cek terakhir: {new Date(healthTimestamp).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#EFE9E2] bg-white p-5">
                <h3 className="text-[14px] font-bold text-[#1A1A2E] mb-2">
                  Tips Deploy di Coolify
                </h3>
                <ul className="text-[12.5px] text-[#666275] space-y-1.5 list-disc pl-5">
                  <li>
                    Buat layanan <strong>PostgreSQL</strong> di Coolify, lalu salin{' '}
                    <code className="px-1.5 py-0.5 bg-[#F6F2EE] rounded">DATABASE_URL</code>.
                  </li>
                  <li>
                    Deploy repo ini sebagai <strong>Dockerfile</strong> app (port{' '}
                    <code className="px-1.5 py-0.5 bg-[#F6F2EE] rounded">3000</code>) dan pasang
                    environment variable <code className="px-1.5 py-0.5 bg-[#F6F2EE] rounded">DATABASE_URL</code>.
                  </li>
                  <li>
                    Tabel <code className="px-1.5 py-0.5 bg-[#F6F2EE] rounded">inventory_items</code>{' '}
                    dan data contoh akan dibuat otomatis saat server pertama kali menyala.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* 3 Category Highlight Cards */}
              <CategoryCards
                categories={dashboard.categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* Active category filter pill */}
              {selectedCategory !== 'all' && (
                <div className="mt-4 flex items-center gap-2 text-[12px]">
                  <span className="text-[#8E8A9B]">Filter kategori:</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#181828] text-white font-semibold">
                    {selectedCategory}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="text-[#FA744F] font-semibold hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Bottom 2-column area on Dashboard, or full-width list on Inventory/Low-stock tab */}
              {activeTab === 'dashboard' ? (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-7">
                  {/* Left: Inventory list (like "Tasks for today") */}
                  <section className="lg:col-span-7">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[16px] font-bold text-[#1A1A2E]">
                        Stok Bahan Hari Ini
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('inventory')}
                        className="text-[12px] font-semibold text-[#6E3580] hover:underline cursor-pointer"
                      >
                        Lihat semua ({items.length})
                      </button>
                    </div>

                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((n) => (
                          <div
                            key={n}
                            className="h-18 rounded-2xl bg-[#F6F2EE] animate-pulse"
                          />
                        ))}
                      </div>
                    ) : (
                      <InventoryList
                        items={displayedItems}
                        compact
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                        onAdjustStock={handleAdjustStock}
                        busyId={busyId}
                      />
                    )}
                  </section>

                  {/* Right: Statistics panel */}
                  <section className="lg:col-span-5">
                    <StatsPanel
                      summary={dashboard.summary}
                      onQuickAdd={openCreateModal}
                    />
                  </section>
                </div>
              ) : (
                <section className="mt-7">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[16px] font-bold text-[#1A1A2E]">
                      {activeTab === 'low-stock'
                        ? `Item Stok Menipis (${items.length})`
                        : `Semua Item Inventaris (${items.length})`}
                    </h3>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="h-18 rounded-2xl bg-[#F6F2EE] animate-pulse"
                        />
                      ))}
                    </div>
                  ) : (
                    <InventoryList
                      items={items}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onAdjustStock={handleAdjustStock}
                      busyId={busyId}
                    />
                  )}
                </section>
              )}
            </>
          )}
        </main>

        {/* Right Timeline Panel (matching "Calendar" warm cream panel in reference) */}
        <RestockTimeline
          lowStockItems={dashboard.lowStockItems}
          recentUpdates={dashboard.recentUpdates}
          onQuickRestock={(item) => handleAdjustStock(item, 10)}
          onRefresh={loadAll}
          busyId={busyId}
        />
      </div>

      {/* Add / Edit Modal */}
      <ItemModal
        open={modalOpen}
        editingItem={editingItem}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveItem}
      />
    </div>
  );
}
