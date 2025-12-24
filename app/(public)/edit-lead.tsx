import ScreenNavbar from "@/components/ScreenNavbar";
import Toast from "@/components/Toast";
import { useUpdateLeadData } from "@/hooks/leadAction/useLeadAction";
import {
  useLeadAgents,
  useMastersData,
} from "@/hooks/sidebar/masters/useMastersData";
import { useLeadDetails } from "@/hooks/sidebar/useLeadsApi";
import SelectField from "@/modals/SmartDropDown";
import { selectAuthData, useAuthStore } from "@/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

/* =========================================================
   ZOD VALIDATION SCHEMA
========================================================= */

const EditLeadSchema = z.object({
  lead_category: z.string().min(1, "Category is required"),
  lead_name: z.string().min(1, "Lead name is required"),
  lead_property_requirement: z
    .string()
    .min(1, "Property requirement is required"),
  lead_type: z.string().min(1, "Lead type is required"),
  lead_city: z.string().min(1, "City is required"),
  lead_status: z.string().min(1, "Status is required"),
  lead_sub_status: z.string().min(1, "Sub status is required"),
  lead_source: z.string().min(1, "Lead source is required"),
  lead_mobile: z.string().min(10, "Valid mobile number is required"),
  lead_channel: z.string().min(1, "Channel is required"),
  lead_campaign: z.string().min(1, "Campaign is required"),
  lead_notes: z.string().min(1, "Notes are required"),
  lead_email: z.string().email("Valid email is required").or(z.literal("")),
  lead_company: z.string(),
  lead_agent: z.string(),
  lead_sanity: z.string(),
  hot_lead: z.string(),
});

/* =========================================================
   TYPES
========================================================= */

type EditLeadForm = {
  lead_category: string;
  lead_name: string;
  lead_property_requirement: string;
  lead_type: string;
  lead_city: string;
  lead_status: string;
  lead_sub_status: string;
  lead_source: string;
  lead_mobile: string;
  lead_channel: string;
  lead_campaign: string;
  lead_notes: string;
  lead_email: string;
  lead_company: string;
  lead_agent: string;
  lead_sanity: string;
  hot_lead: string;
};

