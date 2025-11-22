import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSync } from '../contexts/SyncContext';

export default function MembersScreen() {
  const { dataVersion, forceSync } = useSync();
  const [members, setMembers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadMembers();
  }, [dataVersion]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name');

      if (error) throw error;

      // Calculate balances for each member
      const membersWithBalances = await Promise.all(
        (data || []).map(async (member) => {
          const balance = await calculateMemberBalance(member.name);
          return { ...member, balance };
        })
      );

      setMembers(membersWithBalances);
    } catch (error) {
      console.error('Error loading members:', error);
      Alert.alert('Error', 'Failed to load members');
    }
  };

  const calculateMemberBalance = async (memberName) => {
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

      let balance = 0;

      // Calculate from expenses
      expenses?.forEach((expense) => {
        const splitAmong = expense.split_among || [];
        const sharePerPerson = expense.amount / splitAmong.length;

        // If member paid
        if (expense.paid_by === memberName) {
          balance += expense.amount;
        }

        // If member owes
        if (splitAmong.includes(memberName)) {
          balance -= sharePerPerson;
        }
      });

      // Calculate from payments
      payments?.forEach((payment) => {
        if (payment.from_member === memberName) {
          balance -= payment.amount;
        }
        if (payment.to_member === memberName) {
          balance += payment.amount;
        }
      });

      return balance;
    } catch (error) {
      console.error('Error calculating balance:', error);
      return 0;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const handleAddMember = async () => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only admins can add members');
      return;
    }

    if (!newMemberName.trim()) {
      Alert.alert('Error', 'Please enter a member name');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('members')
        .insert([{ name: newMemberName.trim() }])
        .select();

      if (error) throw error;

      Alert.alert('Success', 'Member added successfully!');
      setShowAddModal(false);
      setNewMemberName('');
      loadMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      Alert.alert('Error', 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id, name) => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only admins can delete members');
      return;
    }

    Alert.alert(
      'Delete Member',
      `Are you sure you want to delete ${name}? This will not delete their expense history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('members').delete().eq('id', id);

              if (error) throw error;
              Alert.alert('Success', 'Member deleted successfully');
              loadMembers();
            } catch (error) {
              console.error('Error deleting member:', error);
              Alert.alert('Error', 'Failed to delete member');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  const renderMemberItem = ({ item }) => {
    const isPositive = item.balance >= 0;
    const balanceText = isPositive
      ? `Gets back ${formatCurrency(item.balance)}`
      : `Owes ${formatCurrency(item.balance)}`;

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberHeader}>
          <View style={styles.memberLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.memberName}>{item.name}</Text>
              <Text
                style={[
                  styles.balanceText,
                  isPositive ? styles.balancePositive : styles.balanceNegative,
                ]}
              >
                {balanceText}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.balanceBadge,
              isPositive ? styles.balanceBadgePositive : styles.balanceBadgeNegative,
            ]}
          >
            <Text
              style={[
                styles.balanceAmount,
                isPositive ? styles.balanceAmountPositive : styles.balanceAmountNegative,
              ]}
            >
              {isPositive ? '+' : '-'}
              {formatCurrency(item.balance)}
            </Text>
          </View>
        </View>

        {isAdmin && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteMember(item.id, item.name)}
            >
              <Text style={styles.deleteText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient 
        colors={['#6366f1', '#8b5cf6']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Members</Text>
        <Text style={styles.headerSubtitle}>
          {members.length} member{members.length !== 1 ? 's' : ''} in the group
        </Text>
      </LinearGradient>

      {/* Members List */}
      <FlatList
        data={members}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No members yet</Text>
            {isAdmin && (
              <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addButtonText}>+ Add Member</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Add Member Button */}
      {isAdmin && members.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Add Member Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Member</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter member name"
              value={newMemberName}
              onChangeText={setNewMemberName}
              autoFocus
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleAddMember}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Add Member</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddModal(false);
                setNewMemberName('');
              }}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  listContent: {
    padding: 15,
  },
  memberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  balancePositive: {
    color: '#10b981',
  },
  balanceNegative: {
    color: '#ef4444',
  },
  balanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  balanceBadgePositive: {
    backgroundColor: '#d1fae5',
  },
  balanceBadgeNegative: {
    backgroundColor: '#fee2e2',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceAmountPositive: {
    color: '#059669',
  },
  balanceAmountNegative: {
    color: '#dc2626',
  },
  actions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  deleteButton: {
    paddingVertical: 6,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
});
