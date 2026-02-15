import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Navbar from "../components/Navbar";
import PrimaryButton from "../components/PrimaryButton";
import { COLORS } from "../constants/theme";

export default function CreateTender() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minBid, setMinBid] = useState("");
  const [biddingDeadline, setBiddingDeadline] = useState("");
  const [revealDeadline, setRevealDeadline] = useState("");

  const handleCreate = () => {
    if (!title || !description || !minBid || !biddingDeadline || !revealDeadline) {
      alert("Please fill all fields");
      return;
    }

    alert("Tender Created (UI only for now)");
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Navbar />
      <View style={styles.container}>
        <Text style={styles.heading}>Create New Tender</Text>

        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />

        <TextInput
          placeholder="Minimum Bid Amount"
          value={minBid}
          onChangeText={setMinBid}
          style={styles.input}
        />

        <TextInput
          placeholder="Bidding Deadline (e.g. Nov 6 7:14 PM)"
          value={biddingDeadline}
          onChangeText={setBiddingDeadline}
          style={styles.input}
        />

        <TextInput
          placeholder="Reveal Deadline (e.g. Nov 6 7:20 PM)"
          value={revealDeadline}
          onChangeText={setRevealDeadline}
          style={styles.input}
        />

        <PrimaryButton title="Create Tender" onPress={handleCreate} style={styles.button} icon="plus" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 20, fontWeight: "800", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "white",
  },
  textarea: { height: 120, textAlignVertical: "top" },
  button: { marginTop: 8 },
});
