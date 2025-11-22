import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AddExpenseScreen({ navigation }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paidBy, setPaidBy] = useState('');
  const [splitAmong, setSplitAmong] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'];

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only admins can add expenses');
      navigation.goBack();
      return;
    }
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name');

      if (error) throw error;
      setMembers(data || []);
      if (data && data.length > 0) {
        setPaidBy(data[0].name);
        setSplitAmong(data.map(m => m.name));
      }
    } catch (error) {
      console.error('Error loading members:', error);
      Alert.alert('Error', 'Failed to load members');
    }
  };

  const toggleSplitMember = (memberName) => {
    setSplitAmong(prev => {
      if (prev.includes(memberName)) {
        return prev.filter(name => name !== memberName);
      } else {
        return [...prev, memberName];
      }
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!paidBy) {
      Alert.alert('Error', 'Please select who paid');
      return;
    }

    if (splitAmong.length === 0) {
      Alert.alert('Error', 'Please select at least one person to split among');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            description: description.trim(),
            amount: amountNum,
            category,
            paid_by: paidBy,
            split_among: splitAmong,
            date,
          },
        ])
        .select();

      if (error) throw error;

      Alert.alert(
        'Success',
        'Expense added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366f1', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <Text style={styles.headerSubtitle}>Fill in the details below</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Dinner at restaurant"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
          />
        </View>

        {/* Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>Amount (₹) *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!loading}
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              enabled={!loading}
              style={styles.picker}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Paid By */}
        <View style={styles.field}>
          <Text style={styles.label}>Paid By *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={paidBy}
              onValueChange={setPaidBy}
              enabled={!loading}
              style={styles.picker}
            >
              {members.map((member) => (
                <Picker.Item key={member.id} label={member.name} value={member.name} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            editable={!loading}
          />
        </View>

        {/* Split Among */}
        <View style={styles.field}>
          <Text style={styles.label}>Split Among * ({splitAmong.length} selected)</Text>
          <View style={styles.memberGrid}>
            {members.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.memberChip,
                  splitAmong.includes(member.name) && styles.memberChipActive,
                ]}
                onPress={() => toggleSplitMember(member.name)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.memberChipText,
                    splitAmong.includes(member.name) && styles.memberChipTextActive,
                  ]}
                >
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Per Person Amount */}
        {amount && splitAmong.length > 0 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <View>
              <Text style={styles.infoTitle}>Per Person Share</Text>
              <Text style={styles.infoAmount}>
                ₹{(parseFloat(amount) / splitAmong.length).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Expense</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  memberChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  memberChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  memberChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  memberChipTextActive: {
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 4,
  },
  infoAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
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
    marginBottom: 30,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
});
