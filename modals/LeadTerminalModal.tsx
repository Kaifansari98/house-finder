import DateTimePicker from "@react-native-community/datetimepicker";
import { useQueryClient } from "@tanstack/react-query";
import { CircleX, Calendar, Tag, StickyNote } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useLeadActivities,
  useSaveLeadActivity,
} from "@/hooks/leadAction/useLeadAction";
import { useMastersData } from "@/hooks/sidebar/masters/useMastersData";
import { selectAuthData, useAuthStore } from "@/stores/auth-store";
import SelectField from "./SmartDropDown";
import Toast from "@/components/Toast";
import { ScrollView } from "react-native-gesture-handler";

type Props = {
  visible: boolean;
  onClose: () => void;
  leadId: string;
  referenceNo: string;
};

export default function LeadTerminalModal({
  leadId,
  referenceNo,
  visible,
  onClose,
}: Props) {
  /* ================= GLOBAL ================= */
  const authData = useAuthStore(selectAuthData);
  const userId = authData?.encrypted_user_id;
  const queryClient = useQueryClient();

  const { data } = useLeadActivities({
    lead_id: leadId,
    user_id: userId!,
  });

  const activities = data?.data.lead_activities ?? [];
  const { mutate: saveActivity, isPending } = useSaveLeadActivity();

  /* ================= TOAST ================= */
  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    text: string;
  }>({
    visible: false,
    type: "success",
    text: "",
  });

  const showToast = (
    type: "success" | "error" | "warning" | "info",
    text: string
  ) => {
    setToast({ visible: true, type, text });
    setTimeout(
      () => setToast({ visible: false, type: "success", text: "" }),
      2500
    );
  };

  /* ================= FORM STATE ================= */
  const [activityType, setActivityType] = useState<string>();
  const [activityNotes, setActivityNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  /* ================= MASTERS ================= */
  const { leadActivityTypeQuery } = useMastersData();

  const activityTypeOptions = useMemo(
    () =>
      leadActivityTypeQuery.data?.data.lead_activity_type?.map((item) => ({
        label: String(item.history_type_name),
        value: String(item.history_type_id),
      })) ?? [],
    [leadActivityTypeQuery.data]
  );

  /* ================= HELPERS ================= */
  const getInitials = (name: string) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(
      2,
      "0"
    )}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  /* ================= DATE HANDLERS ================= */
  const onDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (!date) return;
    setFollowUpDate(date);
    setShowTimePicker(true);
  };

  const onTimeChange = (_: any, time?: Date) => {
    setShowTimePicker(false);
    if (!time || !followUpDate) return;
    const final = new Date(followUpDate);
    final.setHours(time.getHours(), time.getMinutes(), 0);
    setFollowUpDate(final);
  };

  /* ================= SAVE ================= */
  const handleSave = () => {
    if (!userId || !activityType || !followUpDate || !activityNotes.trim()) {
      showToast("error", "Please fill all required fields");
      return;
    }

    saveActivity(
      {
        lead_id: leadId,
        user_id: userId,
        activity_type: Number(activityType),
        activity_notes: activityNotes,
        followup_date: followUpDate.toISOString(),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["lead-activities", leadId],
          });
          setActivityType(undefined);
          setActivityNotes("");
          setFollowUpDate(null);
          showToast("success", "Activity saved successfully");
        },
        onError: () => showToast("error", "Failed to save activity"),
      }
    );
  };

  /* ================= ACTIVITY CARD ================= */
  const renderActivityCard = ({ item }: any) => (
    <View style={styles.activityCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(item.display_name)}
          </Text>
        </View>
        <View style={styles.headerTextBlock}>
          <Text style={styles.displayName}>{item.display_name}</Text>
          <Text style={styles.historyId}>{item.history_id}</Text>
        </View>
      </View>

      <View style={styles.infoRowFlex}>
        <View style={styles.infoRow}>
          <Tag size={16} color="#9CA3AF" />
          <Text style={styles.activityType}>{item.history_type_name}</Text>
        </View>
        {item.followup && (
          <View style={styles.infoRow}>
            <Calendar size={16} color="#9CA3AF" />
            <Text>{formatDate(item.followup)}</Text>
          </View>
        )}
      </View>

      {item.note && (
        <View style={styles.noteContainer}>
          <View style={styles.noteHeader}>
            <StickyNote size={16} color="#9CA3AF" />
            <Text style={styles.noteLabel}>Note:</Text>
          </View>
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      )}
    </View>
  );

  /* ================= UI ================= */
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Lead Terminal : {referenceNo}</Text>
            <TouchableOpacity onPress={onClose}>
              <CircleX size={22} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={{ padding: 10 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ================= FORM ================= */}
            <View style={styles.formContainer}>
              <SelectField
                label="Activity Type"
                required
                options={activityTypeOptions}
                value={activityType}
                loading={leadActivityTypeQuery.isLoading}
                onChange={setActivityType}
              />

              <View style={styles.field}>
                <Text style={styles.label}>Follow-up Date & Time</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>
                    {followUpDate
                      ? followUpDate.toLocaleString()
                      : "Select date & time"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Activity Notes <Text style={{ color: "#EF4444" }}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={activityNotes}
                  onChangeText={setActivityNotes}
                  multiline
                  placeholder="Write activity details here..."
                />
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSave}
                  disabled={isPending}
                >
                  <Text style={styles.saveText}>
                    {isPending ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>

              {activities.length > 0 && (
                <View style={styles.separator}>
                  <Text style={styles.separatorText}>Activity History</Text>
                </View>
              )}
            </View>

            {/* ================= ACTIVITY LIST ================= */}
            <View style={{ paddingBottom: 25 }}>
              {activities.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No activities yet</Text>
                </View>
              ) : (
                activities.map((item, index) => (
                  <View key={`activity-${item.history_id}-${index}`}>
                    {renderActivityCard({ item })}
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* LIST */}
        </SafeAreaView>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={followUpDate ?? new Date()}
          mode="date"
          onChange={onDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={followUpDate ?? new Date()}
          mode="time"
          onChange={onTimeChange}
        />
      )}

      <Toast visible={toast.visible} type={toast.type} text={toast.text} />
    </Modal>
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
    height: "85%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#EFBF04",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  reference: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  formContainer: {
    marginBottom: 16,
    gap: 10,
  },
  field: {},
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
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
  },
  dateText: {
    fontWeight: "600",
    fontSize: 14,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelText: {
    fontWeight: "600",
    color: "#0f172a",
  },
  saveBtn: {
    backgroundColor: "#EFBf04",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: {
    color: "#0f172a",
    fontWeight: "600",
  },

  separator: {
    marginTop: 24,
  },
  separatorText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },

  /* ===== Activity Card ===== */
  activityCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFBF04",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 16,
  },
  headerTextBlock: {
    flex: 1,
  },
  displayName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  historyId: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoRowFlex: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activityType: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  dateTexts: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  followupLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: 2,
  },
  followupDate: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EF4444",
  },
  noteContainer: {
    marginTop: 6,
    padding: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#6b7280",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
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
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
});
