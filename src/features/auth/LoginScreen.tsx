import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme/tokens';
import { PosCard, ToneIcon } from '../../components/PosCard';
import { PosButton } from '../../components/PosButton';
import { PosIcon } from '../../components/PosIcon';

export interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [serverHost, setServerHost] = useState('oauth-staging.rotiropi.web.id');

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
      accessible={true}
    >
      <View style={styles.cardWrapper}>
        <PosCard style={styles.mainCard}>
          {/* Tone Icon */}
          <View style={styles.iconCenter}>
            <ToneIcon tone="Bread" size={64}>
              <PosIcon name="store" size={32} color={Colors.BrandInk} />
            </ToneIcon>
          </View>

          {/* Titles */}
          <Text style={styles.title}>Roti Ropi</Text>
          <Text style={styles.subtitle}>Sistem Point of Sale</Text>

          {/* Server Info Card */}
          <View style={styles.serverCard}>
            <View style={styles.serverRow}>
              <Text style={styles.serverLabel}>Server ERPNext</Text>
              <PosIcon name="server" size={16} color={Colors.BrandInk} />
            </View>
            <TextInput
              value={serverHost}
              onChangeText={setServerHost}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              selectTextOnFocus
              accessibilityLabel="Server ERPNext"
              style={styles.serverHost}
            />
          </View>

          {/* Note 1 */}
          <Text style={styles.reassuranceNote}>
            Anda akan masuk dengan aman melalui ERPNext.
          </Text>

          {/* Action Button */}
          <PosButton
            label="Lanjut dengan ERPNext"
            variant="Primary"
            fullWidth
            disabled={!serverHost.trim()}
            onPress={() => onLoginSuccess?.()}
            style={styles.loginButton}
          />

          {/* Note 2 */}
          <Text style={styles.passwordNote}>
            Kata sandi hanya dimasukkan di halaman masuk ERPNext yang aman.
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.versionText}>v1.2.0</Text>
            <Text style={styles.stagingBadge}>Staging</Text>
          </View>
        </PosCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.s4,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  mainCard: {
    padding: Spacing.s4,
    backgroundColor: Colors.Surface,
    borderRadius: Radius.lg,
  },
  iconCenter: {
    alignItems: 'center',
    marginBottom: Spacing.s3,
  },
  storeIcon: {
    fontSize: 28,
  },
  title: {
    ...Typography.Xxl,
    color: Colors.Text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.Sm,
    color: Colors.Text2,
    textAlign: 'center',
    marginBottom: Spacing.s4,
  },
  serverCard: {
    backgroundColor: Colors.SurfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.s3,
    marginBottom: Spacing.s3,
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  serverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serverLabel: {
    ...Typography.XsSemi,
    color: Colors.Text2,
  },
  serverDnsIcon: {
    fontSize: 14,
  },
  serverHost: {
    ...Typography.SmSemi,
    color: Colors.Text,
  },
  reassuranceNote: {
    ...Typography.Sm,
    color: Colors.Text2,
    textAlign: 'center',
    marginBottom: Spacing.s4,
  },
  loginButton: {
    marginBottom: Spacing.s3,
  },
  passwordNote: {
    ...Typography.Xs,
    color: Colors.Text3,
    textAlign: 'center',
    marginBottom: Spacing.s4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.Border,
    marginBottom: Spacing.s3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionText: {
    ...Typography.Xs,
    color: Colors.Text3,
  },
  stagingBadge: {
    ...Typography.XsSemi,
    color: Colors.WarningInk,
  },
});
