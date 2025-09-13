import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const useColorScheme = require('@/hooks/use-color-scheme').useColorScheme;
import { AppProvider } from '@/context/AppContext';

type UserDetails = {
  completedOnboarding: boolean;
  name?: string;
  age?: string;
  gender?: string;
  activityLevel?: string;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        let completed = false;
        
        if (userDetails) {
          const parsedDetails = JSON.parse(userDetails);
          completed = !!parsedDetails.completedOnboarding;
        }
        
        setHasCompletedOnboarding(completed);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setError('Failed to load app data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={async () => {
            setIsLoading(true);
            setError(null);
            try {
              await AsyncStorage.clear();
              setHasCompletedOnboarding(false);
            } catch (e) {
              console.error('Error resetting app:', e);
              setError('Failed to reset app');
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <Text style={styles.buttonText}>Reset App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
            animation: 'fade',
          }}>
          {!hasCompletedOnboarding ? (
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          ) : (
            <>
              <Stack.Screen 
                name="(tabs)" 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="modal" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                }}
              />
            </>
          )}
        </Stack>
      </ThemeProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6B46C1',
    padding: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
