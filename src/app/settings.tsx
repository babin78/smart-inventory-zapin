import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session';

export default function SettingsScreen() {
  const { session, saveSession, persistsAcrossRestarts } = useSession();
  const [username, setUsername] = useState(session.username);
  const [pin, setPin] = useState(session.pin);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSave() {
    if (pending) {
      return;
    }

    const nextUsername = username.trim();
    const nextPin = pin.trim();
    if (nextUsername.length === 0 || nextPin.length === 0) {
      setSaved(false);
      setError('Enter both a username and a store PIN.');
      return;
    }

    setPending(true);
    setError(null);
    setSaved(false);

    try {
      const stored = await saveSession({ username: nextUsername, pin: nextPin });
      setUsername(stored.username);
      setPin(stored.pin);
      setSaved(true);
    } catch {
      setError('Could not save on this device. Keep the values and try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: Spacing.four, gap: Spacing.three }}>
        <ThemedText type="subtitle">Shopkeeper</ThemedText>
        <View style={{ gap: Spacing.two }}>
          <FormField
            label="Username"
            value={username}
            onChangeText={(value) => {
              setUsername(value);
              setSaved(false);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Shop name or your name"
          />
          <FormField
            label="Store PIN"
            value={pin}
            onChangeText={(value) => {
              setPin(value);
              setSaved(false);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="Shared store PIN"
          />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {persistsAcrossRestarts
            ? 'Saved on this phone only. Submit stays blocked until both fields are stored. The PIN is not a Google or Firebase login.'
            : 'This install does not include secure storage yet. Save still unlocks Submit for this session. Install a new development build so username and PIN survive an app kill.'}
        </ThemedText>
        {error ? <ThemedText type="small">{error}</ThemedText> : null}
        {saved ? (
          <ThemedText type="small">
            {persistsAcrossRestarts
              ? 'Saved. Force-close the app and reopen to confirm they remain.'
              : 'Saved for this session. Rebuild the app to keep them after a restart.'}
          </ThemedText>
        ) : null}
        <UiButton label={pending ? 'Saving…' : 'Save'} disabled={pending} onPress={onSave} />
      </ScrollView>
    </ThemedView>
  );
}
