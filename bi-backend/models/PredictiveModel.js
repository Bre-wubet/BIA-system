import database from '../config/db.js';

const tableName = 'predictive_models';

async function createPredictiveModelTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS predictive_models (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL,
      category VARCHAR(100) NOT NULL,
      model_config JSONB NOT NULL,
      training_data_config JSONB,
      model_file_path VARCHAR(500),
      accuracy DECIMAL(5,4),
      status VARCHAR(20) DEFAULT 'training',
      last_trained TIMESTAMP,
      next_training TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await database.query(query);
    console.log('Predictive models table created successfully');
  } catch (error) {
    console.error('Error creating predictive models table:', error);
    throw error;
  }
}

async function createPredictiveModel(modelData) {
  const { 
    name, 
    description, 
    type, 
    category, 
    model_config, 
    training_data_config, 
    model_file_path, 
    accuracy, 
    status, 
    created_by 
  } = modelData;

  const query = `
    INSERT INTO predictive_models (name, description, type, category, model_config, training_data_config, model_file_path, accuracy, status, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    name, 
    description, 
    type, 
    category, 
    JSON.stringify(model_config), 
    training_data_config ? JSON.stringify(training_data_config) : null, 
    model_file_path, 
    accuracy, 
    status || 'training', 
    created_by
  ];

  try {
    const result = await database.query(query, values);
    return result[0];
  } catch (error) {
    console.error('Error creating predictive model:', error);
    throw error;
  }
}

async function findById(id) {
  const query = 'SELECT * FROM predictive_models WHERE id = $1 AND is_active = true';

  try {
    const result = await database.query(query, [id]);
    return result[0] || null;
  } catch (error) {
    console.error('Error finding predictive model by ID:', error);
    throw error;
  }
}

async function findByType(type) {
  const query = 'SELECT * FROM predictive_models WHERE type = $1 AND is_active = true ORDER BY name';

  try {
    const result = await database.query(query, [type]);
    return result;
  } catch (error) {
    console.error('Error finding predictive models by type:', error);
    throw error;
  }
}

async function findByCategory(category) {
  const query = 'SELECT * FROM predictive_models WHERE category = $1 AND is_active = true ORDER BY name';

  try {
    const result = await database.query(query, [category]);
    return result;
  } catch (error) {
    console.error('Error finding predictive models by category:', error);
    throw error;
  }
}

async function getAllModels() {
  const query = `
    SELECT pm.*, u.username as created_by_name
    FROM predictive_models pm
    LEFT JOIN users u ON pm.created_by = u.id
    WHERE pm.is_active = true
    ORDER BY pm.category, pm.name
  `;

  try {
    const result = await database.query(query);
    return result;
  } catch (error) {
    console.error('Error getting all predictive models:', error);
    throw error;
  }
}

async function update(id, updateData) {
  const { 
    name, 
    description, 
    type, 
    category, 
    model_config, 
    training_data_config, 
    model_file_path, 
    accuracy, 
    status 
  } = updateData;

  const query = `
    UPDATE predictive_models 
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        category = COALESCE($4, category),
        model_config = COALESCE($5, model_config),
        training_data_config = COALESCE($6, training_data_config),
        model_file_path = COALESCE($7, model_file_path),
        accuracy = COALESCE($8, accuracy),
        status = COALESCE($9, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
    RETURNING *
  `;

  const values = [
    name, 
    description, 
    type, 
    category, 
    model_config ? JSON.stringify(model_config) : null, 
    training_data_config ? JSON.stringify(training_data_config) : null, 
    model_file_path, 
    accuracy, 
    status, 
    id
  ];

  try {
    const result = await database.query(query, values);
    return result[0];
  } catch (error) {
    console.error('Error updating predictive model:', error);
    throw error;
  }
}

async function updateStatus(id, status) {
  const query = `
    UPDATE predictive_models 
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;

  try {
    const result = await database.query(query, [status, id]);
    return result[0];
  } catch (error) {
    console.error('Error updating predictive model status:', error);
    throw error;
  }
}

async function updateTrainingResults(id, accuracy, modelFilePath) {
  const query = `
    UPDATE predictive_models 
    SET accuracy = $1, model_file_path = $2, last_trained = CURRENT_TIMESTAMP, status = 'active', updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;

  try {
    const result = await database.query(query, [accuracy, modelFilePath, id]);
    return result[0];
  } catch (error) {
    console.error('Error updating training results:', error);
    throw error;
  }
}

async function deleteModel(id) {
  const query = 'UPDATE predictive_models SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id';

  try {
    const result = await database.query(query, [id]);
    return result[0];
  } catch (error) {
    console.error('Error deleting predictive model:', error);
    throw error;
  }
}

async function getActiveModels() {
  const query = `
    SELECT * FROM predictive_models 
    WHERE is_active = true AND status = 'active'
    ORDER BY name
  `;

  try {
    const result = await database.query(query);
    return result;
  } catch (error) {
    console.error('Error getting active predictive models:', error);
    throw error;
  }
}

async function getModelsNeedingTraining() {
  const query = `
    SELECT * FROM predictive_models 
    WHERE is_active = true 
    AND (status = 'training' OR status = 'retraining')
    ORDER BY last_trained ASC NULLS FIRST
  `;

  try {
    const result = await database.query(query);
    return result;
  } catch (error) {
    console.error('Error getting models needing training:', error);
    throw error;
  }
}

async function getModelTypes() {
  const query = 'SELECT DISTINCT type FROM predictive_models WHERE is_active = true ORDER BY type';

  try {
    const result = await database.query(query);
    return result.map(row => row.type);
  } catch (error) {
    console.error('Error getting model types:', error);
    throw error;
  }
}

async function getCategories() {
  const query = 'SELECT DISTINCT category FROM predictive_models WHERE is_active = true ORDER BY category';

  try {
    const result = await database.query(query);
    return result.map(row => row.category);
  } catch (error) {
    console.error('Error getting model categories:', error);
    throw error;
  }
}

async function getModelPerformance() {
  const query = `
    SELECT 
      category,
      COUNT(*) as total_models,
      AVG(accuracy) as avg_accuracy,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_models,
      COUNT(CASE WHEN status = 'training' THEN 1 END) as training_models
    FROM predictive_models 
    WHERE is_active = true
    GROUP BY category
    ORDER BY avg_accuracy DESC
  `;

  try {
    const result = await database.query(query);
    return result;
  } catch (error) {
    console.error('Error getting model performance:', error);
    throw error;
  }
}

async function scheduleRetraining(id, nextTrainingDate) {
  const query = `
    UPDATE predictive_models 
    SET next_training = $1, status = 'retraining', updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;

  try {
    const result = await database.query(query, [nextTrainingDate, id]);
    return result[0];
  } catch (error) {
    console.error('Error scheduling model retraining:', error);
    throw error;
  }
}

async function getModelPredictions(modelId, inputData) {
  // This would typically call the actual ML model
  // For now, we'll return a mock prediction
  const model = await findById(modelId);
  if (!model || model.status !== 'active') {
    throw new Error('Model not found or not active');
  }

  // Mock prediction logic based on model type
  let prediction = null;
  switch (model.type) {
    case 'sales_forecast':
      prediction = Math.random() * 1000000; // Mock sales prediction
      break;
    case 'churn_prediction':
      prediction = Math.random(); // Mock churn probability
      break;
    case 'inventory_forecast':
      prediction = Math.floor(Math.random() * 1000); // Mock inventory prediction
      break;
    default:
      prediction = Math.random() * 100;
  }

  return {
    model_id: modelId,
    prediction,
    confidence: Math.random() * 0.3 + 0.7, // Mock confidence score
    timestamp: new Date()
  };
}

export default {
  createPredictiveModelTable,
  createPredictiveModel,
  findById,
  findByType,
  findByCategory,
  getAllModels,
  update,
  updateStatus,
  updateTrainingResults,
  deleteModel,
  getActiveModels,
  getModelsNeedingTraining,
  getModelTypes,
  getCategories,
  getModelPerformance,
  scheduleRetraining,
  getModelPredictions
}