// components/CampaignSelector.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  TextInput,
} from "react-native";
import { ChevronDown, CircleX, Check, FilterIcon } from "lucide-react-native";

interface CampaignOption {
  label: string;
  value: string;
}

interface CampaignSelectorProps {
  campaigns: CampaignOption[];
  selectedCampaign: CampaignOption | null;
  onSelect: (campaign: CampaignOption | null) => void;
  placeholder?: string;
  title: string;
}

export default function CampaignSelector({
  campaigns,
  selectedCampaign,
  onSelect,
  placeholder = "All",
  title,
}: CampaignSelectorProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCampaigns = useMemo(() => {
    if (!search.trim()) return campaigns;
    return campaigns.filter((campaign) =>
      campaign.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [campaigns, search]);

  const handleSelect = (campaign: CampaignOption) => {
    onSelect(campaign);
    setVisible(false);
    setSearch("");
  };

  const handleClearSelection = () => {
    onSelect(null);
    setVisible(false);
    setSearch("");
  };

  return (
    <>
      {/* ================= TRIGGER BUTTON ================= */}
      <TouchableOpacity
        style={styles.actionButton}
        activeOpacity={0.8}
        onPress={() => setVisible(true)}
      >
        <FilterIcon size={18} color="#9ca3af" />
      </TouchableOpacity>

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
              <Text style={styles.headerTitle}>{title}</Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CircleX size={22} color="#0f172a" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* SEARCH */}
            <TextInput
              placeholder="Search..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              placeholderTextColor="#9ca3af"
              autoFocus
            />

            {/* OPTIONS LIST */}
            <FlatList
              data={filteredCampaigns}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              style={styles.listContainer}
              ListHeaderComponent={
                <TouchableOpacity
                  style={[
                    styles.option,
                    !selectedCampaign && styles.selectedOption,
                  ]}
                  onPress={handleClearSelection}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      !selectedCampaign && styles.selectedText,
                    ]}
                  >
                    {placeholder}
                  </Text>
                  {!selectedCampaign && (
                    <Check size={18} color="#EFBF04" strokeWidth={3} />
                  )}
                </TouchableOpacity>
              }
              renderItem={({ item }) => {
                const isSelected = selectedCampaign?.value === item.value;
                return (
                  <TouchableOpacity
                    style={[styles.option, isSelected && styles.selectedOption]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedText,
                      ]}
                      numberOfLines={2}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Check size={18} color="#EFBF04" strokeWidth={3} />
                    )}
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
  // Trigger Button
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#fff",
    minWidth: 140,
    maxWidth: 200,
    gap: 8,
  },

  triggerText: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
    fontWeight: "500",
  },

  placeholder: {
    color: "#9ca3af",
  },

  // Modal Overlay
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
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

  // Header
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

  // Search Input
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
    marginBottom: 8,
  },

  // List Container
  listContainer: {
    maxHeight: 300,
  },

  // Option Item
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
    flex: 1,
  },

  selectedText: {
    fontWeight: "700",
  },

  // Empty State
  empty: {
    textAlign: "center",
    padding: 20,
    color: "#9ca3af",
  },

  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
