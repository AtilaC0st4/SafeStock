import React from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet, ActivityIndicator } from 'react-native';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false 
}) => {
  const buttonAnimation = new Animated.Value(1);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    animateButton();
    onPress();
  };

  return (
    <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonAnimation }] }]}>
      <TouchableOpacity
        style={[styles.actionButton, disabled && styles.disabled]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    marginTop: 30,
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
});

export default AnimatedButton;