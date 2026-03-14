import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

export default function AIAdviceScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: "👋 Hi! I'm your AI financial advisor. Ask me anything about your spending, savings, or budgeting!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const data = await AsyncStorage.getItem('transactions');
      const transactions = data ? JSON.parse(data) : [];

      const totalIncome = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

      const totalExpenses = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

      const transactionSummary = transactions.length > 0
        ? `User has ${transactions.length} transactions. Total income: $${totalIncome.toFixed(2)}, Total expenses: $${totalExpenses.toFixed(2)}, Balance: $${(totalIncome - totalExpenses).toFixed(2)}. Recent transactions: ${transactions.slice(-5).map((t: any) => `${t.type} $${t.amount} for ${t.category}`).join(', ')}.`
        : 'User has no transactions yet.';

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are a helpful personal finance advisor. Keep responses short, friendly and practical. Here is the user's financial data: ${transactionSummary}`
            },
            ...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) !== 0),
            { role: 'user', content: userMessage }
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Groq API Error:', errorData);
        setMessages(prev => [...prev, { role: 'assistant', content: `API Error: ${errorData?.error?.message || response.status}` }]);
        setLoading(false);
        return;
      }

      const result = await response.json();
      const aiReply = result.choices?.[0]?.message?.content || 'Sorry, I could not get a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);

    } catch (e: any) {
      console.log('Fetch Error:', e);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🤖 AI Advisor</Text>
      </View>

      <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent}>
        {messages.map((msg, index) => (
          <View key={index} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.bubbleText, msg.role === 'user' ? styles.userText : styles.aiText]}>
              {msg.content}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.aiBubble}>
            <ActivityIndicator color="#7c6fff" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about your finances..."
          placeholderTextColor="#444"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    marginTop: 50,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  backBtn: {
    color: '#7c6fff',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatContent: {
    paddingVertical: 10,
    gap: 12,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 14,
  },
  aiBubble: {
    backgroundColor: '#1a1a2e',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#7c6fff',
    alignSelf: 'flex-end',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aiText: {
    color: '#fff',
  },
  userText: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    color: '#fff',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: '#7c6fff',
    borderRadius: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});