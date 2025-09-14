import { useAppContext } from '@/context/AppContext';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

// Types
type HomeHeaderProps = {
  greeting: string;
  name?: string;
  currentDate: string;
  onProfilePress: () => void;
};

type StreakCardProps = {
  count: number;
};

type GoalItemProps = {
  goal: {
    id: string;
    title: string;
    completed: boolean;
    progress?: number;
    target?: number;
    category?: string;
  };
  onComplete?: (id: string) => void;
};

type QuickActionProps = {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onPress: () => void;
};

type StatsCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
};

interface Styles {
  // Layout
  safeArea: ViewStyle;
  content: ViewStyle;
  container: ViewStyle;
  scrollContent: ViewStyle;
  flex1: ViewStyle;
  flexRow: ViewStyle;
  flexCol: ViewStyle;
  itemsCenter: ViewStyle;
  justifyCenter: ViewStyle;
  justifyBetween: ViewStyle;
  alignItems: ViewStyle;
  
  // Header
  header: ViewStyle;
  headerGradient: ViewStyle;
  greetingSection: ViewStyle;
  greeting: TextStyle;
  userName: TextStyle;
  date: TextStyle;
  profileButton: ViewStyle;
  profileIconContainer: ViewStyle;
  headerContent: ViewStyle;
  headerTitle: TextStyle;
  headerSubtitle: TextStyle;
  greetingContainer: ViewStyle;
  
  // Cards
  card: ViewStyle;
  cardContent: ViewStyle;
  goalCard: ViewStyle;
  modernGoalCard: ViewStyle;
  goalCardHeader: ViewStyle;
  goalCategoryBadge: ViewStyle;
  goalCategoryText: TextStyle;
  goalStatus: ViewStyle;
  goalCompleted: ViewStyle;
  completedGoalTitle: TextStyle;
  goalProgressSection: ViewStyle;
  
  // Streak Card
  streakCard: ViewStyle;
  streakContent: ViewStyle;
  streakIcon: ViewStyle;
  streakLabel: TextStyle;
  streakCount: TextStyle;
  streakText: TextStyle;
  streakBadge: ViewStyle;
  streakTextSection: ViewStyle;
  streakMotivation: TextStyle;
  streakVisual: ViewStyle;
  flameContainer: ViewStyle;
  streakDots: ViewStyle;
  streakDot: ViewStyle;
  
  // Goals
  goalsContainer: ViewStyle;
  goalsScrollContainer: ViewStyle;
  goalsHeader: ViewStyle;
  goalsTitle: TextStyle;
  goalsList: ViewStyle;
  goalItem: ViewStyle;
  goalContent: ViewStyle;
  goalCheckbox: ViewStyle;
  goalCheckboxChecked: ViewStyle;
  goalCheckboxCompleted: ViewStyle;
  goalText: TextStyle;
  goalTextCompleted: TextStyle;
  completedGoalText: TextStyle;
  goalDate: TextStyle;
  goalHeader: ViewStyle;
  goalIcon: ViewStyle;
  goalTitle: TextStyle;
  moreButton: ViewStyle;
  
  // Progress
  progressContainer: ViewStyle;
  progressBar: ViewStyle;
  progressFill: ViewStyle;
  progressText: TextStyle;
  
  // Quick Actions
  quickActions: ViewStyle;
  quickAction: ViewStyle;
  quickActionIcon: ViewStyle;
  quickActionText: TextStyle;
  
  // Actions
  actionsContainer: ViewStyle;
  actionsHeader: ViewStyle;
  actionsTitle: TextStyle;
  actionsGrid: ViewStyle;
  actionButton: ViewStyle;
  actionButtonContent: ViewStyle;
  actionButtonText: TextStyle;
  actionIcon: ViewStyle;
  actionText: TextStyle;
  
  // Empty States
  emptyState: ViewStyle;
  emptyText: TextStyle;
  emptyStateText: TextStyle;
  emptyGoalsContainer: ViewStyle;
  emptyIcon: ViewStyle;
  emptyTitle: TextStyle;
  emptySubtitle: TextStyle;
  noGoals: ViewStyle;
  noGoalsText: TextStyle;
  
