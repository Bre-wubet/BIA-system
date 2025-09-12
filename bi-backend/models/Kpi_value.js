import database from '../config/db.js';

const KpiValue = {
  async createKpiValuesTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS kpi_values (
        id SERIAL PRIMARY KEY,
        kpi_id INT REFERENCES kpis(id),
        value NUMERIC NOT NULL,
        breakdown JSONB,
        calculated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await database.query(query);
  },

async calculateAndInsertKpiValue(kpiId) {
  // 1. Get KPI definition
  const { rows } = await database.query(
    `SELECT formula FROM kpis WHERE id = $1 AND is_active = true`,
    [kpiId]
  );
  if (rows.length === 0) throw new Error(`KPI ${kpiId} not found`);

  const formula = rows[0].formula;

  // 2. Execute formula
  const result = await database.query(formula);
  if (result.rows.length === 0) throw new Error(`No value returned for KPI ${kpiId}`);

  // 3. Detect if result is scalar numeric or breakdown
  const firstRow = result.rows[0];
  const keys = Object.keys(firstRow);

  let insert;
  if (keys.length === 1 && typeof firstRow[keys[0]] === "number") {
    // ✅ Scalar KPI (single numeric value)
    const value = firstRow[keys[0]];
    insert = await database.query(
      `INSERT INTO kpi_values (kpi_id, value, breakdown)
       VALUES ($1, $2, NULL)
       RETURNING *`,
      [kpiId, value]
    );
  } else {
  // Breakdown KPI
  const breakdown = JSON.stringify(result.rows);

  // Calculate a top-level numeric aggregate (e.g. total of all rows)
  let aggregateValue = 0;
  if (result.rows[0].value !== undefined) {
    aggregateValue = result.rows.reduce((sum, r) => sum + Number(r.value || 0), 0);
  }

  insert = await database.query(
    `INSERT INTO kpi_values (kpi_id, value, breakdown)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [kpiId, aggregateValue, breakdown]
  );
}


  return insert.rows[0];
},


  // Get the latest value of a KPI
async getLatestKpiValue(kpiId) {
  const { rows } = await database.query(
    `SELECT value, breakdown, calculated_at
     FROM kpi_values
     WHERE kpi_id = $1
     ORDER BY calculated_at DESC
     LIMIT 1`,
    [kpiId]
  );
  return rows[0] || null;
},

// In KpiValue model
async getKpiValuesHistory(kpiId, limit = 50) {
  // ensure limit is a positive integer
  limit = parseInt(limit, 10);
  if (isNaN(limit) || limit < 1) limit = 50;

  const { rows } = await database.query(
    `SELECT value, calculated_at 
     FROM kpi_values 
     WHERE kpi_id = $1 
     ORDER BY calculated_at DESC 
     LIMIT $2`,
    [kpiId, limit]
  );

  return rows;
},
  // Optionally: bulk refresh all active KPIs
  async refreshAllKpis() {
    const { rows } = await database.query(
      `SELECT id FROM kpis WHERE is_active = true`
    );
    const results = [];
    for (const kpi of rows) {
      const val = await this.calculateAndInsertKpiValue(kpi.id);
      results.push(val);
    }
    return results;
  }
};

export default KpiValue;