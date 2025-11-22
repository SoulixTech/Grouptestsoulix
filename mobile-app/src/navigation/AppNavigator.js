import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import MembersScreen from '../screens/MembersScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import SettlementsScreen from '../screens/SettlementsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Expenses') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Settlements') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Members') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#cbd5e1',
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Settlements" component={SettlementsScreen} />
      <Tab.Screen name="Members" component={MembersScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAdmin ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen 
            name="AddExpense" 
            component={AddExpenseScreen}
            options={{ 
              headerShown: true,
              title: 'Add Expense',
              headerStyle: { backgroundColor: '#6366f1' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen 
            name="Payments" 
            component={PaymentsScreen}
            options={{ 
              headerShown: true,
              title: 'Record Payment',
              headerStyle: { backgroundColor: '#6366f1' },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
