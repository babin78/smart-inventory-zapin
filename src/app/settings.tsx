import { Host, Button, Column, FieldGroup, Text } from '@expo/ui';
import { ScrollView } from 'react-native';

import { ThemedView } from '@/components/themed-view';
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
        contentContainerStyle={{ padding: Spacing.four }}>
        <Host matchContents>
          <Column>
            <FieldGroup>
              <FieldGroup.Section title="Shopkeeper">
                <Text>{`Username: ${usernameLabel}`}</Text>
                <Text>{`Store PIN: ${pinLabel}`}</Text>
              </FieldGroup.Section>
            </FieldGroup>
            <Text>
              Username and PIN will persist on this device in the next phase. They are required
              before Submit.
            </Text>
            <Button disabled>Save</Button>
          </Column>
        </Host>
      </ScrollView>
    </ThemedView>
  );
}
