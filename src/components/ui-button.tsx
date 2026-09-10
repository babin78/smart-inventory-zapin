import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type UiButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outlined';
};

export function UiButton({ label, onPress, disabled = false, variant = 'filled' }: UiButtonProps) {
  const filled = variant === 'filled';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.two,
        borderRadius: Spacing.two,
        borderCurve: 'continuous',
        backgroundColor: filled ? '#1B6B2A' : 'transparent',
        borderWidth: filled ? 0 : 1,
        borderColor: '#1B6B2A',
        opacity: disabled ? 0.45 : 1,
      }}>
      <ThemedText
        type="smallBold"
        style={{ color: filled ? '#ffffff' : '#1B6B2A' }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}
