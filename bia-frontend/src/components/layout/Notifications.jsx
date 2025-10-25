import React, { useState } from 'react';
import Tooltip from '../ui/Tooltip';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { MdNotifications } from 'react-icons/md';

const Notifications = ({ 
  notificationsOpen, 
  notificationsRef, 
  handleNotificationsToggle 
}) => {
  const [notifications] = useState([
    { id: 1, title: 'New KPI Alert', message: 'Revenue target exceeded by 15%', time: '2 min ago', type: 'success' },
    { id: 2, title: 'System Update', message: 'Scheduled maintenance tonight at 2 AM', time: '1 hour ago', type: 'info' },
    { id: 3, title: 'Data Sync Failed', message: 'Integration with CRM failed', time: '3 hours ago', type: 'error' }
  ]);
  const [unreadNotifications] = useState(2);

  return (
    <div className="relative" ref={notificationsRef}>
      <Tooltip content="Notifications">
        <button 
          onClick={handleNotificationsToggle}
          className="p-2 rounded-full text-gray-400 hover:text-gray-600 relative transition-colors"
        >
          <MdNotifications className="w-6 h-6" />
          {unreadNotifications > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadNotifications}
            </span>
          )}
        </button>
      </Tooltip>

      {/* Notifications Dropdown */}
      {notificationsOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <Badge variant="blue" size="sm">{unreadNotifications} unread</Badge>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Button variant="outline" size="sm" fullWidth>
              View All Notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
