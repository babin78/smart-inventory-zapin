import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CaptureProgressBarProps = {
  percent: number;
};

export function CaptureProgressBar({ percent }: CaptureProgressBarProps) {
  const insets = useSafeAreaInsets();
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={{ paddingTop: insets.top, backgroundColor: 'transparent' }}>
      <View style={{ height: 3, backgroundColor: 'rgba(46, 125, 50, 0.2)' }}>
        <View style={{ width: `${clamped}%`, height: 3, backgroundColor: '#2E7D32' }} />
      </View>
    </View>
  );
}
