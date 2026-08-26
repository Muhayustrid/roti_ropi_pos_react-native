import React from 'react';
import { useRouter } from 'expo-router';
import { MoreScreen } from '../../src/features/more/MoreScreen';

export default function MoreRoute() {
  const router = useRouter();

  return (
    <MoreScreen
      onCloseShift={() => router.push('/closing')}
      onOpenPrinter={() => router.push('/printer')}
      onOpenReport={() => router.push('/report')}
    />
  );
}
