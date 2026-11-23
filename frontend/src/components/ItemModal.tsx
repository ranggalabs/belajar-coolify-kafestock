import { useState, useEffect, type FormEvent } from 'react';
import { X } from 'lucide-react';
import {
  CAFE_CATEGORIES,
  type CafeCategory,
  type InventoryItem,
  type InventoryPayload,
} from '../types/inventory';

interface ItemModalProps {
  open: boolean;
  editingItem: InventoryItem | null;
  onClose: () => void;
  onSubmit: (payload: InventoryPayload, id?: number) => Promise<void>;
}

const DEFAULT_FORM: InventoryPayload = {
  sku: '',
  name: '',
  category: 'Biji Kopi & Teh',
  stock: 10,
  min_stock: 5,
  max_stock: 50,
  unit: 'kg',
  price: 50000,
  supplier: '',
  notes: '',
};

export function ItemModal({ open, editingItem, onClose, onSubmit }: ItemModalProps) {
  const [form, setForm] = useState<InventoryPayload>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setForm({
        sku: editingItem.sku,
        name: editingItem.name,
        category: editingItem.category,
        stock: editingItem.stock,
        min_stock: editingItem.min_stock,
        max_stock: editingItem.max_stock,
        unit: editingItem.unit,
        price: editingItem.price,
        supplier: editingItem.supplier,
        notes: editingItem.notes,
      });
    } else {
      const randomSuffix = String(Math.floor(100 + Math.random() * 900));
      setForm({ ...DEFAULT_FORM, sku: `KF-${randomSuffix}` });
    }
    setError('');
  }, [editingItem, open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(form, editingItem?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181828]/45 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl border border-[#F1EAE3] max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[18px] font-extrabold text-[#1A1A2E]">
              {editingItem ? 'Edit Item Inventaris' : 'Tambah Item Kafe'}
            </h3>
            <p className="text-[12px] text-[#8E8A9B]">
              Data akan langsung tersimpan ke database PostgreSQL.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#F7F4F1] flex items-center justify-center text-[#7D788A] hover:text-[#1A1A2E] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-[#FA744F]/15 text-[#C9431E] px-3.5 py-2.5 text-[12.5px] font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11.5px] font-bold text-[#4B4759] mb-1">
                Kode SKU
              </label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="KP-004"
                className="w-full rounded-xl border border-[#E5DDD5] px-3 py-2 text-[13px] focus:outline-none focus:border-[#6E3580]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11.5px] font-bold text-[#4B4759] mb-1">
                Nama Bahan / Item
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Biji Kopi Toraja"
                className="w-full rounded-xl border border-[#E5DDD5] px-3 py-2 text-[13px] focus:outline-none focus:border-[#6E3580]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11.5px] font-bold text-[#4B4759] mb-1">
                Kategori
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as CafeCategory })
                }
                className="w-full rounded-xl border border-[#E5DDD5] px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#6E3580]"
              >
                {CAFE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11.5px] font-bold text-[#4B4759] mb-1">
                Satuan (Unit)
              </label>
              <input
                type="text"
                required
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="kg, liter, pcs, botol"
                className="w-full rounded-xl border border-[#E5DDD5] px-3 py-2 text-[13px] focus:outline-none focus:border-[#6E3580]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11.5px] font-bold text-[#4B4759] mb-1">
                Stok Saat Ini
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full rounded-xl border border-[#E5DDD5] px-3 py-2 text-[13px] focus:outline-none focus:border-[#6E3580]"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-bold text-[#4B4759] mb-1">
                Stok Min.
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.min_stock}
                onChange={(e) =>
                  setForm({ ...form, min_stock: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-[#E5DDD5] px-3 py-2 text-[13px] focus:outline-none focus:border-[#6E3580]"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-bold text-[#4B4759] mb-1">
                Kapasitas Maks.
              </label>
              <input
                type="number"
                min={1}
                required
                value={form.max_stock}
                onChange={(e) =>
                  setForm({ ...form, max_stock: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-[#E5DDD5] px-3 py-2 text-[13px] focus:outline-none focus:border-[#6E3580]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11.5px] font-bold text-[#4B4759] mb-1">
                Harga Satuan (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-xl border border-[#E5DDD5] px-3 py-2 text-[13px] focus:outline-none focus:border-[#6E3580]"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-bold text-[#4B4759] mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="Nama pemasok"
                className="w-full rounded-xl border border-[#E5DDD5] px-3 py-2 text-[13px] focus:outline-none focus:border-[#6E3580]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-bold text-[#4B4759] mb-1">
              Catatan
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Catatan penyimpanan atau jadwal pengiriman..."
              className="w-full rounded-xl border border-[#E5DDD5] px-3 py-2 text-[13px] focus:outline-none focus:border-[#6E3580]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-[#7D788A] hover:bg-[#F5F1EC] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#181828] hover:bg-[#2C2C44] text-white text-[13px] font-semibold transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submitting
                ? 'Menyimpan...'
                : editingItem
                ? 'Simpan Perubahan'
                : 'Tambah Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
