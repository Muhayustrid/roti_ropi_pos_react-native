import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PosProvider } from '../src/state/PosContext';

export default function RootLayout() {
  return (
    <PosProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="payment"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="refund/[id]"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
    </PosProvider>
  );
}
