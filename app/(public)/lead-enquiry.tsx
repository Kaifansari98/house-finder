import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenNavbar from "@/components/ScreenNavbar";
import {
  MapPin,
  MoreVertical,
  Edit2,
  Trash2,
  StickyNote,
  Wallet,
} from "lucide-react-native";

import { useAuthStore, selectAuthData } from "@/stores/auth-store";
import { useAllLeadEnquiries } from "@/hooks/enquiry/useEnquiry";
import { LeadEnquiryItem } from "@/api/enquiryapi";
import { getInitials } from "@/utils/utils";
import AddGeneralEnquiryModal, {
  EnquiryData,
} from "@/modals/enquiry/AddAndEditEnquiryModal";

/* ---------------- STATUS DOT ---------------- */
const StatusDot = ({ color = "green", size = 8 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
    }}
  />
);

/* ---------------- MAIN SCREEN ---------------- */
const LeadEnquiry = () => {
  const authData = useAuthStore(selectAuthData);
  const userId = authData?.encrypted_user_id;

  const { data, isLoading, isError, refetch } = useAllLeadEnquiries(
    userId ? { user_id: userId } : undefined
  );

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] =
    useState<LeadEnquiryItem | null>(null);

  /* ---------------- HELPERS ---------------- */
  type RentSellType = "rent" | "sell" | "buyer";

  /* ================= LABEL MAP ================= */

  const RENT_SELL_LABEL_MAP: Record<string, RentSellType> = {
    "1": "rent",
    "2": "sell",
    "3": "buyer",
  };

  /* ================= COLOR MAP ================= */

  const RENT_SELL_COLOR_MAP: Record<RentSellType, string> = {
    rent: "#3b82f6", // blue
    sell: "#22c55e", // green
    buyer: "#f97316", // orange
  };

  /* ================= HELPERS ================= */
  const getRentSell = (val?: string | number): RentSellType => {
    return RENT_SELL_LABEL_MAP[String(val)] ?? "buyer";
  };

  const getRentSellColor = (type?: RentSellType): string => {
    return (type && RENT_SELL_COLOR_MAP[type]) || "#9ca3af"; // fallback gray
  };

  const formatBudget = (budget: string) => {
    const num = Number(budget);
    if (isNaN(num)) return budget;

    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)} K`;
    return num.toString();
  };

  /* ---------------- HANDLERS ---------------- */
  const handleEdit = (item: LeadEnquiryItem) => {
    setSelectedEnquiry(item);
    setOpenMenuId(null);
    setOpenEditModal(true);
  };

  const handleDelete = (id: number) => {
    console.log("Delete enquiry:", id);
    // TODO: Implement delete functionality
    setOpenMenuId(null);
  };

  const handleModalClose = () => {
    setOpenEditModal(false);
    setSelectedEnquiry(null);
    // Refetch data to get updated list
    refetch();
  };

  /* ---------------- RENDER ITEM ---------------- */
  const renderItem = ({ item }: { item: LeadEnquiryItem }) => {
    const isMenuOpen = openMenuId === item.id;
    const name = item.fullname;
    const avatarText = name ? getInitials(name) : "NA";
    const rentSell = getRentSell(item.rent_sell);
    const rentSellLabel = getRentSell(item.rent_sell);

    return (
      <View style={styles.itemContainer}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, !name && styles.avatarEmpty]}>
              <Text style={styles.avatarText}>{avatarText}</Text>
            </View>

            <View style={styles.headerTextBlock}>
              <Text style={styles.nameText} numberOfLines={1}>
                {name || "Name Not Provided"}
              </Text>

              <View style={styles.rentSellRow}>
                <StatusDot color={getRentSellColor(rentSell)} size={8} />
                <Text style={styles.rentSellText}>
                  {rentSellLabel.toUpperCase()} 
                </Text>
              </View>
            </View>
          </View>

          {/* MENU BUTTON */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setOpenMenuId(isMenuOpen ? null : item.id)}
          >
            <MoreVertical size={18} color="#9ca3af" />
          </TouchableOpacity>

          {/* MENU */}
          {isMenuOpen && (
            <View style={styles.popover}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleEdit(item)}
              >
                <Edit2 size={15} color="#0f172a" />
                <Text style={styles.menuItemText}>Edit</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleDelete(item.id)}
              >
                <Trash2 size={15} color="#ef4444" />
                <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* BUDGET */}
        <View style={styles.wrapItem}>
          <Wallet size={15} color="#9ca3af" />
          <Text style={styles.labelText}>
            ₹{formatBudget(item.budget)} / {item.payment_type}
          </Text>
        </View>

        {/* LOCATION */}
        <View style={styles.fullWidthRow}>
          <MapPin size={15} color="#9ca3af" />
          <Text style={styles.labelText}>{item.location}</Text>
        </View>

        {/* DESCRIPTION */}
        {item.description && (
          <View style={styles.noteContainer}>
            <View style={styles.noteHeader}>
              <StickyNote size={13} color="#9CA3AF" />
              <Text style={styles.noteLabel}>Description</Text>
            </View>
            <Text style={styles.noteText}>{item.description}</Text>
          </View>
        )}
      </View>
    );
  };

  /* ---------------- PREPARE ENQUIRY DATA FOR MODAL ---------------- */
  const getEnquiryDataForModal = (): EnquiryData | undefined => {
    if (!selectedEnquiry) return undefined;

    return {
      lead_enquiry_id: selectedEnquiry.id.toString(),
      rentsell: selectedEnquiry.rent_sell,
      location: selectedEnquiry.location,
      budget: selectedEnquiry.budget,
      payment_type: selectedEnquiry.payment_type,
      description: selectedEnquiry.description || "",
    };
  };

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenNavbar title="View My Enquiry" />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#EFBF04" />
          <Text style={styles.loadingText}>Loading enquiries...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Something went wrong</Text>
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No enquiries found</Text>
            </View>
          }
        />
      )}

      {/* ================= EDIT MODAL ================= */}
      <AddGeneralEnquiryModal
        visible={openEditModal}
        onClose={handleModalClose}
        enquiryData={getEnquiryDataForModal()}
      />
    </SafeAreaView>
  );
};

export default LeadEnquiry;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  listContainer: { padding: 10 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },

  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9ca3af",
  },

  itemContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    gap: 7,
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
  },

  cardHeader: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFBF04",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarEmpty: { backgroundColor: "#E5E7EB" },

  avatarText: {
    fontWeight: "800",
    fontSize: 16,
    color: "#0f172a",
  },

  headerTextBlock: { flex: 1 },

  nameText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },

  rentSellRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  rentSellText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },

  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  popover: {
    position: "absolute",
    top: 35,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },

  menuItem: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    alignItems: "center",
  },

  menuItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },

  menuItemTextDanger: { color: "#ef4444" },

  menuDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  wrapItem: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },

  fullWidthRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },

  labelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },

  noteContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    padding: 7,
    borderLeftWidth: 2,
    borderLeftColor: "#9ca3af",
  },

  noteHeader: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    marginBottom: 3,
  },

  noteLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: 0.5,
  },

  noteText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4b5563",
  },
});
