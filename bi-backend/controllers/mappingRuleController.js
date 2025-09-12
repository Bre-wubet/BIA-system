// mapping controllers  
import * as mappingService from '../services/mappingService.js';
import logger from '../config/logger.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const getRules = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rules = await mappingService.getRules(id);

  if (!rules) {
    logger.warn(`No mapping rules found for data source ID: ${id}`);
    return res.status(404).json({
      success: false,
      message: 'Mapping rules not found'
    });
  }

  res.json({
    success: true,
    data: rules
  });
});

// controller
export const addRule = asyncHandler(async (req, res) => {
  try {
    const { source_field, target_field, transformation } = req.body;

    if (!source_field || !target_field) {
      return res.status(400).json({
        error: "Both source_field and target_field are required.",
      });
    }

    const newRule = await mappingService.addRule(req.params.id, {
      source_field,
      target_field,
      transformation,
    });

    return res.status(201).json({
      success: true,
      data: newRule,
    });
  } catch (err) {
    logger.error("Error adding mapping rule:", err.message);

    if (err.message.includes("Invalid transformation JSON")) {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});


// controllers/mappingRuleController.js
export const updateRule = asyncHandler(async (req, res) => {
  try {
    const { id: dataSourceId, mapId } = req.params; // get both IDs
    const ruleData = req.body;

    const updatedRule = await mappingService.updateRule(dataSourceId, mapId, ruleData);

    if (!updatedRule) {
      return res.status(404).json({ error: `Mapping rule ${mapId} not found for data source ${dataSourceId}` });
    }

    res.json(updatedRule);
  } catch (err) {
    logger.error("Error updating mapping rule:", err);
    res.status(500).json({ error: "Error updating mapping rule" });
  }
});

export const deleteRule = asyncHandler(async (req, res) => {
  try {
    const { id: dataSourceId, mapId } = req.params;

    const deletedRule = await mappingService.deleteRule(dataSourceId, mapId);

    if (!deletedRule) {
      logger.warn(`No mapping rule found to delete (id=${mapId}, dataSource=${dataSourceId})`);
      return res.status(404).json({ error: 'Mapping rule not found' });
    }

    res.json({ message: 'Mapping rule deleted successfully', deletedRule });
  } catch (err) {
    logger.error('Error deleting mapping rule:', err);
    res.status(500).json({ error: 'Error deleting mapping rule' });
  }
});
