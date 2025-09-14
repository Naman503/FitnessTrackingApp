import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Linking, Modal, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAppContext, type UserDetails } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const ACTIVITY_LEVELS = [
  { value: 'Sedentary', label: 'Sedentary (little to no exercise)' },
  { value: 'Lightly active', label: 'Lightly active (light exercise/sports 1-3 days/week)' },
  { value: 'Moderately active', label: 'Moderately active (moderate exercise/sports 3-5 days/week)' },
  { value: 'Very active', label: 'Very active (hard exercise/sports 6-7 days a week)' },
  { value: 'Super active', label: 'Super active (very hard exercise/sports & physical job)' },
];

export default function ProfileScreen() {
  const { userDetails, signOut, setUserDetails } = useAppContext();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState(userDetails?.name || '');
  const [email, setEmail] = useState(userDetails?.email || '');
  const [age, setAge] = useState(userDetails?.age ? String(userDetails.age) : '');
  const [gender, setGender] = useState(userDetails?.gender || GENDER_OPTIONS[0]);
  const [activityLevel, setActivityLevel] = useState(userDetails?.activityLevel || ACTIVITY_LEVELS[0].value);

  useEffect(() => {
    const loadSettings = async () => {
      const storedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      const storedDarkMode = await AsyncStorage.getItem('darkMode');
      if (storedNotifications !== null) {
        setNotificationsEnabled(JSON.parse(storedNotifications));
      }
      if (storedDarkMode !== null) {
        setDarkMode(JSON.parse(storedDarkMode));
      }
    };
    loadSettings();
  }, []);

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(value));
  };

  const toggleDarkMode = async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem('darkMode', JSON.stringify(value));
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/onboarding');
  };

  const handleEditProfile = () => {
    setModalVisible(true);
  };

  const handleSaveProfile = async () => {
    const updatedDetails: UserDetails = {
      name,
      email,
      age,
      phone: userDetails?.phone || '',
      gender,
      activityLevel,
      completedOnboarding: userDetails?.completedOnboarding || true,
      lastActiveDate: userDetails?.lastActiveDate || new Date().toISOString(),
      streakCount: userDetails?.streakCount || 0,
    };
    await setUserDetails(updatedDetails);
    setModalVisible(false);
  };

  const handleCancelEdit = () => {
    setName(userDetails?.name || '');
    setEmail(userDetails?.email || '');
    setAge(userDetails?.age ? String(userDetails.age) : '');
    setGender(userDetails?.gender || GENDER_OPTIONS[0]);
    setActivityLevel(userDetails?.activityLevel || ACTIVITY_LEVELS[0].value);
    setModalVisible(false);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <>
      <ScrollView style={[styles.container, darkMode && { backgroundColor: '#111827' }]}>
        <LinearGradient
          colors={[THEME_COLORS.primary, THEME_COLORS.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userDetails?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={20} color={THEME_COLORS.card} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{userDetails?.name || 'User'}</Text>
          <Text style={styles.email}>{userDetails?.email || 'No email provided'}</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Account Settings</Text>
          
          {/* <TouchableOpacity style={[styles.menuItem, darkMode && styles.darkMenuItem]} onPress={handleEditProfile}>
            <View style={styles.menuIcon}>
              <Ionicons name="person-outline" size={24} color={THEME_COLORS.primary} />
            </View>
            <Text style={[styles.menuText, darkMode && styles.darkText]}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={THEME_COLORS.textSecondary} />
          </TouchableOpacity> */}
          
          <View style={[styles.menuItem, darkMode && styles.darkMenuItem]}>
            <View style={styles.menuIcon}>
              <Ionicons name="notifications-outline" size={24} color={THEME_COLORS.info} />
            </View>
            <Text style={[styles.menuText, darkMode && styles.darkText]}>Notifications</Text>
            <Switch
              trackColor={{ false: '#E5E7EB', true: THEME_COLORS.info }}
              thumbColor={notificationsEnabled ? THEME_COLORS.card : '#f4f3f4'}
              onValueChange={toggleNotifications}
              value={notificationsEnabled}
            />
          </View>
          
          <View style={[styles.menuItem, darkMode && styles.darkMenuItem]}>
            <View style={styles.menuIcon}>
              <MaterialIcons name="dark-mode" size={24} color={THEME_COLORS.secondary} />
            </View>
            <Text style={[styles.menuText, darkMode && styles.darkText]}>Dark Mode</Text>
            <Switch
              trackColor={{ false: '#E5E7EB', true: THEME_COLORS.secondary }}
              thumbColor={darkMode ? THEME_COLORS.card : '#f4f3f4'}
              onValueChange={toggleDarkMode}
              value={darkMode}
            />
          </View>
        </View>

        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Support</Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, darkMode && styles.darkMenuItem]} 
            onPress={() => openLink('https://fyxlife.com/')}
          >
            <View style={styles.menuIcon}>
              <FontAwesome5 name="question-circle" size={24} color={THEME_COLORS.success} />
            </View>
            <Text style={[styles.menuText, darkMode && styles.darkText]}>Help Center</Text>
            <Ionicons name="chevron-forward" size={20} color={THEME_COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, darkMode && styles.darkMenuItem]} 
            onPress={() => openLink('https://fyxlife.com/#contact')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="mail-outline" size={24} color={THEME_COLORS.warning} />
            </View>
            <Text style={[styles.menuText, darkMode && styles.darkText]}>Contact Us</Text>
            <Ionicons name="chevron-forward" size={20} color={THEME_COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, darkMode && styles.darkMenuItem]} 
            onPress={() => openLink('https://fyxlife.com/#privacy')}
          >
            <View style={styles.menuIcon}>
              <MaterialIcons name="privacy-tip" size={24} color={THEME_COLORS.primary} />
            </View>
            <Text style={[styles.menuText, darkMode && styles.darkText]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={THEME_COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, darkMode && { color: '#9CA3AF' }]}>App Version 1.0.0</Text>
        </View>
      </ScrollView>

<Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={handleCancelEdit}
>
  <View style={styles.modalOverlay}>
    <View style={styles.bottomSheet}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleCancelEdit}>
          <Ionicons name="close" size={28} color={THEME_COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.sheetContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.inputField}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.inputField}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Age */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Age</Text>
          <TextInput
            style={styles.inputField}
            value={age}
            onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
            placeholder="Enter your age"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        {/* Gender */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.optionRow}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionChip,
                  gender === option && styles.optionChipSelected,
                ]}
                onPress={() => setGender(option)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    gender === option && styles.optionChipTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Level */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Activity Level</Text>
          <View style={styles.optionColumn}>
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.optionCard,
                  activityLevel === level.value && styles.optionCardSelected,
                ]}
                onPress={() => setActivityLevel(level.value)}
              >
                <Text
                  style={[
                    styles.optionCardText,
                    activityLevel === level.value &&
                      styles.optionCardTextSelected,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky footer buttons */}
      <View style={styles.sheetFooter}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelEdit}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
    marginBottom:64,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME_COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: THEME_COLORS.primary,
    fontSize: 48,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: THEME_COLORS.card,
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkSection: {
    backgroundColor: '#1F2937',
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 14,
    color: THEME_COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  darkMenuItem: {
    borderBottomColor: '#374151',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: THEME_COLORS.textPrimary,
    fontWeight: '500',
  },
  darkText: {
    color: '#D1D5DB',
  },
  signOutButton: {
    margin: 32,
    paddingVertical: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    color: THEME_COLORS.textSecondary,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: THEME_COLORS.card,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeModalButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME_COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: THEME_COLORS.textPrimary,
  },
  pickerContainer: {
    backgroundColor: THEME_COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: THEME_COLORS.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: THEME_COLORS.background,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: THEME_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSheet: {
    width: '100%',
    height: '85%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    position: 'absolute',
    bottom: 0,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.textPrimary,
  },
  sheetContent: {
    flex: 1,
  },
  sheetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputField: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: THEME_COLORS.textPrimary,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    marginBottom: 8,
  },
  optionChipSelected: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  optionChipText: {
    color: THEME_COLORS.textPrimary,
    fontSize: 14,
  },
  optionChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  optionColumn: {
    marginTop: 8,
  },
  optionCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 8,
  },
  optionCardSelected: {
    backgroundColor: THEME_COLORS.primary + '15',
    borderColor: THEME_COLORS.primary,
  },
  optionCardText: {
    fontSize: 15,
    color: THEME_COLORS.textPrimary,
  },
  optionCardTextSelected: {
    color: THEME_COLORS.primary,
    fontWeight: '600',
  },  
});