type ToastState = {
  visible: boolean;
  type: "success" | "error" | "warning" | "info";
  text: string;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function EditLead() {
  const { lead_id_enc } = useLocalSearchParams<{ lead_id_enc: string }>();
  const router = useRouter();

  const authData = useAuthStore(selectAuthData);
  const userId = authData?.user?.user_id;
  const end_userId = authData?.encrypted_user_id;
  const roleMasterId = authData?.role.role_master_id;

  /* ================= API HOOKS ================= */

  const { data, isLoading } = useLeadDetails(lead_id_enc);
  const updateLeadMutation = useUpdateLeadData();

  /* ================= FORM STATE ================= */

  const [form, setForm] = useState<EditLeadForm>({
    lead_category: "",
    lead_name: "",
    lead_property_requirement: "",
    lead_type: "",
    lead_city: "",
    lead_status: "",
    lead_sub_status: "",
    lead_source: "",
    lead_mobile: "",
    lead_channel: "",
    lead_campaign: "",
    lead_notes: "",
    lead_email: "",
    lead_company: "",
    lead_agent: "",
    lead_sanity: "",
    hot_lead: "0",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const initialFormRef = React.useRef<EditLeadForm | null>(null);
  const queryClient = useQueryClient();

  /* ================= TOAST STATE ================= */

  const [toast, setToast] = useState<ToastState>({
    visible: false,
    type: "success",
    text: "",
  });

  const showToast = (
    type: "success" | "error" | "warning" | "info",
    text: string
  ) => {
    setToast({ visible: true, type, text });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  /* ================= PREFILL FROM API ================= */

  useEffect(() => {
    if (!data || initialFormRef.current) return;

    const lead = data;

    const formData: EditLeadForm = {
      lead_category: String(lead.lcat_id ?? ""),
      lead_name: lead.firstname ?? "",
      lead_property_requirement: String(lead.category_id ?? ""),
      lead_type: String(lead.ltype_id ?? ""),
      lead_city: String(lead.city_id ?? ""),
      lead_status: String(lead.lead_status_id ?? ""),
      lead_sub_status: String(lead.lead_main_status_id ?? ""),
      lead_source: String(lead.source_id ?? ""),
      lead_mobile: lead.mobile ?? "",
      lead_channel: String(lead.channel_id ?? ""),
      lead_campaign: String(lead.campaign_id ?? ""),
      lead_notes: "",
      lead_email: lead.email ?? "",
      lead_company: lead.company_name ?? "",
      lead_agent: String(lead.agent1 ?? ""),
      lead_sanity: String(lead.lead_sanity ?? ""),
      hot_lead: String(lead.hot_lead ?? "0"),
    };

    setForm(formData);

    // 🔥 IMPORTANT: deep clone
    initialFormRef.current = JSON.parse(JSON.stringify(formData));
  }, [data]);

  /* ================= MASTERS ================= */

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
    leadSanityQuery,
  } = useMastersData();

  const { data: agentsData, isLoading: agentsLoading } = useLeadAgents(userId);

  /* ================= OPTION MAPPER ================= */

  const map = (arr: any[] | undefined, l: string, v: string) =>
    arr?.map((i) => ({ label: String(i[l]), value: String(i[v]) })) ?? [];

  const categories = useMemo(
    () => map(categoryQuery.data?.data.category, "lcat_name", "lcat_id"),
    [categoryQuery.data]
  );

  const propertyTypes = useMemo(
    () =>
      map(
        propertyTypeQuery.data?.data.property_type,
        "category_name",
        "category_id"
      ),
    [propertyTypeQuery.data]
  );

  const leadTypes = useMemo(
    () => map(leadTypeQuery.data?.data.lead_type, "ltype_name", "ltype_id"),
    [leadTypeQuery.data]
  );

  const cities = useMemo(
    () => map(citiesQuery.data?.data.cities, "city_name", "city_id"),
    [citiesQuery.data]
  );

  const statuses = useMemo(
    () =>
      map(
        leadStatusQuery.data?.data.lead_status,
        "lead_status_name",
        "lead_status_id"
      ),
    [leadStatusQuery.data]
  );

  const subStatuses = useMemo(
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
    () => map(agentsData?.data?.lead_agents, "display_name", "user_id"),
    [agentsData]
  );

  const sanities = useMemo(
    () => map(leadSanityQuery.data?.data.lead_sanity, "name", "id"),
    [leadSanityQuery.data]
  );

  const hotLeadOptions = [
    { label: "Not Specified", value: "0" },
    { label: "Yes", value: "1" },
    { label: "No", value: "2" },
  ];

  /* ================= RESET HANDLER ================= */

  const EMPTY_FORM: EditLeadForm = {
    lead_category: "",
    lead_name: "",
    lead_property_requirement: "",
    lead_type: "",
    lead_city: "",
    lead_status: "",
    lead_sub_status: "",
    lead_source: "",
    lead_mobile: "",
    lead_channel: "",
    lead_campaign: "",
    lead_notes: "",
    lead_email: "",
    lead_company: "",
    lead_agent: "",
    lead_sanity: "",
    hot_lead: "0",
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    showToast("info", "Form cleared successfully");
  };

  /* ================= VALIDATION & SUBMIT ================= */

  const handleSubmit = async () => {
    try {
      // Validate form
      const validationResult = EditLeadSchema.safeParse(form);

      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};

        validationResult.error.issues.forEach((err) => {
          const fieldName = err.path[0];
          if (fieldName) {
            newErrors[fieldName as string] = err.message;
          }
        });

        setErrors(newErrors);
        showToast("error", "Please fill all required fields");
        return;
      }

      setErrors({});

      // Prepare payload
      const payload = {
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
        lead_id: lead_id_enc || "",
        lead_email: form.lead_email,
        hot_lead: Number(form.hot_lead),
        lead_company: form.lead_company,
        lead_agent: Number(form.lead_agent) || 0,
        role_master_id: Number(roleMasterId) || 1,
        lead_sanity: Number(form.lead_sanity) || 0,
        device: "Android",
        app_version: "1.0",
        user_id: end_userId || "",
      };

      await updateLeadMutation.mutateAsync(payload);

      /* 🔥 REFRESH QUERIES */
      queryClient.invalidateQueries({
        queryKey: ["lead-details", lead_id_enc],
        exact: false,
      });

      /* 2️⃣ Infinite lead list refresh */
      queryClient.invalidateQueries({
        queryKey: ["filter-lead-app-infinite"],
        exact: false, // 🔥 IMPORTANT
      });

      /* ✅ UI FEEDBACK */
      showToast("success", "Lead updated successfully!");

      setTimeout(() => {
        router.back();
      }, 800);
    } catch (error: any) {
      console.error("Submit Error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update lead. Please try again.";

      showToast("error", errorMessage);
    }
  };

  /* ================= LOADING ================= */

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#EFBF04" />
        <Text style={styles.loadingText}>Loading lead details...</Text>
      </SafeAreaView>
    );
  }

  /* ================= UI ================= */

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={styles.safeArea}
    >
      <ScreenNavbar title="Update Lead Details" />

      {/* Toast Component */}
      <Toast visible={toast.visible} type={toast.type} text={toast.text} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Lead Name */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              Lead Details <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.lead_name && styles.inputError]}
                value={form.lead_name}
                onChangeText={(t) => setForm({ ...form, lead_name: t })}
                placeholder="Enter lead name"
              />
              {errors.lead_name && (
                <Text style={styles.error}>{errors.lead_name}</Text>
              )}
            </View>

            <TextInput
              style={styles.input}
              value={form.lead_company}
              onChangeText={(t) => setForm({ ...form, lead_company: t })}
              placeholder="Enter company name"
            />

            <TextInput
              style={[styles.input, errors.lead_email && styles.inputError]}
              value={form.lead_email}
              onChangeText={(t) => setForm({ ...form, lead_email: t })}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.lead_email && (
              <Text style={styles.error}>{errors.lead_email}</Text>
            )}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.lead_mobile && styles.inputError]}
                keyboardType="phone-pad"
                value={form.lead_mobile}
                onChangeText={(t) => setForm({ ...form, lead_mobile: t })}
                placeholder="Enter mobile number"
              />
              {errors.lead_mobile && (
                <Text style={styles.error}>{errors.lead_mobile}</Text>
              )}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Selections</Text>
            {/* Category */}

            <View style={styles.selectionWrapper}>
              <SelectField
                label="Category"
                required
                options={categories}
                value={form.lead_category}
                onChange={(v) => setForm({ ...form, lead_category: v ?? "" })}
                textError={errors.lead_category}
              />
            </View>

            {/* Property Requirement */}
            <View style={styles.selectionWrapper}>
              <SelectField
                label="Property Requirement"
                required
                options={propertyTypes}
                value={form.lead_property_requirement}
                onChange={(v) =>
                  setForm({ ...form, lead_property_requirement: v ?? "" })
                }
                textError={errors.lead_property_requirement}
              />
            </View>

            {/* Lead Type */}
            <View style={styles.selectionWrapper}>
              <SelectField
                label="Lead Type"
                required
                options={leadTypes}
                value={form.lead_type}
                onChange={(v) => setForm({ ...form, lead_type: v ?? "" })}
                textError={errors.lead_type}
              />
            </View>

            {/* Hot Lead */}
            <View style={styles.selectionWrapper}>
              <SelectField
                label="Hot Lead"
                options={hotLeadOptions}
                value={form.hot_lead}
                onChange={(v) => setForm({ ...form, hot_lead: v ?? "0" })}
              />
            </View>

            {/* City */}
            <View style={styles.selectionWrapper}>
              <SelectField
                label="City"
                required
                options={cities}
                value={form.lead_city}
                onChange={(v) => setForm({ ...form, lead_city: v ?? "" })}
                textError={errors.lead_city}
              />
            </View>

            {/* Status */}
            <View style={styles.selectionWrapper}>
              <SelectField
                label="Status"
                required
                options={statuses}
                value={form.lead_status}
                onChange={(v) => setForm({ ...form, lead_status: v ?? "" })}
                textError={errors.lead_status}
              />
            </View>

            {/* Sub Status */}
            <View style={styles.selectionWrapper}>
              <SelectField
                label="Sub Status"
                required
                options={subStatuses}
                value={form.lead_sub_status}
                onChange={(v) => setForm({ ...form, lead_sub_status: v ?? "" })}
                textError={errors.lead_sub_status}
              />
            </View>

            {/* Lead Source */}
            <View style={styles.selectionWrapper}>
              <SelectField
                label="Lead Source"
                required
                options={sources}
                value={form.lead_source}
                onChange={(v) => setForm({ ...form, lead_source: v ?? "" })}
                textError={errors.lead_source}
              />
            </View>

            {/* Channel */}
            <View style={styles.selectionWrapper}>
              <SelectField
                label="Channel"
                required
                options={channels}
                value={form.lead_channel}
                onChange={(v) => setForm({ ...form, lead_channel: v ?? "" })}
                textError={errors.lead_channel}
              />
            </View>

            {/* Campaign */}
            <View style={styles.selectionWrapper}>
              <SelectField
                label="Campaign"
                required
                options={campaigns}
                value={form.lead_campaign}
                onChange={(v) => setForm({ ...form, lead_campaign: v ?? "" })}
                textError={errors.lead_campaign}
              />
            </View>

            {/* Agent */}
            <View style={styles.selectionWrapper}>
              <SelectField
                label="Agent"
                options={agents}
                loading={agentsLoading}
                disabled={!userId}
                value={form.lead_agent}
                onChange={(v) => setForm({ ...form, lead_agent: v ?? "" })}
              />
            </View>

            {/* Sanity */}
            <View style={styles.selectionWrapper}>
              <SelectField
                label="Sanity"
                options={sanities}
                value={form.lead_sanity}
                onChange={(v) => setForm({ ...form, lead_sanity: v ?? "" })}
              />
            </View>
          </View>
          {/* Notes */}
          <View>
            <Text style={styles.label}>
              Notes <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <TextInput
              style={[styles.textArea, errors.lead_notes && styles.inputError]}
              multiline
              value={form.lead_notes}
              onChangeText={(t) => setForm({ ...form, lead_notes: t })}
              placeholder="Enter notes"
            />
            {errors.lead_notes && (
              <Text style={styles.error}>{errors.lead_notes}</Text>
            )}
          </View>

          {/* Sticky Button Container */}
          <View style={styles.stickyButtonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              disabled={updateLeadMutation.isPending}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                updateLeadMutation.isPending && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={updateLeadMutation.isPending}
            >
              {updateLeadMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Update Lead</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 16, gap: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#64748b" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    color: "#0f172a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#0f172a",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    height: 90,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#0f172a",
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  stickyButtonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  resetButtonText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#EFBF04",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#fbbf24",
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionContainer: {
    flexDirection: "column",
    gap: 10,
  },
  selectionWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderColor: "#e5e7eb",
  },
  inputContainer: {
    flex: 1,
  },
});
