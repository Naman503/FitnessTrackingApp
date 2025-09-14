import { useAppContext } from '@/context/AppContext';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
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

// Constants
const { width, height } = Dimensions.get('window');
const CARD_SPACING = 20;
const HEADER_HEIGHT = height * 0.35;
const THEME_COLORS = {
  primary: '#6366F1',
  primaryLight: '#A5B4FC',
  primaryDark: '#4F46E5',
  secondary: '#F59E0B',
  secondaryLight: '#FDE68A',
  accent: '#EC4899',
  accentLight: '#F9A8D4',
  success: '#10B981',
  successLight: '#A7F3D0',
  warning: '#EAB308',
  warningLight: '#FEF08A',
  info: '#06B6D4',
  infoLight: '#A5F3FC',
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  card: '#FFFFFF',
  cardSecondary: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  shadow: 'rgba(15, 23, 42, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.6)',
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
  <View style={styles.headerContainer}>
    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
    <LinearGradient
      colors={[THEME_COLORS.primary, THEME_COLORS.primaryDark, THEME_COLORS.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      {/* Background Pattern */}
      <View style={styles.headerPattern}>
        <View style={[styles.patternCircle, styles.patternCircle1]} />
        <View style={[styles.patternCircle, styles.patternCircle2]} />
        <View style={[styles.patternCircle, styles.patternCircle3]} />
      </View>
      
      <View style={styles.headerContent}>
        {/* Top Navigation */}
        <View style={styles.headerNav}>
          <View style={styles.headerLeft}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.locationText}>Home</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={onProfilePress}
            activeOpacity={0.8}
          >
            <View style={styles.profileIconContainer}>
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.profileGradient}
              >
                <Feather name="user" size={20} color={THEME_COLORS.primary} />
              </LinearGradient>
              <View style={styles.onlineIndicator} />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Main Header Content */}
        <View style={styles.headerMain}>
          <Animated.View style={styles.greetingSection}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{name || 'Welcome Back'}</Text>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.date}>{currentDate}</Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </LinearGradient>
  </View>
);

