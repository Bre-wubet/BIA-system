import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

/**
 * Dashboard page component that displays various business metrics and KPIs
 * @returns {React.ReactNode} - Dashboard page with widgets
 */
const Dashboard = () => {
  // Mock data for dashboard widgets
  const dashboardWidgets = [
    {
      id: 'sales-overview',
      title: 'Sales Overview',
      size: 'large',
      content: (
        <div className="h-64 flex flex-col justify-center items-center">
          <div className="text-3xl font-bold text-blue-600">$124,500</div>
          <div className="text-sm text-green-500 mt-2">↑ 12% from last month</div>
          <div className="w-full h-32 mt-4 bg-gray-100 rounded flex items-end p-2">
            {/* Mock bar chart */}
            {[40, 65, 50, 80, 75, 90, 60].map((height, index) => (
              <div 
                key={index} 
                className="flex-1 mx-1 bg-blue-500 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'top-products',
      title: 'Top Products',
      size: 'medium',
      content: (
        <div className="h-64 overflow-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Sales</th>
                <th className="text-right py-2">Growth</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Product A', sales: '$12,500', growth: '+15%' },
                { name: 'Product B', sales: '$9,200', growth: '+8%' },
                { name: 'Product C', sales: '$8,100', growth: '+5%' },
                { name: 'Product D', sales: '$6,400', growth: '-2%' },
                { name: 'Product E', sales: '$5,900', growth: '+10%' },
              ].map((product, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2">{product.name}</td>
                  <td className="text-right py-2">{product.sales}</td>
                  <td className={`text-right py-2 ${product.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {product.growth}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'customer-acquisition',
      title: 'Customer Acquisition',
      size: 'medium',
      content: (
        <div className="h-64 flex flex-col">
          <div className="flex justify-between mb-4">
            <div className="text-center">
              <div className="text-2xl font-semibold">1,245</div>
              <div className="text-xs text-gray-500">New Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold">$42</div>
              <div className="text-xs text-gray-500">Acquisition Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold">18%</div>
              <div className="text-xs text-gray-500">Conversion Rate</div>
            </div>
          </div>
          {/* Mock line chart */}
          <div className="flex-1 flex items-end">
            <svg className="w-full h-32" viewBox="0 0 100 50">
              <path
                d="M0,50 L10,45 L20,48 L30,40 L40,35 L50,30 L60,25 L70,20 L80,15 L90,18 L100,10"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <path
                d="M0,50 L10,45 L20,48 L30,40 L40,35 L50,30 L60,25 L70,20 L80,15 L90,18 L100,10 L100,50 L0,50"
                fill="rgba(59, 130, 246, 0.1)"
                stroke="none"
              />
            </svg>
          </div>
        </div>
      ),
    },
    {
      id: 'recent-activity',
      title: 'Recent Activity',
      size: 'small',
      content: (
        <div className="h-64 overflow-auto">
          {[
            { action: 'New order placed', time: '5 minutes ago', user: 'John Doe' },
            { action: 'Customer support ticket resolved', time: '1 hour ago', user: 'Jane Smith' },
            { action: 'New user registered', time: '3 hours ago', user: 'Robert Johnson' },
            { action: 'Product inventory updated', time: '5 hours ago', user: 'System' },
            { action: 'Monthly report generated', time: '1 day ago', user: 'System' },
          ].map((activity, index) => (
            <div key={index} className="py-2 border-b last:border-0">
              <div className="font-medium">{activity.action}</div>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>{activity.time}</span>
                <span>{activity.user}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      size: 'small',
      content: (
        <div className="h-64 grid grid-cols-2 gap-2">
          {[
            { name: 'New Order', icon: '📦' },
            { name: 'Add Product', icon: '➕' },
            { name: 'Support', icon: '🎧' },
            { name: 'Reports', icon: '📊' },
            { name: 'Settings', icon: '⚙️' },
            { name: 'Logout', icon: '🚪' },
          ].map((action, index) => (
            <button
              key={index}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded flex flex-col items-center justify-center transition-colors"
            >
              <div className="text-xl mb-1">{action.icon}</div>
              <div className="text-sm">{action.name}</div>
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout widgets={dashboardWidgets} title="Business Overview">
      {/* Fallback content if no widgets are provided */}
      <div className="col-span-4 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-medium mb-4">Welcome to your dashboard</h3>
        <p className="text-gray-600">
          This is your business intelligence dashboard. Add widgets to monitor your key metrics and performance indicators.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;