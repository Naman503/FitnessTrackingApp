import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

// Types
type UserDetails = {
  name: string;
  age: string;
  phone: string;
  gender: string;
  activityLevel: string;
  completedOnboarding: boolean;
};

type OnboardingScreenProps = {
  onNext: () => void;
  onBack?: () => void;
  updateUserDetails: (details: Partial<UserDetails>) => void;
  userDetails: UserDetails;
};

// Welcome Screen
const WelcomeScreen = ({ onNext }: { onNext: () => void }) => (
  <View style={styles.slide}>
    <Text style={styles.title}>Welcome to Fyxlife🌱</Text>
    <Text style={styles.subtitle}>Your personal health and wellness companion</Text>
    <TouchableOpacity style={styles.button} onPress={onNext}>
      <Text style={styles.buttonText}>Get Started</Text>
    </TouchableOpacity>
  </View>
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
    <ScrollView contentContainerStyle={styles.slide}>
      <Text style={styles.title}>Tell us about yourself</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
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
              <Text style={styles.radioText}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</Text>
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

      <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleNext}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
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
    <View style={styles.slide}>
      <View style={styles.checkmarkContainer}>
        <View style={styles.checkmarkCircle}>
          <AntDesign name="check" size={60} color="#fff" />
        </View>
      </View>
      <Text style={styles.title}>All set, {userDetails.name || 'there'}! 🎉</Text>
      <Text style={styles.subtitle}>Your profile is ready and you're all set to start your wellness journey with Fyxlife.</Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.getStartedButton]} 
        onPress={onNext}
      >
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main Onboarding Component
export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    age: '',
    phone: '',
    gender: 'male',
    activityLevel: 'moderate',
    completedOnboarding: false,
  });

  const updateUserDetails = (details: Partial<UserDetails>) => {
    setUserDetails(prev => ({
      ...prev,
      ...details,
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = () => {
    router.replace('/(tabs)');
  };

  const renderStep = () => {
    const commonProps = {
      onNext: nextStep,
      onBack: prevStep,
      updateUserDetails,
      userDetails,
    };

    switch (currentStep) {
      case 0:
        return <WelcomeScreen onNext={nextStep} />;
      case 1:
        return <UserInfoScreen {...commonProps} />;
      case 2:
        return <ConfirmationScreen {...commonProps} onNext={handleComplete} />;
      default:
        return <WelcomeScreen onNext={nextStep} />;
    }
  };

  return (
    <LinearGradient
      colors={['#6B46C1', '#805AD5', '#9F7AEA']}
      style={styles.container}
    >
      {currentStep > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Ionicons name="arrow-back" size={24} color="#6B46C1" />
        </TouchableOpacity>
      )}
      
      <View style={styles.stepsContainer}>
        {[0, 1, 2].map((step) => (
          <View
            key={step}
            style={[
              styles.step,
              currentStep >= step ? styles.stepActive : {},
            ]}
          />
        ))}
      </View>
      
      {renderStep()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#6B46C1',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButton: {
    marginTop: 40,
  },
  getStartedButton: {
    backgroundColor: '#4FD1C5',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
  },
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
    backgroundColor: '#4FD1C5',
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 5,
    fontSize: 12,
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4FD1C5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});
