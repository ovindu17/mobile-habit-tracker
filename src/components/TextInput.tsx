import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme, useTheme } from '../contexts/ThemeContext';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={theme.textTertiary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: theme.surface,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  inputFocused: {
    borderColor: theme.primary,
    backgroundColor: theme.surface,
  },
  inputError: {
    borderColor: theme.error,
  },
  errorText: {
    color: theme.error,
    fontSize: 14,
    marginTop: 4,
  },
});

export default TextInput;