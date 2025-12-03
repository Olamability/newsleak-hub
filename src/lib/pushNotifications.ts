// Firebase Cloud Messaging Service for Push Notifications
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { app } from './firebase';
import { supabase } from './supabaseClient';

let messaging: Messaging | null = null;

// Initialize Firebase Cloud Messaging
export const initializeMessaging = () => {
  try {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      messaging = getMessaging(app);
      return messaging;
    } else {
      console.warn('Push notifications not supported in this browser');
      return null;
    }
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return null;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      if (!messaging) {
        messaging = initializeMessaging();
      }
      
      if (messaging) {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        
        if (!vapidKey) {
          console.error('VAPID key not configured');
          return null;
        }
        
        const token = await getToken(messaging, { vapidKey });
        
        if (token) {
          console.log('FCM Token:', token);
          await saveFCMToken(token);
          return token;
        } else {
          console.log('No registration token available.');
          return null;
        }
      }
    } else {
      console.log('Notification permission denied.');
      return null;
    }
    
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Save FCM token to database for the current user
const saveFCMToken = async (token: string) => {
  try {
    // Get or create user ID with proper consent tracking
    let userId = localStorage.getItem('userId');
    
    if (!userId) {
      // Generate anonymous user ID only if user consents to notifications
      userId = `anon_${crypto.randomUUID()}`;
      localStorage.setItem('userId', userId);
      // Mark that user has consented to tracking by enabling notifications
      localStorage.setItem('trackingConsent', 'true');
    }
    
    // Store in localStorage for future reference
    localStorage.setItem('fcmToken', token);
    
    // Create/update user preferences with FCM token
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        fcm_token: token,
        notification_enabled: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error('Error saving FCM token:', error);
    } else {
      console.log('FCM token saved successfully');
    }
  } catch (error) {
    console.error('Error in saveFCMToken:', error);
  }
};

// Handle foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) {
    messaging = initializeMessaging();
  }
  
  if (messaging) {
    return onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
      
      // Show notification even in foreground
      if (payload.notification) {
        showNotification(
          payload.notification.title || 'New Notification',
          {
            body: payload.notification.body,
            icon: payload.notification.icon || '/icon-192.png',
            image: payload.notification.image,
            data: payload.data,
            tag: payload.data?.articleId || 'default',
            requireInteraction: false,
          }
        );
      }
    });
  }
  
  return () => {};
};

// Show browser notification
export const showNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      ...options,
    });
    
    notification.onclick = (event) => {
      event.preventDefault();
      const url = (options?.data as any)?.url || '/';
      window.open(url, '_blank');
      notification.close();
    };
    
    return notification;
  }
  return null;
};

// Send notification (admin function - calls backend)
export const sendPushNotification = async (params: {
  title: string;
  body: string;
  imageUrl?: string;
  articleId?: string;
  userIds?: string[];
  categoryFilter?: string;
}) => {
  try {
    // Get FCM tokens for target users
    let query = supabase
      .from('user_preferences')
      .select('fcm_token, user_id')
      .eq('notification_enabled', true)
      .not('fcm_token', 'is', null);
    
    if (params.userIds && params.userIds.length > 0) {
      query = query.in('user_id', params.userIds);
    }
    
    if (params.categoryFilter) {
      query = query.contains('favorite_categories', [params.categoryFilter]);
    }
    
    const { data: users, error } = await query;
    
    if (error) throw error;
    
    if (!users || users.length === 0) {
      console.warn('No users with FCM tokens found');
      return { success: false, message: 'No recipients found' };
    }
    
    const tokens = users.map(u => u.fcm_token).filter(Boolean);
    
    // Call Supabase Edge Function to send notification
    const { data, error: sendError } = await supabase.functions.invoke('sendNotification', {
      body: {
        title: params.title,
        body: params.body,
        imageUrl: params.imageUrl,
        articleId: params.articleId,
        tokens,
      },
    });
    
    if (sendError) throw sendError;
    
    // Save notification to database
    await supabase.from('notifications').insert({
      title: params.title,
      body: params.body,
      article_id: params.articleId,
      category_filter: params.categoryFilter,
      image_url: params.imageUrl,
      is_sent: true,
      sent_at: new Date().toISOString(),
      sent_count: tokens.length,
      notification_type: 'breaking_news',
    });
    
    return { success: true, data, sentTo: tokens.length };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error };
  }
};

// Subscribe to topic (for category-based notifications)
export const subscribeToTopic = async (topic: string) => {
  try {
    const token = localStorage.getItem('fcmToken');
    if (!token) {
      console.warn('No FCM token available');
      return false;
    }
    
    // This would typically call a backend endpoint to subscribe the token to a topic
    // For now, we'll just update user preferences
    const userId = localStorage.getItem('userId');
    if (userId) {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('favorite_categories')
        .eq('user_id', userId)
        .single();
      
      const currentCategories = prefs?.favorite_categories || [];
      if (!currentCategories.includes(topic)) {
        await supabase
          .from('user_preferences')
          .update({
            favorite_categories: [...currentCategories, topic]
          })
          .eq('user_id', userId);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    return false;
  }
};

// Unsubscribe from topic
export const unsubscribeFromTopic = async (topic: string) => {
  try {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('favorite_categories')
        .eq('user_id', userId)
        .single();
      
      const currentCategories = prefs?.favorite_categories || [];
      const updatedCategories = currentCategories.filter((c: string) => c !== topic);
      
      await supabase
        .from('user_preferences')
        .update({
          favorite_categories: updatedCategories
        })
        .eq('user_id', userId);
    }
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    return false;
  }
};

// Get notification permission status
export const getNotificationPermission = (): NotificationPermission => {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
};

// Check if notifications are supported
export const areNotificationsSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};
