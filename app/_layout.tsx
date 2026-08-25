import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PosProvider } from '../src/state/PosContext';

export default function RootLayout() {
  return (
    <PosProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </PosProvider>
  );
}
