import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

type ScreenNavbarProps = {
  title: string;
  onBack?: () => void;
};

export default function ScreenNavbar({ title, onBack }: ScreenNavbarProps) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) return onBack();
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconBtn} onPress={handleBack} activeOpacity={0.8}>
        <ArrowLeft size={20} color="#0f172a" strokeWidth={2.4} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginHorizontal: 12,
  },
  placeholder: { width: 36 },
});
