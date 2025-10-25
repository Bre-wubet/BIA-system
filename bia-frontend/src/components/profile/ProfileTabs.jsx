import React from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { 
  MdPerson, 
  MdSecurity, 
  MdNotifications, 
  MdSettings, 
  MdLock 
} from 'react-icons/md';

const ProfileTabs = ({ 
  activeTab, 
  setActiveTab, 
  children,
  editing = false
}) => {
  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: MdPerson },
    { id: 'security', label: 'Security', icon: MdSecurity },
    { id: 'notifications', label: 'Notifications', icon: MdNotifications },
    { id: 'preferences', label: 'Preferences', icon: MdSettings },
    { id: 'privacy', label: 'Privacy', icon: MdLock }
  ];

  return (
    <Card>
      <div className="p-6">
        {editing && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-blue-700 font-medium">Editing Mode Active</span>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'primary' : 'outline'}
              size="sm"
              icon={<tab.icon className="w-4 h-4" />}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        {children}
      </div>
    </Card>
  );
};

export default ProfileTabs;
