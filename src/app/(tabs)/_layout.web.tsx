import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="inventory" href="/" asChild>
            <TabButton>Inventory</TabButton>
          </TabTrigger>
          <TabTrigger name="reconcile" href="/reconcile" asChild>
            <TabButton>Reconcile</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={{
          paddingVertical: Spacing.one,
          paddingHorizontal: Spacing.three,
          borderRadius: Spacing.three,
        }}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View
      {...props}
      style={{
        position: 'absolute',
        width: '100%',
        padding: Spacing.three,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: colors.background,
      }}>
      <ThemedView
        type="backgroundElement"
        style={{
          paddingVertical: Spacing.two,
          paddingHorizontal: Spacing.five,
          borderRadius: Spacing.five,
          flexDirection: 'row',
          alignItems: 'center',
          flexGrow: 1,
          gap: Spacing.two,
          maxWidth: MaxContentWidth,
        }}>
        {props.children}
      </ThemedView>
    </View>
  );
}
