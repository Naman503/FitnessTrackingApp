import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { useAppContext } from '@/context/AppContext';

// Define the type for our styles object
type Styles = {
  [key: string]: ViewStyle | TextStyle | ImageStyle;
};

type Goal = {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: string;
  completed: boolean;
  createdAt: string;
};

type UserDetails = {
  name: string;
  age: string;
  phone: string;
  gender: string;
  activityLevel: string;
  completedOnboarding: boolean;
  lastActiveDate?: string;
  streakCount?: number;
};

const { width, height } = Dimensions.get('window');

// Types
type OnboardingScreenProps = {
  onNext: () => void;
  onBack?: () => void;
  updateUserDetails: (details: Partial<UserDetails>) => void;
  userDetails: UserDetails;
};

// Welcome Screen
const WelcomeScreen = ({ onNext }: { onNext: () => void }) => (
  <LinearGradient colors={['#4FD1C5', '#6B46C1']} style={styles.slide}>
    <Text style={styles.welcomeTitle}>Welcome to Fyxlife🌱</Text>
    <Text style={styles.welcomeSubtitle}>Your personal health and wellness companion</Text>
    <TouchableOpacity style={styles.getStartedButton} onPress={onNext}>
      <Text style={styles.buttonText}>Get Started</Text>
    </TouchableOpacity>
  </LinearGradient>
);

