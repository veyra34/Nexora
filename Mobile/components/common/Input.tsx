import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={Colors.dark.textSecondary}
            style={styles.icon}
          />
        )}
        <TextInput
          placeholderTextColor={Colors.dark.textMuted}
          style={[styles.input, style]}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    paddingHorizontal: 14,
    height: 48,
  },
  inputError: {
    borderColor: Colors.dark.error,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 15,
  },
  rightIcon: {
    padding: 4,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
