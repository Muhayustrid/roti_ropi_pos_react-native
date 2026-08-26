import React from 'react';
import { useRouter } from 'expo-router';
import { PrinterSettingsScreen } from '../src/features/more/PrinterSettingsScreen';

export default function PrinterRoute() {
  const router = useRouter();

  return <PrinterSettingsScreen onBack={() => router.back()} />;
}
