import pg from 'pg';

const { Pool } = pg;

const useSsl = process.env.DATABASE_SSL === 'true';

export const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'kafestock',
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      }
);

const INITIAL_SEED = [
  {
    sku: 'KP-001',
    name: 'Arabika Gayo Specialty',
    category: 'Biji Kopi & Teh',
    stock: 24,
    min_stock: 10,
    max_stock: 30,
    unit: 'kg',
    price: 215000,
    supplier: 'Roastery Nusantara',
    notes: 'Medium roast untuk espresso & V60',
  },
  {
    sku: 'KP-002',
    name: 'House Blend Espresso',
    category: 'Biji Kopi & Teh',
    stock: 18,
    min_stock: 12,
    max_stock: 25,
    unit: 'kg',
    price: 165000,
    supplier: 'Roastery Nusantara',
    notes: '70% Arabika, 30% Robusta',
  },
  {
    sku: 'KP-003',
    name: 'Matcha Uji Ceremonial',
    category: 'Biji Kopi & Teh',
    stock: 4,
    min_stock: 6,
    max_stock: 15,
    unit: 'pack',
    price: 185000,
    supplier: 'Kyoto Tea Import',
    notes: 'Segera restock sebelum akhir pekan',
  },
  {
    sku: 'SS-001',
    name: 'Fresh Milk Full Cream',
    category: 'Susu & Sirup',
    stock: 32,
    min_stock: 15,
    max_stock: 48,
    unit: 'liter',
    price: 24000,
    supplier: 'Dairy Fresh Jakarta',
    notes: 'Simpan di chiller 2-4°C',
  },
  {
    sku: 'SS-002',
    name: 'Oat Milk Barista Edition',
    category: 'Susu & Sirup',
    stock: 7,
    min_stock: 10,
    max_stock: 24,
    unit: 'liter',
    price: 46000,
    supplier: 'PlantBased Supply',
    notes: 'Stok menipis, menu favorit pelanggan',
  },
  {
    sku: 'SS-003',
    name: 'Sirup Vanilla & Hazelnut',
    category: 'Susu & Sirup',
    stock: 14,
    min_stock: 6,
    max_stock: 20,
    unit: 'botol',
    price: 135000,
    supplier: 'Monin Official Dist.',
    notes: '700ml per botol',
  },
  {
    sku: 'PS-001',
    name: 'Butter Croissant Frozen',
    category: 'Pastry & Kemasan',
    stock: 42,
    min_stock: 20,
    max_stock: 60,
    unit: 'pcs',
    price: 14000,
    supplier: 'Artisan Bakehouse',
    notes: 'Bake tiap pagi pukul 06:30',
  },
  {
    sku: 'PS-002',
    name: 'Cup Iced 16oz + Lid',
    category: 'Pastry & Kemasan',
    stock: 180,
    min_stock: 100,
    max_stock: 300,
    unit: 'pcs',
    price: 1200,
    supplier: 'Kemasan Kita',
    notes: 'Cup sablon logo kafe',
  },
  {
    sku: 'PS-003',
    name: 'Paper Cup Hot 8oz',
    category: 'Pastry & Kemasan',
    stock: 65,
    min_stock: 80,
    max_stock: 200,
    unit: 'pcs',
    price: 1500,
    supplier: 'Kemasan Kita',
    notes: 'Double wall anti panas',
  },
];

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id SERIAL PRIMARY KEY,
      sku VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(60) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      min_stock INTEGER NOT NULL DEFAULT 10 CHECK (min_stock >= 0),
      max_stock INTEGER NOT NULL DEFAULT 50 CHECK (max_stock > 0),
      unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
      price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
      supplier VARCHAR(120) NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM inventory_items');
  if (rows[0].count === 0) {
    for (const item of INITIAL_SEED) {
      await pool.query(
        `INSERT INTO inventory_items (sku, name, category, stock, min_stock, max_stock, unit, price, supplier, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (sku) DO NOTHING`,
        [
          item.sku,
          item.name,
          item.category,
          item.stock,
          item.min_stock,
          item.max_stock,
          item.unit,
          item.price,
          item.supplier,
          item.notes,
        ]
      );
    }
    console.log(`[DB] Seeded ${INITIAL_SEED.length} initial cafe inventory items.`);
  }
}
