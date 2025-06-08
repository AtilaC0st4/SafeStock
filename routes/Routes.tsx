import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppRoutes from './AppRoutes';
import AuthRoutes from './AuthRoutes';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import { ActivityIndicator, View } from 'react-native';

export default function Routes() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppRoutes /> : <AuthRoutes />}
    </NavigationContainer>
  );
}
