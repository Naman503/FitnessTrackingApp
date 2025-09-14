import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type UserDetails = {
  name: string;
  email: string;
  age: string;
  phone: string;
  gender: string;
  activityLevel: string;
  completedOnboarding: boolean;
  lastActiveDate: string;
  streakCount: number;
};

type AppContextType = {
  userDetails: UserDetails | null;
  setUserDetails: (details: UserDetails | null) => void;
  isLoading: boolean;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'current'>) => void;
  completeGoal: (goalId: string) => void;
  toggleGoalComplete: (goalId: string) => void;
  deleteGoal: (goalId: string) => void;
  updateGoalCurrent: (goalId: string, newCurrent: number) => void;
  swapGoal: (oldGoalId: string, newGoal: Goal) => void;
  resetGoalsToDefault: () => Promise<void>;
  updateStreak: () => void;
  signOut: () => Promise<void>;
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
  progress: number;
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
    progress: 0,
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
    progress: 0,
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
    progress: 0,
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userDetails, setUserDetailsState] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoalsState] = useState<Goal[]>([]);

  const updateStreak = useCallback(async () => {
    if (!userDetails) return null;
    
    try {
      const today = new Date().toDateString();
      const lastActive = userDetails.lastActiveDate 
        ? new Date(userDetails.lastActiveDate).toDateString() 
        : null;
      
      // If user already active today, no need to update
      if (lastActive === today) return userDetails;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      let newStreak = 1; // Default to 1 for new day
      
      if (lastActive === yesterdayStr) {
        // Consecutive day
        newStreak = (userDetails.streakCount || 0) + 1;
      } else if (lastActive && lastActive !== today) {
        // Not consecutive, reset streak
        newStreak = 1;
      }
      
      // Only update if there's a change
      if (newStreak !== userDetails.streakCount || lastActive !== today) {
        const updatedDetails = {
          ...userDetails,
          lastActiveDate: today,
          streakCount: newStreak
        };
        
        await AsyncStorage.setItem('userDetails', JSON.stringify(updatedDetails));
        setUserDetailsState(updatedDetails);
        return updatedDetails;
      }
      
      return userDetails;
    } catch (error) {
      console.error('Error updating streak:', error);
      return null;
    }
  }, [userDetails]);
  
  // Load data on initial mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        // Load user details
        const userData = await AsyncStorage.getItem('userDetails');
        if (userData && isMounted) {
          const parsedUserData = JSON.parse(userData);
          
          // Check if we need to update the streak
          const today = new Date().toDateString();
          const lastActive = parsedUserData.lastActiveDate 
            ? new Date(parsedUserData.lastActiveDate).toDateString() 
            : null;
          
          if (lastActive !== today) {
            await updateStreak();
          } else {
            setUserDetailsState(parsedUserData);
          }
        }

        // Load goals
        const goalsData = await AsyncStorage.getItem('goals');
        if (isMounted) {
          if (goalsData) {
            setGoalsState(JSON.parse(goalsData));
          } else {
            // Set default goals if none exist
            const initialGoals = [...defaultGoals];
            setGoalsState(initialGoals);
            await AsyncStorage.setItem('goals', JSON.stringify(initialGoals));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Removed updateStreak from dependencies to prevent loops

  const setUserDetails = async (details: UserDetails | null) => {
    setUserDetailsState(details);
    try {
      if (details) {
        await AsyncStorage.setItem('userDetails', JSON.stringify(details));
      } else {
        await AsyncStorage.removeItem('userDetails');
      }
    } catch (error) {
      console.error('Error saving user details:', error);
    }
  };

  // Load goals on initial mount
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const goalsData = await AsyncStorage.getItem('goals');
        if (goalsData) {
          const parsedGoals = JSON.parse(goalsData);
          setGoalsState(parsedGoals);
        } else {
          // Set default goals if none exist
          const initialGoals = [...defaultGoals];
          await AsyncStorage.setItem('goals', JSON.stringify(initialGoals));
          setGoalsState(initialGoals);
        }
      } catch (error) {
        console.error('Error loading goals:', error);
        // In case of error, set default goals
        const initialGoals = [...defaultGoals];
        await AsyncStorage.setItem('goals', JSON.stringify(initialGoals));
        setGoalsState(initialGoals);
      }
    };

    loadGoals();
  }, []);

  const setGoals = useCallback(async (newGoals: Goal[]) => {
    try {
      setGoalsState(newGoals);
      await AsyncStorage.setItem('goals', JSON.stringify(newGoals));
    } catch (error) {
      console.error('Error saving goals in setGoals:', error);
    }
  }, []);

  const completeGoal = useCallback((goalId: string) => {
    setGoalsState(prevGoals => {
      const updatedGoals = prevGoals.map(goal =>
        goal.id === goalId ? { ...goal, completed: true } : goal
      );
      // Save to AsyncStorage after state update
      AsyncStorage.setItem('goals', JSON.stringify(updatedGoals)).catch(console.error);
      return updatedGoals;
    });
  }, []);

  const addGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'current'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      current: 0,
      completed: false,
      createdAt: new Date().toISOString(),
      progress: 0,
    };
    setGoalsState(prevGoals => {
      const updatedGoals = [...prevGoals, newGoal];
      // Save to AsyncStorage after state update
      AsyncStorage.setItem('goals', JSON.stringify(updatedGoals)).catch(console.error);
      return updatedGoals;
    });
  }, []);

  const swapGoal = useCallback((oldGoalId: string, newGoal: Goal) => {
    setGoalsState(prevGoals => {
      const updatedGoals = prevGoals.map(goal =>
        goal.id === oldGoalId ? { ...newGoal, id: oldGoalId } : goal
      );
      // Save to AsyncStorage after state update
      AsyncStorage.setItem('goals', JSON.stringify(updatedGoals)).catch(console.error);
      return updatedGoals;
    });
  }, []);

  const toggleGoalComplete = useCallback((goalId: string) => {
    setGoalsState(prevGoals => {
      const updatedGoals = prevGoals.map(goal =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      );
      // Save to AsyncStorage after state update
      AsyncStorage.setItem('goals', JSON.stringify(updatedGoals)).catch(console.error);
      return updatedGoals;
    });
  }, []);

  const deleteGoal = useCallback((goalId: string) => {
    setGoalsState(prevGoals => {
      const updatedGoals = prevGoals.filter(goal => goal.id !== goalId);
      // Save to AsyncStorage after state update
      AsyncStorage.setItem('goals', JSON.stringify(updatedGoals)).catch(console.error);
      return updatedGoals;
    });
  }, []);

  const updateGoalCurrent = useCallback((goalId: string, newCurrent: number) => {
    setGoalsState(prevGoals => {
      const updatedGoals = prevGoals.map(goal => {
        if (goal.id !== goalId) return goal;
        const safeTarget = goal.target || 0;
        const clampedCurrent = Math.max(0, newCurrent);
        const progress = safeTarget > 0 ? Math.min(100, Math.round((clampedCurrent / safeTarget) * 100)) : 0;
        return {
          ...goal,
          current: clampedCurrent,
          progress,
          completed: safeTarget > 0 ? clampedCurrent >= safeTarget : goal.completed,
        };
      });
      // Save to AsyncStorage after state update
      AsyncStorage.setItem('goals', JSON.stringify(updatedGoals)).catch(console.error);
      return updatedGoals;
    });
  }, []);

  const resetGoalsToDefault = async () => {
    try {
      const initialGoals = [...defaultGoals];
      setGoalsState(initialGoals);
      await AsyncStorage.setItem('goals', JSON.stringify(initialGoals));
    } catch (error) {
      console.error('Error resetting goals:', error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userDetails');
      setUserDetailsState(null);
      // Reset goals to defaults on sign out
      const initialGoals = [...defaultGoals];
      setGoalsState(initialGoals);
      await AsyncStorage.setItem('goals', JSON.stringify(initialGoals));
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
        toggleGoalComplete,
        deleteGoal,
        updateGoalCurrent,
        swapGoal,
        addGoal,
        resetGoalsToDefault,
        updateStreak,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;

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
