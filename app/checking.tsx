import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckingScreen } from '../src/features/opening/CheckingScreen';

export default function CheckingRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isPaymentMode = params.mode === 'payment';

  const handleComplete = () => {
    if (isPaymentMode) {
      router.replace('/payment-success');
    } else {
      router.replace('/(pos)');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <CheckingScreen
      type={isPaymentMode ? 'payment' : 'opening'}
      durationMs={2000}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
