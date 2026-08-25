import React from 'react';
import { useRouter } from 'expo-router';
import { LoginScreen } from '../src/features/auth/LoginScreen';

export default function IndexRoute() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/opening');
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}
