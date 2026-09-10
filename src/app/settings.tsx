import { ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session';

export default function SettingsScreen() {
  const { session } = useSession();
  const usernameLabel = session.username.length > 0 ? session.username : 'Not set';
  const pinLabel = session.pin.length > 0 ? 'Saved on this device' : 'Not set';

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: Spacing.four, gap: Spacing.three }}>
        <ThemedText type="subtitle">Shopkeeper</ThemedText>
        <View
          style={{
            padding: Spacing.three,
            borderRadius: Spacing.three,
            borderCurve: 'continuous',
            gap: Spacing.two,
          }}>
          <ThemedView type="backgroundElement" style={{ padding: Spacing.three, borderRadius: Spacing.two, borderCurve: 'continuous' }}>
            <ThemedText type="small" themeColor="textSecondary">
              Username
            </ThemedText>
            <ThemedText>{usernameLabel}</ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={{ padding: Spacing.three, borderRadius: Spacing.two, borderCurve: 'continuous' }}>
            <ThemedText type="small" themeColor="textSecondary">
              Store PIN
            </ThemedText>
            <ThemedText>{pinLabel}</ThemedText>
          </ThemedView>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Username and PIN will persist on this device in the next phase. They are required before
          Submit.
        </ThemedText>
        <UiButton label="Save" disabled />
      </ScrollView>
    </ThemedView>
  );
}
