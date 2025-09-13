import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext, calculateHealthRisks } from '@/context/AppContext';

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

export default function RisksScreen() {
  const { userDetails, goals } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [selectedRisk, setSelectedRisk] = useState<RiskCategory | null>(null);
  const [riskCategories, setRiskCategories] = useState<RiskCategory[]>([]);

  useEffect(() => {
    const healthRisks = calculateHealthRisks(userDetails, goals);
    
    const categories: RiskCategory[] = healthRisks.map(risk => {
      let riskLevel: RiskLevel;
      let color: string;
      let icon: string;
      
      if (risk.risk < 30) {
        riskLevel = 'low';
        color = '#4CAF50'; // Green
        icon = 'check-circle';
      } else if (risk.risk < 70) {
        riskLevel = 'medium';
        color = '#FFC107'; // Amber
        icon = 'warning';
      } else {
        riskLevel = 'high';
        color = '#F44336'; // Red
        icon = 'error';
      }
      
      // Generate recommendations based on risk factors
      const recommendations: string[] = [];
      
      if (risk.factors.includes('age') && parseInt(userDetails?.age || '0', 10) > 35) {
        recommendations.push('Regular health check-ups recommended');
      }
      
      if (risk.factors.includes('activity') && userDetails?.activityLevel === 'sedentary') {
        recommendations.push('Increase physical activity level');
      }
      
      if (risk.factors.includes('goals')) {
        recommendations.push('Improve goal completion rate');
      }
      
      // Add general recommendations
      if (riskLevel === 'high') {
        recommendations.push('Consult a healthcare professional');
        recommendations.push('Consider lifestyle changes');
      } else if (riskLevel === 'medium') {
        recommendations.push('Monitor regularly');
        recommendations.push('Consider preventive measures');
      } else {
        recommendations.push('Maintain healthy habits');
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

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.riskSummary}>
        <Text style={styles.sectionTitle}>Your Health Risk Assessment</Text>
        <Text style={styles.summaryText}>
          Based on your profile and activity, here's an overview of your health risks.
          {userDetails?.activityLevel === 'sedentary' && (
            ' Consider increasing your activity level to reduce risks.'
          )}
        </Text>
      </View>
      
      <View style={styles.riskMeter}>
        {riskCategories.map((category) => (
          <TouchableOpacity 
            key={category.category}
            style={styles.riskMeterItem}
            onPress={() => {
              setSelectedRisk(category);
              setActiveTab('details');
            }}
          >
            <View style={[styles.riskIconContainer, { backgroundColor: `${category.color}20` }]}>
              <MaterialIcons name={category.icon as any} size={24} color={category.color} />
            </View>
            <View style={styles.riskMeterText}>
              <Text style={styles.riskCategory}>{category.category}</Text>
              <View style={styles.riskLevelContainer}>
                <View style={[styles.riskLevelDot, { backgroundColor: category.color }]} />
                <Text style={[styles.riskLevel, { color: category.color }]}>
                  {getRiskLevelLabel(category.riskLevel)}
                </Text>
              </View>
            </View>
            <View style={styles.riskPercentageContainer}>
              <Text style={[styles.riskPercentage, { color: category.color }]}>
                {category.risk}%
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>Quick Health Tips</Text>
        <View style={styles.tipCard}>
          <MaterialIcons name="directions-walk" size={24} color="#6B46C1" />
          <Text style={styles.tipText}>Aim for at least 30 minutes of moderate exercise daily</Text>
        </View>
        <View style={styles.tipCard}>
          <MaterialIcons name="restaurant" size={24} color="#6B46C1" />
          <Text style={styles.tipText}>Eat a balanced diet with plenty of fruits and vegetables</Text>
        </View>
        <View style={styles.tipCard}>
          <MaterialIcons name="bedtime" size={24} color="#6B46C1" />
          <Text style={styles.tipText}>Get 7-9 hours of quality sleep each night</Text>
        </View>
      </View>
    </View>
  );

  const renderRiskDetails = () => {
    if (!selectedRisk) return null;
    
    return (
      <ScrollView style={styles.detailsContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setActiveTab('overview')}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6B46C1" />
          <Text style={styles.backButtonText}>Back to Overview</Text>
        </TouchableOpacity>
        
        <View style={styles.riskHeader}>
          <View style={[styles.riskIconLarge, { backgroundColor: `${selectedRisk.color}20` }]}>
            <MaterialIcons 
              name={selectedRisk.icon as any} 
              size={32} 
              color={selectedRisk.color} 
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
          <Text style={styles.riskPercentageLarge}>{selectedRisk.risk}% Risk</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Risk</Text>
          <Text style={styles.descriptionText}>
            {selectedRisk.description}. This assessment is based on your profile information and activity levels. 
            {selectedRisk.riskLevel === 'high' 
              ? ' We recommend consulting with a healthcare professional for personalized advice.' 
              : ' Consider the recommendations below to maintain or improve your health.'}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {selectedRisk.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: selectedRisk.color }]} />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Schedule a Check-up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#f0f0f0', marginTop: 10 }]}>
            <Text style={[styles.actionButtonText, { color: '#6B46C1' }]}>View Health Resources</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Risk-o-Meter</Text>
        <Text style={styles.headerSubtitle}>Your Health Risk Assessment</Text>
      </View>
      
      {activeTab === 'overview' ? renderOverview() : renderRiskDetails()}
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
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  overviewContainer: {
    flex: 1,
    padding: 15,
  },
  riskSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  riskMeter: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  riskMeterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  riskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  riskMeterText: {
    flex: 1,
  },
  riskCategory: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  riskLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskLevelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  riskLevel: {
    fontSize: 12,
    fontWeight: '500',
  },
  riskPercentageContainer: {
    marginRight: 10,
  },
  riskPercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f5ff',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    marginLeft: 10,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#6B46C1',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
  riskHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  riskIconLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  riskTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  riskLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f5ff',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  riskLevelDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  riskLevelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  riskMeterContainer: {
    marginBottom: 25,
  },
  riskMeterBackground: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  riskMeterFill: {
    height: '100%',
    borderRadius: 5,
  },
  riskPercentageLarge: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 25,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#6B46C1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
