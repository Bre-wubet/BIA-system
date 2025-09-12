import database from '../config/db.js';
import logger from '../config/logger.js';
import dotenv from 'dotenv';
dotenv.config();
// import { createAllTables } from './createAllTables.js';

async function seedTables() {
  try {
    logger.info('🚀 Seeding BI&A tables...');
//     -- Finished Goods
// ('Steel Rod', 'STL-001', 'Raw Materials', 'kg', 'raw_material', 'High-quality steel rods for manufacturing', 'active'),
//       ('Copper Wire', 'COP-002', 'Raw Materials', 'm', 'raw_material', 'Copper wiring for electrical components', 'active'),
//       ('Plastic Granules', 'PLS-003', 'Raw Materials', 'kg', 'raw_material', 'Plastic raw material for molding', 'active'),
// ('LED TV 42-inch', 'TV-004', 'Electronics', 'pcs', 'finished_good', '42-inch LED television with smart features', 'active'),
// ('Laptop Pro 15', 'LTP-005', 'Electronics', 'pcs', 'finished_good', '15-inch professional laptop', 'active'),
// ('Office Chair', 'CHR-006', 'Furniture', 'pcs', 'finished_good', 'Ergonomic office chair with adjustable height', 'active'),
// ('Dining Table', 'TBL-007', 'Furniture', 'pcs', 'finished_good', '6-seater wooden dining table', 'inactive'),

// -- Consumables
// ('Printer Ink Cartridge', 'INK-008', 'Consumables', 'pcs', 'consumable', 'Black ink cartridge for office printers', 'active'),
// ('AA Batteries Pack', 'BAT-009', 'Consumables', 'pack', 'consumable', 'Pack of 4 AA alkaline batteries', 'active'),

// -- Services
// ('Installation Service', 'SRV-010', 'Services', 'job', 'service', 'On-site installation service for electronics', 'active'),
// ('Maintenance Contract', 'SRV-011', 'Services', 'contract', 'service', 'Annual maintenance contract for office equipment', 'active');

// (1, 'Global Metals Ltd.',       4.7, 'active',   '123 Industrial Zone, Addis Ababa, Ethiopia'),
// (2, 'East Africa Plastics Co.', 4.2, 'active',   '456 Manufacturing Rd, Nairobi, Kenya'),
// (3, 'TransNational Textiles',   3.9, 'inactive', '789 Export Ave, Dar es Salaam, Tanzania'),
// (4, 'Prime Chemicals PLC',      4.5, 'active',   '321 Chemical Park, Cairo, Egypt');
// (5, 'Universal Electronics',    4.8, 'active',   '654 Innovation St, Shenzhen, China'),
// (6, 'Continental Logistics',    3.5, 'suspended','987 Supply Chain Blvd, Johannesburg, South Africa'),
// (7, 'Blue Nile Agro Supply',    4.0, 'active',   '159 Farming District, Bahir Dar, Ethiopia'),
// (8, 'EuroSteel Partners',       4.6, 'active',   '753 Steelworks Lane, Hamburg, Germany'),
// (9, 'Global Paper Corp.',       3.8, 'active',   '852 Forest Drive, Helsinki, Finland'),
// (10,'Nile Pharma Distributors', 4.3, 'active',   '963 Health Park, Khartoum, Sudan');

    // Seed Test tables

          // INSERT INTO products (name, sku, category, unit, product_type, description, status)
      // VALUES
      // ('Steel Rod', 'STL-001', 'Raw Materials', 'kg', 'raw_material', 'High-quality steel rods for manufacturing', 'active'),
      // ('Copper Wire', 'COP-002', 'Raw Materials', 'm', 'raw_material', 'Copper wiring for electrical components', 'active'),
      // ('Plastic Granules', 'PLS-003', 'Raw Materials', 'kg', 'raw_material', 'Plastic raw material for molding', 'active');

      // INSERT INTO suppliers (supplier_id, name, rating, status, address)
      // VALUES
      // (1, 'Global Metals Ltd.',       4.7, 'active',   '123 Industrial Zone, Addis Ababa, Ethiopia'),
      // (2, 'East Africa Plastics Co.', 4.2, 'active',   '456 Manufacturing Rd, Nairobi, Kenya'),
      // (3, 'TransNational Textiles',   3.9, 'inactive', '789 Export Ave, Dar es Salaam, Tanzania');
      await database.query(`
        INSERT INTO purchase_orders (po_id, supplier_id, created_at, total_amount, status) VALUES
        (1001, 1, '2025-09-01 10:00:00', 2000.00, 'completed'),
        (1002, 2, '2025-09-02 12:30:00', 150.00, 'pending'),
        (1003, 3, '2025-09-05 15:00:00', 900.00, 'completed');

        INSERT INTO purchase_order_items (id, po_id, product_id, quantity, unit_price, created_at, updated_at) VALUES
        (1, 1001, 4, 1, 1200.00, '2025-09-01 10:00:00', '2025-09-01 10:00:00'),
        (2, 1001, 5, 1, 800.00, '2025-09-01 10:00:00', '2025-09-01 10:00:00'),

        (3, 1002, 6, 3, 50.00, '2025-09-02 12:30:00', '2025-09-02 12:30:00');

        `)
    // await database.query(`

    //   INSERT INTO dim_warehouses (warehouse_id, name, address, manager_id) VALUES
    //   (201, 'Main Warehouse', 'Addis Ababa', 1),
    //   (202, 'Regional Warehouse', 'Dire Dawa', 2)
    //   ON CONFLICT (warehouse_id) DO NOTHING;

    //   INSERT INTO dim_distributors (distributor_id, name, address, status) VALUES
    //   (301, 'Fast Distribution', 'Addis Ababa', 'active'),
    //   (302, 'East Logistics', 'Djibouti', 'suspended')
    //   ON CONFLICT (distributor_id) DO NOTHING;

    //   INSERT INTO dim_users (user_id, username, role_id, distributor_id, is_active) VALUES
    //   (1, 'admin', 1, NULL, true),
    //   (2, 'warehouse_mgr', 2, NULL, true),
    //   (3, 'distributor_user', 3, 301, true)
    //   ON CONFLICT (user_id) DO NOTHING;

    //   INSERT INTO dim_date (date_id, full_date, day, week, month, quarter, year) VALUES
    //   (1001, '2025-09-01', 1, 36, 9, 3, 2025),
    //   (1002, '2025-09-02', 2, 36, 9, 3, 2025)
    //   ON CONFLICT (date_id) DO NOTHING;

    //   INSERT INTO dim_logistics_providers (provider_id, name, service_type) VALUES
    //   (401, 'DHL Express', '3pl'),
    //   (402, 'Internal Fleet', 'internal')
    //   ON CONFLICT (provider_id) DO NOTHING;

    //   INSERT INTO dim_drivers (driver_id, name, license_number) VALUES
    //   (501, 'John Doe', 'ET12345'),
    //   (502, 'Amanuel Bekele', 'ET67890')
    //   ON CONFLICT (driver_id) DO NOTHING;

    //   INSERT INTO dim_contracts (contract_id, supplier_id, start_date, end_date, status) VALUES
    //   (601, 1, '2025-01-01', '2025-12-31', 'active'),
    //   (602, 2, '2025-06-01', '2026-05-31', 'active')
    //   ON CONFLICT (contract_id) DO NOTHING;
    // `);

    // // 3. Seed Fact Tables
    // await database.query(`
    //   INSERT INTO fact_procurement (po_id, product_key, supplier_id, date_id, quantity, unit_price, subtotal, total_amount, status) VALUES
    //   (10001, 1, 1, 1001, 10, 1200.00, 12000.00, 12000.00, 'approved'),
    //   (10002, 2, 2, 1001, 500, 5.00, 2500.00, 2500.00, 'pending'),
    //   (10001, 1, 1, 1001, 10, 1200.00, 12000.00, 12000.00, 'approved'),
    //   (10002, 2, 2, 1001, 500, 5.00, 2500.00, 2500.00, 'pending'),
    //   (10001, 1, 1, 1001, 10, 1200.00, 12000.00, 12000.00, 'approved'),
    //   (10002, 2, 2, 1001, 500, 5.00, 2500.00, 2500.00, 'pending'),
    //   (10001, 1, 1, 1001, 10, 1200.00, 12000.00, 12000.00, 'approved');

    //   INSERT INTO fact_goods_receipt (grn_id, po_id, product_key, warehouse_id, date_id, quantity_received, condition) VALUES
    //   (20001, 10001, 1, 201, 1002, 10, 'Good'),
    //   (20002, 10002, 2, 202, 1002, 480, 'Good'),
    //   (20001, 10001, 1, 201, 1002, 10, 'Good'),
    //   (20002, 10002, 2, 202, 1002, 480, 'Good');

    //   INSERT INTO fact_invoices (invoice_id, po_id, supplier_id, date_id, amount_due, tax, amount_paid, payment_status) VALUES
    //   (30001, 10001, 1, 1002, 12000.00, 600.00, 6000.00, 'partially_paid'),
    //   (30002, 10002, 2, 1002, 2500.00, 125.00, 2500.00, 'paid'),
    //   (30001, 10001, 1, 1002, 12000.00, 600.00, 6000.00, 'partially_paid'),
    //   (30002, 10002, 2, 1002, 2500.00, 125.00, 2500.00, 'paid');

    //   INSERT INTO fact_inventory (product_key, warehouse_id, date_id, quantity, cost, total_value) VALUES
    //   (1, 201, 1002, 50, 1200.00, 60000.00),
    //   (2, 202, 1002, 200, 5.00, 1000.00),
    //   (1, 201, 1002, 50, 1200.00, 60000.00),
    //   (2, 202, 1002, 200, 5.00, 1000.00);

    //   INSERT INTO stock_transfer (transfer_id, product_key, from_warehouse_id, to_warehouse_id, date_id, quantity_transferred, status) VALUES
    //   (40001, 2, 201, 202, 1002, 100, 'approved'),
    //   (40002, 1, 201, 202, 1001, 5, 'approved'),
    //   (40003, 3, 202, 201, 1002, 30, 'approved'),
    //   (40004, 2, 201, 202, 1001, 150, 'approved'),
    //   (40005, 1, 201, 202, 1002, 2, 'rejected');

    //   INSERT INTO fact_distribution (order_id, distributor_id, product_key, logistics_provider_id, date_id, quantity, delivery_status, fulfillment_method) VALUES
    //   (50001, 301, 1, 401, 1002, 5, 'delivered', '3pl'),
    //   (50002, 302, 2, 402, 1002, 50, 'shipped', 'internal'),
    //   (50001, 301, 1, 401, 1002, 5, 'delivered', '3pl'),
    //   (50002, 302, 2, 402, 1002, 50, 'shipped', 'internal');

    //   INSERT INTO fact_delivery_routes (route_id, order_id, driver_id, date_id, distance_km, estimated_duration_minutes, actual_arrival_time, status) VALUES
    //   (60001, 50001, 501, 1002, 120.5, 180, '2025-09-02 15:00:00', 'completed'),
    //   (60001, 50001, 501, 1002, 120.5, 180, '2025-09-02 15:00:00', 'completed');

    //   INSERT INTO fact_supplier_performance (supplier_id, date_id, on_time_deliveries, total_orders, avg_delivery_time) VALUES
    //   (1, 1002, 8, 10, 2.5),
    //   (2, 1002, 15, 20, 3.0),
    //   (1, 1002, 8, 10, 2.5),
    //   (2, 1002, 15, 20, 3.0);

    //   INSERT INTO fact_distribution_kpis (distributor_id, date_id, kpi_type, value) VALUES
    //   (301, 1002, 'On-Time Delivery %', 95.0),
    //   (301, 1002, 'Average Delivery Time (hrs)', 2.5),
    //   (301, 1002, 'On-Time Delivery %', 95.0),
    //   (301, 1002, 'Average Delivery Time (hrs)', 2.5);
    // `);

    logger.info('Mock data seeded successfully!');
  } catch (error) {
    logger.error('Error seeding tables:', error);
    throw error;
  }
}

seedTables()

