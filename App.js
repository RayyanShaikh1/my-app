import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import OpenAI from 'openai';
import { Ionicons } from '@expo/vector-icons';

const openai = new OpenAI({ apiKey: 'YOUR_API_KEY' }); // Replace 'YOUR_API_KEY' with your actual API key

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // You can add logic here for authentication
    Alert.alert('Login Attempt', `Username: ${username}, Password: ${password}`);
    // Navigate to Tabs after login attempt
    navigation.navigate('Tabs');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <StatusBar style="auto" />
    </View>
  );
}

function HealthScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Health</Text>
      <Text>Welcome to the Health Screen!</Text>
    </View>
  );
}

function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessages = [...messages, { text: inputText, sender: 'user' }];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Replace with your desired model
        messages: [
          { role: 'system', content: 'You are a helpful assistant knowledgeable about medical topics.' },
          { role: 'user', content: inputText }
        ],
      });

      const reply = completion.choices[0].message.content; // Get the bot's reply
      setMessages([...newMessages, { text: reply, sender: 'bot' }]);
    } catch (error) {
      setMessages([...newMessages, { text: 'Error fetching response. Please try again.', sender: 'bot' }]);
      console.error('OpenAI API Error:', error);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat Screen</Text>
      <ScrollView style={styles.chatContainer}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.message,
              msg.sender === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <TextInput
        style={styles.input}
        placeholder="Ask a medical question..."
        value={inputText}
        onChangeText={setInputText}
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
}

function ProfileSettingsScreen({ navigation }) {
  const handleLogout = () => {
    // Logic for logging out, if any
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator initialRouteName="Health">
      <Tab.Screen name="Health" component={HealthScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={TabNavigator} />
      <Drawer.Screen name="Profile Settings" component={ProfileSettingsScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Tabs" component={DrawerNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  chatContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 12,
  },
  message: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#cce5ff',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#e2e3e5',
    alignSelf: 'flex-start',
  },
});
