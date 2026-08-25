import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme/tokens';
import { getWindowClass } from '../utils/layout';
import { PosIcon, type PosIconName } from './PosIcon';

export type PosNavTab = 'cashier' | 'history' | 'more';

export interface PosNavigationProps {
  activeTab: PosNavTab;
  onSelectTab: (tab: PosNavTab) => void;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

interface NavItem {
  id: PosNavTab;
  label: string;
  iconName: PosIconName;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'cashier', label: 'Kasir', iconName: 'register' },
  { id: 'history', label: 'Riwayat', iconName: 'history' },
  { id: 'more', label: 'Lainnya', iconName: 'menu' },
];

export const PosNavigation = React.memo(function PosNavigation({
  activeTab,
  onSelectTab,
  width,
  height,
  style,
}: PosNavigationProps) {
  const windowDimensions = useWindowDimensions();
  const measuredWidth = width ?? windowDimensions.width;
  const measuredHeight = height ?? windowDimensions.height;
  const windowClass = getWindowClass(measuredWidth, measuredHeight);

  if (windowClass.hasSideRail) {
    return (
      <View
        style={[styles.sideRail, style]}
        accessible={true}
        accessibilityRole="tablist"
      >
        <View style={styles.railTopSpacer} />
        <View style={styles.railItemsContainer}>
          {NAV_ITEMS.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => onSelectTab(item.id)}
                accessible={true}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.railItem,
                  isSelected && styles.railItemSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.railIconIndicator,
                    isSelected && styles.railIconIndicatorSelected,
                  ]}
                >
                  <PosIcon
                    name={item.iconName}
                    size={22}
                    color={isSelected ? Colors.BrandInk : Colors.Text2}
                  />
                </View>
                <Text
                  style={[
                    styles.railLabel,
                    isSelected ? styles.railLabelSelected : styles.railLabelUnselected,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.bottomBar, style]}
      accessible={true}
      accessibilityRole="tablist"
    >
      {NAV_ITEMS.map((item) => {
        const isSelected = activeTab === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelectTab(item.id)}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => [
              styles.bottomItem,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.bottomIconIndicator,
                isSelected && styles.bottomIconIndicatorSelected,
              ]}
            >
              <PosIcon
                name={item.iconName}
                size={22}
                color={isSelected ? Colors.BrandInk : Colors.Text2}
              />
            </View>
            <Text
              style={[
                styles.bottomLabel,
                isSelected ? styles.bottomLabelSelected : styles.bottomLabelUnselected,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  bottomBar: {
    height: 60,
    backgroundColor: Colors.Surface,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 0,
  },
  bottomItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.s1,
  },
  bottomIconIndicator: {
    width: 48,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bottomIconIndicatorSelected: {
    backgroundColor: Colors.BrandSoft,
  },
  bottomIconText: {
    fontSize: 18,
  },
  bottomLabel: {
    ...Typography.XsSemi,
  },
  bottomLabelSelected: {
    color: Colors.BrandInk,
  },
  bottomLabelUnselected: {
    color: Colors.Text2,
  },
  sideRail: {
    width: 72,
    backgroundColor: Colors.Surface,
    borderRightWidth: 1,
    borderRightColor: Colors.Border,
    alignItems: 'center',
    paddingVertical: Spacing.s3,
  },
  railTopSpacer: {
    height: Spacing.s2,
  },
  railItemsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.s3,
  },
  railItem: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.s2,
    borderRadius: Radius.md,
  },
  railItemSelected: {
    backgroundColor: Colors.BrandSoft,
  },
  railIconIndicator: {
    width: 40,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  railIconIndicatorSelected: {
    backgroundColor: Colors.BrandSoft,
  },
  railIconText: {
    fontSize: 20,
  },
  railLabel: {
    ...Typography.XsSemi,
    textAlign: 'center',
  },
  railLabelSelected: {
    color: Colors.BrandInk,
  },
  railLabelUnselected: {
    color: Colors.Text2,
  },
  pressed: {
    opacity: 0.75,
  },
});
