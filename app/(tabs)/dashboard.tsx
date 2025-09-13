import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AntDesign, MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';

const { width } = Dimensions.get('window');

const Dashboard = () => {
  const router = useRouter();
  const { userDetails, goals, completeGoal, updateStreak } = useAppContext();
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('');
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    // Update date and greeting
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(now.toLocaleDateString('en-US', options));
    
    const hours = now.getHours();
    if (hours < 12) {
      setGreeting('Good Morning');
    } else if (hours < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }

    // Update streak when component mounts (should ideally be done when app starts)
    updateStreak();
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
    { title: 'Today', value: goals.filter(g => g.completed).length, label: 'Goals' },
    { title: 'Week', value: Math.floor(Math.random() * 15) + 5, label: 'Activities' },
    { title: 'Streak', value: userDetails?.streakCount || 0, label: 'Days' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6B46C1', '#805AD5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{userDetails?.name || 'User'}</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push({ pathname: '/modal', params: { screen: 'profile' } } as never)}>
            <FontAwesome5 name="user-circle" size={40} color="#fff" />
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
      </LinearGradient>
      
      <ScrollView style={styles.content}>
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
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push({ pathname: '/modal', params: { screen: 'add-activity' } })}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
                <MaterialIcons name="directions-run" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>Add Activity</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push({ pathname: '/modal', params: { screen: 'nutrition' } } as never)}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#2196F3' }]}>
                <MaterialIcons name="restaurant" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>Log Food</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push({ pathname: '/modal', params: { screen: 'sleep' } } as never)}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#9C27B0' }]}>
                <MaterialIcons name="bedtime" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>Sleep</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'today' && styles.tabItemActive]}
          onPress={() => setActiveTab('today')}
        >
          <MaterialIcons 
            name="home" 
            size={24} 
            color={activeTab === 'today' ? '#6B46C1' : '#888'} 
          />
          <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>
            Today
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'progress' && styles.tabItemActive]}
          onPress={() => {
            setActiveTab('progress');
            router.push('/progress');
          }}
        >
          <MaterialIcons 
            name="show-chart" 
            size={24} 
            color={activeTab === 'progress' ? '#6B46C1' : '#888'} 
          />
          <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>
            Progress
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'risks' && styles.tabItemActive]}
          onPress={() => {
            setActiveTab('risks');
            router.push('/risks');
          }}
        >
          <MaterialIcons 
            name="warning" 
            size={24} 
            color={activeTab === 'risks' ? '#6B46C1' : '#888'} 
          />
          <Text style={[styles.tabText, activeTab === 'risks' && styles.tabTextActive]}>
            Risk Meter
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
          onPress={() => {
            setActiveTab('profile');
            router.push({ pathname: '/modal', params: { screen: 'profile' } } as never);
          }}
        >
          <MaterialIcons 
            name="person" 
            size={24} 
            color={activeTab === 'profile' ? '#6B46C1' : '#888'} 
          />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginBottom: 5,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  date: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  statSubLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#6B46C1',
    fontSize: 14,
    fontWeight: '500',
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
  },
  quickAction: {
    alignItems: 'center',
    width: (width - 60) / 3,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 5,
    paddingBottom: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabItemActive: {
    // Active tab styling if needed
  },
  tabText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#6B46C1',
    fontWeight: '600',
  },
});

export default Dashboard;
