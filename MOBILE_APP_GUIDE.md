# Mobile App Development Guide for Newsleak

This guide provides comprehensive instructions for developing native mobile applications (iOS & Android) for the Newsleak platform using React Native.

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Project Setup](#project-setup)
5. [Architecture](#architecture)
6. [Implementation Guide](#implementation-guide)
7. [Push Notifications](#push-notifications)
8. [Deployment](#deployment)
9. [App Store Submission](#app-store-submission)

---

## Overview

The Newsleak mobile app will provide native iOS and Android experiences while sharing the same backend infrastructure (Supabase) and business logic as the web application.

### Key Features

- Native navigation and performance
- Offline reading with local storage
- Push notifications (Firebase Cloud Messaging)
- Biometric authentication (Face ID/Touch ID)
- Share functionality
- Deep linking support
- Native image caching

---

## Technology Stack

### Recommended: React Native

**Pros:**
- Share code with web app (React components, hooks, utilities)
- Single codebase for iOS and Android
- Large ecosystem and community
- Hot reloading for fast development
- Native performance with bridge optimization

**Stack:**
- **Framework**: React Native 0.72+
- **Navigation**: React Navigation 6
- **State Management**: React Query (same as web)
- **UI Library**: React Native Paper or NativeBase
- **Push Notifications**: React Native Firebase
- **Storage**: AsyncStorage + React Native MMKV
- **Networking**: Axios (same as web)

### Alternative: Flutter

**Pros:**
- High performance (compiled to native code)
- Beautiful UI with Material Design
- Strong typing with Dart

**Note**: This guide focuses on React Native for code reuse with the web app.

---

## Prerequisites

### Development Environment

#### For macOS (iOS + Android)

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
brew install watchman

# Install CocoaPods (for iOS)
sudo gem install cocoapods

# Install Xcode from App Store
# Install Xcode Command Line Tools
xcode-select --install

# Install Android Studio
# Download from https://developer.android.com/studio
```

#### For Windows/Linux (Android only)

```bash
# Install Node.js from https://nodejs.org

# Install Android Studio
# Download from https://developer.android.com/studio

# Set up Android SDK
# Set ANDROID_HOME environment variable
```

### Accounts Needed

1. Apple Developer Account ($99/year for iOS)
2. Google Play Console Account ($25 one-time for Android)
3. Firebase Project (already created for web)
4. Supabase Project (already created for web)

---

## Project Setup

### 1. Initialize React Native Project

```bash
# Create new React Native app with TypeScript
npx react-native@latest init NewsleakMobile --template react-native-template-typescript

cd NewsleakMobile
```

### 2. Install Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# Firebase
npm install @react-native-firebase/app @react-native-firebase/messaging @react-native-firebase/auth

# Supabase
npm install @supabase/supabase-js

# State Management
npm install @tanstack/react-query

# UI Components
npm install react-native-paper

# Storage
npm install @react-native-async-storage/async-storage
npm install react-native-mmkv

# Image Handling
npm install react-native-fast-image

# Other Utilities
npm install axios date-fns

# Development
npm install --save-dev @types/react @types/react-native
```

### 3. iOS Setup

```bash
cd ios
pod install
cd ..
```

### 4. Android Setup

Update `android/build.gradle`:

```gradle
buildscript {
    ext {
        buildToolsVersion = "33.0.0"
        minSdkVersion = 21
        compileSdkVersion = 33
        targetSdkVersion = 33
    }
    dependencies {
        classpath("com.google.gms:google-services:4.3.15")
    }
}
```

Update `android/app/build.gradle`:

```gradle
apply plugin: "com.google.gms.google-services"

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.0.0')
}
```

---

## Architecture

### Project Structure

```
NewsleakMobile/
├── src/
│   ├── components/      # Reusable components
│   │   ├── NewsCard.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── screens/         # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ArticleDetailScreen.tsx
│   │   ├── BookmarksScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/      # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── services/        # API and business logic
│   │   ├── supabase.ts
│   │   ├── firebase.ts
│   │   ├── newsApi.ts
│   │   └── storage.ts
│   ├── hooks/          # Custom hooks (reuse from web)
│   │   ├── useNews.ts
│   │   ├── useLike.ts
│   │   └── useBookmark.ts
│   ├── utils/          # Utility functions (reuse from web)
│   │   ├── newsAlgorithms.ts
│   │   └── helpers.ts
│   ├── types/          # TypeScript types
│   │   └── index.ts
│   └── config/         # Configuration
│       ├── supabase.ts
│       └── firebase.ts
├── android/
├── ios/
└── App.tsx
```

### Shared Code

Reuse these from the web app:
- API client logic (`src/lib/supabaseClient.ts`)
- Business logic (`src/lib/newsAlgorithms.ts`)
- Type definitions
- Utility functions
- React Query hooks

---

## Implementation Guide

### 1. Supabase Configuration

Create `src/config/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 2. Firebase Configuration

Create `src/config/firebase.ts`:

```typescript
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

export const firebaseAuth = auth();
export const firebaseMessaging = messaging();

// Request notification permission
export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return true;
  }
  return false;
}

// Get FCM token
export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}
```

### 3. Navigation Setup

Create `src/navigation/AppNavigator.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import TrendingScreen from '../screens/TrendingScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#999',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Trending"
        component={TrendingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="bookmark" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ArticleDetail"
          component={ArticleDetailScreen}
          options={{ title: 'Article' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 4. Home Screen

Create `src/screens/HomeScreen.tsx`:

```typescript
import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import NewsCard from '../components/NewsCard';

export default function HomeScreen({ navigation }) {
  const { data: articles, isLoading, refetch } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_published', true)
        .order('published', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            onPress={() => navigation.navigate('ArticleDetail', { article: item })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
```

### 5. News Card Component

Create `src/components/NewsCard.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { formatDistanceToNow } from 'date-fns';

export default function NewsCard({ article, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <FastImage
        source={{ uri: article.image || 'https://via.placeholder.com/400x200' }}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {article.description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.source}>{article.source}</Text>
          <Text style={styles.time}>
            {formatDistanceToNow(new Date(article.published), { addSuffix: true })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  source: {
    fontSize: 12,
    color: '#999',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});
```

---

## Push Notifications

### iOS Setup

1. Enable Push Notifications capability in Xcode
2. Add APNs key in Firebase Console
3. Update `AppDelegate.m`:

```objc
#import <Firebase.h>
#import <UserNotifications/UserNotifications.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  [UNUserNotificationCenter currentNotificationCenter].delegate = self;
  
  return YES;
}

@end
```

### Android Setup

1. Add `google-services.json` to `android/app/`
2. Update `AndroidManifest.xml`:

```xml
<application>
  <meta-data
    android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@mipmap/ic_launcher" />
  <meta-data
    android:name="com.google.firebase.messaging.default_notification_color"
    android:resource="@color/primary" />
</application>
```

### Handle Notifications

In `App.tsx`:

```typescript
import messaging from '@react-native-firebase/messaging';

useEffect(() => {
  // Request permission
  requestUserPermission();
  
  // Get FCM token and save to database
  getFCMToken().then(token => {
    if (token) {
      // Save to user_preferences table
      supabase
        .from('user_preferences')
        .upsert({ user_id: userId, fcm_token: token });
    }
  });
  
  // Handle foreground messages
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    Alert.alert('New Notification', remoteMessage.notification.title);
  });
  
  return unsubscribe;
}, []);
```

---

## Deployment

### iOS

1. **Configure App in Xcode**
   - Open `ios/NewsleakMobile.xcworkspace`
   - Set Bundle Identifier (e.g., `com.newsleak.app`)
   - Set Team and Signing

2. **Build Release**
   ```bash
   cd ios
   pod install
   xcodebuild -workspace NewsleakMobile.xcworkspace -scheme NewsleakMobile -configuration Release
   ```

3. **Archive and Upload**
   - Product → Archive in Xcode
   - Distribute to App Store Connect

### Android

1. **Generate Signing Key**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore newsleak-release.keystore -alias newsleak -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Gradle**
   
   Add to `android/app/build.gradle`:
   ```gradle
   signingConfigs {
       release {
           storeFile file('newsleak-release.keystore')
           storePassword 'your-password'
           keyAlias 'newsleak'
           keyPassword 'your-password'
       }
   }
   ```

3. **Build Release APK/Bundle**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   
   Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## App Store Submission

### Apple App Store

1. Create app in App Store Connect
2. Fill in app information, screenshots, privacy policy
3. Upload build via Xcode
4. Submit for review

**Requirements:**
- Privacy policy URL
- App screenshots (various device sizes)
- App icon (1024x1024px)
- Description and keywords

### Google Play Store

1. Create app in Google Play Console
2. Upload AAB file
3. Fill in store listing
4. Submit for review

**Requirements:**
- Privacy policy URL
- Screenshots (phone & tablet)
- Feature graphic (1024x500px)
- App icon (512x512px)

---

## Testing

### Test on Devices

**iOS:**
```bash
npx react-native run-ios --device "iPhone Name"
```

**Android:**
```bash
npx react-native run-android
```

### Test Notifications

Use Firebase Console to send test notifications to specific devices.

---

## Best Practices

1. **Offline Support**: Use AsyncStorage + MMKV for caching
2. **Image Optimization**: Use FastImage for better performance
3. **Deep Linking**: Configure for article URLs
4. **Analytics**: Add Firebase Analytics
5. **Crash Reporting**: Add Firebase Crashlytics
6. **Performance**: Use React Native Performance Monitor
7. **Security**: Store sensitive data in Keychain/KeyStore

---

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [React Native Firebase](https://rnfirebase.io/)
- [Supabase React Native](https://supabase.com/docs/guides/with-react-native)

---

**Estimated Development Time**: 6-8 weeks for MVP  
**Team Size**: 2-3 developers  
**Budget**: $15,000 - $25,000 (freelance) or $40,000 - $60,000 (agency)

---

**Last Updated**: December 2024  
**Version**: 1.0.0
