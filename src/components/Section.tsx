import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

const Section: React.FC<SectionProps> = ({
  title,
  children,
  style,
  titleStyle
}) => {
  const { theme } = useTheme();


  const containerStyle = {
    backgroundColor: theme.card,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden' as const,
  };

  const titleTextStyle = {
    fontSize: 20,
    fontWeight: '600' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    ...titleStyle,
    color: theme.text,
  };

  return (
    <View style={[containerStyle, style]}>
      <Text style={titleTextStyle}>{title}</Text>
      {children}
    </View>
  );
};

export default Section;