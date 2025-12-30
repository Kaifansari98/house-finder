import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Calendar, CircleX, StickyNote, User } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { selectAuthData, useAuthStore } from "@/stores/auth-store";
import {
  useLeadNotes,
  useSaveLeadNote,
} from "@/hooks/leadAction/useLeadAction";
import Toast from "@/components/Toast";
import { triggerLocalLeadNoteNotification } from "@/lib/notifications/notifications";

/* ================= TYPES ================= */

type Props = {
  visible: boolean;
  onClose: () => void;
  leadId: string;
};

/* ================= ZOD ================= */

const saveLeadNoteSchema = z.object({
  notes_comments: z
    .string()
    .trim()
    .min(1, "Notes are required")
    .min(5, "Notes must be at least 5 characters"),
});

/* ================= COMPONENT ================= */

export default function LeadNotesModal({ visible, onClose, leadId }: Props) {
  const authData = useAuthStore(selectAuthData);
  const userId = authData?.encrypted_user_id;

  const { mutate, isPending } = useSaveLeadNote();
  const { data: notesList, isLoading } = useLeadNotes(leadId, userId);

  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  /* ================= TOAST ================= */

  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error";
    text: string;
  }>({
    visible: false,
    type: "success",
    text: "",
  });

  useEffect(() => {
    if (!toast.visible) return;
    const t = setTimeout(
      () => setToast((p) => ({ ...p, visible: false })),
      2200
    );
    return () => clearTimeout(t);
  }, [toast.visible]);

  /* ================= SAVE ================= */

  const handleSaveNotes = () => {
    setError(null);

    if (!userId || !leadId) {
      setToast({
        visible: true,
        type: "error",
        text: "User or Lead reference missing",
      });
      return;
    }

    const result = saveLeadNoteSchema.safeParse({
      notes_comments: notes,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    mutate(
      {
        user_id: userId,
        lead_id: leadId,
        notes_comments: result.data.notes_comments,
      },
      {
        onSuccess: async () => {
          setNotes("");

          await triggerLocalLeadNoteNotification(leadId);
          setToast({
            visible: true,
            type: "success",
            text: "Note added successfully",
          });
        },
        onError: () => {
          setToast({
            visible: true,
            type: "error",
            text: "Failed to save note",
          });
        },
      }
    );
  };

  const isEmpty = !isLoading && (!notesList || notesList.length === 0);

  /* ================= UI ================= */

  return (
    <>
      <Toast visible={toast.visible} type={toast.type} text={toast.text} />

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <SafeAreaView style={styles.sheet}>
            {/* ================= HEADER ================= */}
            <View style={styles.header}>
              <Text style={styles.title}>Lead Notes</Text>
              <TouchableOpacity onPress={onClose} hitSlop={10}>
                <CircleX size={22} color="#0f172a" />
              </TouchableOpacity>
            </View>

            {/* ================= BODY ================= */}
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* ===== INPUT ===== */}
              <View style={styles.field}>
                <Text style={styles.label}>Notes *</Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    error && styles.inputError,
                  ]}
                  placeholder="Write lead notes here..."
                  multiline
                  value={notes}
                  onChangeText={(t) => {
                    setNotes(t);
                    if (error) setError(null);
                  }}
                />

                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>

              {/* ===== ACTIONS ===== */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={isPending}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, isPending && styles.disabled]}
                  onPress={handleSaveNotes}
                  disabled={isPending}
                >
                  <Text style={styles.saveText}>
                    {isPending ? "Saving..." : "Save Notes"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ===== CONTENT AREA ===== */}
              <View
                style={[
                  styles.listWrapper,
                  (isLoading || isEmpty) && styles.centerContent,
                ]}
              >
                {isLoading && (
                  <View
                    style={{
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator size="small" color="#6b7280" />
                    <Text>Loading...</Text>
                  </View>
                )}

                {isEmpty && (
                  <View style={styles.emptyState}>
                    <StickyNote size={36} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No notes found</Text>
                  </View>
                )}

                {!isLoading &&
                  notesList &&
                  notesList.length > 0 &&
                  notesList.map((item, index) => (
                    <View key={index} style={styles.activityCard}>
                      <View style={styles.rowBetween}>
                        <View style={styles.row}>
                          <User size={16} color="#9CA3AF" />
                          <Text style={styles.leadNotesName}>
                            {item.fullname}
                          </Text>
                        </View>

                        <View style={styles.row}>
                          <Calendar size={16} color="#9CA3AF" />
                          <Text style={styles.dateText}>{item.date}</Text>
                        </View>
                      </View>

                      <View style={styles.noteContainer}>
                        <View style={styles.row}>
                          <StickyNote size={16} color="#9CA3AF" />
                          <Text style={styles.noteLabel}>Note:</Text>
                        </View>
                        <Text style={styles.noteText}>{item.note_details}</Text>
                      </View>
                    </View>
                  ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

/* ============================ STYLES ============================ */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  sheet: {
    height: "80%",
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

  scroll: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    color: "#0f172a",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },

  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },

  inputError: {
    borderColor: "#dc2626",
  },

  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },

  cancelBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  cancelText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 13,
  },

  saveBtn: {
    backgroundColor: "#EFBF04",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },

  disabled: {
    opacity: 0.6,
  },

  saveText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 13,
  },

  listWrapper: {
    marginTop: 20,
    minHeight: 250,
  },

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  activityCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  leadNotesName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },

  dateText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },

  noteContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#6b7280",
  },

  noteLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },

  noteText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    lineHeight: 18,
  },

  emptyState: {
    alignItems: "center",
    opacity: 0.85,
  },

  emptyText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
});
