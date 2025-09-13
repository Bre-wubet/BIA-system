export const REPORT_TEMPLATES = {
  // Financial Templates
  financial_summary: {
    id: 'financial_summary',
    name: 'Financial Summary Report',
    description: 'Comprehensive financial overview with revenue, expenses, and profit analysis',
    category: 'financial',
    format: 'pdf',
    data_sources: ['finance', 'accounting'],
    complexity: 'Medium',
    estimated_rows: 1000,
    is_popular: true,
    is_public: true,
    role: 'finance_manager',
    query: `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(revenue) as total_revenue,
        SUM(expenses) as total_expenses,
        SUM(revenue - expenses) as net_profit,
        ROUND((SUM(revenue - expenses) / SUM(revenue)) * 100, 2) as profit_margin
      FROM financial_transactions 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `,
    layout: {
      elements: [
        {
          type: 'text',
          content: 'Financial Summary Report',
          position: { x: 0, y: 0 },
          size: { width: 400, height: 50 }
        },
        {
          type: 'chart',
          chartType: 'line',
          title: 'Revenue vs Expenses Trend',
          position: { x: 0, y: 60 },
          size: { width: 400, height: 200 }
        },
        {
          type: 'table',
          title: 'Monthly Financial Data',
          position: { x: 0, y: 270 },
          size: { width: 400, height: 300 }
        }
      ]
    }
  },

  // Sales Templates
  sales_performance: {
    id: 'sales_performance',
    name: 'Sales Performance Report',
    description: 'Track sales metrics, conversion rates, and team performance',
    category: 'sales',
    format: 'excel',
    data_sources: ['sales', 'crm'],
    complexity: 'Medium',
    estimated_rows: 500,
    is_popular: true,
    is_public: true,
    role: 'sales_manager',
    query: `
      SELECT 
        s.sales_rep,
        COUNT(s.id) as total_leads,
        COUNT(CASE WHEN s.status = 'converted' THEN 1 END) as conversions,
        ROUND((COUNT(CASE WHEN s.status = 'converted' THEN 1 END) / COUNT(s.id)) * 100, 2) as conversion_rate,
        SUM(s.value) as total_value
      FROM sales_leads s
      WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      GROUP BY s.sales_rep
      ORDER BY total_value DESC
    `,
    layout: {
      elements: [
        {
          type: 'text',
          content: 'Sales Performance Report',
          position: { x: 0, y: 0 },
          size: { width: 400, height: 50 }
        },
        {
          type: 'chart',
          chartType: 'bar',
          title: 'Sales Rep Performance',
          position: { x: 0, y: 60 },
          size: { width: 400, height: 200 }
        },
        {
          type: 'table',
          title: 'Detailed Sales Data',
          position: { x: 0, y: 270 },
          size: { width: 400, height: 300 }
        }
      ]
    }
  },

  // HR Templates
  employee_attrition: {
    id: 'employee_attrition',
    name: 'Employee Attrition Report',
    description: 'Analyze employee turnover, retention rates, and exit reasons',
    category: 'hr',
    format: 'pdf',
    data_sources: ['hr', 'employees'],
    complexity: 'High',
    estimated_rows: 200,
    is_popular: true,
    is_public: false,
    role: 'hr_manager',
    query: `
      SELECT 
        department,
        COUNT(*) as total_employees,
        COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated,
        ROUND((COUNT(CASE WHEN status = 'terminated' THEN 1 END) / COUNT(*)) * 100, 2) as attrition_rate,
        AVG(DATEDIFF(termination_date, hire_date)) as avg_tenure_days
      FROM employees 
      WHERE hire_date >= DATE_SUB(NOW(), INTERVAL 2 YEAR)
      GROUP BY department
      ORDER BY attrition_rate DESC
    `,
    layout: {
      elements: [
        {
          type: 'text',
          content: 'Employee Attrition Analysis',
          position: { x: 0, y: 0 },
          size: { width: 400, height: 50 }
        },
        {
          type: 'chart',
          chartType: 'pie',
          title: 'Attrition by Department',
          position: { x: 0, y: 60 },
          size: { width: 200, height: 200 }
        },
        {
          type: 'chart',
          chartType: 'bar',
          title: 'Attrition Rates by Department',
          position: { x: 220, y: 60 },
          size: { width: 180, height: 200 }
        },
        {
          type: 'table',
          title: 'Department-wise Attrition Data',
          position: { x: 0, y: 270 },
          size: { width: 400, height: 300 }
        }
      ]
    }
  },

  // Operations Templates
  inventory_analysis: {
    id: 'inventory_analysis',
    name: 'Inventory Analysis Report',
    description: 'Monitor stock levels, turnover rates, and supply chain performance',
    category: 'operations',
    format: 'excel',
    data_sources: ['inventory', 'supply_chain'],
    complexity: 'Medium',
    estimated_rows: 800,
    is_popular: true,
    is_public: true,
    role: 'operations_manager',
    query: `
      SELECT 
        p.category,
        p.name as product_name,
        i.current_stock,
        i.min_stock_level,
        i.max_stock_level,
        CASE 
          WHEN i.current_stock <= i.min_stock_level THEN 'Low Stock'
          WHEN i.current_stock >= i.max_stock_level THEN 'Overstocked'
          ELSE 'Normal'
        END as stock_status,
        ROUND((i.total_sold / i.current_stock), 2) as turnover_ratio
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.last_updated >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
      ORDER BY stock_status, turnover_ratio DESC
    `,
    layout: {
      elements: [
        {
          type: 'text',
          content: 'Inventory Analysis Report',
          position: { x: 0, y: 0 },
          size: { width: 400, height: 50 }
        },
        {
          type: 'chart',
          chartType: 'bar',
          title: 'Stock Status Distribution',
          position: { x: 0, y: 60 },
          size: { width: 200, height: 150 }
        },
        {
          type: 'chart',
          chartType: 'pie',
          title: 'Products by Category',
          position: { x: 220, y: 60 },
          size: { width: 180, height: 150 }
        },
        {
          type: 'table',
          title: 'Detailed Inventory Data',
          position: { x: 0, y: 220 },
          size: { width: 400, height: 350 }
        }
      ]
    }
  },

  // Executive Templates
  executive_dashboard: {
    id: 'executive_dashboard',
    name: 'Executive Dashboard Report',
    description: 'High-level business metrics and KPIs for executive review',
    category: 'executive',
    format: 'pdf',
    data_sources: ['finance', 'sales', 'hr', 'operations'],
    complexity: 'High',
    estimated_rows: 50,
    is_popular: true,
    is_public: false,
    role: 'admin',
    query: `
      SELECT 
        'Revenue' as metric,
        SUM(f.revenue) as value,
        'Financial' as category
      FROM financial_transactions f
      WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
      UNION ALL
      SELECT 
        'New Customers' as metric,
        COUNT(*) as value,
        'Sales' as category
      FROM customers c
      WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
      UNION ALL
      SELECT 
        'Employee Count' as metric,
        COUNT(*) as value,
        'HR' as category
      FROM employees e
      WHERE e.status = 'active'
      UNION ALL
      SELECT 
        'Orders Processed' as metric,
        COUNT(*) as value,
        'Operations' as category
      FROM orders o
      WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `,
    layout: {
      elements: [
        {
          type: 'text',
          content: 'Executive Dashboard',
          position: { x: 0, y: 0 },
          size: { width: 400, height: 50 }
        },
        {
          type: 'chart',
          chartType: 'bar',
          title: 'Key Business Metrics',
          position: { x: 0, y: 60 },
          size: { width: 400, height: 200 }
        },
        {
          type: 'table',
          title: 'Executive Summary',
          position: { x: 0, y: 270 },
          size: { width: 400, height: 300 }
        }
      ]
    }
  },

  // Marketing Templates
  campaign_performance: {
    id: 'campaign_performance',
    name: 'Marketing Campaign Performance',
    description: 'Analyze marketing campaign effectiveness and ROI',
    category: 'marketing',
    format: 'excel',
    data_sources: ['marketing', 'analytics'],
    complexity: 'Medium',
    estimated_rows: 300,
    is_popular: true,
    is_public: true,
    role: 'sales_manager',
    query: `
      SELECT 
        c.name as campaign_name,
        c.start_date,
        c.end_date,
        c.budget,
        COUNT(l.id) as leads_generated,
        COUNT(CASE WHEN l.status = 'converted' THEN 1 END) as conversions,
        ROUND((COUNT(CASE WHEN l.status = 'converted' THEN 1 END) / COUNT(l.id)) * 100, 2) as conversion_rate,
        SUM(l.value) as revenue_generated,
        ROUND((SUM(l.value) - c.budget) / c.budget * 100, 2) as roi_percentage
      FROM campaigns c
      LEFT JOIN campaign_leads l ON c.id = l.campaign_id
      WHERE c.start_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY c.id, c.name, c.start_date, c.end_date, c.budget
      ORDER BY roi_percentage DESC
    `,
    layout: {
      elements: [
        {
          type: 'text',
          content: 'Campaign Performance Report',
          position: { x: 0, y: 0 },
          size: { width: 400, height: 50 }
        },
        {
          type: 'chart',
          chartType: 'bar',
          title: 'Campaign ROI Comparison',
          position: { x: 0, y: 60 },
          size: { width: 200, height: 150 }
        },
        {
          type: 'chart',
          chartType: 'line',
          title: 'Conversion Rates Over Time',
          position: { x: 220, y: 60 },
          size: { width: 180, height: 150 }
        },
        {
          type: 'table',
          title: 'Campaign Details',
          position: { x: 0, y: 220 },
          size: { width: 400, height: 350 }
        }
      ]
    }
  },

  // Custom Templates
  custom_data_export: {
    id: 'custom_data_export',
    name: 'Custom Data Export',
    description: 'Flexible template for custom data exports with user-defined queries',
    category: 'custom',
    format: 'csv',
    data_sources: ['all'],
    complexity: 'Low',
    estimated_rows: 'Variable',
    is_popular: false,
    is_public: true,
    role: 'analyst',
    query: '-- Custom query will be provided by user',
    layout: {
      elements: [
        {
          type: 'text',
          content: 'Custom Data Export',
          position: { x: 0, y: 0 },
          size: { width: 400, height: 50 }
        },
        {
          type: 'table',
          title: 'Data Export',
          position: { x: 0, y: 60 },
          size: { width: 400, height: 500 }
        }
      ]
    }
  }
};

