-- ============================================
-- Laburen MCP - Database Schema
-- SQLite D1 with FTS5 Full-Text Search
-- ============================================

DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS products_fts;
DROP TABLE IF EXISTS products;

-- ============================================
-- Products Table (from products.xlsx)
-- ============================================
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  tipo_prenda TEXT NOT NULL,
  talla TEXT NOT NULL,
  color TEXT NOT NULL,
  cantidad_disponible INTEGER NOT NULL DEFAULT 0,
  precio_50_u REAL NOT NULL,
  precio_100_u REAL NOT NULL,
  precio_200_u REAL NOT NULL,
  disponible INTEGER NOT NULL DEFAULT 1,
  categoria TEXT NOT NULL,
  descripcion TEXT
);

-- Indexes for common filters (minimal, only frequently used)
CREATE INDEX idx_products_categoria ON products(categoria);
CREATE INDEX idx_products_disponible ON products(disponible);

-- ============================================
-- FTS5 Full-Text Search Index
-- Enables fast multi-term queries like: "camiseta OR remera"
-- ============================================
CREATE VIRTUAL TABLE products_fts USING fts5(
  tipo_prenda,
  color,
  categoria,
  descripcion,
  content='products',
  content_rowid='rowid'
);

-- Triggers to keep FTS5 in sync with products table
CREATE TRIGGER products_ai AFTER INSERT ON products
BEGIN
  INSERT INTO products_fts(rowid, tipo_prenda, color, categoria, descripcion)
  VALUES (NEW.rowid, NEW.tipo_prenda, NEW.color, NEW.categoria, NEW.descripcion);
END;

CREATE TRIGGER products_ad AFTER DELETE ON products
BEGIN
  INSERT INTO products_fts(products_fts, rowid, tipo_prenda, color, categoria, descripcion)
  VALUES ('delete', OLD.rowid, OLD.tipo_prenda, OLD.color, OLD.categoria, OLD.descripcion);
END;

CREATE TRIGGER products_au AFTER UPDATE ON products
BEGIN
  INSERT INTO products_fts(products_fts, rowid, tipo_prenda, color, categoria, descripcion)
  VALUES ('delete', OLD.rowid, OLD.tipo_prenda, OLD.color, OLD.categoria, OLD.descripcion);
  INSERT INTO products_fts(rowid, tipo_prenda, color, categoria, descripcion)
  VALUES (NEW.rowid, NEW.tipo_prenda, NEW.color, NEW.categoria, NEW.descripcion);
END;

-- ============================================
-- Carts Table (one per conversation)
-- ============================================
CREATE TABLE carts (
  id TEXT PRIMARY KEY,
  conversation_id TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Cart Items Table
-- ============================================
CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- Optimize after schema creation
PRAGMA optimize;
