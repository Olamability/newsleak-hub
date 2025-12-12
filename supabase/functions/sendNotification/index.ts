// Supabase Edge Function: sendNotification
// Sends push notifications via Firebase Cloud Messaging

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY');

interface NotificationRequest {
  title: string;
  body: string;
  imageUrl?: string;
  articleId?: string;
  tokens: string[];
}

interface FCMMessage {
  notification: {
    title: string;
    body: string;
    image?: string;
  };
  data: {
    articleId: string;
    url: string;
    click_action?: string;
  };
  registration_ids: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Verify Firebase Server Key is configured
    if (!FIREBASE_SERVER_KEY) {
      console.error('FIREBASE_SERVER_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    // Parse request body
    const { title, body, imageUrl, articleId, tokens } = await req.json() as NotificationRequest;

    // Validate input
    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No FCM tokens provided' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    console.log(`Sending notification to ${tokens.length} devices`);

    // Prepare FCM message
    const message: FCMMessage = {
      notification: {
        title,
        body,
      },
      data: {
        articleId: articleId || '',
        url: articleId ? `/article/${articleId}` : '/',
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // For mobile apps
      },
      registration_ids: tokens.slice(0, 1000), // FCM limit is 1000 tokens per request
    };

    // Add image if provided
    if (imageUrl) {
      message.notification.image = imageUrl;
    }

    // Send to Firebase Cloud Messaging
    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const fcmResult = await fcmResponse.json();

    console.log('FCM Response:', fcmResult);

    // Check for errors
    if (!fcmResponse.ok) {
      console.error('FCM Error:', fcmResult);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send notification',
          details: fcmResult 
        }),
        { 
          status: fcmResponse.status,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    // Parse success and failure counts
    const { success, failure, results } = fcmResult;
    
    // Get invalid tokens (to remove from database)
    const invalidTokens: string[] = [];
    if (results && Array.isArray(results)) {
      results.forEach((result: any, index: number) => {
        if (result.error === 'InvalidRegistration' || 
            result.error === 'NotRegistered') {
          invalidTokens.push(tokens[index]);
        }
      });
    }

    console.log(`Notification sent: ${success} successful, ${failure} failed`);
    if (invalidTokens.length > 0) {
      console.log(`Invalid tokens to remove: ${invalidTokens.length}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: success,
        failed: failure,
        invalidTokens,
        total: tokens.length
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );

  } catch (error: unknown) {
    console.error('Error in sendNotification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
});
