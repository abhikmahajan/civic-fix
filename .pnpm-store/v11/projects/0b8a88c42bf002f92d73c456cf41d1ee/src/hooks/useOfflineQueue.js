import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedCount, setQueuedCount] = useState(0);

  const getQueue = () => {
    try {
      const q = localStorage.getItem('civicfix_offline_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  };

  const updateCount = useCallback(() => {
    setQueuedCount(getQueue().length);
  }, []);

  const processQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    
    const queue = getQueue();
    if (queue.length === 0) return;
    
    const remaining = [];
    for (const item of queue) {
      try {
        const fd = new FormData();
        fd.append('description', item.description || 'No description provided');
        if (item.latitude) fd.append('latitude', item.latitude);
        if (item.longitude) fd.append('longitude', item.longitude);
        if (item.imageDataUrl) {
          const image = await fetch(item.imageDataUrl).then(response => response.blob());
          fd.append('image', image, item.imageName || 'offline-report.jpg');
        }
        await api.createComplaint(fd);
      } catch (err) {
        console.error('Error syncing queued item:', err);
        remaining.push(item);
      }
    }
    localStorage.setItem('civicfix_offline_queue', JSON.stringify(remaining));
    updateCount();
  }, [updateCount]);

  useEffect(() => {
    updateCount();
    
    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processQueue, updateCount]);

  const addToQueue = useCallback((report) => {
    const queue = getQueue();
    queue.push(report);
    localStorage.setItem('civicfix_offline_queue', JSON.stringify(queue));
    updateCount();
  }, [updateCount]);

  return { isOnline, queuedCount, addToQueue, processQueue };
}
