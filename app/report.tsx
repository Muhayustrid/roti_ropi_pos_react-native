import React from 'react';
import { useRouter } from 'expo-router';
import { ReportScreen } from '../src/features/more/ReportScreen';

export default function ReportRoute() {
  const router = useRouter();
  return <ReportScreen onBack={() => router.back()} />;
}
