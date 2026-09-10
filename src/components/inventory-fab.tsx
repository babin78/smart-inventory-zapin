import { Link } from 'expo-router';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function InventoryFab() {
  if (process.env.EXPO_OS !== 'android') {
    return null;
  }

  return (
    <Link href="/capture" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add item"
        style={{
          position: 'absolute',
          right: Spacing.four,
          bottom: Spacing.four,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#1B6B2A',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
        }}>
        <ThemedText style={{ color: '#ffffff', fontSize: 28, lineHeight: 32, fontWeight: 600 }}>
          +
        </ThemedText>
      </Pressable>
    </Link>
  );
}
