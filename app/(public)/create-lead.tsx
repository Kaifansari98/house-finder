import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenNavbar from "@/components/ScreenNavbar";
import Toast from "@/components/Toast";
import { useMastersData } from "@/hooks/sidebar/masters/useMastersData";
import { useLeadsApi } from "@/hooks/sidebar/useLeadsApi";
import { selectAuthData, useAuthStore } from "@/stores/auth-store";
import { Picker } from "@react-native-picker/picker";

type Option = { label: string; value: string }; // Changed: value is always string

const SelectField = ({
  label,
  options,
  value,
  onChange,
  required,
  loading = false,
}: {
  label: string;
  options: Option[];
  value?: string;
  onChange: (val: string | undefined) => void;
  required?: boolean;
  loading?: boolean;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || "Not selected";

  useEffect(() => {
    console.log("Picker options", options);
  }, [options]);

  const handleConfirm = () => {
    onChange(tempValue);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>
          {label} {required ? "*" : ""}
        </Text>
        <TouchableOpacity
          style={[
            styles.pickerTrigger,
            loading && styles.pickerTriggerDisabled,
          ]}
          onPress={() => !loading && setModalVisible(true)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#6b7280" />
          ) : (
            <>
              <Text style={styles.pickerTriggerText}>{selectedLabel}</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>{label}</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>

            <Picker
              selectedValue={tempValue ?? ""}
              onValueChange={(itemValue) =>
                setTempValue(
                  itemValue === "" ? undefined : (itemValue as string)
                )
              }
              style={{ color: "#111827" }} // 👈 IMPORTANT
            >
              <Picker.Item
                label="Not selected"
                value=""
                color="#9ca3af" // 👈 grey placeholder
              />

              {options.map((opt) => (
                <Picker.Item
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                  color="#111827" // 👈 visible text
                />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default function CreateLead() {
  const authData = useAuthStore(selectAuthData);
  const { mutate: saveLead, isPending } = useLeadsApi({
    onSuccess: () => showToast("success", "Lead saved successfully"),
    onError: () => showToast("error", "Failed to save lead"),
  });

  const {
    categoryQuery,
    propertyTypeQuery,
    leadTypeQuery,
    citiesQuery,
    leadStatusQuery,
    leadMainStatusQuery,
    leadSourceQuery,
    leadChannelQuery,
    leadCampaignQuery,
    leadAgentsQuery,
    leadSanityQuery,
  } = useMastersData();

  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    text: string;
  }>({
    visible: false,
    type: "info",
    text: "",
  });
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState({
    lead_category: undefined as string | undefined,
    lead_property_requirement: undefined as string | undefined,
    lead_type: undefined as string | undefined,
    lead_city: undefined as string | undefined,
    lead_status: undefined as string | undefined,
    lead_sub_status: undefined as string | undefined,
    lead_source: undefined as string | undefined,
    lead_channel: undefined as string | undefined,
    lead_campaign: undefined as string | undefined,
    lead_agent: undefined as string | undefined,
    lead_sanity: undefined as string | undefined,
    lead_name: "",
    lead_notes: "",
    lead_email: "",
    lead_mobile: "",
    lead_company: "",
    hot_lead: 0,
    device: Platform.OS === "ios" ? "iOS" : "Android",
  });

  const showToast = (
    type: "success" | "error" | "warning" | "info",
    text: string
  ) => {
    setToast({ visible: true, type, text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => setToast((prev) => ({ ...prev, visible: false })),
      2500
    );
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  // Map to { label, value: string } always
  const mapOptions = <T,>(
    items: T[] | undefined,
    labelKey: keyof T,
    valueKey: keyof T
  ): Option[] => {
    if (!items) return [];
    return items.map((item) => ({
      label: String((item as any)[labelKey]),
      value: String((item as any)[valueKey]), // Force string
    }));
  };

  const categories = useMemo(
    () => mapOptions(categoryQuery.data?.data.category, "lcat_name", "lcat_id"),
    [categoryQuery.data]
  );

  const propertyTypes = useMemo(
    () =>
      mapOptions(
        propertyTypeQuery.data?.data.property_type,
        "category_name",
        "category_id"
      ),
    [propertyTypeQuery.data]
  );

  const leadTypes = useMemo(
    () =>
      mapOptions(leadTypeQuery.data?.data.lead_type, "ltype_name", "ltype_id"),
    [leadTypeQuery.data]
  );

  const cities = useMemo(
    () => mapOptions(citiesQuery.data?.data.cities, "city_name", "city_id"),
    [citiesQuery.data]
  );

  const leadStatuses = useMemo(
    () =>
      mapOptions(
        leadStatusQuery.data?.data.lead_status,
        "lead_status_name",
        "lead_status_id"
      ),
    [leadStatusQuery.data]
  );

  const leadMainStatuses = useMemo(
    () =>
      mapOptions(
        leadMainStatusQuery.data?.data.lead_main_statuses,
        "lead_main_status_name",
        "lead_main_status_id"
      ),
    [leadMainStatusQuery.data]
  );

  const leadSources = useMemo(
    () =>
      mapOptions(leadSourceQuery.data?.data.source, "source_name", "source_id"),
    [leadSourceQuery.data]
  );

  const leadChannels = useMemo(
    () => mapOptions(leadChannelQuery.data?.data.lead_channel, "cname", "cid"),
    [leadChannelQuery.data]
  );

  const leadCampaigns = useMemo(
    () =>
      mapOptions(
        leadCampaignQuery.data?.data.lead_campaign,
        "campaign_name",
        "campaign_id"
      ),
    [leadCampaignQuery.data]
  );

  const leadAgents = useMemo(
    () =>
      mapOptions(
        leadAgentsQuery.data?.data.lead_agents,
        "display_name",
        "user_id"
      ),
    [leadAgentsQuery.data]
  );

  const leadSanities = useMemo(
    () => mapOptions(leadSanityQuery.data?.data.lead_sanity, "name", "id"),
    [leadSanityQuery.data]
  );

  const requiredFields: Array<[keyof typeof form, string]> = [
    ["lead_category", "Category"],
    ["lead_property_requirement", "Property Requirement"],
    ["lead_type", "Lead Type"],
    ["lead_city", "City"],
    ["lead_status", "Lead Status"],
    ["lead_sub_status", "Lead Sub Status"],
    ["lead_source", "Lead Source"],
    ["lead_mobile", "Mobile"],
    ["lead_channel", "Lead Channel"],
    ["lead_campaign", "Lead Campaign"],
    ["lead_name", "Lead Name"],
  ];

  const handleSubmit = () => {
    const missing = requiredFields
      .filter(([key]) => !form[key as keyof typeof form])
      .map(([, label]) => label);

    if (missing.length > 0) {
      showToast("warning", `Please fill: ${missing.join(", ")}`);
      return;
    }

    if (!authData?.encrypted_user_id || !authData?.role?.role_master_id) {
      showToast("error", "Missing user session");
      return;
    }

    saveLead({
      lead_category: Number(form.lead_category),
      lead_name: form.lead_name,
      lead_property_requirement: Number(form.lead_property_requirement),
      lead_type: Number(form.lead_type),
      lead_city: Number(form.lead_city),
      lead_status: Number(form.lead_status),
      lead_sub_status: Number(form.lead_sub_status),
      lead_source: Number(form.lead_source),
      lead_mobile: form.lead_mobile,
      lead_channel: Number(form.lead_channel),
      lead_campaign: Number(form.lead_campaign),
      lead_notes: form.lead_notes,
      lead_id: "",
      lead_email: form.lead_email,
      hot_lead: form.hot_lead,
      lead_company: form.lead_company,
      lead_agent: form.lead_agent ? Number(form.lead_agent) : 0,
      role_master_id: authData.role.role_master_id,
      lead_sanity: form.lead_sanity ? Number(form.lead_sanity) : 0,
      device: form.device,
      app_version: "1.0",
      user_id: authData.encrypted_user_id,
    });
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScreenNavbar title="Create Lead" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Lead Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Lead name *"
          placeholderTextColor="#9ca3af"
          value={form.lead_name}
          onChangeText={(text) => setForm((p) => ({ ...p, lead_name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile *"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          value={form.lead_mobile}
          onChangeText={(text) => setForm((p) => ({ ...p, lead_mobile: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          value={form.lead_email}
          onChangeText={(text) => setForm((p) => ({ ...p, lead_email: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Company"
          placeholderTextColor="#9ca3af"
          value={form.lead_company}
          onChangeText={(text) =>
            setForm((p) => ({ ...p, lead_company: text }))
          }
        />

        <Text style={styles.sectionTitle}>Selections</Text>

        <SelectField
          label="Category"
          required
          options={categories}
          value={form.lead_category}
          onChange={(v) => setForm((p) => ({ ...p, lead_category: v }))}
          loading={categoryQuery.isLoading}
        />
        <SelectField
          label="Property Requirement"
          required
          options={propertyTypes}
          value={form.lead_property_requirement}
          onChange={(v) =>
            setForm((p) => ({ ...p, lead_property_requirement: v }))
          }
          loading={propertyTypeQuery.isLoading}
        />
        <SelectField
          label="Lead Type"
          required
          options={leadTypes}
          value={form.lead_type}
          onChange={(v) => setForm((p) => ({ ...p, lead_type: v }))}
          loading={leadTypeQuery.isLoading}
        />
        <SelectField
          label="City"
          required
          options={cities}
          value={form.lead_city}
          onChange={(v) => setForm((p) => ({ ...p, lead_city: v }))}
          loading={citiesQuery.isLoading}
        />
        <SelectField
          label="Lead Status"
          required
          options={leadStatuses}
          value={form.lead_status}
          onChange={(v) => setForm((p) => ({ ...p, lead_status: v }))}
          loading={leadStatusQuery.isLoading}
        />
        <SelectField
          label="Lead Sub Status"
          required
          options={leadMainStatuses}
          value={form.lead_sub_status}
          onChange={(v) => setForm((p) => ({ ...p, lead_sub_status: v }))}
          loading={leadMainStatusQuery.isLoading}
        />
        <SelectField
          label="Lead Source"
          required
          options={leadSources}
          value={form.lead_source}
          onChange={(v) => setForm((p) => ({ ...p, lead_source: v }))}
          loading={leadSourceQuery.isLoading}
        />
        <SelectField
          label="Lead Channel"
          required
          options={leadChannels}
          value={form.lead_channel}
          onChange={(v) => setForm((p) => ({ ...p, lead_channel: v }))}
          loading={leadChannelQuery.isLoading}
        />
        <SelectField
          label="Campaign"
          required
          options={leadCampaigns}
          value={form.lead_campaign}
          onChange={(v) => setForm((p) => ({ ...p, lead_campaign: v }))}
          loading={leadCampaignQuery.isLoading}
        />
        <SelectField
          label="Agent"
          options={leadAgents}
          value={form.lead_agent}
          onChange={(v) => setForm((p) => ({ ...p, lead_agent: v }))}
          loading={leadAgentsQuery.isLoading}
        />
        <SelectField
          label="Lead Sanity"
          options={leadSanities}
          value={form.lead_sanity}
          onChange={(v) => setForm((p) => ({ ...p, lead_sanity: v }))}
          loading={leadSanityQuery.isLoading}
        />

        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Notes"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          value={form.lead_notes}
          onChangeText={(text) => setForm((p) => ({ ...p, lead_notes: text }))}
        />

        {/* <SelectField
          label="Device"
          required
          options={[
            { label: "Android", value: "Android" },
            { label: "iOS", value: "iOS" },
          ]}
          value={form.device}
          onChange={(v) =>
            setForm((p) => ({ ...p, device: v as "Android" | "iOS" }))
          }
        /> */}

        <TouchableOpacity
          style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={isPending}
        >
          <Text style={styles.submitText}>
            {isPending ? "Saving..." : "Save Lead"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast visible={toast.visible} type={toast.type} text={toast.text} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 16, paddingBottom: 40, gap: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  multiline: { height: 90, textAlignVertical: "top" },

  field: {
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fafafa",
  },
  label: { fontSize: 13, fontWeight: "700", color: "#0f172a", marginBottom: 8 },
  pickerTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pickerTriggerDisabled: {
    opacity: 0.6,
  },
  pickerTriggerText: {
    fontSize: 14,
    color: "#111827",
  },
  dropdownIcon: {
    fontSize: 16,
    color: "#6b7280",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cancelText: {
    fontSize: 16,
    color: "#007AFF",
  },
  doneText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  pickerTitle: {
    fontSize: 14,
    color: "#8e8e93",
    fontWeight: "600",
  },

  submitBtn: {
    marginTop: 12,
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
