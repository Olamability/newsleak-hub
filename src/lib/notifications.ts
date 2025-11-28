// src/lib/notifications.ts
// Utility for browser push notifications (MVP: Notification API, no backend)

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied');
  }
  return Notification.requestPermission();
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

// Example: sendBreakingNewsNotification
export function sendBreakingNewsNotification(article: { title: string; source: string; image?: string; link?: string }) {
  sendNotification(`Breaking: ${article.title}`, {
    body: `Source: ${article.source}`,
    icon: article.image,
    data: { link: article.link },
  });
}
