import logger from '../../config/logger.js';

const defaultOptions = {
  delimiter: ',',
  quote: '"',
  escape: '"',
  newline: '\n',
  header: true,
  encoding: 'utf8'
};

// ---------------- Core Helpers ----------------
function stringifyValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function escapeField(value, options) {
  if (value === null || value === undefined) return '';

  const stringValue = stringifyValue(value);

  const needsQuoting =
    stringValue.includes(options.delimiter) ||
    stringValue.includes(options.quote) ||
    stringValue.includes(options.newline) ||
    stringValue.includes(' ');

  if (needsQuoting) {
    const escaped = stringValue.replace(
      new RegExp(options.escape, 'g'),
      options.escape + options.escape
    );
    return options.quote + escaped + options.quote;
  }

  return stringValue;
}

function flattenObject(obj, prefix = '') {
  const flattened = {};

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }

  return flattened;
}

// ---------------- Exporter API ----------------
function convertToCSV(data, options = {}) {
  try {
    const opts = { ...defaultOptions, ...options };

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }

    const headers = Object.keys(data[0]);
    let csv = '';

    if (opts.header) {
      csv +=
        headers.map(h => escapeField(h, opts)).join(opts.delimiter) +
        opts.newline;
    }

    data.forEach(row => {
      const values = headers.map(h => escapeField(row[h], opts));
      csv += values.join(opts.delimiter) + opts.newline;
    });

    return csv;
  } catch (error) {
    logger.error('Error converting to CSV:', error);
    throw error;
  }
}

function convertObjectToCSV(obj, options = {}) {
  try {
    const opts = { ...defaultOptions, ...options };
    const flattened = flattenObject(obj);

    const rows = Object.entries(flattened).map(([key, value]) => ({
      key,
      value: stringifyValue(value)
    }));

    return convertToCSV(rows, opts);
  } catch (error) {
    logger.error('Error converting object to CSV:', error);
    throw error;
  }
}

function convertNestedToCSV(data, options = {}) {
  try {
    const opts = { ...defaultOptions, ...options };

    if (Array.isArray(data)) return convertToCSV(data, opts);
    if (typeof data === 'object') return convertObjectToCSV(data, opts);

    throw new Error('Data must be an array or object');
  } catch (error) {
    logger.error('Error converting nested data to CSV:', error);
    throw error;
  }
}

function convertDashboardToCSV(dashboard) {
  try {
    const csvRows = [];

    csvRows.push(['Dashboard Name', dashboard.name]);
    csvRows.push(['Description', dashboard.description || '']);
    csvRows.push(['Created At', dashboard.created_at]);
    csvRows.push(['Updated At', dashboard.updated_at]);
    csvRows.push(['Is Public', dashboard.is_public ? 'Yes' : 'No']);
    csvRows.push(['Is Default', dashboard.is_default ? 'Yes' : 'No']);
    csvRows.push(['Refresh Interval', dashboard.refresh_interval]);
    csvRows.push([]);

    if (dashboard.widgets?.length > 0) {
      csvRows.push(['Widgets']);
      csvRows.push(['ID', 'Type', 'Title', 'Config']);

      dashboard.widgets.forEach(w =>
        csvRows.push([
          w.id,
          w.type,
          w.title || '',
          JSON.stringify(w.config || {})
        ])
      );
      csvRows.push([]);
    }

    if (dashboard.kpis?.length > 0) {
      csvRows.push(['KPIs']);
      csvRows.push(['Name', 'Category', 'Current Value', 'Target Value', 'Trend']);
      dashboard.kpis.forEach(k =>
        csvRows.push([
          k.name,
          k.category,
          k.current_value,
          k.target_value,
          k.trend
        ])
      );
    }

    return csvRows.map(r => r.join(',')).join('\n');
  } catch (error) {
    logger.error('Error converting dashboard to CSV:', error);
    throw error;
  }
}

function convertAnalyticsToCSV(analytics, type) {
  try {
    let csvRows = [];

    switch (type) {
      case 'kpi':
        csvRows = convertKPIAnalyticsToCSV(analytics);
        break;
      case 'predictive':
        csvRows = convertPredictiveAnalyticsToCSV(analytics);
        break;
      case 'cross-module':
        csvRows = convertCrossModuleAnalyticsToCSV(analytics);
        break;
      case 'anomalies':
        csvRows = convertAnomalyDetectionToCSV(analytics);
        break;
      default:
        csvRows = convertGenericAnalyticsToCSV(analytics);
    }

    return csvRows.map(r => r.join(',')).join('\n');
  } catch (error) {
    logger.error('Error converting analytics to CSV:', error);
    throw error;
  }
}

