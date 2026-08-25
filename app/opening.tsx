import React from 'react';
import { useRouter } from 'expo-router';
import { OpeningScreen } from '../src/features/opening/OpeningScreen';

export default function OpeningRoute() {
  const router = useRouter();

  const handleContinueToConfirm = () => {
    router.push('/checking');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <OpeningScreen
      onContinueToConfirm={handleContinueToConfirm}
      onBack={handleBack}
    />
  );
}