  // Buttons
  addButton: ViewStyle;
  addButtonText: TextStyle;
  createGoalButton: ViewStyle;
  createGoalButtonText: TextStyle;
  seeAllButton: ViewStyle;
  seeAllText: TextStyle;
  
  // Badges
  completedBadge: ViewStyle;
  completedText: TextStyle;
  
  // Sections
  section: ViewStyle;
  sectionHeader: ViewStyle;
  sectionTitle: TextStyle;
  seeAll: TextStyle;
  
  // Stats
  statsSection: ViewStyle;
  statsCard: ViewStyle;
  statsHeader: ViewStyle;
  statsIcon: ViewStyle;
  statsValue: TextStyle;
  statsLabel: TextStyle;
  trendIndicator: ViewStyle;
  statsContainer: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  
  // Utility
  refreshControl: ViewStyle;
  bottomSpacing: ViewStyle;
};

// Constants
const { width } = Dimensions.get('window');
const CARD_SPACING = 16;
const THEME_COLORS = {
  primary: '#4F46E5',
  secondary: '#EC4899',
  success: '#22C55E',
  warning: '#EAB308',
  info: '#06B6D4',
  background: '#F9FAFB',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
};

// Helper Functions
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// Enhanced Components
const HomeHeader = ({ greeting, name, currentDate, onProfilePress }: HomeHeaderProps) => (
  <LinearGradient
    colors={[THEME_COLORS.primary, THEME_COLORS.primary + 'CC']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.headerGradient}
  >
    <View style={styles.headerContent}>
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.userName}>{name || 'User'}</Text>
        <Text style={styles.date}>{currentDate}</Text>
      </View>
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <View style={styles.profileIconContainer}>
          <Feather name="user" size={24} color={THEME_COLORS.primary} />
        </View>
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

const StatsCard = ({ title, value, icon, color, trend = 'neutral' }: StatsCardProps) => (
  <View style={[styles.statsCard, { borderColor: color }]}>
    <View style={styles.statsHeader}>
      <View style={[styles.statsIcon, { backgroundColor: color + '10' }]}>
        {icon}
      </View>
      {trend !== 'neutral' && (
        <View style={[styles.trendIndicator, { backgroundColor: trend === 'up' ? THEME_COLORS.success : THEME_COLORS.secondary }]}>
          <Ionicons 
            name={trend === 'up' ? 'arrow-up' : 'arrow-down'} 
            size={14} 
            color="#fff" 
          />
        </View>
      )}
    </View>
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsLabel}>{title}</Text>
  </View>
);

