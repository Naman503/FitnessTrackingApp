import appLogo from '@/assets/images/app_logo.png';
import { useAppContext } from '@/context/AppContext';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  white: '#FFFFFF',
  error: '#EF4444',
};

export default function OnboardingScreen() {
  const { setUserDetails } = useAppContext();
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
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    // Logo pop animation on each step entry
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, [step, fadeAnim, slideAnim, logoScale]);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};
    
    if (currentStep === 2) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!formData.age) {
        newErrors.age = 'Age is required';
      } else if (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
        newErrors.age = 'Please enter a valid age (1-120)';
      }
      if (!formData.gender) {
        newErrors.gender = 'Please select a gender';
      }
      if (!formData.activityLevel) {
        newErrors.activityLevel = 'Please select an activity level';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      return;
    }
    
    if (step === 2) {
      // Move to the final step (step 3) instead of redirecting immediately
      setStep(3);
      return;
    }
    
    if (step === 3) {
      // Final submission from the completion screen
      try {
        setIsSubmitting(true);
        const name = formData.name.trim();
        const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
        const phone = '+1234567890';
        const now = new Date().toISOString();
        const userDetails = {
          name,
          email,
          age: formData.age,
          phone,
          gender: formData.gender,
          activityLevel: formData.activityLevel,
          completedOnboarding: true,
          lastActiveDate: now,
          streakCount: 1,
        };
        await setUserDetails(userDetails);
        router.replace('/');
      } catch (error) {
        console.error('Error saving user details:', error);
        Alert.alert('Error', 'Failed to save your information. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (step < 3) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setStep(step + 1);
        slideAnim.setValue(100);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      try {
        setIsSubmitting(true);
        // Generate sensible defaults for missing fields
        const name = formData.name.trim();
        const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
        const phone = '+1234567890';
        const now = new Date().toISOString();
        const userDetails = {
          name,
          email,
          age: formData.age,
          phone,
          gender: formData.gender,
          activityLevel: formData.activityLevel,
          completedOnboarding: true,
          lastActiveDate: now,
          streakCount: 1,
        };
        await setUserDetails(userDetails); // Use AppContext to save
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
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setStep(step - 1);
        slideAnim.setValue(-100);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };
  
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleGoToDashboard = async () => {
    try {
      setIsSubmitting(true);
      const name = formData.name.trim();
      const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
      const phone = '+1234567890';
      const now = new Date().toISOString();
      const userDetails = {
        name,
        email,
        age: formData.age,
        phone,
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        completedOnboarding: true,
        lastActiveDate: now,
        streakCount: 1,
      };
      await setUserDetails(userDetails);
      router.replace('/');
    } catch (error) {
      console.error('Error saving user details:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 3:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.header}>
              <Text style={styles.title}>All Set! 🎉</Text>
              <Text style={styles.subtitle}>Your profile is ready. Let's start your health journey!</Text>
            </View>
            <View style={styles.completionContainer}>
              <View style={styles.completionCard}>
                <MaterialIcons name="check-circle" size={60} color={THEME_COLORS.success} />
                <Text style={styles.completionTitle}>Profile Complete</Text>
                <Text style={styles.completionText}>You're all set to explore Fyxlife and track your health journey.</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.dashboardButton}
              onPress={handleGoToDashboard}
              disabled={isSubmitting}
            >
              <Text style={styles.dashboardButtonText}>
                {isSubmitting ? 'Loading...' : 'Go to Dashboard'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      case 1:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.header}>
              <Image source={appLogo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.title}>Hello!</Text>
              <Text style={styles.subtitle}>Welcome to Fyxlife - Your health journey starts here.</Text>
            </View>
            <TouchableOpacity onPress={handleNext} activeOpacity={0.9}>
              <LinearGradient
                colors={[THEME_COLORS.card, THEME_COLORS.white]}
                start={{x:0,y:0}}
                end={{x:1,y:1}}
                style={styles.startButton}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.stepIndicatorContainer}>
              {[1, 2, 3].map((i) => (
                <View 
                  key={i} 
                  style={[
                    styles.stepDot, 
                    i <= step && styles.stepDotActive
                  ]} 
                />
              ))}
            </View>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Your Profile</Text>
              <Text style={styles.subtitle}>Tell us about yourself</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.name && styles.inputError
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={THEME_COLORS.textSecondary}
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                inputAccessoryViewID="main"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.age && styles.inputError
                ]}
                placeholder="Enter your age"
                placeholderTextColor={THEME_COLORS.textSecondary}
                value={formData.age}
                onChangeText={(text) => updateFormData('age', text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
                returnKeyType="done"
                inputAccessoryViewID="main"
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>
            
            <View style={styles.formGroup}>
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
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Activity Level</Text>
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
                    <MaterialIcons name="check-circle" size={24} color={THEME_COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
              {errors.activityLevel && <Text style={styles.errorText}>{errors.activityLevel}</Text>}
            </View>
            
            <View style={styles.stepIndicatorContainer}>
              {[1, 2, 3].map((i) => (
                <View 
                  key={i} 
                  style={[
                    styles.stepDot, 
                    i <= step && styles.stepDotActive
                  ]} 
                />
              ))}
            </View>
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.header}>
              <Image source={appLogo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.title}>Profile Created!</Text>
              <Text style={styles.subtitle}>Your health journey is ready to begin.</Text>
            </View>
            <TouchableOpacity 
              style={styles.dashboardButton}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
            </TouchableOpacity>
            <View style={styles.stepIndicatorContainer}>
              {[1, 2, 3].map((i) => (
                <View 
                  key={i} 
                  style={[
                    styles.stepDot, 
                    i <= step && styles.stepDotActive
                  ]} 
                />
              ))}
            </View>
          </Animated.View>
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
        colors={[THEME_COLORS.primary, THEME_COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>
        
        {(step === 2) && (
          <View style={[styles.footer, { paddingBottom: 24 + insets.bottom, flexDirection: 'row', gap: 14, backgroundColor: 'transparent', borderTopLeftRadius: 0, borderTopRightRadius: 0, shadowOpacity: 0 }]}>
            <TouchableOpacity
              style={styles.backButtonModern}
              onPress={handlePrevious}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={22} color={THEME_COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.92}
              style={{ flex: 1 }}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={[THEME_COLORS.card, THEME_COLORS.primary, THEME_COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.nextButtonModern, isSubmitting && styles.nextButtonDisabled]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={THEME_COLORS.white} />
                ) : (
                  <Text style={styles.nextButtonTextModern}>Continue</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    marginTop:24,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoWrapper:{
    width:200,
    height:200,
    borderRadius:100,
    backgroundColor:'rgba(255,255,255,0.15)',
    justifyContent:'center',
    alignItems:'center',
    marginBottom:24,
  },
  logo: {
    width:240,
    height:240,
    elevation:6,
    shadowColor:'#000',
    shadowOffset:{width:0,height:4},
    shadowOpacity:0.15,
    shadowRadius:10,
    
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: THEME_COLORS.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: '80%',
  },
  formGroup: {
    marginBottom: 24,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.white,
    marginBottom: 12,
  },
  input: {
    backgroundColor: THEME_COLORS.card,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: THEME_COLORS.textPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  inputError: {
    borderWidth: 1,
    borderColor: THEME_COLORS.error,
  },
  errorText: {
    color: THEME_COLORS.error,
    fontSize: 14,
    marginTop: 8,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 6,
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: THEME_COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  genderText: {
    color: THEME_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  genderTextSelected: {
    color: THEME_COLORS.primary,
  },
  activityOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityOptionSelected: {
    backgroundColor: THEME_COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: THEME_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityTextSelected: {
    color: THEME_COLORS.primary,
  },
  activityDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  activityDescSelected: {
    color: THEME_COLORS.textSecondary,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 6,
  },
  stepDotActive: {
    backgroundColor: THEME_COLORS.white,
    width: 12,
    height: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: THEME_COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width:'100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonModern: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginRight: 2,
  },
  backButtonText: {
    fontSize: 16,
    color: THEME_COLORS.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  nextButtonModern: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonDisabled: {
    backgroundColor: '#A3BFFA',
  },
  nextButtonTextModern: {
    fontSize: 18,
    color: THEME_COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  startButton:{
    paddingVertical:16,
    paddingHorizontal:48,
    borderRadius:24,
    alignItems:'center',
  },
  startButtonText: {
    fontSize: 18,
    color: THEME_COLORS.primary,
    fontWeight: '700',
  },
  dashboardButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  dashboardButtonText: {
    color: THEME_COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  completionContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 32,
  },
  completionCard: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME_COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 16,
    color: THEME_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
});