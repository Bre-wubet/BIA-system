import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { ROUTES } from '../constants/routes';

export const useDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handler functions
  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
    setNotificationsOpen(false);
  };

  const handleNotificationsToggle = () => {
    setNotificationsOpen(!notificationsOpen);
    setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
      navigate(ROUTES.LOGIN);
    }
  };

  const handleSettings = () => {
    navigate('/dashboard/settings');
    setUserMenuOpen(false);
  };

  const handleProfile = () => {
    navigate('/dashboard/profile');
    setUserMenuOpen(false);
  };

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return {
    // State
    sidebarOpen,
    userMenuOpen,
    notificationsOpen,
    user,
    
    // Refs
    userMenuRef,
    notificationsRef,
    
    // Handlers
    handleUserMenuToggle,
    handleNotificationsToggle,
    handleLogout,
    handleSettings,
    handleProfile,
    closeSidebar,
    openSidebar,
    
    // Utils
    location
  };
};
