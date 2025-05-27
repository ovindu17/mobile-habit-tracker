import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

interface SettingItemProps {
  icon: string;
  label: string;
  action?: string;
  onPress: () => void;
  isLast?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  actionStyle?: TextStyle;
  iconStyle?: TextStyle;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  action,
  onPress,
  isLast = false,
  style,
  labelStyle,
  actionStyle,
  iconStyle
}) => {
  const styles = useThemedStyles(createStyles);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isLast && styles.lastItem,
        style
      ]}
      onPress={onPress}
    >
      <View style={styles.labelContainer}>
        <Text style={[styles.icon, iconStyle]}>{icon}</Text>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      </View>
      {action && (
        <Text style={[styles.action, actionStyle]}>{action}</Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    color: theme.text,
  },
  action: {
    fontSize: 16,
    color: theme.primary,
  },
});

export default SettingItem;