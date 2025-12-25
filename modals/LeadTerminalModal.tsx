import DateTimePicker from "@react-native-community/datetimepicker";
import { useQueryClient } from "@tanstack/react-query";
import {
  CircleX,
  Calendar,
  Tag,
  StickyNote,
  CalendarFoldIcon,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import {
  useLeadActivities,
  useSaveLeadActivity,
} from "@/hooks/leadAction/useLeadAction";
import { useMastersData } from "@/hooks/sidebar/masters/useMastersData";
import { selectAuthData, useAuthStore } from "@/stores/auth-store";
import SelectField from "./SmartDropDown";
import Toast from "@/components/Toast";

type Props = {
  visible: boolean;
  onClose: () => void;
  leadId: string;
  referenceNo: string;
};

const activitySchema = z.object({
  activityType: z.preprocess(
    (val) => (typeof val === "string" ? val : ""),
    z.string().min(1, "Activity type is required")
  ),
  followUpDate: z.date().optional(),
  activityNotes: z.string().min(1, "Activity notes are required"),
});

type FormErrors = {
  activityType?: string;
  followUpDate?: string;
  activityNotes?: string;
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
  const [errors, setErrors] = useState<FormErrors>({});

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

  /* ================= DATE HANDLERS ================= */
  const onDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (!date) return;
    setFollowUpDate(date);
    setShowTimePicker(true);
    // Clear error when date is selected
    if (errors.followUpDate) {
      setErrors((prev) => ({ ...prev, followUpDate: undefined }));
    }
  };

  const onTimeChange = (_: any, time?: Date) => {
    setShowTimePicker(false);
    if (!time || !followUpDate) return;
    const final = new Date(followUpDate);
    final.setHours(time.getHours(), time.getMinutes(), 0);
    setFollowUpDate(final);
  };

  /* ================= VALIDATION ================= */
  const validateForm = (): boolean => {
    try {
      activitySchema.parse({
        activityType,
        activityNotes,
      });

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: FormErrors = {};

        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof FormErrors | undefined;
          if (field) {
            formattedErrors[field] = issue.message;
          }
        });

        setErrors(formattedErrors);
      }

      return false;
    }
  };

  /* ================= SAVE ================= */
  const handleSave = () => {
    if (!userId) {
      showToast("error", "User not authenticated");
      return;
    }

    if (!validateForm()) {
      showToast("error", "Please fix the errors before saving");
      return;
    }

    const payload = {
      lead_id: leadId,
      user_id: userId,
      activity_type: Number(activityType),
      activity_notes: activityNotes,
      ...(followUpDate && {
        followup_date: followUpDate.toISOString(),
      }),
    };

    saveActivity(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["lead-activities", leadId],
        });
        setActivityType(undefined);
        setActivityNotes("");
        setFollowUpDate(null);
        setErrors({});
        showToast("success", "Activity saved successfully");
      },
      onError: () => showToast("error", "Failed to save activity"),
    });
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

        <View style={styles.timeContainer}>
          <CalendarFoldIcon size={15} color="#9ca3af" strokeWidth={2} />
          <Text style={styles.statusText}>{item.date}</Text>
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
              <CircleX size={22} color="#0f172a" />
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
                onChange={(value) => {
                  setActivityType(value);
                  if (errors.activityType) {
                    setErrors((prev) => ({ ...prev, activityType: undefined }));
                  }
                }}
                textError={errors.activityType}
              />

              <View style={styles.field}>
                <Text style={styles.label}>Follow-up Date & Time</Text>
                <TouchableOpacity
                  style={[styles.dateInput]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={[
                      styles.dateText,
                      !followUpDate && { color: "#9ca3af" },
                    ]}
                  >
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
                  style={[
                    styles.input,
                    styles.textArea,
                    errors.activityNotes && styles.inputError,
                  ]}
                  value={activityNotes}
                  onChangeText={(text) => {
                    setActivityNotes(text);
                    if (errors.activityNotes) {
                      setErrors((prev) => ({
                        ...prev,
                        activityNotes: undefined,
                      }));
                    }
                  }}
                  multiline
                  placeholder="Write activity details here..."
                  placeholderTextColor="#9ca3af"
                />
                {errors.activityNotes && (
                  <Text style={styles.errorText}>{errors.activityNotes}</Text>
                )}
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
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 5,
    textTransform: "capitalize",
    letterSpacing: 0.5,
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
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    padding: 12,
    backgroundColor: "#FFFFFF",
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
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    gap: 7,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 16,
    textTransform: "capitalize",
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
    fontWeight: "600",
    fontSize: 14,
    color: "#0f172a",
    textTransform: "capitalize",
  },
  noteContainer: {
    marginHorizontal: 4,
    padding: 7,
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: "#9ca3af",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  inputFocused: {
    borderColor: "#EFBF04",
    borderWidth: 1.5,
  },

  inputError: {
    borderColor: "#ef4444",
    borderWidth: 1,
  },

  errorText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
  },
});
