import { Link, useRouter } from 'expo-router';
import { Host, Button } from '@expo/ui';
import { Pressable, ScrollView, View } from 'react-native';

import { InventoryFab } from '@/components/inventory-fab';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getSkuCount } from '@/lib/catalog';

export default function InventoryHomeScreen() {
  const router = useRouter();
  const skuCount = getSkuCount();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: Spacing.four,
          gap: Spacing.four,
          flexGrow: 1,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: Spacing.two,
          }}>
          <ThemedText type="subtitle">Inventory</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
            <Link href="/(tabs)/reconcile" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${skuCount} catalogued items`}>
                <ThemedView
                  type="backgroundElement"
                  style={{
                    minWidth: 36,
                    paddingHorizontal: Spacing.two,
                    paddingVertical: Spacing.one,
                    borderRadius: Spacing.three,
                    borderCurve: 'continuous',
                    alignItems: 'center',
                  }}>
                  <ThemedText type="smallBold">{skuCount}</ThemedText>
                </ThemedView>
              </Pressable>
            </Link>
            <Link href="/settings" asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="Settings">
                <ThemedText type="smallBold">Settings</ThemedText>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', gap: Spacing.three }}>
          <ThemedText type="default">No items catalogued yet.</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Photograph a pack to start building the store list.
          </ThemedText>
          <Host matchContents>
            <Button onPress={() => router.push('/capture')}>Add item</Button>
          </Host>
        </View>
      </ScrollView>
      <InventoryFab />
    </ThemedView>
  );
}
