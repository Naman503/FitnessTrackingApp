import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

type AppContextType = {
  userDetails: UserDetails | null;
  setUserDetails: (details: UserDetails) => void;
  isLoading: boolean;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  completeGoal: (goalId: string) => void;
  swapGoal: (oldGoalId: string, newGoal: Goal) => void;
  updateStreak: () => void;
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

const defaultGoals: Goal[] = [
  {
    id: '1',
    title: 'Daily Steps',
    description: 'Walk 10,000 steps',
    target: 10000,
    current: 0,
    unit: 'steps',
    category: 'Activity',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Water Intake',
    description: 'Drink 8 glasses of water',
    target: 8,
    current: 0,
    unit: 'glasses',
    category: 'Nutrition',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Exercise',
    description: '30 minutes of exercise',
    target: 30,
    current: 0,
    unit: 'minutes',
    category: 'Activity',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userDetails, setUserDetailsState] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoalsState] = useState<Goal[]>([]);

  // Load user details and goals from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user details
        const userData = await AsyncStorage.getItem('userDetails');
        if (userData) {
          setUserDetailsState(JSON.parse(userData));
        }

        // Load goals
        const goalsData = await AsyncStorage.getItem('goals');
        if (goalsData) {
          setGoalsState(JSON.parse(goalsData));
        } else {
          // Set default goals if none exist
          setGoalsState(defaultGoals);
          await AsyncStorage.setItem('goals', JSON.stringify(defaultGoals));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save user details to AsyncStorage whenever they change
  useEffect(() => {
    const saveUserDetails = async () => {
      if (userDetails) {
        try {
          await AsyncStorage.setItem('userDetails', JSON.stringify(userDetails));
        } catch (error) {
          console.error('Error saving user details:', error);
        }
      }
    };

    saveUserDetails();
  }, [userDetails]);

  // Save goals to AsyncStorage whenever they change
  useEffect(() => {
    const saveGoals = async () => {
      if (goals.length > 0) {
        try {
          await AsyncStorage.setItem('goals', JSON.stringify(goals));
        } catch (error) {
          console.error('Error saving goals:', error);
        }
      }
    };

    saveGoals();
  }, [goals]);

  const setUserDetails = (details: UserDetails) => {
    setUserDetailsState(details);
  };

  const setGoals = (newGoals: Goal[]) => {
    setGoalsState(newGoals);
  };

  const completeGoal = (goalId: string) => {
    setGoalsState(prevGoals =>
      prevGoals.map(goal =>
        goal.id === goalId
          ? { ...goal, completed: true, current: goal.target }
          : goal
      )
    );
  };

  const swapGoal = (oldGoalId: string, newGoal: Goal) => {
    setGoalsState(prevGoals =>
      prevGoals.map(goal =>
        goal.id === oldGoalId ? { ...newGoal, id: oldGoalId } : goal
      )
    );
  };

  const updateStreak = () => {
    if (!userDetails) return;

    const today = new Date().toDateString();
    const lastActive = userDetails.lastActiveDate
      ? new Date(userDetails.lastActiveDate).toDateString()
      : null;

    // If we already updated the streak today, do nothing
    if (lastActive === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const newStreakCount =
      !lastActive || lastActive === yesterdayStr
        ? (userDetails.streakCount || 0) + 1
        : 1;

    setUserDetails({
      ...userDetails,
      lastActiveDate: today,
      streakCount: newStreakCount,
    });
  };

  return (
    <AppContext.Provider
      value={{
        userDetails,
        setUserDetails,
        isLoading,
        goals,
        setGoals,
        completeGoal,
        swapGoal,
        updateStreak,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Helper functions for risk assessment
export const calculateHealthRisks = (userDetails: UserDetails | null, goals: Goal[]) => {
  if (!userDetails) return [];

  const age = parseInt(userDetails.age, 10) || 30; // Default to 30 if age is not set
  const activityLevel = userDetails.activityLevel || 'moderate';
  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = Math.max(goals.length, 1); // Avoid division by zero
  const completionRate = (completedGoals / totalGoals) * 100;

  // Base risks for a moderately healthy person in late 30s
  const baseRisks = [
    {
      category: 'Cardiovascular',
      risk: 15, // Base risk percentage
      description: 'Risk of Heart Disease',
      factors: ['age', 'activity', 'goals'],
    },
    {
      category: 'Metabolic',
      risk: 12,
      description: 'Risk of Type 2 Diabetes',
      factors: ['activity', 'goals'],
    },
    {
      category: 'Musculoskeletal',
      risk: 20,
      description: 'Risk of Osteoarthritis',
      factors: ['age', 'activity'],
    },
    {
      category: 'Respiratory',
      risk: 8,
      description: 'Risk of Respiratory Issues',
      factors: ['activity'],
    },
  ];

  // Adjust risks based on user data
  return baseRisks.map(risk => {
    let adjustedRisk = risk.risk;
    
    // Age factor (increases risk after 35)
    if (risk.factors.includes('age') && age > 35) {
      adjustedRisk += (age - 35) * 0.5; // 0.5% increase per year over 35
    }
    
    // Activity level factor
    if (risk.factors.includes('activity')) {
      const activityModifier = {
        sedentary: 10,
        light: 5,
        moderate: 0,
        active: -5,
        veryActive: -8,
      }[activityLevel] || 0;
      
      adjustedRisk += activityModifier;
    }
    
    // Goals completion factor
    if (risk.factors.includes('goals')) {
      const completionModifier = -((100 - completionRate) * 0.1); // Up to -10% for perfect completion
      adjustedRisk += completionModifier;
    }
    
    // Ensure risk is between 1% and 95%
    adjustedRisk = Math.max(1, Math.min(95, adjustedRisk));
    
    return {
      ...risk,
      risk: Math.round(adjustedRisk),
    };
  });
};
