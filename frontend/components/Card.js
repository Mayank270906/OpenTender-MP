import { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

export default function Card({ children, style, onPress }) {
  const anim = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(anim, { toValue: 0.995, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();

  if (onPress) {
    return (
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={[styles.card, { transform: [{ scale: anim }] }, style]}>{children}</Animated.View>
      </Pressable>
    );
  }

  return <Animated.View style={[styles.card, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
});