// ---------------- Analytics Converters ----------------
function convertKPIAnalyticsToCSV(analytics) {
  const rows = [['KPI Analytics Summary']];
  rows.push(['Total KPIs', analytics.totalKPIs]);
  rows.push(['Categories', analytics.categories?.join(', ') || '']);
  rows.push([]);

  if (analytics.performance) {
    rows.push(['Performance Metrics']);
    rows.push(['Metric', 'Value']);
    rows.push(['Total', analytics.performance.total]);
    rows.push(['Active', analytics.performance.active]);
    rows.push(['On Target', analytics.performance.onTarget]);
    rows.push(['Below Target', analytics.performance.belowTarget]);
    rows.push(['Above Target', analytics.performance.aboveTarget]);
    rows.push(['Average Accuracy', analytics.performance.averageAccuracy]);
    rows.push([]);
  }

  if (analytics.trends) {
    rows.push(['Trend Analysis']);
    rows.push(['Category', 'Total KPIs', 'Up Count', 'Down Count', 'Stable Count']);
    analytics.trends.forEach(t =>
      rows.push([t.category, t.total_kpis, t.up_count, t.down_count, t.stable_count])
    );
  }

  return rows;
}

function convertPredictiveAnalyticsToCSV(analytics) {
  const rows = [['Predictive Analytics Summary']];
  rows.push(['Total Models', analytics.totalModels]);
  rows.push(['Active Models', analytics.activeModels]);
  rows.push(['Average Accuracy', analytics.averageAccuracy]);
  rows.push([]);

  if (analytics.modelPerformance) {
    rows.push(['Model Performance by Category']);
    rows.push(['Category', 'Total Models', 'Average Accuracy', 'Active Models', 'Training Models']);
    analytics.modelPerformance.forEach(p =>
      rows.push([p.category, p.total_models, p.avg_accuracy, p.active_models, p.training_models])
    );
  }

  return rows;
}

function convertCrossModuleAnalyticsToCSV(analytics) {
  const rows = [['Cross-Module Analytics'], []];

  if (analytics.salesVsMarketing) {
    rows.push(['Sales vs Marketing']);
    rows.push(['Correlation', analytics.salesVsMarketing.correlation]);
    rows.push(['Insights']);
    analytics.salesVsMarketing.insights.forEach(i => rows.push(['', i]));
    rows.push([]);
  }

  if (analytics.financeVsOperations) {
    rows.push(['Finance vs Operations']);
    rows.push(['Correlation', analytics.financeVsOperations.correlation]);
    rows.push(['Insights']);
    analytics.financeVsOperations.insights.forEach(i => rows.push(['', i]));
    rows.push([]);
  }

  return rows;
}

function convertAnomalyDetectionToCSV(analytics) {
  const rows = [['Anomaly Detection Summary']];
  rows.push(['Total Anomalies', analytics.totalAnomalies]);
  rows.push(['High Severity', analytics.highSeverity]);
  rows.push(['Medium Severity', analytics.mediumSeverity]);
  rows.push(['Low Severity', analytics.lowSeverity]);
  rows.push([]);

  if (analytics.anomalies) {
    rows.push(['Anomalies']);
    rows.push(['ID', 'Type', 'Severity', 'Description', 'Value', 'Expected', 'Deviation', 'Timestamp']);
    analytics.anomalies.forEach(a =>
      rows.push([a.id, a.type, a.severity, a.description, a.value, a.expected, a.deviation, a.timestamp])
    );
  }

  return rows;
}

function convertGenericAnalyticsToCSV(analytics) {
  const rows = [['Analytics Data'], ['Key', 'Value']];
  Object.entries(analytics).forEach(([key, value]) => {
    rows.push([key, typeof value === 'object' ? JSON.stringify(value) : value]);
  });
  return rows;
}

// ---------------- Export Singleton ----------------
const csvExporter = {
  convertToCSV,
  convertObjectToCSV,
  convertNestedToCSV,
  convertDashboardToCSV,
  convertAnalyticsToCSV
};

export default csvExporter;
