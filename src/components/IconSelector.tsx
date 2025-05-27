import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
  icons?: string[];
  style?: ViewStyle;
  title?: string;
}

const defaultIcons = ['💧', '🏃', '💪', '😊', '🐕', '📘', '🍎', '🧘', '💤', '🧹'];

const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onIconSelect,
  icons = defaultIcons,
  style,
  title = "Choose an icon"
}) => {
  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {icons.map((icon, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.iconOption,
              selectedIcon === icon && styles.selectedIconOption,
            ]}
            onPress={() => onIconSelect(icon)}
          >
            <Text style={styles.icon}>{icon}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  scrollView: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIconOption: {
    backgroundColor: '#E1F5FE',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  icon: {
    fontSize: 24,
  },
});

export default IconSelector;