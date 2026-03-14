import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Transaction = {
  id: string;
  amount: string;
  note: string;
  category: string;
  type: 'expense' | 'income';
  date: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      const data = await AsyncStorage.getItem('transactions');
      if (data) setTransactions(JSON.parse(data));
    } catch (e) {
      console.log('Error loading', e);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.greeting}>👋 Hello!</Text>
        <Text style={styles.subtitle}>Your Financial Overview</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
        <View style={styles.row}>
          <View style={styles.incomeBox}>
            <Text style={styles.boxLabel}>Income</Text>
            <Text style={styles.incomeText}>+${totalIncome.toFixed(2)}</Text>
          </View>
          <View style={styles.expenseBox}>
            <Text style={styles.boxLabel}>Expenses</Text>
            <Text style={styles.expenseText}>-${totalExpenses.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/add-expense')}>
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionLabel}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/charts')}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionLabel}>View Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/ai-advice')}>
          <Text style={styles.actionIcon}>🤖</Text>
          <Text style={styles.actionLabel}>AI Advice</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      {transactions.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No transactions yet!</Text>
          <Text style={styles.emptySubtext}>Tap ➕ to add your first one</Text>
        </View>
      )}

      {[...transactions].reverse().slice(0, 10).map((item) => (
        <View key={item.id} style={styles.transactionItem}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionName}>{item.category} {item.note ? `— ${item.note}` : ''}</Text>
            <Text style={styles.transactionDate}>{item.date}</Text>
          </View>
          <Text style={[styles.transactionAmount,
            item.type === 'income' ? styles.positive : styles.negative]}>
            {item.type === 'income' ? '+' : '-'}${parseFloat(item.amount).toFixed(2)}
          </Text>
        </View>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20 },
  header: { marginTop: 50, marginBottom: 20 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  balanceCard: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 24, marginBottom: 24 },
  balanceLabel: { color: '#888', fontSize: 14 },
  balanceAmount: { color: '#fff', fontSize: 42, fontWeight: 'bold', marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  incomeBox: { backgroundColor: '#0d2b1f', borderRadius: 12, padding: 12, flex: 0.48 },
  expenseBox: { backgroundColor: '#2b0d0d', borderRadius: 12, padding: 12, flex: 0.48 },
  boxLabel: { color: '#888', fontSize: 12 },
  incomeText: { color: '#4caf50', fontSize: 18, fontWeight: 'bold' },
  expenseText: { color: '#f44336', fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
  actionBtn: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, alignItems: 'center', flex: 0.3 },
  actionIcon: { fontSize: 24 },
  actionLabel: { color: '#aaa', fontSize: 11, marginTop: 6, textAlign: 'center' },
  emptyBox: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 30, alignItems: 'center' },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptySubtext: { color: '#666', fontSize: 13, marginTop: 6 },
  transactionItem: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  transactionInfo: { flex: 1 },
  transactionName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  transactionDate: { color: '#666', fontSize: 12, marginTop: 2 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  positive: { color: '#4caf50' },
  negative: { color: '#f44336' },
});