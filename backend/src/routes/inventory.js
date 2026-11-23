import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const CATEGORIES = ['Biji Kopi & Teh', 'Susu & Sirup', 'Pastry & Kemasan'];

function validatePayload(body) {
  const errors = [];
  const sku = String(body.sku || '').trim().toUpperCase();
  const name = String(body.name || '').trim();
  const category = String(body.category || '').trim();
  const unit = String(body.unit || 'pcs').trim();
  const supplier = String(body.supplier || '').trim();
  const notes = String(body.notes || '').trim();

  const stock = Number(body.stock);
  const min_stock = Number(body.min_stock ?? 10);
  const max_stock = Number(body.max_stock ?? Math.max(50, stock || 50));
  const price = Number(body.price ?? 0);

  if (!sku) errors.push('SKU wajib diisi.');
  if (!name) errors.push('Nama item wajib diisi.');
  if (!CATEGORIES.includes(category)) {
    errors.push(`Kategori harus salah satu dari: ${CATEGORIES.join(', ')}`);
  }
  if (!Number.isInteger(stock) || stock < 0) {
    errors.push('Stok harus berupa bilangan bulat >= 0.');
  }
  if (!Number.isInteger(min_stock) || min_stock < 0) {
    errors.push('Stok minimum harus berupa bilangan bulat >= 0.');
  }
  if (!Number.isInteger(max_stock) || max_stock <= 0) {
    errors.push('Kapasitas stok maksimum harus > 0.');
  }
  if (!Number.isInteger(price) || price < 0) {
    errors.push('Harga satuan harus berupa bilangan bulat >= 0.');
  }

  return {
    errors,
    data: { sku, name, category, stock, min_stock, max_stock, unit, price, supplier, notes },
  };
}

// GET /api/inventory/dashboard
router.get('/dashboard', async (_req, res) => {
  try {
    const { rows: items } = await pool.query(
      'SELECT * FROM inventory_items ORDER BY updated_at DESC, id DESC'
    );

    const totalItems = items.length;
    const totalStockUnits = items.reduce((sum, item) => sum + item.stock, 0);
    const lowStockItems = items.filter((item) => item.stock <= item.min_stock);
    const lowStockCount = lowStockItems.length;
    const totalValue = items.reduce((sum, item) => sum + item.stock * item.price, 0);
    const healthyPercent =
      totalItems > 0 ? Math.round(((totalItems - lowStockCount) / totalItems) * 100) : 100;

    const categories = CATEGORIES.map((catName) => {
      const catItems = items.filter((item) => item.category === catName);
      const totalStock = catItems.reduce((sum, item) => sum + item.stock, 0);
      const totalMax = catItems.reduce((sum, item) => sum + Math.max(item.max_stock, item.stock), 0);
      const fillPercent = totalMax > 0 ? Math.min(100, Math.round((totalStock / totalMax) * 100)) : 0;
      const lowCount = catItems.filter((item) => item.stock <= item.min_stock).length;

      return {
        name: catName,
        itemCount: catItems.length,
        totalStock,
        fillPercent,
        lowCount,
      };
    });

    res.json({
      summary: {
        totalItems,
        totalStockUnits,
        lowStockCount,
        totalValue,
        healthyPercent,
      },
      categories,
      lowStockItems,
      recentUpdates: items.slice(0, 6),
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Gagal memuat data dashboard.' });
  }
});

// GET /api/inventory
router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', status = '' } = req.query;
    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${String(search).trim()}%`);
      conditions.push(
        `(name ILIKE $${values.length} OR sku ILIKE $${values.length} OR supplier ILIKE $${values.length})`
      );
    }

    if (category && category !== 'all') {
      values.push(String(category));
      conditions.push(`category = $${values.length}`);
    }

    if (status === 'low') {
      conditions.push('stock <= min_stock');
    } else if (status === 'ok') {
      conditions.push('stock > min_stock');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT * FROM inventory_items ${whereClause} ORDER BY updated_at DESC, id DESC`,
      values
    );

    res.json(rows);
  } catch (error) {
    console.error('Error listing inventory:', error);
    res.status(500).json({ error: 'Gagal mengambil daftar inventaris.' });
  }
});

// GET /api/inventory/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }
    const { rows } = await pool.query('SELECT * FROM inventory_items WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item tidak ditemukan.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Gagal mengambil detail item.' });
  }
});

// POST /api/inventory
router.post('/', async (req, res) => {
  const { errors, data } = validatePayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO inventory_items (sku, name, category, stock, min_stock, max_stock, unit, price, supplier, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.sku,
        data.name,
        data.category,
        data.stock,
        data.min_stock,
        data.max_stock,
        data.unit,
        data.price,
        data.supplier,
        data.notes,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: `SKU "${data.sku}" sudah digunakan.` });
    }
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Gagal menambahkan item baru.' });
  }
});

// PUT /api/inventory/:id
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'ID tidak valid.' });
  }

  const { errors, data } = validatePayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE inventory_items
       SET sku = $1,
           name = $2,
           category = $3,
           stock = $4,
           min_stock = $5,
           max_stock = $6,
           unit = $7,
           price = $8,
           supplier = $9,
           notes = $10,
           updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        data.sku,
        data.name,
        data.category,
        data.stock,
        data.min_stock,
        data.max_stock,
        data.unit,
        data.price,
        data.supplier,
        data.notes,
        id,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item tidak ditemukan.' });
    }
    res.json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: `SKU "${data.sku}" sudah digunakan item lain.` });
    }
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Gagal memperbarui item.' });
  }
});

// PATCH /api/inventory/:id/stock
router.patch('/:id/stock', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'ID tidak valid.' });
  }

  try {
    const { delta, stock } = req.body;
    let query;
    let params;

    if (typeof delta === 'number' && Number.isInteger(delta)) {
      query = `
        UPDATE inventory_items
        SET stock = GREATEST(0, stock + $1),
            updated_at = NOW()
        WHERE id = $2
        RETURNING *`;
      params = [delta, id];
    } else if (typeof stock === 'number' && Number.isInteger(stock) && stock >= 0) {
      query = `
        UPDATE inventory_items
        SET stock = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING *`;
      params = [stock, id];
    } else {
      return res.status(400).json({ error: 'Parameter delta atau stock tidak valid.' });
    }

    const { rows } = await pool.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item tidak ditemukan.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error adjusting stock:', error);
    res.status(500).json({ error: 'Gagal mengubah jumlah stok.' });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'ID tidak valid.' });
  }

  try {
    const { rows } = await pool.query(
      'DELETE FROM inventory_items WHERE id = $1 RETURNING id, name',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item tidak ditemukan.' });
    }
    res.json({ deleted: true, item: rows[0] });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Gagal menghapus item.' });
  }
});

export default router;
