import { AppProvider } from '@/context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const useColorScheme = require('@/hooks/use-color-scheme').useColorScheme;

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
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      let completed = false;
      
      if (userDetails) {
        try {
          const parsedDetails = JSON.parse(userDetails);
          completed = !!parsedDetails.completedOnboarding;
        } catch (e) {
          console.error('Error parsing user details:', e);
          // If there's an error parsing, treat as not completed
          completed = false;
        }
      }
      
      setInitialRoute(completed ? '(tabs)' : 'onboarding');
      return completed;
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError('Failed to load app data. Please try again.');
      setInitialRoute('onboarding');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading || !initialRoute) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
            checkAuth();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
          <Text style={styles.buttonText}>Reset App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar barStyle="dark-content" backgroundColor="#00000000" translucent={true} />
        <Stack
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
            animation: 'fade',
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="onboarding" 
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
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
    marginBottom: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: '#6B46C1',
    fontSize: 14,
    marginTop: 10,
  },
});
