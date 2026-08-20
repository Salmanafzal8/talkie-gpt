import Animated from 'react-native-reanimated';
import { RFValue } from 'react-native-responsive-fontsize';

export function HelloWave() {
  return (
    <Animated.Text
      style={{
        fontSize: RFValue(28),
        lineHeight: RFValue(32),
        marginTop: -RFValue(6),
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}
