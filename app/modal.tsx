import { AntDesign, Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, ViewStyle, TextStyle, ImageStyle, Alert, Animated, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import { useAppContext } from '@/context/AppContext';

// Create a Modal Navigation Context
type ModalScreenType = 'goals' | 'add-goal' | 'meditation' | 'workout' | 'sleep' | 'nutrition' | 'profile';

type ModalContextType = {
  currentScreen: ModalScreenType;
  setCurrentScreen: (screen: ModalScreenType) => void;
  modalData?: any;
  setModalData: (data: any) => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within ModalProvider');
  }
  return context;
};

// Enhanced Theme Colors
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
  surface: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  shadow: 'rgba(15, 23, 42, 0.08)',
  error: '#EF4444',
  errorLight: '#FCA5A5',
};

const { width, height } = Dimensions.get('window');

// Helper function to get category color
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Activity: THEME_COLORS.success,
    Nutrition: THEME_COLORS.warning,
    Sleep: THEME_COLORS.info,
    Wellness: THEME_COLORS.accent,
  };
  return colors[category] || THEME_COLORS.textSecondary;
};

// Goals List Screen
const GoalsListScreen = () => {
  const router = useRouter();
  const { goals, toggleGoalComplete, deleteGoal } = useAppContext();
  const { setCurrentScreen } = useModalContext();
  const [refreshing, setRefreshing] = useState(false);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteGoal?.(id) },
      ]
    );
  };

  const handleToggle = async (id: string) => {
    setRefreshing(true);
    toggleGoalComplete?.(id);
    setTimeout(() => setRefreshing(false), 300);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Modern Header */}
      <LinearGradient
        colors={[THEME_COLORS.primary, THEME_COLORS.primaryDark]}
        style={styles.modernHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <View style={styles.backButtonContainer}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.modernHeaderTitle}>All Goals</Text>
          <TouchableOpacity 
            onPress={() => setCurrentScreen('add-goal')}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.goalsContainer}>
          {goals.length > 0 ? (
            goals.map((goal, index) => (
              <Animated.View key={goal.id} style={[styles.modernGoalCard, { marginTop: index === 0 ? 20 : 0 }]}>
                <View style={styles.goalCardHeader}>
                  <View style={styles.goalInfoSection}>
                    <TouchableOpacity 
                      onPress={() => handleToggle(goal.id)} 
                      style={[styles.goalCheckbox, goal.completed && styles.goalCheckboxCompleted]}
                    >
                      {goal.completed && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                    
                    <View style={styles.goalDetails}>
                      <Text style={[styles.goalTitle, goal.completed && styles.completedGoalTitle]}>
                        {goal.title}
                      </Text>
                      <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(goal.category) + '15', borderColor: getCategoryColor(goal.category) + '30' }]}>
                        <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(goal.category) }]} />
                        <Text style={[styles.categoryText, { color: getCategoryColor(goal.category) }]}>
                          {goal.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.goalActions}>
                    <Text style={[styles.progressPercentage, { color: getCategoryColor(goal.category) }]}>
                      {Math.min(100, Math.round(((goal.current || 0) / (goal.target || 1)) * 100))}%
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(goal.id)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={18} color={THEME_COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Progress Section */}
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${Math.min(100, Math.round(((goal.current || 0) / (goal.target || 1)) * 100))}%`, 
                          backgroundColor: getCategoryColor(goal.category) 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {goal.current || 0} / {goal.target} {goal.unit}
                  </Text>
                </View>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="target" size={48} color={THEME_COLORS.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No Goals Yet</Text>
              <Text style={styles.emptySubtitle}>Create your first goal to start tracking your progress</Text>
              <TouchableOpacity 
                style={styles.createFirstGoalButton}
                onPress={() => setCurrentScreen('add-goal')}
              >
                <LinearGradient
                  colors={[THEME_COLORS.primary, THEME_COLORS.primaryDark]}
                  style={styles.createButtonGradient}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Create Goal</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Add Goal Screen
const AddGoalScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('Activity');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { addGoal } = useAppContext();
  const { setCurrentScreen } = useModalContext();
  const router = useRouter();

  const categories = [
    { name: 'Activity', icon: 'fitness', color: THEME_COLORS.success, unit: 'steps' },
    { name: 'Nutrition', icon: 'restaurant', color: THEME_COLORS.warning, unit: 'calories' },
    { name: 'Sleep', icon: 'moon', color: THEME_COLORS.info, unit: 'hours' },
    { name: 'Wellness', icon: 'heart', color: THEME_COLORS.accent, unit: 'sessions' },
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!target.trim()) {
      newErrors.target = 'Target is required';
    } else if (isNaN(Number(target)) || Number(target) <= 0) {
      newErrors.target = 'Please enter a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const selectedCategory = categories.find(c => c.name === category);
      addGoal({
        title: title.trim(),
        description: description.trim(),
        target: Number(target),
        unit: selectedCategory?.unit || 'units',
        category,
        progress: 0
      });
      
      Alert.alert(
        'Goal Created!',
        'Your new goal has been added successfully.',
        [{ text: 'OK', onPress: () => setCurrentScreen('goals') }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={[THEME_COLORS.primary, THEME_COLORS.primaryDark]}
        style={styles.modernHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => setCurrentScreen('goals')} style={styles.headerBackButton}>
            <View style={styles.backButtonContainer}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.modernHeaderTitle}>New Goal</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={!title || !target}
            style={[styles.saveButton, (!title || !target) && styles.disabledSaveButton]}
          >
            <Text style={[styles.saveButtonText, (!title || !target) && styles.disabledSaveText]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.addGoalContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Goal Title</Text>
            <TextInput
              style={[styles.modernInput, errors.title && styles.inputError]}
              placeholder="e.g., Walk 10,000 steps daily"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) setErrors({...errors, title: ''});
              }}
              maxLength={50}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryCard,
                    category === cat.name && { backgroundColor: cat.color + '15', borderColor: cat.color }
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <View style={[styles.categoryIconContainer, { backgroundColor: cat.color + '20' }]}>
                    <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                  </View>
                  <Text style={[
                    styles.categoryCardText,
                    category === cat.name && { color: cat.color, fontWeight: '600' }
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Target Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Target ({categories.find(c => c.name === category)?.unit || 'units'})
            </Text>
            <TextInput
              style={[styles.modernInput, errors.target && styles.inputError]}
              placeholder="Enter target amount"
              value={target}
              onChangeText={(text) => {
                setTarget(text);
                if (errors.target) setErrors({...errors, target: ''});
              }}
              keyboardType="numeric"
              maxLength={10}
            />
            {errors.target && <Text style={styles.errorText}>{errors.target}</Text>}
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.modernInput, styles.textArea]}
              placeholder="Add more details about your goal..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={styles.characterCount}>{description.length}/200</Text>
          </View>

          {/* Goal Preview */}
          {title && target && (
            <View style={styles.goalPreview}>
              <Text style={styles.previewLabel}>Goal Preview:</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <View style={[styles.previewCategoryBadge, { backgroundColor: categories.find(c => c.name === category)?.color + '15' }]}>
                    <Text style={[styles.previewCategoryText, { color: categories.find(c => c.name === category)?.color }]}>
                      {category}
                    </Text>
                  </View>
                </View>
                <Text style={styles.previewTitle}>{title}</Text>
                <Text style={styles.previewTarget}>
                  Target: {target} {categories.find(c => c.name === category)?.unit}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Quick Action Screens
const MeditationScreen = () => {
  const router = useRouter();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = () => {
    setSessionStarted(true);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setSessionStarted(false);
          clearInterval(timerRef.current!);
          Alert.alert('Session Complete', 'Great job! You completed your meditation session.');
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopSession = () => {
    setSessionStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(600);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient colors={[THEME_COLORS.primary, THEME_COLORS.accent]} style={styles.quickActionHeader}>
        <View style={styles.quickActionHeaderContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.quickActionBackButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.quickActionTitle}>Meditation</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={styles.quickActionContent}>
        <View style={styles.meditationContainer}>
          <View style={styles.meditationIconContainer}>
            <MaterialCommunityIcons name="meditation" size={80} color={THEME_COLORS.primary} />
          </View>
          
          <Text style={styles.quickActionMainText}>Mindful Meditation</Text>
          <Text style={styles.quickActionSubText}>
            Take a moment to breathe deeply and center yourself. Find a quiet space and let go of distractions.
          </Text>

          {sessionStarted ? (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
              <Text style={styles.timerLabel}>Time Remaining</Text>
              
              <TouchableOpacity style={styles.stopButton} onPress={stopSession}>
                <Text style={styles.stopButtonText}>Stop Session</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.sessionOptions}>
              <TouchableOpacity style={styles.primaryActionButton} onPress={startSession}>
                <LinearGradient
                  colors={[THEME_COLORS.primary, THEME_COLORS.primaryDark]}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="play" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Start 10min Session</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const WorkoutScreen = () => {
  const router = useRouter();
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const { updateGoalCurrent, goals } = useAppContext();

  const workoutTypes = [
    { id: 'cardio', name: 'Cardio', icon: 'heart', duration: '30 min', calories: '250-400' },
    { id: 'strength', name: 'Strength Training', icon: 'barbell', duration: '45 min', calories: '180-300' },
    { id: 'yoga', name: 'Yoga', icon: 'flower', duration: '60 min', calories: '120-200' },
    { id: 'hiit', name: 'HIIT', icon: 'flash', duration: '20 min', calories: '300-500' },
  ];

  const logWorkout = (workout: any) => {
    const exerciseGoals = goals.filter(g => 
      g.category === 'Activity' && 
      (g.title.toLowerCase().includes('exercise') || g.title.toLowerCase().includes('workout'))
    );
    
    exerciseGoals.forEach(goal => {
      const duration = parseInt(workout.duration);
      updateGoalCurrent?.(goal.id, (goal.current || 0) + duration);
    });

    Alert.alert(
      'Workout Logged!',
      `Great job completing your ${workout.name} session!`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient colors={[THEME_COLORS.accent, THEME_COLORS.secondary]} style={styles.quickActionHeader}>
        <View style={styles.quickActionHeaderContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.quickActionBackButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.quickActionTitle}>Workout</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.quickActionContent} showsVerticalScrollIndicator={false}>
        <View style={styles.workoutContainer}>
          <View style={styles.workoutIconContainer}>
            <FontAwesome5 name="running" size={60} color={THEME_COLORS.accent} />
          </View>
          
          <Text style={styles.quickActionMainText}>Choose Your Workout</Text>
          <Text style={styles.quickActionSubText}>
            Select a workout type that matches your fitness goals and energy level today.
          </Text>

          <View style={styles.workoutGrid}>
            {workoutTypes.map(workout => (
              <TouchableOpacity
                key={workout.id}
                style={[
                  styles.workoutCard,
                  selectedWorkout === workout.id && styles.selectedWorkoutCard
                ]}
                onPress={() => setSelectedWorkout(workout.id)}
              >
                <MaterialCommunityIcons 
                  name={workout.icon as any} 
                  size={40} 
                  color={selectedWorkout === workout.id ? THEME_COLORS.accent : THEME_COLORS.textSecondary} 
                />
                <Text style={[
                  styles.workoutCardTitle,
                  selectedWorkout === workout.id && { color: THEME_COLORS.accent }
                ]}>
                  {workout.name}
                </Text>
                <Text style={styles.workoutCardDetail}>{workout.duration}</Text>
                <Text style={styles.workoutCardDetail}>{workout.calories} cal</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedWorkout && (
            <TouchableOpacity 
              style={styles.primaryActionButton} 
              onPress={() => logWorkout(workoutTypes.find(w => w.id === selectedWorkout))}
            >
              <LinearGradient
                colors={[THEME_COLORS.accent, THEME_COLORS.secondary]}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Complete Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const SleepScreen = () => {
  const router = useRouter();
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const { updateGoalCurrent, goals } = useAppContext();

  const calculateSleepHours = (bedtime: string, wakeTime: string): number => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
    
    let bedTimeInMinutes = bedHour * 60 + bedMin;
    let wakeTimeInMinutes = wakeHour * 60 + wakeMin;
    
    if (wakeTimeInMinutes < bedTimeInMinutes) {
      wakeTimeInMinutes += 24 * 60;
    }
    
    const sleepMinutes = wakeTimeInMinutes - bedTimeInMinutes;
    return Math.round((sleepMinutes / 60) * 10) / 10;
  };

  const logSleep = () => {
    const sleepHours = calculateSleepHours(bedtime, wakeTime);
    
    const sleepGoals = goals.filter(g => 
      g.category === 'Sleep' || 
      g.title.toLowerCase().includes('sleep')
    );
    
    sleepGoals.forEach(goal => {
      updateGoalCurrent?.(goal.id, sleepHours);
    });

    Alert.alert(
      'Sleep Logged!',
      `You got ${sleepHours} hours of sleep. Keep maintaining a consistent sleep schedule!`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient colors={[THEME_COLORS.info, THEME_COLORS.primary]} style={styles.quickActionHeader}>
        <View style={styles.quickActionHeaderContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.quickActionBackButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.quickActionTitle}>Sleep Tracker</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.quickActionContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sleepContainer}>
          <View style={styles.sleepIconContainer}>
            <Ionicons name="moon" size={60} color={THEME_COLORS.info} />
          </View>
          
          <Text style={styles.quickActionMainText}>Track Your Sleep</Text>
          <Text style={styles.quickActionSubText}>
            Log your bedtime and wake time to monitor your sleep quality and duration.
          </Text>

          <View style={styles.sleepInputs}>
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeLabel}>Bedtime</Text>
              <TextInput
                style={styles.timeInput}
                value={bedtime}
                onChangeText={setBedtime}
                placeholder="22:00"
              />
            </View>
            
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeLabel}>Wake Time</Text>
              <TextInput
                style={styles.timeInput}
                value={wakeTime}
                onChangeText={setWakeTime}
                placeholder="07:00"
              />
            </View>
          </View>

          <View style={styles.sleepSummary}>
            <Text style={styles.sleepHours}>
              {calculateSleepHours(bedtime, wakeTime)} hours
            </Text>
            <Text style={styles.sleepHoursLabel}>Total Sleep</Text>
          </View>

          <TouchableOpacity style={styles.primaryActionButton} onPress={logSleep}>
            <LinearGradient
              colors={[THEME_COLORS.info, THEME_COLORS.primary]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Log Sleep</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const NutritionScreen = () => {
  const router = useRouter();
  const [selectedMeal, setSelectedMeal] = useState<string>('breakfast');
  const [calories, setCalories] = useState('');
  const { updateGoalCurrent, goals } = useAppContext();

  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast', icon: 'coffee' },
    { id: 'lunch', name: 'Lunch', icon: 'restaurant' },
    { id: 'dinner', name: 'Dinner', icon: 'restaurant-outline' },
    { id: 'snack', name: 'Snack', icon: 'nutrition' },
  ];

  const logMeal = () => {
    const calorieAmount = parseInt(calories);
    if (!calorieAmount || calorieAmount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid calorie amount.');
      return;
    }

    const nutritionGoals = goals.filter(g => 
      g.category === 'Nutrition' || 
      g.title.toLowerCase().includes('calorie') ||
      g.title.toLowerCase().includes('nutrition')
    );
    
    nutritionGoals.forEach(goal => {
      updateGoalCurrent?.(goal.id, (goal.current || 0) + calorieAmount);
    });

    Alert.alert(
      'Meal Logged!',
      `Added ${calorieAmount} calories for ${selectedMeal}. Keep tracking your nutrition!`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient colors={[THEME_COLORS.warning, THEME_COLORS.secondary]} style={styles.quickActionHeader}>
        <View style={styles.quickActionHeaderContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.quickActionBackButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.quickActionTitle}>Nutrition</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.quickActionContent} showsVerticalScrollIndicator={false}>
        <View style={styles.nutritionContainer}>
          <View style={styles.nutritionIconContainer}>
            <MaterialCommunityIcons name="food-apple" size={60} color={THEME_COLORS.warning} />
          </View>
          
          <Text style={styles.quickActionMainText}>Log Your Meal</Text>
          <Text style={styles.quickActionSubText}>
            Track your daily nutrition by logging meals and their calorie content.
          </Text>

          <View style={styles.mealTypeSelector}>
            {mealTypes.map(meal => (
              <TouchableOpacity
                key={meal.id}
                style={[
                  styles.mealTypeButton,
                  selectedMeal === meal.id && styles.selectedMealType
                ]}
                onPress={() => setSelectedMeal(meal.id)}
              >
                <Ionicons 
                  name={meal.icon as any} 
                  size={24} 
                  color={selectedMeal === meal.id ? THEME_COLORS.warning : THEME_COLORS.textSecondary} 
                />
                <Text style={[
                  styles.mealTypeText,
                  selectedMeal === meal.id && { color: THEME_COLORS.warning }
                ]}>
                  {meal.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.calorieInput}>
            <Text style={styles.inputLabel}>Calories</Text>
            <TextInput
              style={styles.nutritionInput}
              value={calories}
              onChangeText={setCalories}
              placeholder="Enter calories"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryActionButton, !calories && styles.disabledButton]} 
            onPress={logMeal}
            disabled={!calories}
          >
            <LinearGradient
              colors={!calories ? [THEME_COLORS.textTertiary, THEME_COLORS.textTertiary] : [THEME_COLORS.warning, THEME_COLORS.secondary]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Log Meal</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Simple onboarding screen for profile
const OnboardingScreen = () => {
  const router = useRouter();
  
  return (
    <LinearGradient colors={[THEME_COLORS.primary, THEME_COLORS.accent]} style={styles.onboardingContainer}>
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>Welcome to Fyxlife</Text>
        <Text style={styles.welcomeSubtitle}>Your personal health and wellness companion</Text>
        <TouchableOpacity style={styles.getStartedButton} onPress={() => router.back()}>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.welcomeButtonGradient}
          >
            <Text style={styles.welcomeButtonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

// Modal Provider Component
const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ModalScreenType>('goals');
  const [modalData, setModalData] = useState<any>(null);

  return (
    <ModalContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      modalData,
      setModalData
    }}>
      {children}
    </ModalContext.Provider>
  );
};

// Main Modal Component
export default function ModalScreen() {
  const params = useLocalSearchParams();
  console.log(params);
  // Try to get screen from URL params
  const getInitialScreen = (): ModalScreenType => {
    const urlScreen = params.perms?.toString().toLowerCase();


    
    switch (urlScreen) {
      case 'add-goal':
        return 'add-goal';
      case 'meditation':
        return 'meditation';
      case 'workout':
        return 'workout';
      case 'sleep':
        return 'sleep';
      case 'nutrition':
        return 'nutrition';
      case 'profile':
        return 'profile';
      default:
        return 'goals';
    }
  };

  const ModalContent = () => {
    const { currentScreen } = useModalContext();
    
    switch (currentScreen) {
      case 'add-goal':
        return <AddGoalScreen />;
      case 'goals':
        return <GoalsListScreen />;
      case 'profile':
        return <OnboardingScreen />;
      case 'meditation':
        return <MeditationScreen />;
      case 'workout':
        return <WorkoutScreen />;
      case 'sleep':
        return <SleepScreen />;
      case 'nutrition':
        return <NutritionScreen />;
      default:
        return <GoalsListScreen />;
    }
  };

  return (
    <ModalProvider>
      <ScreenInitializer initialScreen={getInitialScreen()} />
      <ModalContent />
    </ModalProvider>
  );
}

// Helper component to set initial screen
const ScreenInitializer: React.FC<{ initialScreen: ModalScreenType }> = ({ initialScreen }) => {
  const { setCurrentScreen } = useModalContext();
  
  useEffect(() => {
    setCurrentScreen(initialScreen);
  }, [initialScreen, setCurrentScreen]);
  
  return null;
};

// Comprehensive Styles
const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  content: {
    flex: 1,
  },
  
  // Modern Header
  modernHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerBackButton: {
    marginRight: 16,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabledSaveButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledSaveText: {
    opacity: 0.7,
  },

  // Goals List
  goalsContainer: {
    padding: 20,
  },
  modernGoalCard: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: THEME_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderLight,
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME_COLORS.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalCheckboxCompleted: {
    backgroundColor: THEME_COLORS.success,
    borderColor: THEME_COLORS.success,
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    marginBottom: 8,
  },
  completedGoalTitle: {
    textDecorationLine: 'line-through',
    color: THEME_COLORS.textSecondary,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  goalActions: {
    alignItems: 'center',
    gap: 8,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: THEME_COLORS.errorLight + '20',
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: THEME_COLORS.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: THEME_COLORS.textSecondary,
    textAlign: 'right',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME_COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createFirstGoalButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Quick Actions
  quickActionHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  quickActionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickActionBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  quickActionContent: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  quickActionMainText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  quickActionSubText: {
    fontSize: 16,
    color: THEME_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },

  // Meditation
  meditationContainer: {
    padding: 20,
    alignItems: 'center',
  },
  meditationIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME_COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 16,
    color: THEME_COLORS.textSecondary,
    marginBottom: 32,
  },
  sessionOptions: {
    width: '100%',
    alignItems: 'center',
  },

  // Workout
  workoutContainer: {
    padding: 20,
    alignItems: 'center',
  },
  workoutIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME_COLORS.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  workoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  workoutCard: {
    width: '48%',
    backgroundColor: THEME_COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: THEME_COLORS.borderLight,
  },
  selectedWorkoutCard: {
    borderColor: THEME_COLORS.accent,
    backgroundColor: THEME_COLORS.accent + '10',
  },
  workoutCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  workoutCardDetail: {
    fontSize: 12,
    color: THEME_COLORS.textSecondary,
    textAlign: 'center',
  },

  // Sleep
  sleepContainer: {
    padding: 20,
    alignItems: 'center',
  },
  sleepIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME_COLORS.info + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  sleepInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  timeInputContainer: {
    width: '45%',
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    marginBottom: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: THEME_COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: THEME_COLORS.card,
    textAlign: 'center',
  },
  sleepSummary: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sleepHours: {
    fontSize: 36,
    fontWeight: 'bold',
    color: THEME_COLORS.info,
    marginBottom: 4,
  },
  sleepHoursLabel: {
    fontSize: 16,
    color: THEME_COLORS.textSecondary,
  },

  // Nutrition
  nutritionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  nutritionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME_COLORS.warning + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  mealTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  mealTypeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: THEME_COLORS.borderLight,
  },
  selectedMealType: {
    borderColor: THEME_COLORS.warning,
    backgroundColor: THEME_COLORS.warning + '10',
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    marginLeft: 8,
  },
  calorieInput: {
    width: '100%',
    marginBottom: 32,
  },
  nutritionInput: {
    borderWidth: 1,
    borderColor: THEME_COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: THEME_COLORS.card,
  },

  // Add Goal
  addGoalContent: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    marginBottom: 8,
  },
  modernInput: {
    borderWidth: 1,
    borderColor: THEME_COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: THEME_COLORS.card,
    color: THEME_COLORS.textPrimary,
  },
  inputError: {
    borderColor: THEME_COLORS.error,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: THEME_COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: THEME_COLORS.textTertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: THEME_COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: THEME_COLORS.borderLight,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME_COLORS.textPrimary,
  },
  goalPreview: {
    marginTop: 16,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME_COLORS.borderLight,
  },
  previewHeader: {
    marginBottom: 12,
  },
  previewCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  previewCategoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    marginBottom: 4,
  },
  previewTarget: {
    fontSize: 14,
    color: THEME_COLORS.textSecondary,
  },

  // Common Buttons
  primaryActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  stopButton: {
    backgroundColor: THEME_COLORS.error,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Onboarding
  onboardingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  getStartedButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  welcomeButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  welcomeButtonText: {
    color: THEME_COLORS.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});