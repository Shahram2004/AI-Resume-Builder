import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CATEGORIES = [
  { label: 'Food', icon: '🍔' },
  { label: 'Transport', icon: '🚗' },
  { label: 'Shopping', icon: '🛍️' },
  { label: 'Bills', icon: '💡' },
  { label: 'Health', icon: '💊' },
  { label: 'Fun', icon: '🎮' },
  { label: 'Salary', icon: '💰' },
  { label: 'Other', icon: '📦' },
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const handleSave = async () => {
    if (!amount || !selectedCategory) {
      window.alert('Please enter an amount and select a category.');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      amount,
      note,
      category: selectedCategory,
      type,
      date: new Date().toLocaleDateString(),
    };

    try {
      const existing = await AsyncStorage.getItem('transactions');
      const transactions = existing ? JSON.parse(existing) : [];
      transactions.push(newTransaction);
      await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      window.alert(`Saved! ${type === 'expense' ? '-' : '+'}$${amount} for ${selectedCategory}`);
      router.back();
    } catch (e) {
      window.alert('Error saving transaction.');
    }
  };

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Transaction</Text>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, type === 'expense' && styles.toggleExpenseActive]}
          onPress={() => setType('expense')}>
          <Text style={[styles.toggleText, type === 'expense' && styles.toggleTextActive]}>
            💸 Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, type === 'income' && styles.toggleIncomeActive]}
          onPress={() => setType('income')}>
          <Text style={[styles.toggleText, type === 'income' && styles.toggleTextActive]}>
            💰 Income
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Amount ($)</Text>
      <TextInput
        style={styles.amountInput}
        placeholder="0.00"
        placeholderTextColor="#444"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={styles.noteInput}
        placeholder="e.g. Lunch with friends"
        placeholderTextColor="#444"
        value={note}
        onChangeText={setNote}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.label}
            style={[styles.categoryBtn, selectedCategory === cat.label && styles.categoryActive]}
            onPress={() => setSelectedCategory(cat.label)}>
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[styles.categoryLabel, selectedCategory === cat.label && styles.categoryLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Transaction</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20 },
  header: { marginTop: 50, marginBottom: 30, flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { color: '#7c6fff', fontSize: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  toggleRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  toggleBtn: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#1a1a2e', alignItems: 'center' },
  toggleExpenseActive: { backgroundColor: '#3b0f0f', borderWidth: 1, borderColor: '#f44336' },
  toggleIncomeActive: { backgroundColor: '#0d2b1f', borderWidth: 1, borderColor: '#4caf50' },
  toggleText: { color: '#666', fontSize: 15, fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  label: { color: '#888', fontSize: 13, marginBottom: 8, marginTop: 4 },
  amountInput: { backgroundColor: '#1a1a2e', color: '#fff', fontSize: 36, fontWeight: 'bold',
    borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'center' },
  noteInput: { backgroundColor: '#1a1a2e', color: '#fff', fontSize: 16,
    borderRadius: 16, padding: 16, marginBottom: 20 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  categoryBtn: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 14, alignItems: 'center', width: '22%' },
  categoryActive: { backgroundColor: '#2a1f5e', borderWidth: 1, borderColor: '#7c6fff' },
  categoryIcon: { fontSize: 24 },
  categoryLabel: { color: '#666', fontSize: 11, marginTop: 4 },
  categoryLabelActive: { color: '#7c6fff' },
  saveBtn: { backgroundColor: '#7c6fff', borderRadius: 18, padding: 18, alignItems: 'center', marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});