const StatsCard = ({ title, value, icon, color, trend = 'neutral' }: StatsCardProps) => (
  <Animated.View style={[styles.statsCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
    <View style={styles.statsHeader}>
      <View style={[styles.statsIcon, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      {trend !== 'neutral' && (
        <View style={[styles.trendIndicator, { 
          backgroundColor: trend === 'up' ? THEME_COLORS.success : THEME_COLORS.accent 
        }]}>
          <Ionicons 
            name={trend === 'up' ? 'trending-up' : 'trending-down'} 
            size={12} 
            color="#FFFFFF" 
          />
        </View>
      )}
    </View>
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsLabel}>{title}</Text>
    
    {/* Subtle background decoration */}
    <View style={[styles.statsDecoration, { backgroundColor: color + '08' }]} />
  </Animated.View>
);

const StreakCard = ({ count }: StreakCardProps) => {
  const scaleAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, [scaleAnim, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.streakCardContainer}>
      <LinearGradient
        colors={[THEME_COLORS.secondary, THEME_COLORS.warning, THEME_COLORS.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.streakCard}
      >
        {/* Background Pattern */}
        <Animated.View style={[styles.streakPattern, { transform: [{ rotate: rotation }] }]}>
          <View style={styles.streakPatternDot} />
          <View style={[styles.streakPatternDot, styles.streakPatternDot2]} />
          <View style={[styles.streakPatternDot, styles.streakPatternDot3]} />
        </Animated.View>
        
        <View style={styles.streakContent}>
          <View style={styles.streakTextSection}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>STREAK</Text>
            </View>
            <Text style={styles.streakCount}>{count}</Text>
            <Text style={styles.streakMotivation}>
              {count > 7 ? "You're on fire! 🔥" : count > 3 ? "Keep it up! 💪" : "Great start! ⭐"}
            </Text>
          </View>
          
          <Animated.View style={[styles.flameContainer, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.flameGradient}
            >
              <Ionicons name="flame" size={36} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.streakDaysLabel}>days</Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const EnhancedGoalItem = ({ goal, onToggle, onDelete }: GoalItemProps) => {
  const progress = goal.progress || 0;
  const categoryColors = {
    Activity: THEME_COLORS.success,
    Nutrition: THEME_COLORS.warning,
    Sleep: THEME_COLORS.info,
    Wellness: THEME_COLORS.primary,
    Mental: THEME_COLORS.accent,
  };
  const color = categoryColors[goal.category as keyof typeof categoryColors] || THEME_COLORS.textSecondary;

  return (
    <TouchableOpacity 
      style={[styles.modernGoalCard, goal.completed && styles.completedGoalCard]}
      onPress={() => onToggle?.(goal.id)}
      onLongPress={() => onDelete?.(goal.id)}
      activeOpacity={0.8}
    >
      {/* Goal Header */}
      <View style={styles.goalCardHeader}>
        <View style={[styles.goalCategoryBadge, { backgroundColor: color + '15', borderColor: color + '30' }]}>
          <View style={[styles.categoryDot, { backgroundColor: color }]} />
          <Text style={[styles.goalCategoryText, { color }]}>
            {goal.category || 'General'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.goalStatusButton, goal.completed && { backgroundColor: color }]}
          onPress={() => onToggle?.(goal.id)}
        >
          {goal.completed ? (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          ) : (
            <View style={[styles.goalStatusRing, { borderColor: color }]} />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Goal Title */}
      <Text style={[styles.goalTitle, goal.completed && styles.completedGoalTitle]} numberOfLines={2}>
        {goal.title}
      </Text>
      
      {/* Progress Section */}
      {!goal.completed && progress > 0 && (
        <View style={styles.goalProgressSection}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.progressText, { color }]}>{progress}%</Text>
          </View>
        </View>
      )}
      
      {/* Completion Badge */}
      {goal.completed && (
        <View style={[styles.completionBadge, { backgroundColor: color + '15' }]}>
          <Ionicons name="trophy" size={16} color={color} />
          <Text style={[styles.completionText, { color }]}>Completed</Text>
        </View>
      )}
      
      {/* Card Decoration */}
      <View style={[styles.goalCardDecoration, { backgroundColor: color + '08' }]} />
    </TouchableOpacity>
  );
};

const QuickAction = ({ icon, label, color, bgColor, onPress }: QuickActionProps) => (
  <TouchableOpacity 
    style={[styles.quickAction, { backgroundColor: bgColor }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: color + '15', borderColor: color + '25' }]}>
      {icon}
    </View>
    <Text style={[styles.quickActionText, { color: THEME_COLORS.textPrimary }]}>{label}</Text>
    
    {/* Action Arrow */}
    <View style={styles.actionArrow}>
      <Ionicons name="arrow-forward" size={14} color={THEME_COLORS.textTertiary} />
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const { userDetails, goals = [], toggleGoalComplete, deleteGoal, updateStreak } = useAppContext();
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [refreshing, setRefreshing] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [animatedValue] = useState(new Animated.Value(0));
  
  const handleToggleGoal = useCallback(async (goalId: string) => {
    toggleGoalComplete?.(goalId);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  }, [toggleGoalComplete]);

  const handleDeleteGoal = useCallback((goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteGoal?.(goalId) },
      ]
    );
  }, [deleteGoal]);
  
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
        title="Today's Goals"
        value={`${goals.filter(g => g.completed).length}/${goals.length}`}
        icon={<MaterialIcons name="today" size={18} color={THEME_COLORS.success} />}
        color={THEME_COLORS.success}
        trend="up"
      />
      <StatsCard 
        title="Weekly Score"
        value="94%"
        icon={<MaterialCommunityIcons name="chart-line" size={18} color={THEME_COLORS.primary} />}
        color={THEME_COLORS.primary}
        trend="up"
      />
      <StatsCard 
        title="Best Streak"
        value={`${Math.max(streakCount, 12)}d`}
        icon={<Ionicons name="flame" size={18} color={THEME_COLORS.warning} />}
        color={THEME_COLORS.warning}
        trend={streakCount > 0 ? 'up' : 'neutral'}
      />
    </View>
  );

  const renderGoals = () => {
    if (!goals?.length) {
      return (
        <View style={styles.emptyGoalsContainer}>
          <LinearGradient
            colors={[THEME_COLORS.background, THEME_COLORS.card]}
            style={styles.emptyGradient}
          >
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="target" size={48} color={THEME_COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Ready to Start?</Text>
            <Text style={styles.emptySubtitle}>Create your first goal and begin your wellness journey today</Text>
            <TouchableOpacity 
              style={styles.createGoalButton}
              onPress={() => router.push({
                pathname: '/modal',
                params: {
                  perms: 'add-goal'
                }
              })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[THEME_COLORS.primary, THEME_COLORS.primaryDark]}
                style={styles.createGoalGradient}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.createGoalButtonText}>Create First Goal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.goalsScrollContainer}
        decelerationRate="fast"
        snapToInterval={width * 0.75 + CARD_SPACING / 2}
        snapToAlignment="start"
      >
        {goals.slice(0, 5).map((goal) => (
          <EnhancedGoalItem 
            key={goal.id} 
            goal={goal}
            onToggle={handleToggleGoal}
            onDelete={handleDeleteGoal}
          />
        ))}
        <View style={{ width: CARD_SPACING }} />
      </ScrollView>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <View style={styles.quickActionsGrid}>
        <QuickAction 
          icon={<MaterialCommunityIcons name="meditation" size={24} color={THEME_COLORS.primary} />}
          label="Meditate"
          color={THEME_COLORS.primary}
          bgColor={THEME_COLORS.card}
          onPress={() => router.push({ pathname: '/modal', params: { perms: 'meditation' } })}
        />
        <QuickAction 
          icon={<FontAwesome5 name="running" size={24} color={THEME_COLORS.accent} />}
          label="Workout"
          color={THEME_COLORS.accent}
          bgColor={THEME_COLORS.card}
          onPress={() => router.push({ pathname: '/modal', params: { perms: 'workout' } })}
        />
        <QuickAction 
          icon={<Ionicons name="moon-outline" size={24} color={THEME_COLORS.info} />}
          label="Sleep Track"
          color={THEME_COLORS.info}
          bgColor={THEME_COLORS.card}
          onPress={() => router.push({ pathname: '/modal', params: { perms: 'sleep' } })}
        />
        <QuickAction 
          icon={<MaterialCommunityIcons name="food-apple" size={24} color={THEME_COLORS.warning} />}
          label="Nutrition"
          color={THEME_COLORS.warning}
          bgColor={THEME_COLORS.card}
          onPress={() => router.push({ pathname: '/modal', params: { perms: 'nutrition' } })}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={THEME_COLORS.primary}
            colors={[THEME_COLORS.primary]}
            progressBackgroundColor={THEME_COLORS.card}
            progressViewOffset={HEADER_HEIGHT * 0.6}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
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
            <Text style={styles.sectionTitle}>Today's Focus</Text>
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/modal', params: { screen: 'goals' } })}
              style={styles.seeAllButton}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={14} color={THEME_COLORS.primary} />
            </TouchableOpacity>
          </View>
          {renderGoals()}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          {renderQuickActions()}
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  bottomSpacing: {
    height: 60,
  },

  // Header
  headerContainer: {
    position: 'relative',
    zIndex: 1,
  },
  headerGradient: {
    height: HEADER_HEIGHT,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: CARD_SPACING,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  patternCircle1: {
    width: 120,
    height: 120,
    top: -20,
    right: -30,
  },
  patternCircle2: {
    width: 80,
    height: 80,
    top: 100,
    left: -20,
  },
  patternCircle3: {
    width: 60,
    height: 60,
    bottom: 20,
    right: 60,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  profileButton: {
    marginLeft: 16,
  },
  profileIconContainer: {
    position: 'relative',
  },
  profileGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME_COLORS.success,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerMain: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingSection: {
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  date: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginLeft: 6,
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: CARD_SPACING,
    marginTop: -40,
    marginBottom: 24,
    gap: 12,
    zIndex: 2,
  },
  statsCard: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 20,
    padding: 16,
    flex: 1,
    shadowColor: THEME_COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.textPrimary,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: THEME_COLORS.textSecondary,
    fontWeight: '500',
  },
  statsDecoration: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopLeftRadius: 20,
  },

  // Streak Card
  streakCardContainer: {
    marginHorizontal: CARD_SPACING,
    marginBottom: 24,
  },
  streakCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: THEME_COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  streakPattern: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
  },
  streakPatternDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  streakPatternDot2: {
    top: 20,
    left: 30,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  streakPatternDot3: {
    top: 50,
    left: 10,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  streakTextSection: {
    flex: 1,
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  streakBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  streakCount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  streakMotivation: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  flameContainer: {
    alignItems: 'center',
  },
  flameGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  streakDaysLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME_COLORS.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seeAllText: {
    color: THEME_COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },

  // Goals
  goalsScrollContainer: {
    paddingRight: CARD_SPACING,
  },
  modernGoalCard: {
    width: width * 0.75,
    backgroundColor: THEME_COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginRight: CARD_SPACING / 2,
    shadowColor: THEME_COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME_COLORS.borderLight,
  },
  completedGoalCard: {
    backgroundColor: THEME_COLORS.backgroundSecondary,
    opacity: 0.8,
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  goalCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalStatusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.backgroundSecondary,
  },
  goalStatusRing: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  completedGoalTitle: {
    color: THEME_COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  goalProgressSection: {
    marginTop: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: THEME_COLORS.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  completionText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  goalCardDecoration: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 60,
    height: 60,
    borderTopLeftRadius: 30,
  },

  // Empty States
  emptyGoalsContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: THEME_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyGradient: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME_COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  createGoalButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createGoalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createGoalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Quick Actions
  quickActionsContainer: {
    marginTop: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAction: {
    width: '48%',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    shadowColor: THEME_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderLight,
    position: 'relative',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});