const StreakCard = ({ count }: StreakCardProps) => {
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  return (
    <LinearGradient
      colors={[THEME_COLORS.warning, THEME_COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.streakCard}
    >
      <View style={styles.streakContent}>
        <View style={styles.streakTextSection}>
          <Text style={styles.streakLabel}>Current Streak</Text>
          <Text style={styles.streakCount}>{count}</Text>
          <Text style={styles.streakMotivation}>days on fire!</Text>
        </View>
        <Animated.View style={[styles.flameContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="flame" size={48} color="#FFFFFF" />
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const EnhancedGoalItem = ({ goal, onComplete }: GoalItemProps) => {
  const progress = goal.progress || 0;
  const categoryColors = {
    Activity: THEME_COLORS.success,
    Nutrition: THEME_COLORS.warning,
    Sleep: THEME_COLORS.info,
    Wellness: THEME_COLORS.primary,
  };
  const color = categoryColors[goal.category as keyof typeof categoryColors] || THEME_COLORS.textSecondary;

  return (
    <TouchableOpacity 
      style={styles.modernGoalCard}
      onPress={() => onComplete?.(goal.id)}
      activeOpacity={0.7}
    >
      <View style={styles.goalCardHeader}>
        <View style={[styles.goalCategoryBadge, { backgroundColor: color + '10' }]}>
          <Text style={[styles.goalCategoryText, { color }]}>
            {goal.category || 'General'}
          </Text>
        </View>
        <View style={[styles.goalStatus, goal.completed && styles.goalCompleted]}>
          <Ionicons name={goal.completed ? "checkmark-circle" : "ellipse-outline"} size={20} color={goal.completed ? "#FFFFFF" : color} />
        </View>
      </View>
      
      <Text style={[styles.goalTitle, goal.completed && styles.completedGoalTitle]} numberOfLines={2}>
        {goal.title}
      </Text>
      
      {!goal.completed && progress > 0 && (
        <View style={styles.goalProgressSection}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const QuickAction = ({ icon, label, color, bgColor, onPress }: QuickActionProps) => (
  <TouchableOpacity 
    style={[styles.quickAction, { backgroundColor: bgColor }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: color + '10', borderColor: color + '20' }]}>
      {icon}
    </View>
    <Text style={[styles.quickActionText, { color: THEME_COLORS.textPrimary }]}>{label}</Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const { userDetails, goals = [], completeGoal, updateStreak } = useAppContext();
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [refreshing, setRefreshing] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [animatedValue] = useState(new Animated.Value(0));
  
  const handleCompleteGoal = useCallback(async (goalId: string) => {
    if (completeGoal) {
      await completeGoal(goalId);
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 500);
    }
  }, [completeGoal]);
  
  const loadStreakCount = useCallback(async () => {
    try {
      const storedStreak = await AsyncStorage.getItem('appStreak');
      const today = new Date().toDateString();
      
      if (storedStreak) {
        const { count, lastOpened } = JSON.parse(storedStreak);
        const lastOpenedDate = new Date(lastOpened).toDateString();
        
        if (today === lastOpenedDate) {
          setStreakCount(count);
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastOpenedDate === yesterday.toDateString()) {
            const newCount = count + 1;
            await AsyncStorage.setItem('appStreak', JSON.stringify({
              count: newCount,
              lastOpened: new Date().toISOString()
            }));
            setStreakCount(newCount);
          } else {
            await AsyncStorage.setItem('appStreak', JSON.stringify({
              count: 1,
              lastOpened: new Date().toISOString()
            }));
            setStreakCount(1);
          }
        }
      } else {
        await AsyncStorage.setItem('appStreak', JSON.stringify({
          count: 1,
          lastOpened: new Date().toISOString()
        }));
        setStreakCount(1);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  }, []);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStreakCount();
    await updateStreak?.();
    
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setRefreshing(false);
  }, [loadStreakCount, updateStreak, animatedValue]);
  
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setGreeting(getTimeBasedGreeting());
      setCurrentDate(now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric'
      }));
    };
    
    updateDateTime();
    loadStreakCount();
    
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, [loadStreakCount]);

  const renderStatsSection = () => (
    <View style={styles.statsSection}>
      <StatsCard 
        title="Goals Today"
        value={`${goals.filter(g => g.completed).length}/${goals.length}`}
        icon={<MaterialIcons name="track-changes" size={20} color={THEME_COLORS.success} />}
        color={THEME_COLORS.success}
        trend="up"
      />
      <StatsCard 
        title="Weekly Progress"
        value="85%"
        icon={<MaterialCommunityIcons name="calendar-week" size={20} color={THEME_COLORS.primary} />}
        color={THEME_COLORS.primary}
        trend="up"
      />
      <StatsCard 
        title="Streak"
        value={`${streakCount}d`}
        icon={<Ionicons name="flame" size={20} color={THEME_COLORS.warning} />}
        color={THEME_COLORS.warning}
        trend={streakCount > 0 ? 'up' : 'neutral'}
      />
    </View>
  );

  const renderGoals = () => {
    if (!goals?.length) {
      return (
        <View style={styles.emptyGoalsContainer}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={60} color={THEME_COLORS.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>Start Your Journey</Text>
          <Text style={styles.emptySubtitle}>Add your first goal and take the first step towards better wellness</Text>
          <TouchableOpacity 
            style={styles.createGoalButton}
            onPress={() => router.push('/modal?screen=add-goal')}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.createGoalButtonText}>Create Goal</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.goalsScrollContainer}
        decelerationRate="fast"
        snapToInterval={width * 0.7 + CARD_SPACING / 2}
        snapToAlignment="start"
      >
        {goals.slice(0, 5).map((goal) => (
          <EnhancedGoalItem 
            key={goal.id} 
            goal={{
              ...goal,
              progress: Math.floor(Math.random() * 100), // Mock progress for demo
              category: ['Activity', 'Nutrition', 'Sleep', 'Wellness'][Math.floor(Math.random() * 4)]
            }} 
            onComplete={handleCompleteGoal} 
          />
        ))}
        <View style={{ width: CARD_SPACING }} />
      </ScrollView>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <QuickAction 
        icon={<MaterialCommunityIcons name="meditation" size={28} color={THEME_COLORS.primary} />}
        label="Meditate"
        color={THEME_COLORS.primary}
        bgColor={THEME_COLORS.card}
        onPress={() => router.push('/modal?screen=meditation')}
      />
      <QuickAction 
        icon={<FontAwesome5 name="running" size={28} color={THEME_COLORS.secondary} />}
        label="Workout"
        color={THEME_COLORS.secondary}
        bgColor={THEME_COLORS.card}
        onPress={() => router.push('/modal?screen=workout')}
      />
      <QuickAction 
        icon={<Ionicons name="bed-outline" size={28} color={THEME_COLORS.info} />}
        label="Sleep Track"
        color={THEME_COLORS.info}
        bgColor={THEME_COLORS.card}
        onPress={() => router.push('/modal?screen=sleep')}
      />
      <QuickAction 
        icon={<MaterialCommunityIcons name="food-apple" size={28} color={THEME_COLORS.warning} />}
        label="Nutrition"
        color={THEME_COLORS.warning}
        bgColor={THEME_COLORS.card}
        onPress={() => router.push('/modal?screen=nutrition')}
      />
    </View>
  );

  return (
    
      <ScrollView style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={THEME_COLORS.primary}
            colors={[THEME_COLORS.primary]}
            progressBackgroundColor={THEME_COLORS.card}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HomeHeader 
          greeting={greeting}
          name={userDetails?.name}
          currentDate={currentDate}
          onProfilePress={() => router.push('/profile')}
        />
        
        {renderStatsSection()}
        
        <StreakCard count={streakCount} />
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Goals</Text>
            <TouchableOpacity 
              onPress={() => router.push('/modal?screen=goals')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={THEME_COLORS.primary} />
            </TouchableOpacity>
          </View>
          {renderGoals()}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {renderQuickActions()}
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  // iOS Status Bar
  iosStatusBar: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  iosStatusBarContent: {
    height: Platform.OS === 'ios' ? 44 : 0,
  },
  
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  bottomSpacing: {
    height: 40,
  },

  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  // Header
  headerGradient: {
    paddingHorizontal: CARD_SPACING,
    paddingTop: 120,
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '400',
  },
  profileButton: {
    marginLeft: 16,
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: CARD_SPACING,
    marginTop: -24,
    marginBottom: 24,
    gap: 12,
  },
  statsCard: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 24,
    padding: 16,
    flex: 1,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.textPrimary,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 13,
    color: THEME_COLORS.textSecondary,
    fontWeight: '500',
  },

  // Streak Card
  streakCard: {
    marginHorizontal: CARD_SPACING,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakTextSection: {
    flex: 1,
  },
  streakLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  streakCount: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  streakMotivation: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 16,
    fontWeight: '600',
  },
  flameContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sections
  section: {
    marginBottom: 32,
    paddingHorizontal: CARD_SPACING,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: THEME_COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 4,
  },

  // Goals
  goalsScrollContainer: {
    paddingRight: CARD_SPACING,
  },
  modernGoalCard: {
    width: width * 0.7,
    backgroundColor: THEME_COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginRight: CARD_SPACING / 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goalCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  goalStatus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCompleted: {
    backgroundColor: THEME_COLORS.success,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    lineHeight: 24,
  },
  completedGoalTitle: {
    color: THEME_COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  goalProgressSection: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: THEME_COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: THEME_COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'right',
  },

  // Empty States
  emptyGoalsContainer: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: THEME_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  createGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  createGoalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAction: {
    width: '48%',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
