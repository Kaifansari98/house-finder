import React, { useMemo } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
} from "react-native";
import { CircleX } from "lucide-react-native";
import SelectField from "./SmartDropDown";
import { useCallCenterMasterData } from "@/hooks/sidebar/masters/useCallCenterMastersData";

export type CallCenterLeadFilters = {
  followup_startDate: string;
  followup_endDate: string;
  upload_startDate: string;
  upload_endDate: string;
  name: string;
  mobile1: string;
  mobile2: string;
  email: string;
  city: string;
  location: string;
  dataname: string;
  status: string;
  agent: string;
  notes: string;
};

type Props = {
  values: CallCenterLeadFilters;
  onChange: (v: CallCenterLeadFilters) => void;
  open: boolean;
  onClose: () => void;
  onApply: () => void;
};

const CallCenterLeadFilterModal = ({
  values,
  onChange,
  open,
  onClose,
  onApply,
}: Props) => {
  const { citiesQuery, locationQuery, datanameQuery, statusQuery, agentQuery } =
    useCallCenterMasterData();

  /* ================= OPTIONS ================= */

  const mapToOptions = (arr: any[] | undefined, key: string) =>
    arr
      ?.filter((i) => i?.[key])
      .map((i) => ({
        label: String(i[key]),
        value: String(i[key]),
      })) ?? [];

  const cityOptions = useMemo(
    () => mapToOptions(citiesQuery.data?.data.city, "city"),
    [citiesQuery.data]
  );

  const locationOptions = useMemo(
    () => mapToOptions(locationQuery.data?.data.location, "location"),
    [locationQuery.data]
  );

  const dataNameOptions = useMemo(
    () => mapToOptions(datanameQuery.data?.data.location, "data_name"),
    [datanameQuery.data]
  );

  const statusOptions = useMemo(
    () =>
      statusQuery.data?.data.status?.map((s: string) => ({
        label: s,
        value: s,
      })) ?? [],
    [statusQuery.data]
  );

  const agentOptions = useMemo(
    () =>
      agentQuery.data?.data.active_agents?.map((a) => ({
        label: a.display_name,
        value: String(a.user_id),
      })) ?? [],
    [agentQuery.data]
  );

  /* ================= RESET ================= */

  const handleReset = () => {
    onChange({
      followup_startDate: "",
      followup_endDate: "",
      upload_startDate: "",
      upload_endDate: "",
      name: "",
      mobile1: "",
      mobile2: "",
      email: "",
      city: "",
      location: "",
      dataname: "",
      status: "",
      agent: "",
      notes: "",
    });
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* ================= HEADER ================= */}
          <View style={styles.header}>
            <Text style={styles.title}>Search & Filter</Text>
            <TouchableOpacity onPress={onClose}>
              <CircleX size={22} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* ================= CONTENT ================= */}
          <ScrollView contentContainerStyle={styles.content}>
            {/* Name + Email */}
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={values.name}
                  placeholder="ex. John Cena"
                  onChangeText={(t) => onChange({ ...values, name: t })}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={values.email}
                  placeholder="ex. john@gmail.com"
                  onChangeText={(t) => onChange({ ...values, email: t })}
                />
              </View>
            </View>

            {/* Mobile 1 + 2 */}
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>Mobile 1</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="ex. 9887338574"
                  value={values.mobile1}
                  onChangeText={(t) => onChange({ ...values, mobile1: t })}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Mobile 2</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="ex. 9887338574"
                  value={values.mobile2}
                  onChangeText={(t) => onChange({ ...values, mobile2: t })}
                />
              </View>
            </View>

            {/* City + Location */}
            <View style={styles.row}>
              <SelectField
                label="City"
                options={cityOptions}
                value={values.city}
                onChange={(v) => onChange({ ...values, city: v ?? "" })}
              />

              <SelectField
                label="Location"
                options={locationOptions}
                value={values.location}
                onChange={(v) => onChange({ ...values, location: v ?? "" })}
              />
            </View>

            {/* Data Name + Status */}
            <View style={styles.row}>
              <SelectField
                label="Data Name"
                options={dataNameOptions}
                value={values.dataname}
                onChange={(v) => onChange({ ...values, dataname: v ?? "" })}
              />

              <SelectField
                label="Status"
                options={statusOptions}
                value={values.status}
                onChange={(v) => onChange({ ...values, status: v ?? "" })}
              />
            </View>

            {/* Agent */}
            <SelectField
              label="Agent"
              options={agentOptions}
              value={values.agent}
              onChange={(v) => onChange({ ...values, agent: v ?? "" })}
            />

            {/* Notes */}
            <View style={styles.field}>
              <Text style={styles.label}>Activity Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                value={values.notes}
                placeholder="enter notes"
                onChangeText={(t) => onChange({ ...values, notes: t })}
              />
            </View>
          </ScrollView>

          {/* ================= FOOTER ================= */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.searchBtn} onPress={onApply}>
              <Text style={styles.btnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CallCenterLeadFilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
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
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  content: {
    padding: 16,
    gap: 14,
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
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },

  resetBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 22,
    paddingVertical: 12,
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
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
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
});
