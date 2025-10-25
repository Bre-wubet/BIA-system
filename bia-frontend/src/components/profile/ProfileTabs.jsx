import React from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
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
  children 
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
