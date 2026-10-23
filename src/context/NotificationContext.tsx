import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToDataChanges,
} from '../services/storageService';
import { useAuth } from './AuthContext';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  toasts: ToastItem[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const loadNotifications = async () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const notifs = await getNotificationsForUser(currentUser.id);
    setNotifications(notifs);
  };

  useEffect(() => {
    loadNotifications();
    const unsubscribe = subscribeToDataChanges(() => {
      loadNotifications();
    });
    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    await loadNotifications();
  };

  const markAllAsRead = async () => {
    if (currentUser) {
      await markAllNotificationsAsRead(currentUser.id);
      await loadNotifications();
    }
  };

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto remove toast after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
