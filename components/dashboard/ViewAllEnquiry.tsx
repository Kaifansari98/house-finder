import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { selectAuthData, useAuthStore } from "@/stores/auth-store";
import {
  CalendarFoldIcon,
  ChevronUp,
  ChevronDown,
  MapPin,
  StickyNote,
  User,
} from "lucide-react-native";
import { useRouter } from "expo-router";

const ViewAllEnquiry = () => {
  const authData = useAuthStore(selectAuthData);
  const router = useRouter();
  const { data: dashboardData } = useDashboardData(
    authData
      ? {
          user_id: Number(authData.user.user_id),
          role_id: Number(authData.user.role_id),
        }
      : null
  );

  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );

  const [showEnquiry, setShowEnquiry] = useState(false);

  const enquiryData = dashboardData?.data.view_all_lead_enquiry || [];

  // Type mapping
  const getType = (rentSell: string) => {
    const types: Record<string, string> = {
      "1": "Rent",
      "2": "Sell",
      "3": "Buy",
    };
    return types[rentSell] || "N/A";
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Toggle description expansion
  const toggleDescription = (itemId: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Helper function for badge colors
  const getTypeBadgeColor = (rentSell: string) => {
    switch (rentSell) {
      case "1":
        return styles.rentBadge;
      case "2":
        return styles.sellBadge;
      case "3":
        return styles.buyBadge;
      default:
        return styles.defaultBadge;
    }
  };

  // Check if description is long
  const isDescriptionLong = (description: string) => {
    return description && description.length > 50;
  };

  // ============ CARD VIEW ============
  const renderCardView = ({ item }: any) => {
    const isExpanded = expandedItems[item.id];
    const description = item.description || "No description";
    const shouldShowReadMore = isDescriptionLong(description);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {/* Badge */}
          <View style={[styles.typeBadge, getTypeBadgeColor(item.rent_sell)]}>
            <Text style={styles.typeBadgeText}>{getType(item.rent_sell)}</Text>
          </View>
          {/* Date */}
          <View style={styles.timeContainer}>
            <CalendarFoldIcon size={15} color="#9ca3af" strokeWidth={2} />
            <Text style={styles.statusText}>{formatDate(item.created_at)}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.fullWidthRow}>
            <MapPin size={15} color="#9ca3af" />
            <Text style={styles.labelText} numberOfLines={1}>
              {item.location || "N/A"}
            </Text>
          </View>

          <View style={styles.fullWidthRow}>
            <User size={15} color="#9ca3af" />
            <Text style={styles.labelText} numberOfLines={1}>
              {item.created_by_name || "Unknown"}
            </Text>
          </View>

          {/* Description with Read More */}
          <View style={styles.noteContainer}>
            <View style={styles.noteHeader}>
              <StickyNote size={13} color="#9CA3AF" />
              <Text style={styles.noteLabel}>Description</Text>
            </View>
            <Text
              style={styles.noteText}
              numberOfLines={isExpanded ? undefined : 1}
            >
              {description}
            </Text>
            {shouldShowReadMore && (
              <TouchableOpacity
                onPress={() => toggleDescription(item.id)}
                style={styles.readMoreButton}
              >
                <Text style={styles.readMoreText}>
                  {isExpanded ? "Read less" : "Read more"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lead Enquiries</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.viewBtn}
          onPress={() => router.push("/(public)/lead-enquiry")}
        >
          <Text style={styles.btnText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Collapsed Preview - Shows when enquiry is hidden */}
      {!showEnquiry && (
        <View style={styles.previewContainer}>
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{enquiryData.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {enquiryData.filter((item) => item.rent_sell === "1").length}
              </Text>
              <Text style={styles.statLabel}>Rent</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {enquiryData.filter((item) => item.rent_sell === "2").length}
              </Text>
              <Text style={styles.statLabel}>Sell</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {enquiryData.filter((item) => item.rent_sell === "3").length}
              </Text>
              <Text style={styles.statLabel}>Buy</Text>
            </View>
          </View>

          {/* Empty State */}
          {enquiryData.length === 0 && (
            <View style={styles.emptyPreview}>
              <Text style={styles.emptyPreviewText}>No enquiries yet</Text>
            </View>
          )}
        </View>
      )}

      {/* Expanded List - Shows when enquiry is visible */}
      {showEnquiry && (
        <FlatList
          data={enquiryData}
          renderItem={renderCardView}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No enquiries found</Text>
            </View>
          }
        />
      )}

      {/* Toggle Button */}
      <TouchableOpacity
        style={styles.toggleContainer}
        onPress={() => setShowEnquiry(!showEnquiry)}
      >
        {showEnquiry ? (
          <ChevronUp size={25} color="#9ca3af" strokeWidth={3} />
        ) : (
          <ChevronDown size={25} color="#9ca3af" strokeWidth={3} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ViewAllEnquiry;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    gap: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  listContainer: {
    paddingBottom: 10,
  },
  viewBtn: {
    backgroundColor: "#EFBF40",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 10,
  },
  btnText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // ============ PREVIEW/COLLAPSED STYLES ============
  previewContainer: {
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#E5E7EB",
  },
  recentPreview: {
    gap: 6,
  },
  recentLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recentCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#EFBF40",
    gap: 6,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  miniTypeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
  },
  recentDate: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6b7280",
  },
  recentLocation: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  emptyPreview: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  emptyPreviewText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9ca3af",
  },

  // ============ CARD STYLES ============
  card: {
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  rentBadge: {
    backgroundColor: "#dbeafe",
  },
  sellBadge: {
    backgroundColor: "#dcfce7",
  },
  buyBadge: {
    backgroundColor: "#fef3c7",
  },
  defaultBadge: {
    backgroundColor: "#f1f5f9",
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
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
    color: "#6b7280",
  },
  cardContent: {
    gap: 7,
  },
  fullWidthRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    flex: 1,
  },
  labelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
  },

  // ============ DESCRIPTION NOTE STYLES ============
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
    textTransform: "uppercase",
  },
  noteText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4b5563",
    lineHeight: 18,
  },
  readMoreButton: {
    marginTop: 0,
    alignSelf: "flex-start",
  },
  readMoreText: {
    fontSize: 11,
    color: "#3b82f6",
    fontWeight: "700",
  },

  // ============ EMPTY STATE ============
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
  },

  // ============ TOGGLE BUTTON ============
  toggleContainer: {
    alignItems: "center",
    paddingTop: 5,
  },
});
