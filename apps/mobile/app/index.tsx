import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-obsidian">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-ash text-sm tracking-widest uppercase mb-2">
          modo
        </Text>
        <Text className="text-bone text-6xl font-display tracking-wider">
          CAVERNA
        </Text>
        <View className="h-1 w-12 bg-ember rounded-full mt-4" />
        <Text className="text-mute text-xs mt-8 text-center">
          Disciplina é silêncio. Treino é fogo.
        </Text>

        <Link href="/timer-demo" asChild>
          <Pressable className="mt-12 px-8 py-4 bg-ember rounded-full active:opacity-80">
            <Text className="text-obsidian font-display text-xl tracking-widest">
              VER TIMER
            </Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
