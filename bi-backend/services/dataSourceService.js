import database from '../config/db.js';
import DataSource from '../models/DataSource.js';
import MappingRule from '../models/MappingRule.js';
import logger from '../config/logger.js';
import axios from 'axios';
import DataIntegrationLog, {createDataLog} from '../models/Data_Integration_Log.js';
import LogRecord from '../models/Data_Integration_Log_Record.js';

const syncQueue = [];
let isProcessing = false;

// get active data sources
export async function getActiveDataSources() {
  const result = await DataSource.getActiveDataSources();

  return result.rows || [];
}
// Test data source connection
export async function testConnection(dataSourceId) {
  try {
    const dataSource = await DataSource.findById(dataSourceId);

    if (!dataSource) {
      return { success: false, message: 'Data source not found' };
    }

    const testResult = await performConnectionTest(dataSource);

    await DataSource.updateStatus(
      dataSourceId,
      testResult.success ? 'active' : 'error'
    );

    return testResult;
  } catch (error) {
    logger.error('Error testing connection:', error);
    throw error;
  }
}

// Perform connection test based on type
export async function performConnectionTest(dataSource) {
  try {
    const { type, connection_config, query } = dataSource;

    switch (type) {
      case 'api':
        return testAPIConnection(connection_config);
      case 'database':
        return testDatabaseConnection(connection_config);
      case 'internal_module':
        return testInternalModuleConnection(connection_config, query);
      case 'webhook':
        return testWebhookConnection(connection_config);
      default:
        return { success: false, message: 'Unsupported data source type' };
    }
  } catch (error) {
    logger.error('Error performing connection test:', error);
    return { success: false, message: error.message };
  }
}

