import React from 'react';
import { useRouter } from 'expo-router';
import { PaymentScreen } from '../src/features/payment/PaymentScreen';

export default function PaymentRoute() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleProceedToCash = () => {
    router.push('/cash-entry');
  };

  const handleProceedToSplit = () => {
    router.push('/split-payment');
  };

  const handleProceedToChecking = () => {
    router.push('/checking?mode=payment');
  };

  return (
    <PaymentScreen
      onBack={handleBack}
      onProceedToCash={handleProceedToCash}
      onProceedToSplit={handleProceedToSplit}
      onProceedToChecking={handleProceedToChecking}
    />
  );
}
