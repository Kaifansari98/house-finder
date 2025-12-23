import DateTimePicker from "@react-native-community/datetimepicker";
import { CircleX, Calendar } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SelectField from "./SmartDropDown";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ScheduleMeetingModal({
  visible,
  onClose,
}: Props) {
  /* ================= STATE ================= */
  const [meetingType, setMeetingType] = useState<string | undefined>();
  const [meetingDate, setMeetingDate] = useState<Date | null>(null);
  const [inviteAgent, setInviteAgent] = useState("");
  const [inviteOthers, setInviteOthers] = useState("");
  const [notes, setNotes] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  /* ================= DATE HANDLERS ================= */
  const onDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (!date) return;
    setMeetingDate(date);
    setShowTimePicker(true);
  };

  const onTimeChange = (_: any, time?: Date) => {
    setShowTimePicker(false);
    if (!time || !meetingDate) return;
    const final = new Date(meetingDate);
    final.setHours(time.getHours(), time.getMinutes(), 0);
    setMeetingDate(final);
  };

  /* ================= SAVE ================= */
  const handleSave = () => {
    if (!meetingType || !meetingDate || !notes.trim()) {
      // validation placeholder
      return;
    }

    const payload = {
      meetingType,
      meetingDate,
      inviteAgent,
      inviteOthers,
      notes,
    };

    console.log("Schedule Meeting Payload:", payload);
    onClose();
  };

  /* ================= UI ================= */
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Schedule A Meeting</Text>
            <TouchableOpacity onPress={onClose}>
              <CircleX size={22} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* CONTENT */}
          <View style={styles.content}>
            {/* Meeting Type */}
            {/* <SelectField
              label="Meeting Type"
              required
              options={[]} // empty for now
              value={meetingType}
              onChange={setMeetingType}
            /> */}

            {/* Meeting Date & Time */}
            <View style={styles.field}>
              <Text style={styles.label}>Meeting Date & Time <Text style={{ color: "#EF4444" }}>*</Text></Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.dateText}>
                  {meetingDate
                    ? meetingDate.toLocaleString()
                    : "Select date & time"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Invite Agent */}
            <View style={styles.field}>
              <Text style={styles.label}>Invite Agent</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter agent name"
                value={inviteAgent}
                onChangeText={setInviteAgent}
              />
            </View>

            {/* Invite Others */}
            <View style={styles.field}>
              <Text style={styles.label}>Invite Others (Email)</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                keyboardType="email-address"
                value={inviteOthers}
                onChangeText={setInviteOthers}
              />
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Notes <Text style={{ color: "#EF4444" }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add meeting notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            {/* ACTIONS */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* DATE PICKERS */}
      {showDatePicker && (
        <DateTimePicker
          value={meetingDate ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={onDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={meetingDate ?? new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}
    </Modal>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: "70%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    padding: 16,
    backgroundColor: "#EFBF04",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  content: {
    padding: 16,
  },
  field: {
    marginBottom: 14,
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
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
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
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelText: {
    fontWeight: "600",
    color: "#0f172a",
  },
  saveBtn: {
    backgroundColor: "#EFBF04",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: {
    color: "#0f172a",
    fontWeight: "700",
  },
});
