import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenNavbar from "@/components/ScreenNavbar";

import { useAuthStore, selectAuthData } from "@/stores/auth-store";
import { useInfiniteCallCenterData } from "@/hooks/callcenter/useCallCenter";
import { CallCenterItem } from "@/api/callcenterapi";
import { getInitials, normalizeStatusKey } from "@/utils/utils";
import {
  Building2,
  Calendar,
  Laptop,
  Mail,
  MapPin,
  MapPinned,
  StickyNote,
  UserCheck,
} from "lucide-react-native";
import StatusDot from "@/components/StatusDot";
import CallCenterLeadFilterModal from "@/modals/callCenterLeadFilterModal";

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

const CallCenter = () => {
  const authData = useAuthStore(selectAuthData);
  const role = authData?.role.role_master_id;

  const initialFilters: CallCenterLeadFilters = {
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
    notes: "",
    agent: "",
  };
  const [draftFilters, setDraftFilters] =
    useState<CallCenterLeadFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<CallCenterLeadFilters>(initialFilters);

  const [openFilter, setOpenFilter] = useState(false);

  // 🔹 payload wahi jo API chahti hai
  const payload = useMemo(() => {
    if (!authData?.encrypted_user_id) return null;

    return {
      user_id: authData.encrypted_user_id,
      followup_startDate: "",
      followup_endDate: "",
      filter_agent: appliedFilters.agent,
      upload_startDate: "",
      upload_endDate: "",
      filter_name: appliedFilters.name,
      filter_mobile: appliedFilters.mobile1,
      filter_mobile2: appliedFilters.mobile2,
      filter_email: appliedFilters.email,
      filter_city: appliedFilters.city,
      filter_location: appliedFilters.location,
      filter_data_name: appliedFilters.dataname,
      filter_status: appliedFilters.status,
      filter_notes: appliedFilters.notes,
      page_no: 1,
    };
  }, [authData?.encrypted_user_id, appliedFilters]);

  console.log("Appliefiler Data: ", appliedFilters);

  // 🔹 infinite hook
  const query = useInfiniteCallCenterData(payload);
  const leads = useMemo(
    () => query.data?.pages.flatMap((p) => p.data.data ?? []) ?? [],
    [query.data]
  );
  const isEmpty = !query.isLoading && !query.isError && leads.length === 0;

  // 🔹 saare pages ka data ek array me
  const callCenterList = useMemo(
    () => query.data?.pages.flatMap((p) => p.data.data ?? []) ?? [],
    [query.data]
  );

  const STATUS_COLOR_MAP: Record<string, string> = {
    lead: "#2563EB", // Blue → New / Incoming
    landlord: "#16A34A", // Green → Verified / Owner
    prospect: "#F59E0B", // Amber → Potential / Warm
    ootacive: "#9CA3AF", // Gray → Inactive / Closed
  };

  const getStatusColor = (status?: string | null) => {
    if (!status) return "#9CA3AF";
    const key = normalizeStatusKey(status);
    return STATUS_COLOR_MAP[key] || "#9CA3AF";
  };

  const renderItem = ({ item }: { item: CallCenterItem }) => {
    const avtarName = getInitials(item.name);

    const canShowFollowUp =
      role === 1 && !!item.followup_date && !!item.followup_time;

    return (
      <View style={styles.itemContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avtarName}</Text>
            </View>
            <View style={styles.headerTextBlock}>
              <Text style={styles.nameText} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.mobileText}>{item.mobile}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={() => {
              // open action sheet / modal later
            }}
          >
            <Laptop size={18} color="#9ca3af" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Flex Wrap Container for all items */}
        <View style={styles.flexWrapContainer}>
          {/* Email */}
          {item.email && (
            <View style={styles.wrapItem}>
              <View style={styles.iconAndText}>
                <Mail size={18} color={"#9ca3af"} />
                <Text style={styles.labelText} numberOfLines={1}>
                  {item.email}
                </Text>
              </View>
            </View>
          )}

          {/* Assigned To */}
          {item.assigned_to_name && (
            <View style={styles.wrapItem}>
              <View style={styles.iconAndText}>
                <UserCheck size={15} color={"#9ca3af"} />
                <Text style={styles.labelText} numberOfLines={1}>
                  {item.assigned_to_name}
                </Text>
              </View>
            </View>
          )}

          {/* Status */}
          {item.status && (
            <View style={styles.wrapItem}>
              <View style={styles.iconAndText}>
                <StatusDot color={getStatusColor(item.status)} size={8} />
                <Text style={styles.labelText} numberOfLines={1}>
                  {item.status}
                </Text>
              </View>
            </View>
          )}

          {/* Data Name */}
          {item.data_name && (
            <View style={styles.wrapItem}>
              <View style={styles.iconAndText}>
                <MapPinned size={15} color={"#9ca3af"} />
                <Text style={styles.labelText} numberOfLines={1}>
                  {item.data_name}
                </Text>
              </View>
            </View>
          )}

          {/* City */}
          {item.city && (
            <View style={styles.wrapItem}>
              <View style={styles.iconAndText}>
                <Building2 size={15} color={"#9ca3af"} />
                <Text style={styles.labelText} numberOfLines={1}>
                  {item.city}
                </Text>
              </View>
            </View>
          )}

          {/* Follow Up */}
          {canShowFollowUp && (
            <View style={styles.wrapItem}>
              <View style={styles.iconAndText}>
                <Calendar size={15} color={"#9ca3af"} />
                <Text style={styles.labelText} numberOfLines={1}>
                  {item.followup_date} {item.followup_time}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Location - Full Width */}
        {item.location && (
          <View style={styles.fullWidthRow}>
            <MapPin size={15} color={"#9ca3af"} />
            <Text style={styles.labelText} numberOfLines={2}>
              {item.location}
            </Text>
          </View>
        )}

        {/* Notes - Full Width */}
        {item.notes && (
          <View style={styles.noteContainer}>
            <View style={styles.noteHeader}>
              <StickyNote size={13} color="#9CA3AF" />
              <Text style={styles.noteLabel}>Note</Text>
            </View>
            <Text style={styles.noteText} numberOfLines={3}>
              {item.notes}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScreenNavbar
        title="Call Center All Leads"
        onMenuPress={() => setOpenFilter(true)}
      />

      {query.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text>Loading...</Text>
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <Text>Something went wrong</Text>
        </View>
      ) : isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No leads found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting or clearing your filters
          </Text>

          <TouchableOpacity
            style={styles.clearFilterBtn}
            onPress={() => {
              setDraftFilters(initialFilters);
              setAppliedFilters(initialFilters);
            }}
          >
            <Text style={styles.clearFilterText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={callCenterList}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) {
              query.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator />
                <Text>Loading more...</Text>
              </View>
            ) : null
          }
        />
      )}

      <CallCenterLeadFilterModal
        values={draftFilters}
        onChange={setDraftFilters}
        open={openFilter}
        onApply={() => {
          setAppliedFilters(draftFilters);
          setOpenFilter(false);
        }}
        onClose={() => setOpenFilter(false)}
      />
    </SafeAreaView>
  );
};

export default CallCenter;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  listContent: {
    padding: 16,
    paddingBottom: 24,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  footer: {
    paddingVertical: 16,
    alignItems: "center",
    gap: 6,
  },

  /* ================= CARD ================= */

  itemContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    gap: 7,
  },

  cardHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFBF04",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 16,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  nameText: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 16,
    textTransform: "capitalize",
  },
  mobileText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 13,
    marginTop: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },

  // 🔥 Main Flex Wrap Container - Demo jaisa!
  flexWrapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  wrapItem: {
    width: "50%", // ✅ Exactly 2 items per row
    padding: 4, // ✅ Spacing between items
  },
  iconAndText: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  fullWidthRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  labelText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#0f172a",
    flex: 1,
  },

  // Note styles
  noteContainer: {
    marginHorizontal: 4,
    padding: 7,
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: "#9ca3af",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  noteText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4b5563",
    lineHeight: 15,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  clearFilterBtn: {
    marginTop: 12,
    backgroundColor: "#EFBF04",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  clearFilterText: {
    fontWeight: "700",
    color: "#0f172a",
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
});
