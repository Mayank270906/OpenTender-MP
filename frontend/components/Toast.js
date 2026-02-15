import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text } from "react-native";

let _show;
export function showToast(message) {
  if (_show) _show(message);
}

export default function Toast() {
  const [message, setMessage] = useState("");
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    _show = (msg) => {
      setMessage(msg);
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(1400),
        Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => setMessage(""));
    };

    return () => {
      _show = null;
    };
  }, [anim]);

  if (!message) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 8] });

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }], opacity: anim }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    maxWidth: width - 40,
    zIndex: 99,
  },
  text: { color: "white", fontWeight: "600" },
});