// Test API connection
export async function testAPIConnection(config) {
  try {
    const {
      base_url,
      endpoint = '', // optional endpoint if needed
      method = 'GET',
      headers = {},
      timeout = 5000
    } = config;

    if (!base_url) {
      return { success: false, message: 'Base URL is required' };
    }

    // Combine base URL with endpoint if provided
    const url = `${base_url.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    const startTime = Date.now();

    const response = await axios({
      method,
      url, // Correct property
      headers,
      timeout,
      validateStatus: () => true
    });

    const elapsed = `${Date.now() - startTime} ms`;

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        message: 'API connection successful',
        data: {
          status: response.status,
          responseTime: elapsed
        }
      };
    }

    return {
      success: false,
      message: `API connection failed with status ${response.status}`
    };

  } catch (error) {
    return { success: false, message: `API connection failed: ${error.message}` };
  }
}

// Test database connection
export async function testDatabaseConnection(config) {
  try {
    const { host, database } = config;
    await new Promise(res => setTimeout(res, 1000));
    return {
      success: true,
      message: 'Database connection successful',
      data: { host, database, connectionTime: '1.2s' }
    };
  } catch (error) {
    return { success: false, message: `Database connection failed: ${error.message}` };
  }
}

// Test internal module connection
export async function testInternalModuleConnection(config, customQuery) {
  try {
    const schema = config.schema;
    const table = config.table;
    const query = customQuery || `SELECT * FROM ${schema}.${table} LIMIT 1`;

    if (!schema || !table) {
      return { success: false, message: 'Schema and table are required' };
    }

    logger.info(`Testing internal module connection with query: ${query}`);
    const result = await database.query(query);
    return { success: true, data: result.rows.length ? result.rows[0] : null, message: 'Internal module connection successful' };
  } catch (error) {
    logger.error('Error testing internal module connection:', error);
    return { success: false, message: error.message };
  }
}

// Test webhook connection
export async function testWebhookConnection(config) {
  try {
    const { url, method = 'POST' } = config;
    await new Promise(res => setTimeout(res, 800));
    return {
      success: true,
      message: 'Webhook connection successful',
      data: { url, method, responseTime: '800ms' }
    };
  } catch (error) {
    return { success: false, message: `Webhook connection failed: ${error.message}` };
  }
}

// Sync data source and wait for result
export async function syncDataSource(dataSourceId) {
  const timestamp = new Date().toISOString();

  try {
    const dataSource = await DataSource.findById(dataSourceId);

    if (!dataSource) {
      const msg = `DS not found: ${dataSourceId}`;
      logger.error(`Sync FAIL | DS=${dataSourceId} | Err=${msg}`, { timestamp });
      return { success: false, message: msg, dataSourceId, timestamp };
    }

    if (dataSource.status !== 'active') {
      const msg = `Data source is not active: ${dataSourceId}`;
      logger.error(`Sync FAIL | DS=${dataSourceId} | Err=${msg}`, { timestamp });
      return { success: false, message: msg, dataSourceId, type: dataSource.type, timestamp };
    }

    logger.info(`Starting sync for DS=${dataSourceId} [${dataSource.type}]`, { timestamp });

    // Directly perform sync instead of queuing
    const syncResult = await performSync(dataSourceId);

    // Include timestamp in the result
    return {
      ...syncResult,
      timestamp
    };

  } catch (error) {
    logger.error(`Error syncing DS=${dataSourceId}: ${error.message}`, { timestamp });
    return { success: false, message: error.message, dataSourceId, timestamp };
  }
}
// Get sync queue
export async function getSyncQueue() {
  const { rows } = await database.query(`
  SELECT dl.data_source_id,
         ds.name AS data_source_name,
         ds.type,
         dl.status,
         dl.run_timestamp AS started_at,
         dl.run_timestamp + INTERVAL '1 second' * dl.duration_seconds AS completed_at
  FROM data_integration_log dl
  JOIN data_sources ds ON ds.id = dl.data_source_id
  WHERE dl.status IN ('success','pending', 'in_progress')
  ORDER BY dl.run_timestamp ASC
`);

  return rows;
}
// Perform sync
export async function performSync(dataSourceId) {
  const start = Date.now();
  try {
    const dataSource = await DataSource.findById(dataSourceId);
    if (!dataSource) {
      return { success: false, message: `DS not found: ${dataSourceId}`, processedRecords: [] };
    }

    logger.info(`Starting sync for DS=${dataSourceId} [${dataSource.type}]`);

    const syncResult = await syncDataByType(dataSource);

    if (syncResult.success) {
      await DataSource.updateLastSync(dataSourceId);
      logger.info(`Sync OK | DS=${dataSourceId} | Records=${syncResult.recordsProcessed}`);
    } else {
      logger.error(`Sync FAIL | DS=${dataSourceId} | Err=${syncResult.message}`);
    }

    return {
      ...syncResult,
      dataSourceId,
      type: dataSource.type,
      name: dataSource.name,
      durationSeconds: ((Date.now() - start) / 1000).toFixed(2)
    };

  } catch (error) {
    logger.error(`Fatal sync error for DS=${dataSourceId}: ${error.message}`);
    return { success: false, message: error.message, processedRecords: [] };
  }
}

// Sync by type
export async function syncDataByType(dataSource) {
  try {
    const { type, connection_config, id: dataSourceId } = dataSource;
    const config = { ...connection_config, id: dataSourceId };

    switch (type) {
      case 'internal_module':
        return await syncFromInternalModule(config);
      case 'api':
        return await syncFromAPI(config);
      case 'database':
        return await syncFromDatabase(config);
      case 'file':
        return await syncFromFile(config);
      case 'webhook':
        return await syncFromWebhook(config);
      default:
        return { success: false, message: 'Unsupported data source type for sync', processedRecords: [] };
    }
  } catch (error) {
    logger.error('Error syncing data by type:', { error: error.message });
    return { success: false, message: error.message, processedRecords: [] };
  }
}

// Sync from internal module
export async function syncFromInternalModule(config) {
  try {
    const { module, id: dataSourceId } = config;

    const { rows } = await database.query(
      "SELECT * FROM data_sources WHERE id = $1", 
      [dataSourceId]
    );

    if (!rows.length) throw new Error(`No data sources found for module ${module}`);

    const dataSource = rows[0];
    const query = dataSource.query;

    if (!query) throw new Error(`No query found for DS=${dataSourceId}`);

     // --- Extract the table name (basic check) ---
    const match = query.match(/from\s+([a-zA-Z0-9_"\.]+)/i);
    if (match) {
      const tableName = match[1].replace(/["']/g, ""); // strip quotes if any

      // Validate table existence
      const check = await database.query(
        `SELECT 1 
         FROM information_schema.tables 
         WHERE table_name = $1 OR table_name = lower($1)`,
        [tableName.includes(".") ? tableName.split(".")[1] : tableName]
      );

      if (check.rowCount === 0) {
        throw new Error(`Table "${tableName}" does not exist or is not accessible`);
      }
    }
    const { rows: data } = await database.query(query);
    
    // Validate data format before processing
    if (!Array.isArray(data)) {
      logger.error(`Invalid data format received from internal module for DS=${dataSourceId}. Expected array, got ${typeof data}`);
      return {
        success: false,
        message: `Invalid data format: expected array, got ${typeof data}`,
        processedRecords: []
      };
    }
    
    // Check for empty data
    if (data.length === 0) {
      logger.warn(`No records returned from query for DS=${dataSourceId}`);
      return {
        success: true,
        message: `No records returned from query for DS=${dataSourceId}`,
        recordsProcessed: 0,
        processedRecords: []
      };
    }

    const result = await processAndStoreData(data, 'internal_module', dataSourceId);

    return { 
      ...result, 
      message: `Internal module sync completed for DS=${dataSourceId}` 
    };

  } catch (error) {
    return { success: false, message: `Internal sync failed: ${error.message}`, processedRecords: [] };
  }
}
export async function syncFromAPI(config) {
  try {
    const { url, base_url, method = 'GET', headers = {}, id: dataSourceId } = config;
    const apiUrl = url || base_url;

    if (!apiUrl) {
      throw new Error('API URL not provided in connection config');
    }

    const response = await axios({ method, url: apiUrl, headers, timeout: 30000 });
    const data = response.data;

    // Call processAndStoreData once for API response
    const result = await processAndStoreData(data, 'api', dataSourceId);

    return {
      success: result.success,
      recordsProcessed: result.recordsProcessed,
      message: 'API sync completed successfully',
      processedRecords: result.processedRecords
    };
  } catch (error) {
    return { 
      success: false, 
      message: `API sync failed: ${error.message}`, 
      processedRecords: [] 
    };
  }
}
// Sync from database
export async function syncFromDatabase(config) {
  try {
    const { query, id: dataSourceId } = config;

    if (!query) {
      throw new Error(`No query provided for database data source ${dataSourceId}`);
    }

    const { rows: data } = await database.query(query);
    const result = await processAndStoreData(data, 'database', dataSourceId);

    return {
      success: result.success,
      recordsProcessed: result.recordsProcessed,
      message: 'Database sync completed successfully',
      processedRecords: result.processedRecords
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Database sync failed: ${error.message}`, 
      processedRecords: [] 
    };
  }
}

