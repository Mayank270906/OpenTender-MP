import { Feather } from "@expo/vector-icons";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/theme";
import Toast from "./Toast";

export default function Navbar() {
  return (
    <SafeAreaView style={styles.navbar}>
      <Text style={styles.logo}>  OpenTender Decentralized System </Text>
{/* 
      <View style={styles.navLinks}>
        <Text style={styles.link}>Home</Text>
        <Text style={styles.link}>Create</Text>
      </View> */}

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity style={[styles.walletBtn, { flexDirection: "row", alignItems: "center" }]}> 
          <Feather name="user" size={14} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.walletText}>Connect</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  navbar: {
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 18,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    textAlign:"center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  logo: { color: "white", fontSize: 20, fontWeight: "800", textAlign:"center" },
  navLinks: { flexDirection: "row" },
  link: { color: "white", fontWeight: "600", marginHorizontal: 8 },
  walletBtn: {
    backgroundColor: "white",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  walletText: { color: COLORS.primary, fontWeight: "700" },
});
