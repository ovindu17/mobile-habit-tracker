import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import {StorageService} from '../services/storageService';
import {validateEmail, generateId} from '../utils/helpers';
import {
  TextInput,
  Button,
  Card,
  HeaderTitle
} from '../components';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Register'
>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {

      const existingUsers = await StorageService.getUsers();
      const userExists = existingUsers.find((user: any) => user.email === email);

      if (userExists) {
        Alert.alert('Error', 'An account with this email already exists');
        setLoading(false);
        return;
      }


      const newUser = {
        id: generateId(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
      };


      await StorageService.saveUser(newUser);
      await StorageService.saveCurrentUser(newUser);

      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.replace('MainTabs'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <HeaderTitle
            title="Create Account"
            subtitle="Sign up to start building better habits!"
          />
        </View>

        <Card style={styles.formContainer}>
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            autoCapitalize="words"
            returnKeyType="next"
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
            returnKeyType="next"
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          <Button
            title={loading ? 'Creating Account...' : 'Create Account'}
            onPress={handleRegister}
            disabled={loading}
            style={styles.button}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Text
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}>
              Sign In
            </Text>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  formContainer: {
    padding: 24,
  },
  button: {
    marginTop: 12,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;