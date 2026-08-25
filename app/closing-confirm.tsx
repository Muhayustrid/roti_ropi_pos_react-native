import React from 'react';
import { useRouter } from 'expo-router';
import { ClosingConfirmScreen } from '../src/features/more/ClosingConfirmScreen';

export default function ClosingConfirmRoute() {
  const router = useRouter();

  return (
    <ClosingConfirmScreen
      onBack={() => router.back()}
      onConfirmClosing={() => router.push('/shift-closed')}
    />
  );
}
