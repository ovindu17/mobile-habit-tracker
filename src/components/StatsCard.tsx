import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface StatsCardProps {
  icon: string;
  value: string | number;
  label: string;
  style?: ViewStyle;
  valueStyle?: TextStyle;
  labelStyle?: TextStyle;
  iconStyle?: TextStyle;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  value,
  label,
  style,
  valueStyle,
  labelStyle,
  iconStyle
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.icon, iconStyle]}>{icon}</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 100,
  },
  icon: {
    fontSize: 30,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default StatsCard;