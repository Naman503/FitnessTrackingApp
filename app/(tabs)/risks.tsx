import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext, calculateHealthRisks } from '@/context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

type RiskLevel = 'low' | 'medium' | 'high';

interface RiskCategory {
  category: string;
  description: string;
  risk: number;
  riskLevel: RiskLevel;
  icon: string;
  color: string;
  recommendations: string[];
}

const THEME_COLORS = {
  primary: '#4F46E5',
  secondary: '#EC4899',
  background: '#F9FAFB',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  gradientStart: '#6D28D9',
  gradientEnd: '#4F46E5',
};

export default function RisksScreen() {
  const { userDetails, goals } = useAppContext();
  const [activeView, setActiveView] = useState<'overview' | 'details'>('overview');
  const [selectedRisk, setSelectedRisk] = useState<RiskCategory | null>(null);
  const [riskCategories, setRiskCategories] = useState<RiskCategory[]>([]);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const healthRisks = calculateHealthRisks(userDetails, goals);
    
    const categories: RiskCategory[] = healthRisks.map(risk => {
      let riskLevel: RiskLevel;
      let color: string;
      let icon: string;
      
      if (risk.risk < 30) {
        riskLevel = 'low';
        color = THEME_COLORS.success;
        icon = 'check-circle';
      } else if (risk.risk < 70) {
        riskLevel = 'medium';
        color = THEME_COLORS.warning;
        icon = 'warning';
      } else {
        riskLevel = 'high';
        color = THEME_COLORS.danger;
        icon = 'error';
      }
      
      const recommendations: string[] = [];
      
      if (risk.factors.includes('age') && parseInt(userDetails?.age || '0', 10) > 35) {
        recommendations.push('Schedule regular health check-ups');
      }
      
      if (risk.factors.includes('activity') && userDetails?.activityLevel === 'sedentary') {
        recommendations.push('Incorporate 30 minutes of daily exercise');
      }
      
      if (risk.factors.includes('goals')) {
        recommendations.push('Set and track achievable health goals');
      }
      
      if (riskLevel === 'high') {
        recommendations.push('Consult a healthcare professional');
        recommendations.push('Adopt comprehensive lifestyle changes');
      } else if (riskLevel === 'medium') {
        recommendations.push('Monitor risk factors regularly');
        recommendations.push('Implement preventive health measures');
      } else {
        recommendations.push('Continue maintaining healthy habits');
      }
      
      return {
        category: risk.category,
        description: risk.description,
        risk: risk.risk,
        riskLevel,
        icon,
        color,
        recommendations,
      };
    });
    
    setRiskCategories(categories);
  }, [userDetails, goals]);

  const getRiskLevelLabel = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'low': return 'Low Risk';
      case 'medium': return 'Medium Risk';
      case 'high': return 'High Risk';
      default: return '';
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const transitionToDetails = (category: RiskCategory) => {
    scrollToTop();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setSelectedRisk(category);
      setActiveView('details');
      slideAnim.setValue(-width);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const transitionToOverview = () => {
    scrollToTop();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setSelectedRisk(null);
      setActiveView('overview');
      slideAnim.setValue(width);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const renderOverview = () => (
    <Animated.View 
      style={[
        styles.contentContainer, 
        { 
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      <View style={styles.riskSummary}>
        <Text style={styles.sectionTitle}>Health Risk Overview</Text>
        <Text style={styles.summaryText}>
          Personalized assessment based on your profile and goals.
          {userDetails?.activityLevel === 'sedentary' && ' Boost activity to lower risks.'}
        </Text>
      </View>
      
      <View style={styles.riskList}>
        {riskCategories.map((category) => (
          <TouchableOpacity 
            key={category.category}
            style={styles.riskCard}
            onPress={() => transitionToDetails(category)}
          >
            <LinearGradient
              colors={[`${category.color}10`, `${category.color}05`]}
              style={styles.riskCardGradient}
            >
              <View style={styles.riskCardHeader}>
                <View style={[styles.riskIconContainer, { backgroundColor: `${category.color}15` }]}>
                  <MaterialIcons name={category.icon as any} size={28} color={category.color} />
                </View>
                <View style={styles.riskCardInfo}>
                  <Text style={styles.riskCategory}>{category.category}</Text>
                  <View style={styles.riskLevelContainer}>
                    <View style={[styles.riskLevelDot, { backgroundColor: category.color }]} />
                    <Text style={[styles.riskLevel, { color: category.color }]}>
                      {getRiskLevelLabel(category.riskLevel)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.riskProgressContainer}>
                <View style={styles.riskProgressBackground}>
                  <View 
                    style={[
                      styles.riskProgressFill, 
                      { width: `${category.risk}%`, backgroundColor: category.color }
                    ]} 
                  />
                </View>
                <Text style={[styles.riskPercentage, { color: category.color }]}>
                  {category.risk}%
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>Daily Health Tips</Text>
        <View style={styles.tipCard}>
          <MaterialIcons name="directions-run" size={24} color={THEME_COLORS.primary} />
          <Text style={styles.tipText}>30 min daily moderate exercise</Text>
        </View>
        <View style={styles.tipCard}>
          <MaterialIcons name="restaurant" size={24} color={THEME_COLORS.primary} />
          <Text style={styles.tipText}>Balanced diet with fruits & veggies</Text>
        </View>
        <View style={styles.tipCard}>
          <MaterialIcons name="bedtime" size={24} color={THEME_COLORS.primary} />
          <Text style={styles.tipText}>7-9 hours of quality sleep nightly</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderDetails = () => {
    if (!selectedRisk) return null;
    
    return (
      <Animated.View 
        style={[
          styles.contentContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={transitionToOverview}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={THEME_COLORS.textPrimary} />
          <Text style={styles.backButtonText}>Back to Overview</Text>
        </TouchableOpacity>
        
        <View style={styles.riskDetailCard}>
          <LinearGradient
            colors={[THEME_COLORS.gradientStart, THEME_COLORS.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.riskHeaderGradient}
          >
            <View style={styles.riskHeader}>
              <View style={[styles.riskIconLarge, { backgroundColor: `${selectedRisk.color}20` }]}>
                <MaterialIcons 
                  name={selectedRisk.icon as any} 
                  size={40} 
                  color="#FFFFFF" 
                />
              </View>
              <Text style={styles.riskTitle}>{selectedRisk.category}</Text>
              <View style={styles.riskLevelBadge}>
                <View style={[styles.riskLevelDotLarge, { backgroundColor: selectedRisk.color }]} />
                <Text style={[styles.riskLevelText, { color: selectedRisk.color }]}>
                  {getRiskLevelLabel(selectedRisk.riskLevel)}
                </Text>
              </View>
            </View>
          </LinearGradient>
          
          <View style={styles.riskMeterContainer}>
            <View style={styles.riskMeterBackground}>
              <View 
                style={[
                  styles.riskMeterFill, 
                  { 
                    width: `${selectedRisk.risk}%`,
                    backgroundColor: selectedRisk.color,
                  }
                ]} 
              />
            </View>
            <Text style={[styles.riskPercentageLarge, { color: selectedRisk.color }]}>
              {selectedRisk.risk}% Risk
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Risk</Text>
            <Text style={styles.descriptionText}>
              {selectedRisk.description}. This assessment is derived from your profile data and activity patterns.
              {selectedRisk.riskLevel === 'high' 
                ? ' We recommend seeking professional medical advice promptly.' 
                : ' Implement the suggestions below to manage or reduce this risk.'}
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
            {selectedRisk.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={[styles.recommendationBullet, { backgroundColor: selectedRisk.color }]} />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Take Action</Text>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: THEME_COLORS.primary }]}>
              <Text style={styles.actionButtonText}>Schedule Check-up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: THEME_COLORS.secondary }]}>
              <Text style={styles.actionButtonText}>Explore Resources</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <BlurView 
          intensity={Platform.OS === 'ios' ? 90 : 120}
          tint="light"
          style={styles.headerBlur}
        >
          <LinearGradient
            colors={[THEME_COLORS.gradientStart, THEME_COLORS.gradientEnd]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                {activeView === 'overview' ? 'Risk-o-Meter' : selectedRisk?.category}
              </Text>
              <Text style={styles.headerSubtitle}>
                {activeView === 'overview' 
                  ? 'Your Personalized Health Risk Assessment' 
                  : 'Detailed Risk Analysis'}
              </Text>
            </View>
          </LinearGradient>
        </BlurView>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.headerSpacer} />
        {activeView === 'overview' ? renderOverview() : renderDetails()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
    bottom: 40,
  },
  headerContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerBlur: {
    width: '100%',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerSpacer: {
    height: Platform.OS === 'ios' ? 140 : 120,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentContainer: {
    padding: 16,
  },
  riskSummary: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME_COLORS.textPrimary,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: THEME_COLORS.textSecondary,
    lineHeight: 24,
  },
  riskList: {
    marginBottom: 16,
  },
  riskCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  riskCardGradient: {
    padding: 20,
  },
  riskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  riskCardInfo: {
    flex: 1,
  },
  riskCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    marginBottom: 4,
  },
  riskLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskLevelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  riskLevel: {
    fontSize: 14,
    fontWeight: '500',
  },
  riskProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskProgressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  riskProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  riskPercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: THEME_COLORS.textPrimary,
    marginLeft: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: THEME_COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.textPrimary,
    marginLeft: 8,
  },
  riskDetailCard: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  riskHeaderGradient: {
    padding: 32,
    alignItems: 'center',
  },
  riskHeader: {
    alignItems: 'center',
  },
  riskIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  riskLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  riskLevelDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  riskLevelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  riskMeterContainer: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  riskMeterBackground: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  riskMeterFill: {
    height: '100%',
    borderRadius: 6,
  },
  riskPercentageLarge: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  descriptionText: {
    fontSize: 16,
    color: THEME_COLORS.textSecondary,
    lineHeight: 26,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recommendationBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 9,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 16,
    color: THEME_COLORS.textPrimary,
    lineHeight: 26,
  },
  actionButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});