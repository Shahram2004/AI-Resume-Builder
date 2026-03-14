import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = ['#7c6fff', '#f44336', '#4caf50', '#ff9800', '#00bcd4', '#e91e63', '#9c27b0', '#607d8b'];

type Transaction = {
  id: string;
  amount: string;
  note: string;
  category: string;
  type: 'expense' | 'income';
  date: string;
};

export default function ChartsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await AsyncStorage.getItem('transactions');
      if (data) setTransactions(JSON.parse(data));
    } catch (e) {
      console.log('Error loading', e);
    }
  };

  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  // Group by category
  const categoryMap: { [key: string]: number } = {};
  expenses.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + parseFloat(t.amount);
  });

  const categoryData = Object.keys(categoryMap).map((key, index) => ({
    name: key,
    amount: categoryMap[key],
    color: COLORS[index % COLORS.length],
    percent: totalExpenses > 0 ? (categoryMap[key] / totalExpenses) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);

  // Last 6 days
  const last6Days = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (5 - i));
    return d.toLocaleDateString();
  });

  const dailyExpenses = last6Days.map(day => ({
    label: day.split('/').slice(0, 2).join('/'),
    amount: transactions
      .filter(t => t.date === day && t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0),
  }));

  const maxDaily = Math.max(...dailyExpenses.map(d => d.amount), 1);

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📊 Reports</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.row}>
        <View style={[styles.summaryCard, { flex: 1 }]}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.incomeText}>+${totalIncome.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, { flex: 1 }]}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={styles.expenseText}>-${totalExpenses.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, { flex: 1 }]}>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={[styles.incomeText, { color: balance >= 0 ? '#4caf50' : '#f44336' }]}>
            ${balance.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Daily Bar Chart */}
      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>Daily Spending (Last 6 Days)</Text>
        <View style={styles.barChart}>
          {dailyExpenses.map((day, index) => (
            <View key={index} style={styles.barColumn}>
              <Text style={styles.barValue}>
                {day.amount > 0 ? `$${day.amount.toFixed(0)}` : ''}
              </Text>
              <View style={styles.barWrapper}>
                <View style={[styles.bar, {
                  height: Math.max((day.amount / maxDaily) * 120, day.amount > 0 ? 4 : 0),
                  backgroundColor: COLORS[index % COLORS.length],
                }]} />
              </View>
              <Text style={styles.barLabel}>{day.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Category Breakdown */}
      {categoryData.length > 0 ? (
        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>Spending by Category</Text>
          {categoryData.map((item, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.categoryName}>{item.name}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, {
                  width: `${item.percent}%` as any,
                  backgroundColor: item.color,
                }]} />
              </View>
              <Text style={styles.categoryPercent}>{item.percent.toFixed(0)}%</Text>
              <Text style={styles.categoryAmount}>${item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No expense data yet!</Text>
          <Text style={styles.emptySubtext}>Add some expenses to see charts</Text>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20 },
  header: { marginTop: 50, marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { color: '#7c6fff', fontSize: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 14 },
  summaryLabel: { color: '#888', fontSize: 11, marginBottom: 6 },
  incomeText: { color: '#4caf50', fontSize: 16, fontWeight: 'bold' },
  expenseText: { color: '#f44336', fontSize: 16, fontWeight: 'bold' },
  chartBox: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 16, marginBottom: 20 },
  chartTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 180 },
  barColumn: { alignItems: 'center', flex: 1 },
  barValue: { color: '#aaa', fontSize: 10, marginBottom: 4 },
  barWrapper: { height: 120, justifyContent: 'flex-end', width: '70%' },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { color: '#666', fontSize: 10, marginTop: 6, textAlign: 'center' },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  categoryName: { color: '#fff', fontSize: 13, width: 70 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: '#0f0f1a', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: 4 },
  categoryPercent: { color: '#888', fontSize: 12, width: 35, textAlign: 'right' },
  categoryAmount: { color: '#f44336', fontSize: 13, fontWeight: 'bold', width: 65, textAlign: 'right' },
  emptyBox: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 30, alignItems: 'center' },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptySubtext: { color: '#666', fontSize: 13, marginTop: 6 },
});