import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import type { TimerSnapshot } from '@/lib/timer/RestTimer';
import { tokens } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RestTimerRingProps {
  snapshot: TimerSnapshot;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onAdjust: (deltaMs: number) => void;
  /** Próxima série / exercício para mostrar abaixo. */
  nextLabel?: string;
  /** Diâmetro do anel em px. */
  size?: number;
}

const STROKE = 12;

export function RestTimerRing({
  snapshot,
  onPause,
  onResume,
  onSkip,
  onAdjust,
  nextLabel,
  size = 280,
}: RestTimerRingProps) {
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useDerivedValue(() => {
    if (snapshot.durationMs <= 0) return 0;
    return Math.max(0, Math.min(1, snapshot.remainingMs / snapshot.durationMs));
  }, [snapshot.remainingMs, snapshot.durationMs]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const pulse = useSharedValue(1);
  const lastFiveSeconds = snapshot.state === 'running' && snapshot.remainingMs <= 5_000;
  if (lastFiveSeconds && pulse.value === 1) {
    pulse.value = withRepeat(withTiming(1.06, { duration: 500 }), -1, true);
  } else if (!lastFiveSeconds && pulse.value !== 1) {
    pulse.value = withTiming(1, { duration: 200 });
  }

  const seconds = Math.ceil(snapshot.remainingMs / 1000);
  const totalSeconds = Math.ceil(snapshot.durationMs / 1000);

  const ringColor = useMemo(() => {
    if (snapshot.state === 'finished') return tokens.color.state.moss;
    if (lastFiveSeconds) return tokens.color.accent.glow;
    return tokens.color.accent.ember;
  }, [snapshot.state, lastFiveSeconds]);

  return (
    <View className="items-center">
      <Text className="text-ash text-xs uppercase tracking-widest mb-3">descanso</Text>

      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tokens.color.border.smoke}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
          />
        </Svg>

        <Animated.View style={{ transform: [{ scale: pulse }], alignItems: 'center' }}>
          <Text
            className="font-display text-bone"
            style={{ fontSize: tokens.fontSize.timer, lineHeight: tokens.fontSize.timer }}
          >
            {seconds}
          </Text>
          <Text className="text-mute text-xs mt-1">{totalSeconds}s total</Text>
        </Animated.View>
      </View>

      <View className="flex-row items-center justify-center gap-4 mt-8">
        <RingButton label="−15s" onPress={() => onAdjust(-15_000)} />
        {snapshot.state === 'running' ? (
          <RingButton label="II" onPress={onPause} primary />
        ) : (
          <RingButton label="▶" onPress={onResume} primary />
        )}
        <RingButton label="+15s" onPress={() => onAdjust(15_000)} />
      </View>

      <Pressable onPress={onSkip} className="mt-6 px-4 py-2">
        <Text className="text-ash text-sm uppercase tracking-widest">pular</Text>
      </Pressable>

      {nextLabel ? (
        <Text className="text-mute text-xs mt-4">próxima: {nextLabel}</Text>
      ) : null}
    </View>
  );
}

function RingButton({ label, onPress, primary = false }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      className={
        primary
          ? 'w-20 h-20 rounded-full items-center justify-center bg-ember active:opacity-80'
          : 'w-16 h-16 rounded-full items-center justify-center border border-smoke bg-cave active:opacity-70'
      }
    >
      <Text className={primary ? 'text-obsidian font-display text-2xl' : 'text-bone font-sans text-base'}>
        {label}
      </Text>
    </Pressable>
  );
}
