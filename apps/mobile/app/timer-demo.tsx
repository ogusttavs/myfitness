import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { RestTimerRing } from '@/components/RestTimerRing';
import { useTimer } from '@/lib/timer/useTimer';

/**
 * Tela demo do cronômetro de descanso. Não é parte da tab nav final —
 * serve como playground para a engine + UI da Story 5.1/5.4.
 */
export default function TimerDemo() {
  const { snapshot, start, pause, resume, skip, reset, adjust } = useTimer({
    durationMs: 90_000,
    onFinish: () => {
      // story 5.3 vai plugar haptic + som aqui
    },
  });

  useEffect(() => {
    // auto-start ao entrar na tela
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Timer demo' }} />
      <SafeAreaView className="flex-1 bg-obsidian">
        <View className="flex-1 items-center justify-center px-6">
          <RestTimerRing
            snapshot={snapshot}
            onPause={pause}
            onResume={resume}
            onSkip={skip}
            onAdjust={adjust}
            nextLabel="Supino reto · série 3"
          />

          <Pressable onPress={reset} className="mt-12 px-4 py-2">
            <Text className="text-mute text-xs uppercase tracking-widest">reset</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}
