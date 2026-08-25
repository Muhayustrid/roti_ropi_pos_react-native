import React from 'react';
import { useRouter } from 'expo-router';
import { CashEntryScreen } from '../src/features/payment/CashEntryScreen';

export default function CashEntryRoute() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleComplete = () => {
    router.push('/checking?mode=payment');
  };

  return (
    <CashEntryScreen
      onBack={handleBack}
      onComplete={handleComplete}
    />
  );
}
