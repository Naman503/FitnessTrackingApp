import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const stored = await AsyncStorage.getItem('userDetails');
        if (stored) {
          const parsed = JSON.parse(stored);
          setInitialRoute(parsed?.completedOnboarding ? '/(tabs)/home' : '/onboarding');
        } else {
          setInitialRoute('/onboarding');
        }
      } catch {
        setInitialRoute('/onboarding');
      }
    };
    check();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator />
      </View>
    );
  }
  return <Redirect href={initialRoute as any} />;
}