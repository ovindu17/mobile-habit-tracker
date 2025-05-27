import React, {useState, useEffect} from 'react';
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
import {validateEmail} from '../utils/helpers';
import {
  Button,
  Card,
  HeaderTitle,
  TextInput
} from '../components';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    checkAutoLogin();
  }, []);

  const checkAutoLogin = async () => {
    try {
      const currentUser = await StorageService.getCurrentUser();
      if (currentUser) {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      console.error('Auto-login check failed:', error);
    }
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const users = await StorageService.getUsers();
      const user = users.find(
        (u: any) => u.email === email.toLowerCase().trim() && u.password === password,
      );

      if (user) {
        await StorageService.saveCurrentUser(user);
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
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
            title="Welcome Back!"
            subtitle="Sign in to continue building your habits"
          />
        </View>

        <Card style={styles.formContainer}>
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
            placeholder="Enter your password"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Button
            title={loading ? 'Signing In...' : 'Sign In'}
            onPress={handleLogin}
            disabled={loading}
            style={styles.button}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}>
              Create Account
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;