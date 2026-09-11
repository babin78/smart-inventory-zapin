import { TextInput, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormFieldProps = TextInputProps & {
  label: string;
};

export function FormField({ label, style, ...rest }: FormFieldProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={{
        padding: Spacing.three,
        borderRadius: Spacing.two,
        borderCurve: 'continuous',
        gap: Spacing.one,
      }}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        {...rest}
        placeholderTextColor={theme.textSecondary}
        style={[
          {
            color: theme.text,
            fontSize: 16,
            lineHeight: 22,
            paddingVertical: Spacing.one,
          },
          style,
        ]}
      />
    </ThemedView>
  );
}