export const EXPORT_TEMPLATES = {
  // CSV Templates
  csv_sales_data: {
    id: 'csv_sales_data',
    name: 'Sales Data Export (CSV)',
    description: 'Export sales data in CSV format for analysis',
    category: 'sales',
    format: 'csv',
    data_sources: ['sales'],
    complexity: 'Low',
    estimated_rows: 1000,
    is_popular: true,
    is_public: true,
    role: 'sales_manager',
    query: `
      SELECT 
        s.id,
        s.customer_name,
        s.product_name,
        s.quantity,
        s.unit_price,
        s.total_amount,
        s.sale_date,
        s.sales_rep
      FROM sales s
      WHERE s.sale_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      ORDER BY s.sale_date DESC
    `
  },

  // Excel Templates
  excel_financial_report: {
    id: 'excel_financial_report',
    name: 'Financial Report (Excel)',
    description: 'Comprehensive financial data export in Excel format',
    category: 'financial',
    format: 'excel',
    data_sources: ['finance'],
    complexity: 'Medium',
    estimated_rows: 500,
    is_popular: true,
    is_public: true,
    role: 'finance_manager',
    query: `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        account_name,
        transaction_type,
        amount,
        description,
        created_at
      FROM financial_transactions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 2 YEAR)
      ORDER BY created_at DESC
    `
  },

  // PDF Templates
  pdf_employee_report: {
    id: 'pdf_employee_report',
    name: 'Employee Report (PDF)',
    description: 'Employee data export in PDF format with formatting',
    category: 'hr',
    format: 'pdf',
    data_sources: ['hr'],
    complexity: 'Medium',
    estimated_rows: 200,
    is_popular: true,
    is_public: false,
    role: 'hr_manager',
    query: `
      SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.department,
        e.position,
        e.hire_date,
        e.salary,
        e.status
      FROM employees e
      WHERE e.status = 'active'
      ORDER BY e.department, e.last_name
    `
  }
};

