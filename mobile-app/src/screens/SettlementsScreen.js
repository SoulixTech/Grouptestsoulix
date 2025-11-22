import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../config/supabase';
import { useSync } from '../contexts/SyncContext';

export default function SettlementsScreen() {
  const { dataVersion, forceSync } = useSync();
  const [settlements, setSettlements] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    loadSettlements();
  }, [dataVersion]);

  const loadSettlements = async () => {
    try {
      // Fetch expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*');

      if (expensesError) throw expensesError;

      // Fetch payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*');

      if (paymentsError) throw paymentsError;

      // Calculate balances
      const balances = {};

      // Process expenses
      expenses?.forEach((expense) => {
        const paidBy = expense.paid_by;
        const splitAmong = expense.split_among || [];
        const sharePerPerson = expense.amount / splitAmong.length;

        if (!balances[paidBy]) balances[paidBy] = {};

        splitAmong.forEach((person) => {
          if (person !== paidBy) {
            if (!balances[paidBy][person]) {
              balances[paidBy][person] = {
                totalOwed: 0,
                paidAmount: 0,
                expenses: [],
              };
            }
            balances[paidBy][person].totalOwed += sharePerPerson;
            balances[paidBy][person].expenses.push({
              description: expense.description,
              amount: sharePerPerson,
              date: expense.date,
              category: expense.category,
            });
          }
        });
      });

      // Process payments
      payments?.forEach((payment) => {
        const from = payment.from_member;
        const to = payment.to_member;

        if (balances[to] && balances[to][from]) {
          balances[to][from].paidAmount += payment.amount;
          if (!balances[to][from].payments) {
            balances[to][from].payments = [];
          }
          balances[to][from].payments.push({
            amount: payment.amount,
            date: payment.date,
            notes: payment.notes,
          });
        }
      });

      // Convert to array for display
      const settlementsArray = [];
      Object.keys(balances).forEach((paidBy) => {
        Object.keys(balances[paidBy]).forEach((owes) => {
          const data = balances[paidBy][owes];
          const remainingAmount = data.totalOwed - data.paidAmount;

          if (data.totalOwed > 0) {
            settlementsArray.push({
              paidBy,
              owes,
              totalOwed: data.totalOwed,
              paidAmount: data.paidAmount,
              remainingAmount,
              expenses: data.expenses || [],
              payments: data.payments || [],
              status: remainingAmount <= 0.01 ? 'Settled' : 'Due',
            });
          }
        });
      });

      // Sort by remaining amount (highest first)
      settlementsArray.sort((a, b) => b.remainingAmount - a.remainingAmount);

      setSettlements(settlementsArray);
    } catch (error) {
      console.error('Error loading settlements:', error);
      Alert.alert('Error', 'Failed to load settlements');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSettlements();
    setRefreshing(false);
  };

  const toggleCard = (index) => {
    setExpandedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

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

  const getTotalOutstanding = () => {
    return settlements.reduce((sum, s) => sum + s.remainingAmount, 0);
  };

  const renderSettlementCard = (settlement, index) => {
    const isExpanded = expandedCards[index];

    return (
      <TouchableOpacity
        key={index}
        style={styles.card}
        onPress={() => toggleCard(index)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text style={styles.personIcon}>👤</Text>
            <View>
              <Text style={styles.owesText}>
                <Text style={styles.owesName}>{settlement.owes}</Text> owes
              </Text>
              <Text style={styles.paidByText}>
                to <Text style={styles.paidByName}>{settlement.paidBy}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.remainingAmount}>
              {formatCurrency(settlement.remainingAmount)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                settlement.status === 'Settled' ? styles.statusSettled : styles.statusDue,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  settlement.status === 'Settled' ? styles.statusTextSettled : styles.statusTextDue,
                ]}
              >
                {settlement.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((settlement.paidAmount / settlement.totalOwed) * 100, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {formatCurrency(settlement.paidAmount)} / {formatCurrency(settlement.totalOwed)}
          </Text>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Expenses */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Expenses ({settlement.expenses.length})</Text>
              {settlement.expenses.map((expense, idx) => (
                <View key={idx} style={styles.detailItem}>
                  <View style={styles.detailLeft}>
                    <Text style={styles.detailIcon}>{getCategoryIcon(expense.category)}</Text>
                    <View>
                      <Text style={styles.detailDescription}>{expense.description}</Text>
                      <Text style={styles.detailDate}>{formatDate(expense.date)}</Text>
                    </View>
                  </View>
                  <Text style={styles.detailAmount}>{formatCurrency(expense.amount)}</Text>
                </View>
              ))}
            </View>

            {/* Payments */}
            {settlement.payments && settlement.payments.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💳 Payments ({settlement.payments.length})</Text>
                {settlement.payments.map((payment, idx) => (
                  <View key={idx} style={styles.detailItem}>
                    <View style={styles.detailLeft}>
                      <Text style={styles.detailIcon}>✅</Text>
                      <View>
                        <Text style={styles.detailDescription}>
                          {payment.notes || 'Payment'}
                        </Text>
                        <Text style={styles.detailDate}>{formatDate(payment.date)}</Text>
                      </View>
                    </View>
                    <Text style={[styles.detailAmount, styles.paymentAmount]}>
                      -{formatCurrency(payment.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Owed:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(settlement.totalOwed)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Paid:</Text>
                <Text style={[styles.summaryValue, styles.summaryPaid]}>
                  -{formatCurrency(settlement.paidAmount)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Remaining:</Text>
                <Text style={styles.summaryTotalValue}>
                  {formatCurrency(settlement.remainingAmount)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.tapHint}>
          {isExpanded ? '▲ Tap to collapse' : '▼ Tap to see details'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6366f1', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Settlements</Text>
        <Text style={styles.headerSubtitle}>
          {settlements.length} settlement{settlements.length !== 1 ? 's' : ''} • Outstanding: {formatCurrency(getTotalOutstanding())}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {settlements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyText}>All settled up!</Text>
            <Text style={styles.emptySubtext}>No pending settlements</Text>
          </View>
        ) : (
          settlements.map((settlement, index) => renderSettlementCard(settlement, index))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  personIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  owesText: {
    fontSize: 15,
    color: '#64748b',
  },
  owesName: {
    fontWeight: '700',
    color: '#1e293b',
    fontSize: 16,
  },
  paidByText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  paidByName: {
    fontWeight: '600',
    color: '#6366f1',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  remainingAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusSettled: {
    backgroundColor: '#d1fae5',
  },
  statusDue: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextSettled: {
    color: '#059669',
  },
  statusTextDue: {
    color: '#dc2626',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  expandedContent: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 6,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  detailDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  detailDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  detailAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  paymentAmount: {
    color: '#10b981',
  },
  summary: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  summaryPaid: {
    color: '#10b981',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 6,
    paddingTop: 10,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  tapHint: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
  },
});
