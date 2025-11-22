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

export default function PaymentsScreen({ navigation }) {
  const [fromMember, setFromMember] = useState('');
  const [toMember, setToMember] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only admins can record payments');
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
        setFromMember(data[0].name);
        if (data.length > 1) {
          setToMember(data[1].name);
        }
      }
    } catch (error) {
      console.error('Error loading members:', error);
      Alert.alert('Error', 'Failed to load members');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!fromMember || !toMember) {
      Alert.alert('Error', 'Please select both members');
      return;
    }

    if (fromMember === toMember) {
      Alert.alert('Error', 'From and To members must be different');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            from_member: fromMember,
            to_member: toMember,
            amount: amountNum,
            date,
            notes: notes.trim() || null,
          },
        ])
        .select();

      if (error) throw error;

      Alert.alert(
        'Success',
        'Payment recorded successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error recording payment:', error);
      Alert.alert('Error', 'Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366f1', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Record Payment</Text>
        <Text style={styles.headerSubtitle}>Fill in the payment details</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Visual Representation */}
        <View style={styles.visualContainer}>
          <View style={styles.memberBox}>
            <Text style={styles.memberIcon}>👤</Text>
            <Text style={styles.memberLabel}>From</Text>
            <Text style={styles.memberName}>{fromMember || '---'}</Text>
          </View>

          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>→</Text>
            {amount && (
              <Text style={styles.arrowAmount}>₹{parseFloat(amount).toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.memberBox}>
            <Text style={styles.memberIcon}>👤</Text>
            <Text style={styles.memberLabel}>To</Text>
            <Text style={styles.memberName}>{toMember || '---'}</Text>
          </View>
        </View>

        {/* From Member */}
        <View style={styles.field}>
          <Text style={styles.label}>From Member *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={fromMember}
              onValueChange={setFromMember}
              enabled={!loading}
              style={styles.picker}
            >
              {members.map((member) => (
                <Picker.Item key={member.id} label={member.name} value={member.name} />
              ))}
            </Picker>
          </View>
        </View>

        {/* To Member */}
        <View style={styles.field}>
          <Text style={styles.label}>To Member *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={toMember}
              onValueChange={setToMember}
              enabled={!loading}
              style={styles.picker}
            >
              {members.map((member) => (
                <Picker.Item key={member.id} label={member.name} value={member.name} />
              ))}
            </Picker>
          </View>
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

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add any notes about this payment..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            editable={!loading}
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Payment Summary</Text>
            <Text style={styles.infoText}>
              {fromMember || '---'} is paying ₹{amount || '0.00'} to {toMember || '---'}
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Record Payment</Text>
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
  visualContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  memberBox: {
    alignItems: 'center',
    flex: 1,
  },
  memberIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  memberLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  arrowContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  arrow: {
    fontSize: 28,
    color: '#6366f1',
  },
  arrowAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6366f1',
    marginTop: 4,
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
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
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
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
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