export const getTemplatesByRole = (role) => {
  const allTemplates = { ...REPORT_TEMPLATES, ...EXPORT_TEMPLATES };
  const roleTemplates = {
    [ROLES.ADMIN]: Object.values(allTemplates),
    [ROLES.MANAGER]: Object.values(allTemplates).filter(t => 
      ['executive', 'management', 'sales', 'hr', 'finance', 'operations'].includes(t.category)
    ),
    [ROLES.ANALYST]: Object.values(allTemplates).filter(t => 
      ['analytics', 'data_analysis', 'custom'].includes(t.category)
    ),
    [ROLES.VIEWER]: Object.values(allTemplates).filter(t => t.is_public),
    [ROLES.SALES]: Object.values(allTemplates).filter(t => 
      ['sales', 'marketing', 'customer'].includes(t.category)
    ),
    [ROLES.HR]: Object.values(allTemplates).filter(t => 
      ['hr', 'employee', 'performance'].includes(t.category)
    ),
    [ROLES.FINANCE]: Object.values(allTemplates).filter(t => 
      ['finance', 'budget', 'revenue'].includes(t.category)
    ),
    [ROLES.OPERATIONS]: Object.values(allTemplates).filter(t => 
      ['operations', 'supply_chain', 'inventory'].includes(t.category)
    )
  };
  return roleTemplates[role] || [];
};

export const getTemplatesByCategory = (category) => {
  const allTemplates = { ...REPORT_TEMPLATES, ...EXPORT_TEMPLATES };
  return Object.values(allTemplates).filter(template => template.category === category);
};

export const getPopularTemplates = () => {
  const allTemplates = { ...REPORT_TEMPLATES, ...EXPORT_TEMPLATES };
  return Object.values(allTemplates).filter(template => template.is_popular);
};
