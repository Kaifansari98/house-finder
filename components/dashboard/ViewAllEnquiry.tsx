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
  MapPin,
  StickyNote,
  User,
} from "lucide-react-native";

const ViewAllEnquiry = () => {
  const authData = useAuthStore(selectAuthData);
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

  // Check if description is long (more than ~50 characters for 1 line)
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
          {/* Location & Enquired By in same row */}

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
      </View>

      {/* List */}
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
    </View>
  );
};

export default ViewAllEnquiry;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    gap: 10,
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
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
});
