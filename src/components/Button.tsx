import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
}) => {
  const styles = useThemedStyles(createStyles);


  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.button, styles.secondaryButton, style];
      case 'outline':
        return [styles.button, styles.outlineButton, style];
      case 'danger':
        return [styles.button, styles.dangerButton, style];
      default:
        return [styles.button, styles.primaryButton, style];
    }
  };


  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return [styles.buttonText, styles.outlineButtonText, textStyle];
      case 'secondary':
        return [styles.buttonText, styles.secondaryButtonText, textStyle];
      default:
        return [styles.buttonText, textStyle];
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={[getTextStyle(), disabled && styles.disabledText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: theme.buttonPrimary,
  },
  secondaryButton: {
    backgroundColor: theme.buttonSecondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.buttonPrimary,
  },
  dangerButton: {
    backgroundColor: theme.buttonDanger,
  },
  disabledButton: {
    backgroundColor: theme.buttonSecondary,
    opacity: 0.7,
  },
  buttonText: {
    color: theme.buttonText,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: theme.buttonTextSecondary,
  },
  outlineButtonText: {
    color: theme.buttonPrimary,
  },
  disabledText: {
    color: theme.textSecondary,
  },
});

export default Button;