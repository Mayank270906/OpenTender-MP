import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Navbar from "../components/Navbar";
import PrimaryButton from "../components/PrimaryButton";
import { COLORS } from "../constants/theme";
import { getTimeLeft } from "../utils/time";


export default function Home() {
  const router = useRouter();

  const [now, setNow] = useState(Date.now());

useEffect(() => {
  const timer = setInterval(() => setNow(Date.now()), 1000);
  return () => clearInterval(timer);
}, []);


  const tenders = [
  {
    id: 1,
    title: "Road Construction",
    minBid: "1 ETH",
    biddingDeadline: "2026-02-06T19:14:00",
    revealDeadline: "2026-02-07T14:20:00",
    bidders: 0,
  },
  {
    id: 2,
    title: "City Bridge Repair",
    minBid: "2 ETH",
    biddingDeadline: "2026-03-01T17:00:00",
    revealDeadline: "2026-03-02T13:10:00",
    bidders: 0,
  },
  {
    id: 3,
    title: "Highway Lighting Upgrade",
    minBid: "0.5 ETH",
    biddingDeadline: "2026-02-04T16:20:00",
    revealDeadline: "2026-02-04T16:50:00",
    bidders: 0,
  },
];


  return (
    <View style={styles.page}>
      <Navbar />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.heading}>Active Tenders</Text>
            <Text style={styles.subheading}>
              Browse and participate in blockchain-secured tenders
            </Text>
          </View>

          <PrimaryButton
            title="Create Tender"
            icon="plus"
            onPress={() => router.push("/create")}
            style={styles.createBtn}
          />
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color="#888" style={{ marginLeft: 8 }} />
          <TextInput placeholder="Search tenders..." style={styles.searchInput} />
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={[styles.cell, styles.headerCell]}>ID</Text>
            <Text style={[styles.cell, styles.headerCell]}>Title</Text>
            <Text style={[styles.cell, styles.headerCell]}>Min Bid</Text>
            <Text style={[styles.cell, styles.headerCell]}>Bid Deadline</Text>
            <Text style={[styles.cell, styles.headerCell]}>Reveal Deadline</Text>
            <Text style={[styles.cell, styles.headerCell]}>Bidders</Text>
            <Text style={[styles.cell, styles.headerCell]}>Action</Text>
          </View>

          {tenders.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.cell}>{item.id}</Text>
              <Text style={styles.cell}>{item.title}</Text>
              <Text style={styles.cell}>{item.minBid}</Text>
              {/* <Text style={styles.cell}>{item.biddingDeadline}</Text>
              <Text style={styles.cell}>{item.revealDeadline}</Text> */}
              <Text style={styles.cell}>{getTimeLeft(item.biddingDeadline)}</Text>
            <Text style={styles.cell}>{getTimeLeft(item.revealDeadline)}</Text>

              <Text style={styles.cell}>{item.bidders}</Text>

              <View style={styles.cell}>
                <PrimaryButton
                  title="View"
                  onPress={() => router.push(`/tender/${item.id}`)}
                  style={styles.tableBtn}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20 },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  heading: { fontSize: 24, fontWeight: "800" },
  subheading: { color: "#6B7280", marginTop: 4 },

  createBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  searchInput: { flex: 1, padding: 10, paddingLeft: 8 },

  table: {
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },

  tableHeader: { backgroundColor: "#F3F4F6" },

  cell: { flex: 1, fontSize: 13, color: COLORS.text },

  headerCell: {
    fontWeight: "700",
    fontSize: 12,
    color: "#6B7280",
  },

  tableBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});
