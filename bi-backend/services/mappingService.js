import database from '../config/db.js';
import Mapping from '../models/MappingRule.js';

async function getRules(dataSourceId) {
  return Mapping.getMappingRules(dataSourceId);
}

async function addRule(dataSourceId, rule) {
  return Mapping.addMappingRule(dataSourceId, rule);
}

async function updateRule(dataSourceId, mapId, rule) {
  return Mapping.updateMappingRule(dataSourceId, mapId, rule);
}

async function deleteRule(dataSourceId, mapId) {
  return Mapping.deleteMappingRule(dataSourceId, mapId);
}

export {
  getRules,
  addRule,
  updateRule,
  deleteRule
};
