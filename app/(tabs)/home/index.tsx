import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AntDesign, MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../../context/AppContext';

const { width } = Dimensions.get('window');

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export default function HomeScreen() {
  const router = useRouter();
  const { userDetails, goals, completeGoal, updateStreak } = useAppContext();
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Refresh any data here if needed
    setTimeout(() => setRefreshing(false), 1000);
  }, []);
  
  // Update greeting based on time of day
  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting());
    };
    
    // Update greeting when the hour changes
    const now = new Date();
    const timeToNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
    
    const timer = setTimeout(() => {
      updateGreeting();
      // Set interval to update greeting every hour
      const interval = setInterval(updateGreeting, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, timeToNextHour);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Update date
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(now.toLocaleDateString('en-US', options));
  }, []);

  const handleCompleteGoal = (goalId: string) => {
    completeGoal(goalId);
    // You could add haptic feedback here
  };

  const renderGoalCard = (goal: any) => (
    <View key={goal.id} style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={[styles.goalIcon, { backgroundColor: getCategoryColor(goal.category) }]}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
        </View>
        <Text style={styles.goalTitle}>{goal.title}</Text>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => router.push({ pathname: '/modal', params: { screen: 'goal-details', id: goal.id } } as never)}
        >
          <AntDesign name="ellipsis" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${(goal.current / goal.target) * 100}%`,
                backgroundColor: getCategoryColor(goal.category)
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {goal.current} / {goal.target} {goal.unit}
        </Text>
      </View>
      
      {!goal.completed ? (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: getCategoryColor(goal.category) }]}
          onPress={() => handleCompleteGoal(goal.id)}
        >
          <Text style={styles.actionButtonText}>Mark as Complete</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.completedBadge}>
          <AntDesign name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
    </View>
  );

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Activity: '#4CAF50',
      Nutrition: '#2196F3',
      Sleep: '#9C27B0',
      Mindfulness: '#FF9800',
      default: '#607D8B',
    };
    return colors[category] || colors.default;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      Activity: 'ios-walk',
      Nutrition: 'ios-restaurant',
      Sleep: 'ios-moon',
      Mindfulness: 'ios-leaf',
      default: 'ios-checkmark-circle',
    };
    return icons[category] || icons.default;
  };

  const stats = [
    { title: 'Today', value: goals.filter((g: { completed: boolean }) => g.completed).length, label: 'Goals' },
    { title: 'Week', value: Math.floor(Math.random() * 15) + 5, label: 'Activities' },
    { title: 'Streak', value: userDetails?.streakCount || 0, label: 'Days' },
  ];

  const renderStreakBadge = () => (
    <View style={styles.streakBadge}>
      <Ionicons name="flame" size={20} color="#FF6B6B" />
      <Text style={styles.streakText}>{userDetails?.streakCount || 0} day streak</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#6B46C1', '#805AD5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <View>
              <Text style={styles.greeting}>
                {greeting}{userDetails?.name ? `, ${userDetails.name}` : ''}
              </Text>
              <Text style={styles.date}>{currentDate}</Text>
              {userDetails?.streakCount ? renderStreakBadge() : null}
            </View>
            <TouchableOpacity onPress={() => router.push('/modal')}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.title}</Text>
                <Text style={styles.statSubLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
      
      {/* Main Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#6B46C1"
            colors={['#6B46C1']}
          />
        }
        bounces={true}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Daily Goals</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/modal', params: { screen: 'all-goals' } } as never)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {goals.length > 0 ? (
            goals.map(renderGoalCard)
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="add-circle" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>No goals yet</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push({ pathname: '/modal', params: { screen: 'add-goal' } } as never)}
              >
                <Text style={styles.addButtonText}>Add Your First Goal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction} 
              onPress={() => router.push({ pathname: '/modal', params: { screen: 'add-activity' } } as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
                <MaterialIcons name="directions-run" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>Add Activity</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction} 
              onPress={() => router.push({ pathname: '/modal', params: { screen: 'nutrition' } } as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#2196F3' }]}>
                <MaterialIcons name="restaurant" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>Log Food</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction} 
              onPress={() => router.push({ pathname: '/modal', params: { screen: 'sleep' } } as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#9C27B0' }]}>
                <MaterialIcons name="bedtime" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>Sleep</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  content: {
    flex: 1,
    padding: 16,
    marginTop: -30,
    zIndex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 30,
    flexGrow: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'System',
  },
  date: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontFamily: 'System',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  statSubLabel: {
    color: '#999',
    fontSize: 12,
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    fontFamily: 'System',
  },
  seeAllText: {
    color: '#6B46C1',
    fontSize: 14,
    fontWeight: '500',
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  moreButton: {
    padding: 5,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  completedText: {
    color: '#4CAF50',
    marginLeft: 5,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
    backgroundColor: '#F7FAFC',
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 13,
    color: '#4A5568',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 2,
  },
});
