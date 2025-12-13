import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ArrowUpRight, TrendingUp } from "lucide-react-native";

type StatsCardsProps = {
  totalLeads?: number;
  missedFollowup?: number;
  todayFollowup?: number;
  futureFollowup?: number;
};

export default function StatsCards({
  totalLeads,
  missedFollowup,
  todayFollowup,
  futureFollowup,
}: StatsCardsProps) {
  const cards = [
    { title: "Total Lead's", value: totalLeads, trendColor: "#10b981" }, // green
    { title: "Missed Follow up's", value: missedFollowup, trendColor: "#ef4444" }, // red
    { title: "Today Follow up's", value: todayFollowup, trendColor: "#eab308" }, // yellow
    { title: "Future Follow up's", value: futureFollowup, trendColor: "#3b82f6" }, // blue
  ].filter((card) => card.value !== undefined && card.value !== null);

  if (cards.length === 0) return null;

  return (
    <View style={styles.grid}>
      {cards.map((item) => {
        return (
          <View key={item.title} style={styles.card}>
            <View style={styles.cardContent}>
              {/* Top Row: Value + Trend + Arrow Icon */}
              <View style={styles.topRow}>
                {/* Bottom: Title */}
                <View style={{ width: "60%" }}>
                  <Text style={styles.title}>{item.title}</Text>
                </View>

                {/* Right Side: Arrow Icon */}
                <View style={styles.iconContainer}>
                  <ArrowUpRight size={18} color="#18181b" strokeWidth={2} />
                </View>
              </View>

              {/* Left Side: Value + Trend */}
              <View style={styles.leftContent}>
                <Text style={styles.value}>{item.value}</Text>
                {item.value && item.value > 0 && (
                  <TrendingUp
                    size={14}
                    color={item.trendColor}
                    strokeWidth={2.5}
                    style={{ marginBottom: 3, marginLeft: 4 }}
                  />
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginVertical: 10,
    paddingHorizontal: 0,
  },
  card: {
    flex: 1,
    minWidth: "48%",
    maxWidth: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  cardContent: {
    padding: 18,
    gap: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  leftContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: "#18181b",
    letterSpacing: -0.8,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
    letterSpacing: 0.2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    color: "#71717a",
  },
});
