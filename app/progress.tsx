import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';

const { width } = Dimensions.get('window');

type TimeRange = 'week' | 'month' | 'year';

export default function ProgressScreen() {
  const { goals, userDetails } = useAppContext();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [activeTab, setActiveTab] = useState('overview');
  const [chartData, setChartData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
        color: (opacity = 1) => `rgba(107, 70, 193, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  });

  // Generate mock data based on time range
  useEffect(() => {
    let labels: string[] = [];
    let data: number[] = [];
    
    if (timeRange === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = [20, 45, 28, 80, 99, 43, 50];
    } else if (timeRange === 'month') {
      labels = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
      data = [65, 59, 80, 81];
    } else {
      labels = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      data = [
        65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56
      ];
    }
    
    setChartData({
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(107, 70, 193, ${opacity})`,
        strokeWidth: 2,
      }],
    });
  }, [timeRange]);

  // Calculate completion rate by category
  const categoryCompletion = goals.reduce((acc: {[key: string]: {completed: number, total: number}}, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = { completed: 0, total: 0 };
    }
    acc[goal.category].total++;
    if (goal.completed) {
      acc[goal.category].completed++;
    }
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryCompletion).map(([category, data], index) => {
    const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#607D8B'];
    return {
      name: category,
      population: (data.completed / data.total) * 100,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    };
  });

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{goals.filter(g => g.completed).length}</Text>
          <Text style={styles.statLabel}>Goals Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {goals.length > 0 
              ? Math.round((goals.filter(g => g.completed).length / goals.length) * 100) 
              : 0}%
          </Text>
          <Text style={styles.statLabel}>Completion Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userDetails?.streakCount || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Activity Progress</Text>
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
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(107, 70, 193, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#6B46C1',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Goals by Category</Text>
        <View style={styles.pieChartContainer}>
          <PieChart
            data={pieChartData}
            width={width - 40}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
              {data.completed} of {data.total} completed
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(data.completed / data.total) * 100}%`,
                  backgroundColor: '#6B46C1',
                }
              ]} 
            />
          </View>
          <View style={styles.goalList}>
            {goals
              .filter(goal => goal.category === category)
              .map(goal => (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalInfo}>
                    <MaterialIcons 
                      name={goal.completed ? 'check-circle' : 'radio-button-unchecked'} 
                      size={20} 
                      color={goal.completed ? '#4CAF50' : '#ccc'} 
                    />
                    <Text style={styles.goalName}>{goal.title}</Text>
                  </View>
                  <Text style={styles.goalProgress}>
                    {goal.current} / {goal.target} {goal.unit}
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
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <MaterialIcons name="directions-run" size={24} color="#fff" />
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>Morning Run</Text>
              <Text style={styles.activityTime}>Today, 7:30 AM</Text>
              <Text style={styles.activityStats}>5.2 km • 32 min • 280 kcal</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
          onPress={() => setActiveTab('goals')}
        >
          <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>
            Goals
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'activities' && styles.activeTab]}
          onPress={() => setActiveTab('activities')}
        >
          <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>
            Activities
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'goals' && renderGoalsTab()}
        {activeTab === 'activities' && renderActivitiesTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6B46C1',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6B46C1',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeRangeTabs: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  timeRangeTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  timeRangeTabActive: {
    backgroundColor: '#fff',
  },
  timeRangeText: {
    fontSize: 12,
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#6B46C1',
    fontWeight: '600',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  goalCategoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  goalCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  goalCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  goalCategoryStats: {
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalList: {
    marginTop: 5,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalName: {
    marginLeft: 10,
    color: '#333',
  },
  goalProgress: {
    fontSize: 12,
    color: '#666',
  },
  activitiesContainer: {
    marginTop: 10,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  activityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  activityStats: {
    fontSize: 12,
    color: '#6B46C1',
    fontWeight: '500',
  },
});
