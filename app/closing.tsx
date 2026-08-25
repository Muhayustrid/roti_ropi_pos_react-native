import React from 'react';
import { useRouter } from 'expo-router';
import { ClosingScreen } from '../src/features/more/ClosingScreen';

export default function ClosingRoute() {
  const router = useRouter();

  return (
    <ClosingScreen
      onBack={() => router.back()}
      onReviewClosing={() => router.push('/closing-confirm')}
    />
  );
}