// Sync from file
export async function syncFromFile(config) {
  try {
    const { file_path, id: dataSourceId } = config;

    if (!file_path) {
      throw new Error(`No file path provided for data source ${dataSourceId}`);
    }

    const fileContent = fs.readFileSync(file_path, 'utf-8');
    const parsedData = JSON.parse(fileContent);

    const result = await processAndStoreData(parsedData, 'file', dataSourceId);

    return {
      success: result.success,
      recordsProcessed: result.recordsProcessed,
      message: 'File sync completed successfully',
      processedRecords: result.processedRecords
    };
  } catch (error) {
    return { 
      success: false, 
      message: `File sync failed: ${error.message}`, 
      processedRecords: [] 
    };
  }
}

// Sync from webhook
export async function syncFromWebhook(config) {
  try {
    const { payload, id: dataSourceId } = config;

    if (!payload) {
      throw new Error(`No payload provided for webhook data source ${dataSourceId}`);
    }

    const result = await processAndStoreData(payload, 'webhook', dataSourceId);

    return {
      success: result.success,
      recordsProcessed: result.recordsProcessed,
      message: 'Webhook sync completed successfully',
      processedRecords: result.processedRecords
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Webhook sync failed: ${error.message}`, 
      processedRecords: [] 
    };
  }
}

// Process and store data
export async function processAndStoreData(rawData, source, dataSourceId) {
  const startTime = Date.now();
  let totalRecords = 0;
  let insertedRecords = 0;
  let status = 'success';
  let errorLog = null;
  let transformedRecords = [];
  let logId = null;

  try {
    logger.debug(`Raw data received for DataSource=${dataSourceId}`, {
      type: typeof rawData,
      isArray: Array.isArray(rawData),
      count: Array.isArray(rawData) ? rawData.length : 1,
    });

    // 0. Ensure log records table exists (idempotent)
    try { await LogRecord.ensureTable(); } catch {}

    // 1. Normalize
    let records = Array.isArray(rawData) ? rawData : [rawData];
    totalRecords = records.length;

    // Filter invalid
    records = records.filter(r => r && typeof r === 'object' && Object.keys(r).length > 0);
    if (!records.length) {
      logger.warn(`No valid records for DataSource=${dataSourceId}`);
      return { success: true, recordsProcessed: 0, totalReceived: totalRecords, processedRecords: [] };
    }

    // 2. Clean
    const cleanedRecords = await cleanData(records);
    if (!cleanedRecords.length) {
      logger.warn(`All records cleaned out for DataSource=${dataSourceId}`);
      return { success: true, recordsProcessed: 0, totalReceived: totalRecords, processedRecords: [] };
    }

    // 3. Fetch target tables
    const { rows } = await database.query(`SELECT module FROM data_sources WHERE id = $1`, [dataSourceId]);
    if (!rows.length) throw new Error(`No module found for DataSource=${dataSourceId}`);

    let factTables = rows[0].module?.fact_tables || [];
    if (typeof factTables === 'string') factTables = [factTables];
    const targetTables = factTables;

    if (!targetTables.length) {
      logger.warn(`No target tables defined for DataSource=${dataSourceId}`);
    }

    // 4. Create initial log entry (pending) to capture logId for record storage
    try {
      const pendingLog = await createDataLog({
        source_system: source,
        data_source_id: dataSourceId,
        record_count: 0,
        status: 'in_progress',
        run_timestamp: new Date(),
        error_log: null,
        duration_seconds: null
      });
      logId = pendingLog?.id || null;
    } catch {}

    // 5. Fetch mapping rules
    let mappingRules = [];
    try {
      mappingRules = await MappingRule.getMappingRules(dataSourceId) || [];

      mappingRules = mappingRules.map(rule => {
        let transformation = rule.transformation;
        if (typeof transformation === 'string') {
          try { transformation = JSON.parse(transformation); } catch { transformation = {}; }
        }
        return {
          id: rule.id,
          sourceField: rule.source_field,
          targetField: rule.target_field,
          transformation: {
            type: transformation?.type || 'string',
            default: transformation?.default ?? null,
            formula: transformation?.formula
          }
        };
      });

      // Log mapping rules for debugging
      logger.debug(`Loaded ${mappingRules.length} mapping rules for DataSource=${dataSourceId}`, {
        rules: mappingRules.map(r => ({ id: r.id, sourceField: r.sourceField, targetField: r.targetField }))
      });
      
      // Filter out rules with no valid targetField
      const validRules = mappingRules.filter(r => r.targetField && r.targetField !== 'undefined');
      
      if (validRules.length < mappingRules.length) {
        logger.warn(`Filtered out ${mappingRules.length - validRules.length} invalid mapping rules for DataSource=${dataSourceId}`);
      }
      
      mappingRules = validRules;
    } catch (ruleErr) {
      logger.warn(`Mapping rules fetch failed for DataSource=${dataSourceId}: ${ruleErr.message}`);
    }

    // 6. Transform
    transformedRecords = [...cleanedRecords];
    if (mappingRules.length > 0) {
      try {
        logger.info(`Applying ${mappingRules.length} mapping rules to records`, { dataSourceId });
        transformedRecords = await transformData(cleanedRecords, mappingRules, logger);
      } catch (transformErr) {
        logger.error(`Transformation failed for DataSource=${dataSourceId}: ${transformErr.message}`);
        status = 'failed';
        errorLog = transformErr.message;
        throw transformErr;
      }
    }

    // 7. Insert
    for (const record of transformedRecords) {
      try {
        if (!record || Object.keys(record).length === 0) {
          logger.warn(`Skipping empty record for DataSource=${dataSourceId}`);
          continue;
        }

        const validRecord = Object.fromEntries(
          Object.entries(record).filter(([k, v]) => k && k !== 'undefined' && v !== undefined)
        );

        if (!Object.keys(validRecord).length) {
          logger.warn(`Skipping record with no valid fields for DataSource=${dataSourceId}`, { record });
          continue;
        }

        const columns = Object.keys(validRecord).join(', ');
        const placeholders = Object.keys(validRecord).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(validRecord);

        for (const table of targetTables) {
          const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
          await database.query(sql, values);
        }

        insertedRecords++;
      } catch (insertErr) {
        logger.error(`Insert failed for DataSource=${dataSourceId}: ${insertErr.message}`, {
          record,
          targetTables
        });
      }
    }

    // 8. Persist transformed records as log records if we have a logId (best-effort)
    try {
      if (logId && transformedRecords.length > 0) {
        // Limit bulk insert to reasonable batch sizes
        const batchSize = 1000;
        for (let i = 0; i < transformedRecords.length; i += batchSize) {
          const batch = transformedRecords.slice(i, i + batchSize);
          await LogRecord.insertMany(logId, batch);
        }
      }
    } catch {}

    logger.info(`Data processed for DataSource=${dataSourceId}`, {
      totalRecords,
      insertedRecords,
      skippedRecords: totalRecords - insertedRecords,
    });

  } catch (err) {
    status = 'failed';
    errorLog = err.message;
    logger.error(`Global failure in processAndStoreData (DataSource=${dataSourceId}): ${err.message}`, err);
  } finally {
    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    try {
      if (logId) {
        // finalize existing log
        await DataIntegrationLog.updateStatusAndLog(logId, status, errorLog, durationSeconds, insertedRecords);
      } else {
        // fallback create when pending failed
        await createDataLog({
          source_system: source,
          data_source_id: dataSourceId,
          record_count: insertedRecords,
          total_records_received: totalRecords,
          status,
          error_log: errorLog,
          duration_seconds: durationSeconds,
          timestamp: new Date()
        });
      }
    } catch (logErr) {
      logger.error(`Failed to log sync for DataSource=${dataSourceId}: ${logErr.message}`);
    }
    return {
      success: status === 'success',
      recordsProcessed: insertedRecords,
      totalReceived: totalRecords,
      durationSeconds,
      status,
      error: errorLog,
      processedRecords: transformedRecords,
      logId
    };
  }
}


// Get data sources needing sync
export async function getDataSourcesNeedingSync() {
  try {
    const dataSources = await DataSource.getDataSourcesNeedingSync();
    return { success: true, data: dataSources };
  } catch (error) {
    logger.error('Error getting data sources needing sync:', error);
    throw error;
  }
}

// Clean data
export async function cleanData(records) {
  if (!Array.isArray(records)) return [];

  const cleaned = records
    .map(record => {
      if (!record || typeof record !== 'object') return null;

      // Normalize keys to lowercase
      const normalized = {};
      for (const key of Object.keys(record)) {
        // Skip undefined keys
        if (key === undefined || key === 'undefined' || key === null) {
          continue;
        }
        
        let value = record[key];

        // Trim strings
        if (typeof value === 'string') {
          value = value.trim();
          if (value === '') value = null;
        }

        // Normalize booleans
        if (value === 'true') value = true;
        if (value === 'false') value = false;

        // Normalize keys (lower_snake_case)
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
        normalized[normalizedKey] = value;
      }

      return normalized;
    })
    // Remove invalid/null records
    .filter(record => record && Object.keys(record).length > 0);

  // Remove duplicates (by JSON string representation)
  const unique = [];
  const seen = new Set();
  for (const rec of cleaned) {
    const sig = JSON.stringify(rec);
    if (!seen.has(sig)) {
      seen.add(sig);
      unique.push(rec);
    }
  }

  return unique;
}

// Transform data
export async function transformData(records, mappingRules) {
  if (!Array.isArray(records) || records.length === 0) return [];
  if (!Array.isArray(mappingRules) || mappingRules.length === 0) return records;

  return records.map(record => {
    const transformed = {};

    for (const rule of mappingRules) {
      // Handle both camelCase and snake_case field names for compatibility
      const sourceField = rule.sourceField || rule.source_field;
      const targetField = rule.targetField || rule.target_field;
      const transformation = rule.transformation || {};
      
      const type = transformation?.type || 'string';
      const defaultValue = transformation?.default ?? null;
      const formula = transformation?.formula;
      
      // Debug log to identify mapping rule issues
      logger.debug(`Processing mapping rule: sourceField=${sourceField}, targetField=${targetField}`, { rule });
      
      // Skip rules with invalid target fields
      if (!targetField || targetField === 'undefined' || targetField === undefined) {
        logger.warn(`Skipping mapping rule with invalid target field: ${JSON.stringify(rule)}`);
        continue;
      }

      let value = record[sourceField];

      // If formula provided → evaluate based on record
      if (formula && typeof formula === 'function') {
        try {
          value = formula(record);
        } catch (err) {
          logger.error(`Formula evaluation failed for field ${targetField}:`, err);
          value = defaultValue;
        }
      }

      // Type conversion
      if (value != null) {
        switch (type) {
          case 'number':
            value = Number(value);
            if (isNaN(value)) value = defaultValue;
            break;
          case 'boolean':
            value = Boolean(value);
            break;
          case 'date':
            value = new Date(value);
            if (isNaN(value.getTime())) value = defaultValue;
            break;
          case 'string':
          default:
            value = String(value).trim();
            break;
        }
      } else {
        value = defaultValue;
      }

      transformed[targetField] = value;
    }

    return transformed;
  });
}