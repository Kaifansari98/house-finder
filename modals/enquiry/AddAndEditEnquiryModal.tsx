import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CircleX } from "lucide-react-native";
import { z } from "zod";
import SelectField, { Option } from "../SmartDropDown";

import { selectAuthData, useAuthStore } from "@/stores/auth-store";
import { useSaveLeadEnquiry } from "@/hooks/enquiry/useEnquiry";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "@/components/Toast";

/* ================= ZOD SCHEMA ================= */

const enquirySchema = z.object({
  rentSell: z.string().min(1, "Please select Rent/Sell/Buyer"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  budget: z.string().min(1, "Budget is required"),
  paymentType: z.string().min(1, "Please select payment type"),
  description: z.string().min(5, "Description is required"),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

/* ================= TYPES ================= */

export type EnquiryData = {
  lead_enquiry_id?: string;
  rentsell: string;
  location: string;
  budget: string;
  payment_type: string;
  description: string;
};

type AddGeneralEnquiryModalProps = {
  visible: boolean;
  onClose: () => void;
  leadId?: string;
  enquiryData?: EnquiryData;
};  

type ToastType = "success" | "error" | "warning" | "info";

/* ================= OPTIONS ================= */

const RENT_SELL_OPTIONS: Option[] = [
  { label: "Rent", value: "1" },
  { label: "Sell", value: "2" },
  { label: "Buyer", value: "3" },
];

const PAYMENT_TYPE_OPTIONS: Option[] = [
  { label: "Cash", value: "1" },
  { label: "Finance", value: "2" },
];

/* ================= COMPONENT ================= */

const AddGeneralEnquiryModal = ({
  visible,
  onClose,
  enquiryData,
}: AddGeneralEnquiryModalProps) => {
  const authData = useAuthStore(selectAuthData);
  const { mutate: saveEnquiry, isPending } = useSaveLeadEnquiry();

  /* ================= STATE ================= */

  const [rentSell, setRentSell] = useState<string | undefined>();
  const [paymentType, setPaymentType] = useState<string | undefined>();
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");

  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Error states
  const [errors, setErrors] = useState<
    Partial<Record<keyof EnquiryFormData, string>>
  >({});

  // Toast states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");
  const [toastText, setToastText] = useState("");

  const isEditMode = !!enquiryData?.lead_enquiry_id;

  /* ================= TOAST HELPER ================= */

  const showToast = (type: ToastType, text: string) => {
    setToastType(type);
    setToastText(text);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide after 3 seconds
  };

  /* ================= EFFECTS ================= */

  // Pre-fill data in edit mode
  useEffect(() => {
    if (visible && enquiryData) {
      setRentSell(enquiryData.rentsell);
      setLocation(enquiryData.location);
      setBudget(enquiryData.budget);
      setPaymentType(enquiryData.payment_type);
      setDescription(enquiryData.description || "");
      setErrors({});
    } else if (visible && !enquiryData) {
      // Reset form for create mode
      setRentSell(undefined);
      setLocation("");
      setBudget("");
      setPaymentType(undefined);
      setDescription("");
      setErrors({});
    }
  }, [visible, enquiryData]);

  /* ================= VALIDATION ================= */
  const validateForm = (): boolean => {
    const formData = {
      rentSell: rentSell || "",
      location,
      budget,
      paymentType: paymentType || "",
      description,
    };

    const result = enquirySchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Partial<Record<keyof EnquiryFormData, string>> =
        {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof EnquiryFormData;
        formattedErrors[field] = issue.message;
      });

      setErrors(formattedErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  /* ================= HANDLERS ================= */

  const handleSave = () => {
    if (!validateForm()) {
      showToast("error", "Please fill all required fields correctly");
      return;
    }

    if (!authData?.user?.user_id) {
      showToast("error", "User not authenticated");
      return;
    }

    const payload = {
      user_id: String(authData.user.user_id),
      rentsell: rentSell!,
      location,
      budget,
      payment_type: paymentType!,
      description,
      ...(isEditMode && { lead_enquiry_id: enquiryData.lead_enquiry_id }),
    };

    console.log("Payload: ", payload);
    saveEnquiry(payload, {
      onSuccess: (response) => {
        showToast(
          "success",
          isEditMode
            ? "Enquiry updated successfully"
            : "Enquiry added successfully"
        );
        // Close modal after short delay to show toast
        setTimeout(() => {
          onClose();
        }, 1500);
      },
      onError: (error: any) => {
        showToast(
          "error",
          error?.message || "Failed to save enquiry. Please try again."
        );
      },
    });
  };

  const handleClose = () => {
    setErrors({});
    setFocusedField(null);
    onClose();
  };

  if (!visible) return null;

  /* ================= UI ================= */

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <SafeAreaView style={styles.sheet}>
            {/* ================= HEADER ================= */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isEditMode ? "Edit General Enquiry" : "Add General Enquiry"}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={10}
                disabled={isPending}
              >
                <CircleX size={22} color="#0f172a" />
              </TouchableOpacity>
            </View>

            {/* ================= BODY ================= */}
            <ScrollView>
              <View style={styles.content}>
                {isEditMode && enquiryData?.lead_enquiry_id && (
                  <Text style={styles.subTitle}>
                    Enquiry ID: {enquiryData.lead_enquiry_id}
                  </Text>
                )}

                {/* Rent / Sell / Buyer */}
                <SelectField
                  label="Rent / Sell / Buyer"
                  options={RENT_SELL_OPTIONS}
                  value={rentSell}
                  onChange={setRentSell}
                  required
                  textError={errors.rentSell}
                />

                {/* Location */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    Location <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={location}
                    onChangeText={(text) => {
                      setLocation(text);
                      if (errors.location) {
                        setErrors((prev) => ({ ...prev, location: undefined }));
                      }
                    }}
                    placeholder="Enter location"
                    placeholderTextColor="#9ca3af"
                    style={[
                      styles.input,
                      focusedField === "location" && styles.inputFocused,
                      errors.location && styles.inputError,
                    ]}
                    onFocus={() => setFocusedField("location")}
                    onBlur={() => setFocusedField(null)}
                    editable={!isPending}
                  />
                  {errors.location && (
                    <Text style={styles.errorText}>{errors.location}</Text>
                  )}
                </View>

                {/* Budget */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    Budget <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={budget}
                    onChangeText={(text) => {
                      setBudget(text);
                      if (errors.budget) {
                        setErrors((prev) => ({ ...prev, budget: undefined }));
                      }
                    }}
                    placeholder="Enter budget"
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                    style={[
                      styles.input,
                      focusedField === "budget" && styles.inputFocused,
                      errors.budget && styles.inputError,
                    ]}
                    onFocus={() => setFocusedField("budget")}
                    onBlur={() => setFocusedField(null)}
                    editable={!isPending}
                  />
                  {errors.budget && (
                    <Text style={styles.errorText}>{errors.budget}</Text>
                  )}
                </View>

                {/* Payment Type */}
                <SelectField
                  label="Payment Type"
                  options={PAYMENT_TYPE_OPTIONS}
                  value={paymentType}
                  onChange={setPaymentType}
                  required
                  textError={errors.paymentType}
                />

                {/* Description */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Write requirement"
                    placeholderTextColor="#9ca3af"
                    style={[
                      styles.input,
                      styles.textArea,
                      focusedField === "description" && styles.inputFocused,
                      errors.description && styles.inputError,
                    ]}
                    multiline
                    onFocus={() => setFocusedField("description")}
                    onBlur={() => setFocusedField(null)}
                    editable={!isPending}
                  />
                  {errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}
                </View>

                {/* ================= FOOTER ================= */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={handleClose}
                    disabled={isPending}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      isPending && styles.saveBtnDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <ActivityIndicator size="small" color="#0f172a" />
                    ) : (
                      <Text style={styles.saveText}>
                        {isEditMode ? "Update" : "Save"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ================= TOAST ================= */}
      <Toast visible={toastVisible} type={toastType} text={toastText} />
    </>
  );
};

export default AddGeneralEnquiryModal;

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

  subTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },

  content: {
    flex: 1,
    padding: 16,
    gap: 12,
  },

  inputWrapper: {
    gap: 4,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 5,
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },

  required: {
    color: "#ef4444",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
    padding: 12,
    backgroundColor: "#FFFFFF",
  },

  inputFocused: {
    borderColor: "#EFBF04",
    borderWidth: 2,
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

  textArea: {
    height: 90,
    textAlignVertical: "top",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
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

  saveBtn: {
    backgroundColor: "#EFBF04",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },

  saveBtnDisabled: {
    opacity: 0.6,
  },

  saveText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13,
  },
});
