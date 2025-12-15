import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { Check, AlertTriangle, Info } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastType = "success" | "error" | "warning" | "info";

type ToastProps = {
  visible: boolean;
  type: ToastType;
  text: string;
};

const typeColors: Record<ToastType, string> = {
  success: "#16a34a",
  error: "#dc2626",
  warning: "#d97706",
  info: "#0284c7",
};

const typeIcons: Record<ToastType, React.ComponentType<any>> = {
  success: Check,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

export default function Toast({ visible, type, text }: ToastProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const Icon = typeIcons[type];
  const color = typeColors[type];

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View pointerEvents="none" style={[styles.wrapper, { top: insets.top + 12 }]}>
        <View style={styles.toast}>
          <View style={[styles.iconCircle, { backgroundColor: color }]}>
            <Icon size={16} color="#fff" strokeWidth={2.5} />
          </View>
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    gap: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
  },
});
