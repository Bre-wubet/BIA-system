import database from '../config/db.js';
import Report from '../models/Report.js';
import Export from '../models/Export.js';

async function setupReportsAndExports() {
  try {
    console.log('Setting up Reports and Exports tables...');

    // Create reports table
    await Report.createReportTable();
    console.log('✓ Reports table created');

    // Create exports table
    await Export.createExportTable();
    console.log('✓ Exports table created');

    // Add additional columns to reports table for new features
    await addReportColumns();
    console.log('✓ Report columns updated');

    // Create indexes for better performance
    await createIndexes();
    console.log('✓ Indexes created');

    // Insert sample report templates
    await insertSampleTemplates();
    console.log('✓ Sample templates inserted');

    console.log('✅ Reports and Exports setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up Reports and Exports:', error);
    throw error;
  }
}

async function addReportColumns() {
  const queries = [
    // Add template and sharing columns to reports table
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS allowed_roles JSONB DEFAULT '[]'`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT false`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS share_password VARCHAR(255)`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE reports ADD COLUMN IF NOT EXISTS description TEXT`
  ];

  for (const query of queries) {
    try {
      await database.query(query);
    } catch (error) {
      console.warn(`Warning: ${error.message}`);
    }
  }
}

async function createIndexes() {
  const indexes = [
    // Reports indexes
    `CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type)`,
    `CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category)`,
    `CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by)`,
    `CREATE INDEX IF NOT EXISTS idx_reports_is_template ON reports(is_template)`,
    `CREATE INDEX IF NOT EXISTS idx_reports_is_public ON reports(is_public)`,
    `CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at)`,
    
    // Exports indexes
    `CREATE INDEX IF NOT EXISTS idx_exports_user_id ON exports(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_exports_data_type ON exports(data_type)`,
    `CREATE INDEX IF NOT EXISTS idx_exports_format ON exports(format)`,
    `CREATE INDEX IF NOT EXISTS idx_exports_status ON exports(status)`,
    `CREATE INDEX IF NOT EXISTS idx_exports_created_at ON exports(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_exports_job_id ON exports(job_id)`
  ];

  for (const indexQuery of indexes) {
    try {
      await database.query(indexQuery);
    } catch (error) {
      console.warn(`Warning creating index: ${error.message}`);
    }
  }
}

async function insertSampleTemplates() {
  const templates = [
    {
      name: 'Financial Summary Report',
      type: 'financial_report',
      category: 'Finance',
      description: 'Comprehensive financial overview with revenue, expenses, and profit analysis',
      is_template: true,
      allowed_roles: ['admin', 'manager', 'finance'],
      query_config: {
        type: 'financial',
        tables: ['finance_transactions', 'budgets'],
        metrics: ['revenue', 'expenses', 'profit_margin'],
        groupBy: ['month', 'department']
      }
    },
    {
      name: 'Sales Performance Report',
      type: 'sales_report',
      category: 'Sales',
      description: 'Sales team performance metrics and conversion analysis',
      is_template: true,
      allowed_roles: ['admin', 'manager', 'sales'],
      query_config: {
        type: 'sales',
        tables: ['sales', 'leads', 'customers'],
        metrics: ['conversion_rate', 'revenue', 'leads_count'],
        groupBy: ['sales_rep', 'region', 'month']
      }
    },
    {
      name: 'Employee Attrition Report',
      type: 'hr_report',
      category: 'Human Resources',
      description: 'Employee turnover analysis by department and role',
      is_template: true,
      allowed_roles: ['admin', 'manager', 'hr'],
      query_config: {
        type: 'hr',
        tables: ['employees', 'departments'],
        metrics: ['attrition_rate', 'headcount', 'tenure'],
        groupBy: ['department', 'role', 'quarter']
      }
    },
    {
      name: 'Inventory Analysis Report',
      type: 'operations_report',
      category: 'Operations',
      description: 'Inventory levels, turnover rates, and stock analysis',
      is_template: true,
      allowed_roles: ['admin', 'manager', 'operations'],
      query_config: {
        type: 'operations',
        tables: ['inventory', 'products', 'suppliers'],
        metrics: ['stock_level', 'turnover_rate', 'reorder_point'],
        groupBy: ['product_category', 'warehouse', 'month']
      }
    },
    {
      name: 'Executive Dashboard Summary',
      type: 'analytics_report',
      category: 'Executive',
      description: 'High-level business metrics and KPIs for executive review',
      is_template: true,
      allowed_roles: ['admin', 'manager'],
      query_config: {
        type: 'analytics',
        tables: ['kpis', 'dashboards'],
        metrics: ['revenue_growth', 'customer_satisfaction', 'operational_efficiency'],
        groupBy: ['month', 'quarter']
      }
    }
  ];

  for (const template of templates) {
    try {
      await Report.createReport({
        ...template,
        created_by: 1, // Assuming admin user ID is 1
        schedule: null,
        recipients: [],
        format: 'pdf'
      });
    } catch (error) {
      console.warn(`Warning inserting template ${template.name}: ${error.message}`);
    }
  }
}

// Run the setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupReportsAndExports()
    .then(() => {
      console.log('Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

export default setupReportsAndExports;
