import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CircleX } from "lucide-react-native";

/* ================= TYPES ================= */

type EditEnquiryModalProps = {
  visible: boolean;
  onClose: () => void;
  item: {
    leadName?: string | null;
    budget: number;
    paymentType: string;
    location: string;
  } | null;
};

/* ================= COMPONENT ================= */

export default function EditEnquiryModal({
  visible,
  onClose,
  item,
}: EditEnquiryModalProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          {/* ================= HEADER ================= */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Enquiry</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <CircleX size={22} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* ================= BODY ================= */}
          <View style={styles.content}>
            <Text style={styles.placeholder}>Edit form will be added here</Text>
          </View>

          {/* ================= FOOTER ================= */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.updateBtn}>
              <Text style={styles.updateText}>Update</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  sheet: {
    height: "40%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },

  header: {
    backgroundColor: "#EFBF04",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholder: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  cancelBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },

  cancelText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 13,
  },

  updateBtn: {
    backgroundColor: "#EFBF04",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  updateText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13,
  },
});