// User Info Screen
const UserInfoScreen = ({ onNext, updateUserDetails, userDetails }: OnboardingScreenProps) => {
  const [formData, setFormData] = useState({
    name: userDetails.name || '',
    age: userDetails.age || '',
    phone: userDetails.phone || '',
    gender: userDetails.gender || 'male',
    activityLevel: userDetails.activityLevel || 'moderate',
  });

  const [errors, setErrors] = useState({
    name: '',
    age: '',
    phone: '',
  });

  const validate = () => {
    let valid = true;
    const newErrors = { name: '', age: '', phone: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
      valid = false;
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
      newErrors.age = 'Please enter a valid age';
      valid = false;
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (!/^[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleNext = () => {
    if (validate()) {
      updateUserDetails(formData);
      onNext();
    }
  };

  return (
    <LinearGradient colors={['#4FD1C5', '#6B46C1']} style={styles.container}>
      <View style={styles.stepsContainer}>
        <View style={[styles.step, styles.stepActive]} />
        <View style={[styles.step, styles.stepActive]} />
        <View style={styles.step} />
      </View>
      
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formTitle}>Tell us about yourself</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#666"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
          />
          {errors.age ? <Text style={styles.errorText}>{errors.age}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="1234567890"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
          />
          {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioGroup}>
            {['male', 'female', 'other'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.radioButton,
                  formData.gender === gender && styles.radioButtonSelected,
                ]}
                onPress={() => setFormData({ ...formData, gender })}
              >
                <Text style={[
                  styles.radioText,
                  formData.gender === gender && { color: '#333' }
                ]}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Activity Level</Text>
          <View style={styles.selectContainer}>
            {[
              { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
              { value: 'light', label: 'Light (light exercise 1-3 days/week)' },
              { value: 'moderate', label: 'Moderate (moderate exercise 3-5 days/week)' },
              { value: 'active', label: 'Active (hard exercise 6-7 days/week)' },
              { value: 'veryActive', label: 'Very Active (very hard exercise & physical job)' },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.optionButton,
                  formData.activityLevel === item.value && styles.optionButtonSelected,
                ]}
                onPress={() => setFormData({ ...formData, activityLevel: item.value })}
              >
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

// Confirmation Screen
const ConfirmationScreen = ({ userDetails, onNext }: OnboardingScreenProps) => {
  useEffect(() => {
    const completeOnboarding = async () => {
      try {
        await AsyncStorage.setItem('userDetails', JSON.stringify({
          ...userDetails,
          completedOnboarding: true,
        }));
      } catch (error) {
        console.error('Error saving user details:', error);
      }
    };

    completeOnboarding();
  }, []);

  return (
    <LinearGradient colors={['#4FD1C5', '#6B46C1']} style={styles.slide}>
      <View style={styles.checkmarkContainer}>
        <View style={styles.checkmarkCircle}>
          <AntDesign name="check" size={60} color="#fff" />
        </View>
      </View>
      <Text style={styles.confirmationTitle}>All set, {userDetails.name || 'there'}! 🎉</Text>
      <Text style={styles.confirmationSubtitle}>Your profile is ready and you're all set to start your wellness journey with Fyxlife.</Text>
      
      <TouchableOpacity 
        style={styles.dashboardButton} 
        onPress={onNext}
      >
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

// Onboarding Flow Component
const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    age: '',
    phone: '',
    gender: '',
    activityLevel: '',
    completedOnboarding: false,
  });
  const router = useRouter();

  const updateUserDetails = (details: Partial<UserDetails>) => {
    setUserDetails(prev => ({ ...prev, ...details }));
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const screens = [
    <WelcomeScreen key="welcome" onNext={nextStep} />,
    <UserInfoScreen 
      key="userinfo"
      onNext={nextStep} 
      onBack={prevStep}
      updateUserDetails={updateUserDetails}
      userDetails={userDetails}
    />,
    <ConfirmationScreen 
      key="confirmation"
      onNext={nextStep}
      updateUserDetails={updateUserDetails}
      userDetails={userDetails}
    />
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {screens[currentStep]}
    </View>
  );
};

// Goal Details Screen
const GoalDetailsScreen = ({ goalId }: { goalId: string }) => {
  const { goals } = useAppContext();
  const goal = goals.find(g => g.id === goalId);
  const router = useRouter();

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text>Goal not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.goalTitle}>{goal.title}</Text>
      <Text style={styles.goalDescription}>{goal.description}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(100, (goal.current / goal.target) * 100)}%`,
                backgroundColor: getCategoryColor(goal.category)
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {goal.current} / {goal.target} {goal.unit}
        </Text>
      </View>
    </View>
  );
};

// Add Goal Screen
const AddGoalScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('Activity');
  const { addGoal } = useAppContext();
  const router = useRouter();

  const handleSave = () => {
    if (title && target && !isNaN(Number(target))) {
      addGoal({
        title,
        description,
        target: Number(target),
        unit: getUnitForCategory(category),
        category,
        progress: 0
      });
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color="#6B46C1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Goal</Text>
        <TouchableOpacity onPress={handleSave} disabled={!title || !target}>
          <Text style={[
            styles.saveButtonText, 
            (!title || !target) && { opacity: 0.5 }
          ]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Enter goal title"
            value={title}
            onChangeText={setTitle}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={[styles.inputField, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Enter goal description"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.categoryContainer}>
            {['Activity', 'Nutrition', 'Sleep'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryButton,
                  category === item && { 
                    backgroundColor: getCategoryColor(item) + '20',
                    borderColor: getCategoryColor(item)
                  }
                ]}
                onPress={() => setCategory(item)}
              >
                <Text 
                  style={[
                    styles.categoryButtonText,
                    category === item && { color: getCategoryColor(item) }
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Target {getUnitForCategory(category)}</Text>
          <TextInput
            style={styles.inputField}
            placeholder={`Enter target ${getUnitForCategory(category)}`}
            keyboardType="numeric"
            value={target}
            onChangeText={setTarget}
          />
        </View>
      </ScrollView>
    </View>
  );
};

// Main Modal Component
export default function ModalScreen() {
  const router = useRouter();
  const { screen, id } = useLocalSearchParams<{ screen?: string; id?: string }>();

  const renderScreen = () => {
    switch (screen) {
      case 'goal-details':
        return id ? <GoalDetailsScreen goalId={id} /> : null;
      case 'add-goal':
        return <AddGoalScreen />;
      case 'profile':
        return <OnboardingScreen />;
      case 'add-activity':
      case 'nutrition':
      case 'sleep':
      default:
        return (
          <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
              colors={['#6B46C1', '#805AD5']}
              style={styles.headerGradient}
            >
              <Text style={styles.headerTitle}>
                {screen ? `${screen.charAt(0).toUpperCase()}${screen.slice(1)}` : 'Modal'}
              </Text>
            </LinearGradient>
            <View style={styles.content}>
              <Text style={styles.placeholderText}>This is the {screen || 'modal'} screen</Text>
            </View>
          </View>
        );
    }
  };

  return renderScreen();
}

// Helper functions for styling
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Activity: '#4CAF50',
    Nutrition: '#2196F3',
    Sleep: '#9C27B0',
  };
  return colors[category] || '#607D8B';
};

const getUnitForCategory = (category: string) => {
  const units: Record<string, string> = {
    Activity: 'steps',
    Nutrition: 'calories',
    Sleep: 'hours',
  };
  return units[category] || 'units';
};

// Consolidated and cleaned up styles
const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    padding: 20,
  },
  
  // Headers
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerBackButton: {
    padding: 5,
  },
  
  // Typography
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 26,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff',
  },
  confirmationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  confirmationSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  goalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  goalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  
  // Buttons
  getStartedButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dashboardButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#6B46C1',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#6B46C1',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Form Elements
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  
  // Radio Buttons & Options
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  radioButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#fff',
  },
  radioText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  selectContainer: {
    marginTop: 10,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
  },
  
  // Categories
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Progress
  progressContainer: {
    marginTop: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  
  // Steps Indicator
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  step: {
    width: 30,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 3,
  },
  stepActive: {
    backgroundColor: '#fff',
  },
  
  // Checkmark
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  // Form Groups
  formGroup: {
    marginBottom: 20,
  },
  
  // Error Text
  errorText: {
    color: '#FF6B6B',
    marginTop: 5,
    fontSize: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 5,
    borderRadius: 4,
  },
});