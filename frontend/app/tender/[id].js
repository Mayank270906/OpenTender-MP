import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Card from "../../components/Card";
import Navbar from "../../components/Navbar";
import PrimaryButton from "../../components/PrimaryButton";
import { showToast } from "../../components/Toast";
import { COLORS } from "../../constants/theme";
import { generateCommitment, generateSecretKey } from "../../utils/crypto";
import { getCommitment, storeCommitment } from "../../utils/mockChain";

export default function TenderDetail() {
  const { id } = useLocalSearchParams();
  const [bidAmount, setBidAmount] = useState("");
  const [generatedKey, setGeneratedKey] = useState(null);
  const [encrypted, setEncrypted] = useState(false);

  const [revealAmount, setRevealAmount] = useState("");
  const [revealKey, setRevealKey] = useState("");

  // focus states for inputs
  const [bidFocused, setBidFocused] = useState(false);
  const [revealAmountFocused, setRevealAmountFocused] = useState(false);
  const [revealKeyFocused, setRevealKeyFocused] = useState(false);

  const copyKey = async () => {
    if (!generatedKey) return;
    await Clipboard.setStringAsync(generatedKey);
    showToast("Secret key copied to clipboard");
  };

  const handleEncryptBid = () => {
    const secret = generateSecretKey();
    const hash = generateCommitment(bidAmount, secret);
    storeCommitment(id, "0xDemoUser", hash);
    setGeneratedKey(secret);
    setEncrypted(true);
  };

  const handleReveal = () => {
    const stored = getCommitment(id, "0xDemoUser");
    const newHash = generateCommitment(revealAmount, revealKey);

    if (stored === newHash) alert("✅ Reveal Successful!");
    else alert("❌ Hash mismatch");
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Tender #{id}</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Submit Encrypted Bid</Text>
          <TextInput
            placeholder="Bid Amount"
            value={bidAmount}
            onChangeText={setBidAmount}
            style={[styles.input, bidFocused && { borderColor: COLORS.primary }]}
            onFocus={() => setBidFocused(true)}
            onBlur={() => setBidFocused(false)}
          />
          <PrimaryButton title="Encrypt Bid" onPress={handleEncryptBid} style={styles.primaryBtn} />

          {encrypted && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ Bid Encrypted Successfully</Text>
              <Text style={styles.keyLabel}>Secret Key:</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                <Text style={styles.keyValue}>{generatedKey}</Text>
                <Pressable onPress={copyKey} style={{ marginLeft: 10 }}>
                  <Feather name="copy" size={18} color={COLORS.primary} />
                </Pressable>
              </View>
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Reveal Bid</Text>
          <TextInput
            placeholder="Original Bid Amount"
            value={revealAmount}
            onChangeText={setRevealAmount}
            style={[styles.input, revealAmountFocused && { borderColor: COLORS.primary }]}
            onFocus={() => setRevealAmountFocused(true)}
            onBlur={() => setRevealAmountFocused(false)}
          />
          <TextInput
            placeholder="Secret Key"
            value={revealKey}
            onChangeText={setRevealKey}
            style={[styles.input, revealKeyFocused && { borderColor: COLORS.primary }]}
            onFocus={() => setRevealKeyFocused(true)}
            onBlur={() => setRevealKeyFocused(false)}
          />
          <PrimaryButton title="Reveal Bid" onPress={handleReveal} style={styles.primaryBtn} />
        </Card> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 20, fontWeight: "800", marginBottom: 12 },
  card: { padding: 16, borderRadius: 12, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: COLORS.border, padding: 12, borderRadius: 10, marginBottom: 10, backgroundColor: "white" },
  primaryBtn: { marginTop: 6 },
  btnText: { color: "white", fontWeight: "600" },
  successBox: { marginTop: 10, backgroundColor: "#DCFCE7", padding: 12, borderRadius: 10 },
  successText: { color: COLORS.success, fontWeight: "700" },
  keyLabel: { marginTop: 8, fontWeight: "600" },
  keyValue: { marginTop: 6, fontFamily: "monospace", backgroundColor: "#f7f7f7", padding: 8, borderRadius: 6 },
});
