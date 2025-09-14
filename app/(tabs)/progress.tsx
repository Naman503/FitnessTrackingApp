import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '@/context/AppContext';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const CARD_SPACING = 16;

type TimeRange = 'week' | 'month' | 'year';

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

export default function ProgressScreen() {
  const { goals, userDetails } = useAppContext();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [activeTab, setActiveTab] = useState('overview');
  const [chartData, setChartData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `${THEME_COLORS.primary}${Math.floor(opacity * 255).toString(16)}`,
        strokeWidth: 3,
      },
    ],
  });
  const tabAnim = React.useRef(new Animated.Value(0)).current;

  // Calculate real data if possible; fallback to mock
  useEffect(() => {
    // Assuming goals have 'completionDate' for real data; if not, use mock
    // For demo, using improved mock with calculations
    let labels: string[] = [];
    let data: number[] = [];
    
    const completionRate = goals.length > 0 
      ? (goals.filter(g => g.completed).length / goals.length) * 100 
      : 0;

    if (timeRange === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = labels.map(() => Math.floor(Math.random() * 100 * (completionRate / 100)));
    } else if (timeRange === 'month') {
      labels = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
      data = labels.map(() => Math.floor(Math.random() * 100 * (completionRate / 100)));
    } else {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = labels.map(() => Math.floor(Math.random() * 100 * (completionRate / 100)));
    }
    
    setChartData({
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `${THEME_COLORS.primary}${Math.floor(opacity * 255).toString(16)}`,
        strokeWidth: 3,
      }],
    });
  }, [timeRange, goals]);

  // Calculate completion rate by category
  const categoryCompletion = goals.reduce((acc: {[key: string]: {completed: number, total: number, currentTotal: number}}, goal) => {
    const cat = goal.category || 'General';
    if (!acc[cat]) {
      acc[cat] = { completed: 0, total: 0, currentTotal: 0 };
    }
    acc[cat].total++;
    if (goal.completed) {
      acc[cat].completed++;
    }
    acc[cat].currentTotal += goal.progress || goal.current || 0;
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryCompletion).map(([category, data], index) => {
    const colors = [THEME_COLORS.success, THEME_COLORS.primary, THEME_COLORS.secondary, THEME_COLORS.warning, THEME_COLORS.info];
    return {
      name: category,
      population: (data.completed / data.total) * 100 || 0,
      color: colors[index % colors.length],
      legendFontColor: THEME_COLORS.textSecondary,
      legendFontSize: 13,
    };
  });

  const handleTabChange = (tab: string) => {
    Animated.timing(tabAnim, {
      toValue: ['overview', 'goals', 'activities'].indexOf(tab) * (width / 3),
      duration: 300,
      useNativeDriver: true,
    }).start();
    setActiveTab(tab);
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{goals.filter(g => g.completed).length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {goals.length > 0 
              ? Math.round((goals.filter(g => g.completed).length / goals.length) * 100) 
              : 0}%
          </Text>
          <Text style={styles.statLabel}>Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userDetails?.streakCount || 0}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Progress Trend</Text>
          <View style={styles.timeRangeTabs}>
            {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeTab,
                  timeRange === range && styles.timeRangeTabActive,
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    timeRange === range && styles.timeRangeTextActive,
                  ]}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <LineChart
          data={chartData}
          width={width - CARD_SPACING * 2}
          height={240}
          chartConfig={{
            backgroundGradientFrom: THEME_COLORS.card,
            backgroundGradientTo: THEME_COLORS.card,
            decimalPlaces: 0,
            color: (opacity = 1) => THEME_COLORS.textSecondary + Math.floor(opacity * 255).toString(16),
            labelColor: () => THEME_COLORS.textSecondary,
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: THEME_COLORS.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Category Breakdown</Text>
        <View style={styles.pieChartContainer}>
          <PieChart
            data={pieChartData}
            width={width - CARD_SPACING * 2}
            height={220}
            chartConfig={{
              color: (opacity = 1) => THEME_COLORS.textPrimary + Math.floor(opacity * 255).toString(16),
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </View>
    </View>
  );

  const renderGoalsTab = () => (
    <View style={styles.tabContent}>
      {Object.entries(categoryCompletion).map(([category, data]) => (
        <View key={category} style={styles.goalCategoryCard}>
          <View style={styles.goalCategoryHeader}>
            <Text style={styles.goalCategoryTitle}>{category}</Text>
            <Text style={styles.goalCategoryStats}>
              {data.completed}/{data.total} completed
            </Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[THEME_COLORS.primary, THEME_COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill, 
                { width: `${(data.completed / data.total) * 100}%` }
              ]}
            />
          </View>
          <View style={styles.goalList}>
            {goals
              .filter(goal => (goal.category || 'General') === category)
              .map(goal => (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalInfo}>
                    <Ionicons 
                      name={goal.completed ? 'checkmark-circle' : 'ellipse-outline'} 
                      size={24} 
                      color={goal.completed ? THEME_COLORS.success : THEME_COLORS.textSecondary} 
                    />
                    <Text style={styles.goalName}>{goal.title}</Text>
                  </View>
                  <Text style={styles.goalProgress}>
                    {goal.progress || goal.current || 0} / {goal.target || 'N/A'} {goal.unit || ''}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderActivitiesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.activitiesContainer}>
        {/* Assuming activities data; mock for now */}
        {goals.filter(g => !g.completed).map((goal) => (
          <View key={goal.id} style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <MaterialIcons name="directions-run" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>{goal.title}</Text>
              <Text style={styles.activityTime}>Ongoing</Text>
              <Text style={styles.activityStats}>Progress: {goal.progress || 0}%</Text>
            </View>
          </View>
        ))}
        {goals.length === 0 && (
          <Text style={styles.emptyText}>No activities yet</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={THEME_COLORS.background} />
      <LinearGradient
        colors={[THEME_COLORS.primary + '20', THEME_COLORS.background]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your Progress</Text>
      </LinearGradient>
      
      <View style={styles.tabs}>
        <Animated.View style={[styles.tabIndicator, { transform: [{ translateX: tabAnim }] }]} />
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => handleTabChange('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => handleTabChange('goals')}
        >
          <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>
            Goals
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => handleTabChange('activities')}
        >
          <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>
            Activities
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'goals' && renderGoalsTab()}
        {activeTab === 'activities' && renderActivitiesTab()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
    marginBottom:64,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: CARD_SPACING,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME_COLORS.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: THEME_COLORS.card,
    position: 'relative',
    marginHorizontal: CARD_SPACING,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width / 3 - CARD_SPACING * 2 / 3,
    height: 3,
    backgroundColor: THEME_COLORS.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabText: {
    fontSize: 15,
    color: THEME_COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: THEME_COLORS.primary,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  tabContent: {
    paddingHorizontal: CARD_SPACING,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME_COLORS.card,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME_COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: THEME_COLORS.textSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.textPrimary,
  },
  timeRangeTabs: {
    flexDirection: 'row',
    backgroundColor: THEME_COLORS.background,
    borderRadius: 12,
    padding: 4,
  },
  timeRangeTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeRangeTabActive: {
    backgroundColor: THEME_COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  timeRangeText: {
    fontSize: 13,
    color: THEME_COLORS.textSecondary,
    fontWeight: '600',
  },
  timeRangeTextActive: {
    color: THEME_COLORS.primary,
  },
  chart: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  goalCategoryCard: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalCategoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.textPrimary,
  },
  goalCategoryStats: {
    fontSize: 13,
    color: THEME_COLORS.textSecondary,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: THEME_COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalList: {},
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.background,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalName: {
    marginLeft: 12,
    fontSize: 15,
    color: THEME_COLORS.textPrimary,
    fontWeight: '500',
  },
  goalProgress: {
    fontSize: 13,
    color: THEME_COLORS.textSecondary,
    fontWeight: '500',
  },
  activitiesContainer: {
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: THEME_COLORS.card,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 13,
    color: THEME_COLORS.textSecondary,
    marginBottom: 4,
  },
  activityStats: {
    fontSize: 13,
    color: THEME_COLORS.primary,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: THEME_COLORS.textSecondary,
    fontSize: 15,
    marginTop: 32,
  },
  bottomSpacing: {
    height: 40,
  },
});