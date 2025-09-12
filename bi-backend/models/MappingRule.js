import logger from '../config/logger.js';
import database from '../config/db.js';

const tableName = 'mapping_rules';

async function createMappingRulesTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id BIGSERIAL PRIMARY KEY,
      data_source_id INTEGER NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
      source_field VARCHAR(255) NOT NULL,
      target_field VARCHAR(255) NOT NULL,
      transformation JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_mapping UNIQUE (data_source_id, source_field, target_field)
    );

    CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS set_timestamp ON ${tableName};
    CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON ${tableName}
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  `;

  await database.query(query);
  logger.info(`Ensured table ${tableName} exists with constraints and triggers`);

  // Repair sequence to avoid duplicate key violations
  await repairSequence();
}

async function repairSequence() {
  const query = `
    SELECT setval(
      pg_get_serial_sequence('${tableName}', 'id'),
      COALESCE((SELECT MAX(id) FROM ${tableName}), 0) + 1,
      false
    );
  `;
  await database.query(query);
  logger.info(`Repaired sequence for ${tableName}`);
}

async function addMappingRule(dataSourceId, rule) {
  try {
    const { source_field, target_field, transformation = {} } = rule;

    if (!source_field || !target_field) {
      throw new Error("Source field and target field are required");
    }

    // Normalize transformation safely
    let normalizedTransformation = transformation;
    if (typeof transformation === "string") {
      try {
        normalizedTransformation = JSON.parse(transformation);
      } catch (err) {
        throw new Error("Invalid transformation JSON");
      }
    }

    const query = `
      INSERT INTO ${tableName} (data_source_id, source_field, target_field, transformation)
      VALUES ($1, $2, $3, $4::jsonb)
      RETURNING *;
    `;

    const { rows } = await database.query(query, [
      dataSourceId,
      source_field,
      target_field,
      normalizedTransformation, // pg will auto-cast object to jsonb
    ]);

    logger.info(`Added new mapping rule for data source ${dataSourceId}`);
    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      // Duplicate key violation (from UNIQUE constraint)
      logger.warn(
        `Duplicate mapping rule attempted for data source ${dataSourceId}: ${error.detail}`
      );
      throw new Error("A mapping rule with the same source and target already exists.");
    }

    logger.error("Error adding mapping rule:", error.stack || error.message);
    throw error;
  }
}

async function getMappingRules(dataSourceId) {
  try {
    const query = `
      SELECT *
      FROM ${tableName}
      WHERE data_source_id = $1
      ORDER BY id ASC
    `;
    const { rows } = await database.query(query, [dataSourceId]);

    if (!rows.length) {
      logger.warn(`No mapping rules found for data source ${dataSourceId}`);
      return [];
    }

    logger.info(`Retrieved ${rows.length} mapping rules for data source ${dataSourceId}`);
    return rows;
  } catch (error) {
    logger.error('Error getting mapping rules:', error);
    throw error;
  }
}
async function updateMappingRule(dataSourceId, mapId, rule) {
  try {
    if (!rule || !rule.source_field || !rule.target_field) {
      throw new Error("Invalid mapping rule data");
    }

    const { source_field, target_field, transformation } = rule;
    const query = `
      UPDATE ${tableName}
      SET source_field = $1,
          target_field = $2,
          transformation = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE data_source_id = $4 AND id = $5
      RETURNING *
    `;
    const { rows } = await database.query(query, [
      source_field,
      target_field,
      transformation || {},
      dataSourceId,
      mapId,
    ]);

    if (!rows.length) {
      logger.warn(`No mapping rule found with id=${mapId} for data source ${dataSourceId}`);
      return null;
    }

    logger.info(`Updated mapping rule ${mapId} for data source ${dataSourceId}`);
    return rows[0];
  } catch (error) {
    logger.error('Error updating mapping rule:', error);
    throw error;
  }
}

async function deleteMappingRule(dataSourceId, mapId) {
  try {
    const query = `
      DELETE FROM ${tableName}
      WHERE data_source_id = $1 AND id = $2
      RETURNING *
    `;
    const { rows } = await database.query(query, [dataSourceId, mapId]);

    if (!rows.length) {
      logger.warn(`No mapping rule found to delete (id=${mapId}, dataSource=${dataSourceId})`);
      return null;
    }

    logger.info(`Deleted mapping rule ${mapId} for data source ${dataSourceId}`);
    return rows[0];
  } catch (error) {
    logger.error('Error deleting mapping rule:', error);
    throw error;
  }
}

export default {
  createMappingRulesTable,
  getMappingRules,
  addMappingRule,
  updateMappingRule,
  deleteMappingRule,
};
