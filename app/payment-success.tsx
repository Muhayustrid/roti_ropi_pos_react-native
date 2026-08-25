import React from 'react';
import { useRouter } from 'expo-router';
import { PaymentSuccessScreen } from '../src/features/payment/PaymentSuccessScreen';

export default function PaymentSuccessRoute() {
  const router = useRouter();

  const handleNewTransaction = () => {
    // Navigate back to POS root and clear payment stack
    router.replace('/(pos)');
  };

  return <PaymentSuccessScreen onNewTransaction={handleNewTransaction} />;
}
