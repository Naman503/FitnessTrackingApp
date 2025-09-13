import { Tabs } from 'expo-router';
import { useColorScheme, Platform, Animated } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useEffect, useRef } from 'react';

type TabBarIconProps = {
  focused: boolean;
  icon: React.ReactNode;
  color: string;
  size?: number;
};

const TabBarIcon = ({ focused, icon, color, size = 24 }: TabBarIconProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.spring(scale, {
        toValue: 1.2,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {icon}
    </Animated.View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tabBarHeight = Platform.OS === 'ios' ? 90 : 70;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              focused={focused}
              color={color}
              icon={<FontAwesome5 name="home" size={24} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="risks"
        options={{
          title: 'Risks',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              focused={focused}
              color={color}
              icon={<MaterialIcons name="warning" size={24} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              focused={focused}
              color={color}
              icon={<MaterialIcons name="trending-up" size={24} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              focused={focused}
              color={color}
              icon={<Ionicons name="person" size={24} color={color} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}
