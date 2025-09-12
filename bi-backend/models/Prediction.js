import database from '../config/db.js';

const tableName = 'model_prediction';

async function createPredictionTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS model_prediction (
      id SERIAL PRIMARY KEY,
      model_id INTEGER REFERENCES predictive_models(id) ON DELETE CASCADE,
      input_data JSONB,
      predicted_value VARCHAR(255),
      probability_score FLOAT,
      associated_entity_id INTEGER,
      prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await database.query(query);
    console.log('model_prediction table created successfully');
  } catch (error) {
    console.error('Error creating model_prediction table:', error);
    throw error;
  }
}

async function createPrediction(predictionData) {
  const {
    model_id,
    input_data,
    predicted_value,
    probability_score,
    associated_entity_id,
    prediction_date
  } = predictionData;

  const query = `
    INSERT INTO model_prediction 
      (model_id, input_data, predicted_value, probability_score, associated_entity_id, prediction_date)
    VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP))
    RETURNING *
  `;

  const values = [
    model_id,
    JSON.stringify(input_data),
    predicted_value,
    probability_score,
    associated_entity_id,
    prediction_date
  ];

  try {
    const result = await database.query(query, values);
    return result[0];
  } catch (error) {
    console.error('Error creating model prediction:', error);
    throw error;
  }
}

async function findById(id) {
  const query = 'SELECT * FROM model_prediction WHERE id = $1';

  try {
    const result = await database.query(query, [id]);
    return result[0] || null;
  } catch (error) {
    console.error('Error finding model prediction by ID:', error);
    throw error;
  }
}

async function findByModelId(model_id) {
  const query = 'SELECT * FROM model_prediction WHERE model_id = $1 ORDER BY prediction_date DESC';

  try {
    const result = await database.query(query, [model_id]);
    return result;
  } catch (error) {
    console.error('Error finding model predictions by model ID:', error);
    throw error;
  }
}

async function getAllPredictions() {
  const query = 'SELECT * FROM model_prediction ORDER BY prediction_date DESC';

  try {
    const result = await database.query(query);
    return result;
  } catch (error) {
    console.error('Error getting all model predictions:', error);
    throw error;
  }
}

async function deletePrediction(id) {
  const query = 'DELETE FROM model_prediction WHERE id = $1 RETURNING id';

  try {
    const result = await database.query(query, [id]);
    return result[0];
  } catch (error) {
    console.error('Error deleting model prediction:', error);
    throw error;
  }
}


// Get latest N predictions for a specific model
async function getLatestPredictions(model_id, limit = 10) {
  const query = `
    SELECT * FROM model_prediction
    WHERE model_id = $1
    ORDER BY prediction_date DESC
    LIMIT $2
  `;

  try {
    const result = await database.query(query, [model_id, limit]);
    return result;
  } catch (error) {
    console.error('Error getting latest predictions:', error);
    throw error;
  }
}

// Get predictions with probability_score above threshold
async function getPredictionsByConfidence(minConfidence = 0.7) {
  const query = `
    SELECT * FROM model_prediction
    WHERE probability_score >= $1
    ORDER BY prediction_date DESC
  `;

  try {
    const result = await database.query(query, [minConfidence]);
    return result;
  } catch (error) {
    console.error('Error getting predictions by confidence:', error);
    throw error;
  }
}

// Aggregate average probability_score by day for a given model
async function getDailyAverageConfidence(model_id) {
  const query = `
    SELECT DATE(prediction_date) as day, AVG(probability_score) as avg_confidence
    FROM model_prediction
    WHERE model_id = $1
    GROUP BY day
    ORDER BY day DESC
  `;

  try {
    const result = await database.query(query, [model_id]);
    return result;
  } catch (error) {
    console.error('Error getting daily average confidence:', error);
    throw error;
  }
}

// Get all predictions linked to an associated entity
async function findByAssociatedEntity(entity_id) {
  const query = `
    SELECT * FROM model_prediction
    WHERE associated_entity_id = $1
    ORDER BY prediction_date DESC
  `;

  try {
    const result = await database.query(query, [entity_id]);
    return result;
  } catch (error) {
    console.error('Error finding predictions by associated entity:', error);
    throw error;
  }
}

export default {
  createPredictionTable,
  createPrediction,
  findById,
  findByModelId,
  getAllPredictions,
  deletePrediction,
  getLatestPredictions,
  getPredictionsByConfidence,
  getDailyAverageConfidence,
  findByAssociatedEntity
}