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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSync } from '../contexts/SyncContext';

export default function ExpensesScreen({ navigation }) {
  const { dataVersion, forceSync } = useSync();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { isAdmin } = useAuth();

  const categories = ['All', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'];

  useEffect(() => {
    loadExpenses();
  }, [dataVersion]);

  useEffect(() => {
    filterExpenses();
  }, [searchQuery, filterCategory, expenses]);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      Alert.alert('Error', 'Failed to load expenses');
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    // Filter by category
    if (filterCategory !== 'All') {
      filtered = filtered.filter((exp) => exp.category === filterCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((exp) =>
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.paid_by.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExpenses(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    forceSync();
    await loadExpenses();
    setRefreshing(false);
  };

  const handleDeleteExpense = async (id) => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only admins can delete expenses');
      return;
    }

    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);

              if (error) throw error;
              Alert.alert('Success', 'Expense deleted successfully');
              loadExpenses();
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const getTotalAmount = () => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseLeft}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
          <View style={styles.expenseInfo}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.metadata}>
              Paid by <Text style={styles.paidBy}>{item.paid_by}</Text>
            </Text>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.expenseRight}>
          <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </View>

      {isAdmin && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteExpense(item.id)}
          >
            <Text style={styles.deleteText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Expenses</Text>
        <Text style={styles.headerSubtitle}>
          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} • Total: {formatCurrency(getTotalAmount())}
        </Text>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filter */}
      {filterCategory !== 'All' && (
        <View style={styles.activeFilter}>
          <Text style={styles.activeFilterText}>
            Showing: {filterCategory}
          </Text>
          <TouchableOpacity onPress={() => setFilterCategory('All')}>
            <Text style={styles.clearFilter}>✕ Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Expenses List */}
      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No expenses found</Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddExpense')}
              >
                <Text style={styles.addButtonText}>+ Add Expense</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Add Button */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Category</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryOption,
                  filterCategory === category && styles.categoryOptionActive,
                ]}
                onPress={() => {
                  setFilterCategory(category);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    filterCategory === category && styles.categoryOptionTextActive,
                  ]}
                >
                  {category === 'All' ? '📋' : getCategoryIcon(category)} {category}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
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
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterIcon: {
    fontSize: 20,
  },
  activeFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    marginHorizontal: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  clearFilter: {
    color: '#fff',
    fontSize: 16,
  },
  listContent: {
    padding: 15,
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  metadata: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  paidBy: {
    fontWeight: '600',
    color: '#6366f1',
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
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
    paddingVertical: 60,
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  categoryOption: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  categoryOptionActive: {
    backgroundColor: '#6366f1',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  categoryOptionTextActive: {
    color: '#fff',
  },
  closeButton: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
});
