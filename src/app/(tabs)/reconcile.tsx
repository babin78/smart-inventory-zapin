import { useRouter } from 'expo-router';
import { Host, Button } from '@expo/ui';
import { ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getSkuCount } from '@/lib/catalog';

export default function ReconcileScreen() {
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
        <ThemedText type="subtitle">Reconcile</ThemedText>
        <View style={{ flex: 1, justifyContent: 'center', gap: Spacing.three }}>
          <ThemedText type="default">Nothing to total yet.</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Catalogued items: {skuCount}. Export and category totals arrive after the first
            products are saved.
          </ThemedText>
          <Host matchContents>
            <Button onPress={() => router.push('/capture')}>Add item</Button>
          </Host>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
