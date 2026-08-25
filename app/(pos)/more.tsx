import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/tokens';
import { PosBrandBar } from '../../src/components/PosBars';
import { PosNavigation, type PosNavTab } from '../../src/components/PosNavigation';
import { MoreScreen } from '../../src/features/more/MoreScreen';
import { getWindowClass } from '../../src/utils/layout';

export default function MoreRoute() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const windowClass = getWindowClass(width, height);

  const handleSelectTab = (tab: PosNavTab) => {
    if (tab === 'cashier') router.replace('/(pos)');
    else if (tab === 'history') router.replace('/(pos)/history');
    else if (tab === 'more') router.replace('/(pos)/more');
  };

  const handleCloseShift = () => {
    router.push('/closing');
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        {windowClass.hasSideRail ? (
          <PosNavigation
            activeTab="more"
            onSelectTab={handleSelectTab}
            width={width}
            height={height}
          />
        ) : null}

        <View style={styles.content}>
          <PosBrandBar title="Pengaturan & Shift" />
          <MoreScreen onCloseShift={handleCloseShift} />
        </View>
      </View>

      {windowClass.isCompact ? (
        <PosNavigation
          activeTab="more"
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
  content: {
    flex: 1,
  },
});
