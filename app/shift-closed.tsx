import React from 'react';
import { useRouter } from 'expo-router';
import { ShiftClosedScreen } from '../src/features/more/ShiftClosedScreen';

export default function ShiftClosedRoute() {
  const router = useRouter();

  return (
    <ShiftClosedScreen
      onFinish={() => router.replace('/')}
    />
  );
}
