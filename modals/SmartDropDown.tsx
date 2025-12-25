import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  FlatList,
} from "react-native";
import { Check, CircleX } from "lucide-react-native";

export type Option = { label: string; value: string };

type Props = {
  label: string;
  options: Option[];
  value?: string;
  onChange: (val: string | undefined) => void;
  required?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** 🔴 SIMPLE ERROR PROP */
  textError?: string;
};

export default function SelectField({
  label,
  options,
  value,
  onChange,
  required,
  loading = false,
  disabled = false,
  textError,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel =
    options.find((o) => o.value === value)?.label || "Not selected";

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const isDisabled = disabled || loading;
  const hasError = !!textError;

  const handleSelect = (val?: string) => {
    onChange(val);
    setVisible(false);
    setSearch("");
  };

  return (
    <>
      {/* ================= FIELD ================= */}
      <View style={styles.field}>
        <Text style={styles.label}>
          {label} {required && <Text style={{ color: "#EF4444" }}>*</Text>}
        </Text>

        <TouchableOpacity
          style={[
            styles.trigger,
            isDisabled && styles.disabledTrigger,
            hasError && styles.errorBorder,
          ]}
          disabled={isDisabled}
          activeOpacity={0.8}
          onPress={() => setVisible(true)}
        >
          {loading ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              <Text style={[styles.triggerText, !value && styles.placeholder]}>
                {selectedLabel}
              </Text>
              <Text style={styles.icon}>▼</Text>
            </>
          )}
        </TouchableOpacity>

        {/* 🔴 ERROR TEXT */}
        {hasError && <Text style={styles.errorText}>{textError}</Text>}
      </View>

      {/* ================= CENTER MODAL ================= */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)} hitSlop={10}>
                <CircleX size={22} color="#0f172a" />
              </TouchableOpacity>
            </View>

            {/* SEARCH */}
            <TextInput
              placeholder="Search..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              autoFocus
            />

            {/* OPTIONS */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => {
                const isSelected = item.value === value;

                return (
                  <TouchableOpacity
                    style={[styles.option, isSelected && styles.selectedOption]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {isSelected && <Check size={18} color="#EFBF04" />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.empty}>No results found</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ============================ STYLES ============================ */

const styles = StyleSheet.create({
  field: {
   width: "100%"
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 5,
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },

  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#fff",
  },

  disabledTrigger: {
    backgroundColor: "#f3f4f6",
    opacity: 0.6,
  },

  errorBorder: {
    borderColor: "#EF4444",
    borderWidth: 1,
  },

  triggerText: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
  },

  placeholder: {
    color: "#9ca3af",
  },

  icon: {
    fontSize: 16,
    color: "#6b7280",
    marginLeft: 8,
  },

  errorText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
  },

  /* ---------------- modal ---------------- */

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
    padding: 12,
    paddingLeft: 10,
    backgroundColor: "#FFFFFF",
  },

  option: {
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectedOption: {
    backgroundColor: "#FFF6D1",
  },

  optionText: {
    fontSize: 14,
    color: "#111827",
  },

  selectedText: {
    fontWeight: "700",
  },

  empty: {
    textAlign: "center",
    padding: 20,
    color: "#9ca3af",
  },
});
