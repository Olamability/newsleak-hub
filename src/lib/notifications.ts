// Local notifications stub
export async function getNotifications(userId: string) {
  const stored = localStorage.getItem('newsleak_notifications');
  return stored ? JSON.parse(stored) : [];
}

export async function markAsRead(notificationId: string, userId: string) {
  // Mark notification as read in localStorage
  const stored = localStorage.getItem('newsleak_notifications');
  if (stored) {
    const notifications = JSON.parse(stored);
    const updated = notifications.map((n: any) => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('newsleak_notifications', JSON.stringify(updated));
  }
}

export async function createNotification(notification: any) {
  const stored = localStorage.getItem('newsleak_notifications');
  const notifications = stored ? JSON.parse(stored) : [];
  notifications.push({
    ...notification,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    read: false
  });
  localStorage.setItem('newsleak_notifications', JSON.stringify(notifications));
}

export async function requestNotificationPermission() {
  // In local version, just return success
  return Promise.resolve({ permission: 'granted' });
}
