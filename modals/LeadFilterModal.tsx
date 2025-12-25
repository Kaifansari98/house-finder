import {
  useLeadAgents,
  useMastersData,
} from "@/hooks/sidebar/masters/useMastersData";
import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import SelectField from "./SmartDropDown";
import type { LeadFilters } from "@/app/(public)/view-all-leads";
import { CircleX, Calendar } from "lucide-react-native";
import { selectAuthData, useAuthStore } from "@/stores/auth-store";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  values: LeadFilters;
  onChange: (v: LeadFilters) => void;
  visible: boolean;
  onApply: () => void;
  onClose: () => void;
};

export default function LeadFilterModal({
  values,
  onChange,
  visible,
  onApply,
  onClose,
}: Props) {
  /* ================= AUTH ================= */
  const authData = useAuthStore(selectAuthData);
  const userId = authData?.user.user_id;

  const [showDatePicker, setShowDatePicker] = useState(false);

  /* ================= MASTERS ================= */
  const {
    leadStatusQuery,
    leadMainStatusQuery,
    leadSourceQuery,
    leadChannelQuery,
    leadCampaignQuery,
  } = useMastersData();

  const { data: agentsData, isLoading: agentsLoading } = useLeadAgents(userId);

  /* ================= HELPERS ================= */
  const map = (arr: any[] | undefined, l: string, v: string) =>
    arr?.map((i) => ({ label: String(i[l]), value: String(i[v]) })) ?? [];

  const leadStatuses = useMemo(
    () =>
      map(
        leadStatusQuery.data?.data.lead_status,
        "lead_status_name",
        "lead_status_id"
      ),
    [leadStatusQuery.data]
  );

  const leadSubStatuses = useMemo(
    () =>
      map(
        leadMainStatusQuery.data?.data.lead_main_statuses,
        "lead_main_status_name",
        "lead_main_status_id"
      ),
    [leadMainStatusQuery.data]
  );

  const sources = useMemo(
    () => map(leadSourceQuery.data?.data.source, "source_name", "source_id"),
    [leadSourceQuery.data]
  );

  const channels = useMemo(
    () => map(leadChannelQuery.data?.data.lead_channel, "cname", "cid"),
    [leadChannelQuery.data]
  );

  const campaigns = useMemo(
    () =>
      map(
        leadCampaignQuery.data?.data.lead_campaign,
        "campaign_name",
        "campaign_id"
      ),
    [leadCampaignQuery.data]
  );

  const agents = useMemo(
    () => map(agentsData?.data.lead_agents, "display_name", "user_id"),
    [agentsData]
  );

  /* ================= DATE HANDLER ================= */
  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (!selectedDate) return;

    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");

    onChange({
      ...values,
      date_created: `${yyyy}-${mm}-${dd}`,
    });
  };

  /* ================= UI ================= */
  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>Search & Filter</Text>
              <TouchableOpacity onPress={onClose}>
                <CircleX size={22} color="#0f172a" />
              </TouchableOpacity>
            </View>

            {/* CONTENT */}
            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.row}>
                <View style={styles.field}>
                  <Text style={styles.label}>Reference Code</Text>
                  <TextInput
                    style={styles.input}
                    value={values.ref}
                    placeholder="ex. HFL-32343"
                    onChangeText={(t) => onChange({ ...values, ref: t })}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Customer Name</Text>
                  <TextInput
                    style={styles.input}
                    value={values.name}
                    placeholder="ex. John Wick"
                    onChangeText={(t) => onChange({ ...values, name: t })}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.field}>
                  <Text style={styles.label}>Mobile</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="ex. 9887338574"
                    value={values.mobile}
                    onChangeText={(t) => onChange({ ...values, mobile: t })}
                  />
                </View>

                <View style={styles.field}>
                  <SelectField
                    label="Lead Status"
                    options={leadStatuses}
                    value={values.lead_status}
                    onChange={(v) =>
                      onChange({ ...values, lead_status: v ?? "" })
                    }
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.field}>
                  <SelectField
                    label="Lead Sub Status"
                    options={leadSubStatuses}
                    value={values.lead_sub_status}
                    onChange={(v) =>
                      onChange({
                        ...values,
                        lead_sub_status: v ?? "",
                      })
                    }
                  />
                </View>
                <View style={styles.field}>
                  <SelectField
                    label="Source"
                    options={sources}
                    value={values.lead_source}
                    onChange={(v) =>
                      onChange({
                        ...values,
                        lead_source: v ?? "",
                      })
                    }
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.field}>
                  <SelectField
                    label="Channel"
                    options={channels}
                    value={values.lead_channel}
                    onChange={(v) =>
                      onChange({
                        ...values,
                        lead_channel: v ?? "",
                      })
                    }
                  />
                </View>

                <View style={styles.field}>
                  <SelectField
                    label="Campaign"
                    options={campaigns}
                    value={values.lead_campaign}
                    onChange={(v) =>
                      onChange({
                        ...values,
                        lead_campaign: v ?? "",
                      })
                    }
                  />
                </View>
              </View>

              <SelectField
                label="Agent"
                options={agents}
                loading={agentsLoading}
                disabled={!userId}
                value={values.lead_agent}
                onChange={(v) => onChange({ ...values, lead_agent: v ?? "" })}
              />

              {/* DATE FIELD */}
              <View style={styles.field}>
                <Text style={styles.label}>Follow-up Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={[
                      styles.dateText,
                      !values.date_created && styles.placeholder,
                    ]}
                  >
                    {values.date_created || "Select date"}
                  </Text>
                  <Calendar size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* FOOTER */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  onChange({
                    ref: "",
                    name: "",
                    mobile: "",
                    lead_status: "",
                    lead_sub_status: "",
                    lead_source: "",
                    lead_channel: "",
                    lead_campaign: "",
                    lead_agent: "",
                    date_created: "",
                  });
                  onApply();
                }}
              >
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.searchBtn} onPress={onApply}>
                <Text style={styles.btnText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DATE PICKER */}
      {showDatePicker && (
        <DateTimePicker
          value={
            values.date_created ? new Date(values.date_created) : new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={onDateChange}
        />
      )}
    </>
  );
}

/* ============================ STYLES ============================ */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  sheet: {
    height: "75%",
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
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  content: {
    padding: 16,
    gap: 10,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  field: {
    flex: 1,
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
    padding: 13,
  },

  dateInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dateText: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "600",
  },

  placeholder: {
    color: "#9CA3AF",
    fontWeight: "500",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  searchBtn: {
    backgroundColor: "#EFBF04",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },

  resetBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },

  btnText: {
    color: "#0f172a",
    fontWeight: "700",
  },

  resetText: {
    color: "#0f172a",
    fontWeight: "700",
  },
});
