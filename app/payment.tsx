import React from 'react';
import { useRouter } from 'expo-router';
import { PaymentFlowScreen } from '../src/features/payment/PaymentFlowScreen';

export default function PaymentRoute() {
  const router = useRouter();

  return (
    <PaymentFlowScreen onClose={() => router.dismissTo('/(pos)')} />
  );
}
