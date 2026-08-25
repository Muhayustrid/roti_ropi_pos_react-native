import React from 'react';
import { type StyleProp, type TextStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '../theme/tokens';

export type PosIconName =
  | 'person'
  | 'store'
  | 'server'
  | 'check'
  | 'search'
  | 'cart'
  | 'offer'
  | 'cash'
  | 'qris'
  | 'card'
  | 'wallet'
  | 'pos-terminal'
  | 'refund'
  | 'draft'
  | 'history'
  | 'menu'
  | 'close'
  | 'back'
  | 'warning'
  | 'offline'
  | 'time';

const ICON_MAP: Record<PosIconName, keyof typeof MaterialIcons.glyphMap> = {
  person: 'person',
  store: 'storefront',
  server: 'public',
  check: 'check',
  search: 'search',
  cart: 'shopping-cart',
  offer: 'local-offer',
  cash: 'payments',
  qris: 'qr-code-scanner',
  card: 'credit-card',
  wallet: 'account-balance-wallet',
  'pos-terminal': 'point-of-sale',
  refund: 'undo',
  draft: 'description',
  history: 'history',
  menu: 'menu',
  close: 'close',
  back: 'arrow-back',
  warning: 'warning',
  offline: 'wifi-off',
  time: 'schedule',
};

export interface PosIconProps {
  name: PosIconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function PosIcon({
  name,
  size = 20,
  color = Colors.Text,
  style,
  accessibilityLabel,
}: PosIconProps) {
  const iconGlyph = ICON_MAP[name] || 'help-outline';
  return (
    <MaterialIcons
      name={iconGlyph}
      size={size}
      color={color}
      style={style}
      accessibilityLabel={accessibilityLabel}
      accessible={!!accessibilityLabel}
    />
  );
}
