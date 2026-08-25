import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme/tokens';
import { PosCard } from '../../components/PosCard';
import { PosButton } from '../../components/PosButton';

export interface CheckingScreenProps {
  type?: 'opening' | 'payment';
  referenceId?: string;
  durationMs?: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function CheckingScreen({
  type = 'opening',
  referenceId = '#POS-8849-TRX',
  durationMs = 2500,
  onComplete,
  onCancel,
}: CheckingScreenProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onComplete?.();
    }, durationMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [durationMs, onComplete]);

  const isOpening = type === 'opening';
  const title = isOpening ? 'Memeriksa status shift' : 'Memeriksa hasil pembayaran…';
  const body = isOpening
    ? 'Permintaan pembukaan sudah dikirim. Hasilnya sedang diverifikasi.'
    : 'Tunggu sebentar, transaksi sedang diverifikasi. Jangan tutup aplikasi.';
  const statusBadge = isOpening ? 'Memulai shift…' : `Transaksi ${referenceId}`;

  const handleCancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onCancel?.();
  };

  return (
    <View style={styles.container} accessible={true} accessibilityLiveRegion="polite">
      <View style={styles.cardWrapper}>
        <PosCard style={styles.card}>
          {/* Spinner */}
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={Colors.Brand} />
          </View>

          {/* Title and Body */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          {/* Status Badge */}
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{statusBadge}</Text>
          </View>

          {/* Cancellable Action Button */}
          <PosButton
            label="Batalkan"
            variant="Outline"
            onPress={handleCancel}
            style={styles.cancelBtn}
            accessibilityLabel="Batalkan pemeriksaan"
          />
        </PosCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.s4,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: Colors.Surface,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  spinnerContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.BrandSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.s4,
  },
  title: {
    ...Typography.Lg,
    color: Colors.Text,
    textAlign: 'center',
    marginBottom: Spacing.s2,
  },
  body: {
    ...Typography.Sm,
    color: Colors.Text2,
    textAlign: 'center',
    marginBottom: Spacing.s4,
    maxWidth: 300,
  },
  statusPill: {
    backgroundColor: Colors.BrandSoft,
    paddingHorizontal: Spacing.s3,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginBottom: Spacing.s4,
  },
  statusText: {
    ...Typography.XsSemi,
    color: Colors.BrandInk,
  },
  cancelBtn: {
    minWidth: 140,
  },
});
