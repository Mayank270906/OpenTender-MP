import { Feather } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/theme";

export default function PrimaryButton({ title, onPress, style, icon }) {
  const anim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(anim, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={style}>
      <Animated.View style={[styles.btn, { transform: [{ scale: anim }] }]}> 
        <View style={styles.content}>
          {icon ? <Feather name={icon} size={16} color="white" style={{ marginRight: 8 }} /> : null}
          <Text style={styles.text}>{title}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  content: { flexDirection: "row", alignItems: "center" },
  text: { color: "white", fontWeight: "700" },
});