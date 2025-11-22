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
        colors={['#6366f1', '#764ba2']}
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
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 25,
    paddingTop: 60,
    paddingBottom: 30,
    background: 'linear-gradient(135deg, #6366f1 0%, #764ba2 100%)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    marginTop: -30,
  },
  statCard: {
    width: (width - 45) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  secondaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAll: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseCategory: {
    fontSize: 28,
    marginRight: 12,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: '#64748b',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366f1',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  actionButton: {
    width: (width - 55) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 18,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
});
