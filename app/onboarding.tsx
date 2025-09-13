import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

type FormData = {
  name: string;
  age: string;
  gender: string;
  activityLevel: string;
};

type FormErrors = {
  name?: string;
  age?: string;
  gender?: string;
  activityLevel?: string;
};

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    gender: '',
    activityLevel: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};
    
    if (currentStep === 1 && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (currentStep === 2) {
      if (!formData.age) {
        newErrors.age = 'Age is required';
      } else if (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
        newErrors.age = 'Please enter a valid age (1-120)';
      }
      
      if (!formData.gender) {
        newErrors.gender = 'Please select a gender';
      }
    }
    
    if (currentStep === 3 && !formData.activityLevel) {
      newErrors.activityLevel = 'Please select an activity level';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
      // Scroll to top when changing steps
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      try {
        setIsSubmitting(true);
        // Save user details and mark onboarding as complete
        const userDetails = {
          ...formData,
          completedOnboarding: true,
          onboardedAt: new Date().toISOString(),
          lastActiveDate: new Date().toISOString(),
          streakCount: 1,
        };
        
        await AsyncStorage.setItem('userDetails', JSON.stringify(userDetails));
        
        // Simple navigation to tabs
        router.replace('/');
      } catch (error) {
        console.error('Error saving user details:', error);
        Alert.alert('Error', 'Failed to save your information. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
      // Scroll to top when changing steps
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };
  
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to Fyxlife</Text>
              <Text style={styles.subtitle}>Let's get started with your health journey</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.name && styles.inputError
                ]}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (formData.name.trim()) {
                    handleNext();
                  }
                }}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
            
            <View style={styles.stepIndicatorContainer}>
              {[1, 2, 3].map((i) => (
                <View 
                  key={i} 
                  style={[
                    styles.stepDot, 
                    i === step && styles.stepDotActive,
                    i < step && styles.stepDotCompleted
                  ]} 
                />
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Tell us about yourself</Text>
              <Text style={styles.subtitle}>This helps us personalize your experience</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.age && styles.inputError
                ]}
                placeholder="Enter your age"
                value={formData.age}
                onChangeText={(text) => updateFormData('age', text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
                returnKeyType="next"
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>
            
            <View style={[styles.formGroup, styles.genderGroup]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderOptions}>
                {['Male', 'Female', 'Other'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.genderOption,
                      formData.gender === item && styles.genderOptionSelected,
                    ]}
                    onPress={() => updateFormData('gender', item)}
                  >
                    <Text style={[
                      styles.genderText,
                      formData.gender === item && styles.genderTextSelected,
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
            </View>
            
            <View style={styles.stepIndicatorContainer}>
              {[1, 2, 3].map((i) => (
                <View 
                  key={i} 
                  style={[
                    styles.stepDot, 
                    i === step && styles.stepDotActive,
                    i < step && styles.stepDotCompleted
                  ]} 
                />
              ))}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Activity Level</Text>
              <Text style={styles.subtitle}>How active are you on a weekly basis?</Text>
            </View>
            
            <View style={[styles.formGroup, styles.activityGroup]}>
              {[
                { level: 'Sedentary', desc: 'Little to no exercise' },
                { level: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                { level: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                { level: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
                { level: 'Extremely Active', desc: 'Very hard exercise & physical job or 2x training' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.level}
                  style={[
                    styles.activityOption,
                    formData.activityLevel === item.level && styles.activityOptionSelected,
                  ]}
                  onPress={() => updateFormData('activityLevel', item.level)}
                >
                  <View style={styles.activityContent}>
                    <Text style={[
                      styles.activityText,
                      formData.activityLevel === item.level && styles.activityTextSelected,
                    ]}>
                      {item.level}
                    </Text>
                    <Text style={[
                      styles.activityDesc,
                      formData.activityLevel === item.level && styles.activityDescSelected,
                    ]}>
                      {item.desc}
                    </Text>
                  </View>
                  {formData.activityLevel === item.level && (
                    <MaterialIcons name="check-circle" size={24} color="#6B46C1" />
                  )}
                </TouchableOpacity>
              ))}
              {errors.activityLevel && (
                <Text style={[styles.errorText, { marginTop: 8 }]}>{errors.activityLevel}</Text>
              )}
            </View>
            
            <View style={styles.stepIndicatorContainer}>
              {[1, 2, 3].map((i) => (
                <View 
                  key={i} 
                  style={[
                    styles.stepDot, 
                    i === step && styles.stepDotActive,
                    i < step && styles.stepDotCompleted
                  ]} 
                />
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#6B46C1', '#8B5FBF']}
        style={styles.gradient}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>
        
        <View style={styles.footer}>
          {step > 1 ? (
            <TouchableOpacity 
              style={styles.navButton}
              onPress={handlePrevious}
              disabled={isSubmitting}
            >
              <MaterialIcons name="arrow-back" size={20} color="#6B46C1" />
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          
          <TouchableOpacity 
            style={[
              styles.nextButton,
              isSubmitting && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {step === 3 ? 'Get Started' : 'Continue'}
                </Text>
                {step < 3 && (
                  <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 24,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    maxWidth: '90%',
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  activityGroup: {
    marginBottom: 20,
  },
  activityOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#fff',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  activityTextSelected: {
    color: '#6B46C1',
  },
  activityDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  activityDescSelected: {
    color: '#666',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: '#fff',
  },
  stepDotCompleted: {
    backgroundColor: '#fff',
  },
  genderGroup: {
    marginBottom: 32,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  genderOption: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  genderOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#fff',
  },
  genderText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  genderTextSelected: {
    color: '#6B46C1',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    color: '#6B46C1',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 18,
    color: '#6B46C1',
    fontWeight: 'bold',
    marginRight: 8,
  },
});
