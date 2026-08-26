import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { PosTopBar } from '../../src/components/PosBars';
import {
  PosNavigation,
  type PosNavTab,
} from '../../src/components/PosNavigation';
import { Colors } from '../../src/theme/tokens';
import { getWindowClass } from '../../src/utils/layout';

const TAB_ROUTES: Record<PosNavTab, '/(pos)' | '/(pos)/history' | '/(pos)/more'> = {
  cashier: '/(pos)',
  history: '/(pos)/history',
  more: '/(pos)/more',
};

function getActiveTab(pathname: string): PosNavTab {
  if (pathname.endsWith('/history')) return 'history';
  if (pathname.endsWith('/more')) return 'more';
  return 'cashier';
}

const TAB_TITLES: Record<PosNavTab, string> = {
  cashier: 'Roti Ropi POS',
  history: 'Riwayat Transaksi',
  more: 'Pengaturan & Shift',
};

export default function PosShellLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width, height } = useWindowDimensions();
  const windowClass = getWindowClass(width, height);
  const activeTab = getActiveTab(pathname);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateX.setValue(12);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, pathname, translateX]);

  const handleSelectTab = (tab: PosNavTab) => {
    if (tab !== activeTab) router.replace(TAB_ROUTES[tab]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        {windowClass.hasSideRail ? (
          <PosNavigation
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            width={width}
            height={height}
          />
        ) : null}

        <View style={styles.contentColumn}>
          <PosTopBar title={TAB_TITLES[activeTab]} />
          <Animated.View
            style={[
              styles.content,
              { opacity, transform: [{ translateX }] },
            ]}
          >
            <Slot />
          </Animated.View>
        </View>
      </View>

      {windowClass.isCompact ? (
        <PosNavigation
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          width={width}
          height={height}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
  },
  contentColumn: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
