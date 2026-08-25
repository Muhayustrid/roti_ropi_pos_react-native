import React from 'react';
import { useRouter } from 'expo-router';
import { SplitPaymentScreen } from '../src/features/payment/SplitPaymentScreen';

export default function SplitPaymentRoute() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleComplete = () => {
    router.push('/checking?mode=payment');
  };

  return (
    <SplitPaymentScreen
      onBack={handleBack}
      onComplete={handleComplete}
    />
  );
}
