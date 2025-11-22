import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../config/supabase';
import { useSync } from '../contexts/SyncContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { dataVersion, forceSync } = useSync();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalMembers: 0,
    totalPayments: 0,
    recentExpenses: [],
  });

  useEffect(() => {
    loadData();
  }, [dataVersion]);

  const loadData = async () => {
    try {
      // Fetch expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      // Fetch members
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*');

      if (membersError) throw membersError;

      // Fetch payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*');

      if (paymentsError) throw paymentsError;

      // Calculate total expenses
      const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
      const totalPayments = payments?.reduce((sum, pay) => sum + (pay.amount || 0), 0) || 0;

      setStats({
        totalExpenses,
        totalMembers: members?.length || 0,
        totalPayments,
        recentExpenses: expenses?.slice(0, 5) || [],
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    forceSync();
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#6366f1"
          colors={['#6366f1']}
        />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome back, Admin!</Text>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.totalExpenses)}</Text>
          <Text style={styles.statLabel}>Total Expenses</Text>
        </View>

        <View style={[styles.statCard, styles.secondaryCard]}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statValue}>{stats.totalMembers}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>

        <View style={[styles.statCard, styles.successCard]}>
          <Text style={styles.statIcon}>💳</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.totalPayments)}</Text>
          <Text style={styles.statLabel}>Total Payments</Text>
        </View>

        <View style={[styles.statCard, styles.warningCard]}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statValue}>
            {formatCurrency(stats.totalExpenses - stats.totalPayments)}
          </Text>
          <Text style={styles.statLabel}>Outstanding</Text>
        </View>
      </View>

      {/* Recent Expenses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {stats.recentExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No expenses yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddExpense')}
            >
              <Text style={styles.addButtonText}>+ Add Expense</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {stats.recentExpenses.map((expense) => (
              <View key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseLeft}>
                  <Text style={styles.expenseCategory}>
                    {getCategoryIcon(expense.category)}
                  </Text>
                  <View>
                    <Text style={styles.expenseDescription}>
                      {expense.description}
                    </Text>
                    <Text style={styles.expenseDate}>
                      {formatDate(expense.date)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.expenseAmount}>
                  {formatCurrency(expense.amount)}
                </Text>
              </View>
            ))}
          </>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddExpense')}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Payments')}
          >
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>Record Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settlements')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Settlements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Members')}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Members</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const getCategoryIcon = (category) => {
  const icons = {
    Food: '🍔',
    Transport: '🚗',
    Entertainment: '🎬',
    Shopping: '🛍️',
    Bills: '💡',
    Other: '📦',
  };
  return icons[category] || '📦';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    padding: 25,
    paddingTop: 60,
    paddingBottom: 40,
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#ffffff',
    opacity: 0.95,
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    marginTop: -35,
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#6366f1',
    backgroundColor: '#fefeff',
  },
  secondaryCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#8b5cf6',
    backgroundColor: '#fefeff',
  },
  successCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#10b981',
    backgroundColor: '#fefeff',
  },
  warningCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fefeff',
  },
  statIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  seeAll: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '700',
  },
  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseCategory: {
    fontSize: 32,
    marginRight: 14,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  expenseDate: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 18,
  },
  emptyText: {
    fontSize: 17,
    color: '#64748b',
    marginBottom: 24,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    width: (width - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
});
