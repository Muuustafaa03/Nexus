import { useState, useEffect } from 'react';

// Simple state management for Portal Official message read status
let isPortalMessageRead = false;
const listeners: Array<(read: boolean) => void> = [];

export function usePortalMessageStatus() {
  const [isRead, setIsRead] = useState(isPortalMessageRead);

  useEffect(() => {
    const listener = (read: boolean) => setIsRead(read);
    listeners.push(listener);
    
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const markAsRead = () => {
    isPortalMessageRead = true;
    listeners.forEach(listener => listener(true));
  };

  const markAsUnread = () => {
    isPortalMessageRead = false;
    listeners.forEach(listener => listener(false));
  };

  return {
    isRead,
    markAsRead,
    markAsUnread,
  };
}