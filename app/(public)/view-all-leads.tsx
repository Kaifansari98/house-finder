import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, ChevronRight, PhoneCall } from "lucide-react-native";

import ScreenNavbar from "@/components/ScreenNavbar";
import {
  useAuthStore,
  selectAuthData,
  selectIsHydrated,
} from "@/stores/auth-store";
import { useInfiniteFilterLeadApp } from "@/hooks/sidebar/useLeadsApi";
import type { FilterLeadAppItem } from "@/api/api";
import StatusDot from "@/components/StatusDot";
import { formatDate, normalizeStatusKey } from "@/utils/utils";
import LeadFilterModal from "@/modals/LeadFilterModal";

/* ===================== TYPES ===================== */

export type LeadFilters = {
  ref: string;
  name: string;
  mobile: string;
  lead_status: string;
  lead_sub_status: string;
  lead_source: string;
  lead_channel: string;
  lead_campaign: string;
  lead_agent: string;
  date_created: string;
};

/* ===================== CONSTANTS ===================== */

const STATUS_COLOR_MAP: Record<string, string> = {
  open: "#22C55E",
  closed: "#EF4444",
};

const SUB_STATUS_COLOR_MAP: Record<string, string> = {
  newlead: "#0000FF",
  contactinginterested: "#FFFF00",
  qualifiedready: "#32CD32",
  wonconverted: "#008000",
  lostnotinterested: "#FFA500",
  disqualifiedinvalid: "#FF0000",
  followupretry: "#800080",
};

const FALLBACK_COLOR = "#9CA3AF";

/* ===================== HELPERS ===================== */

const getDisplayName = (lead: FilterLeadAppItem): string => {
  const name = `${lead.firstname ?? ""} ${lead.lastname ?? ""}`.trim();
  return name || (lead.company_name as string) || `Lead #${lead.lead_id}`;
};

const getStatusColor = (status?: string): string => {
  if (!status) return FALLBACK_COLOR;
  return STATUS_COLOR_MAP[status.toLowerCase()] || FALLBACK_COLOR;
};

const getSubStatusColor = (status?: string): string => {
  const key = normalizeStatusKey(status);
  return SUB_STATUS_COLOR_MAP[key] || FALLBACK_COLOR;
};

/* ===================== LEAD ITEM COMPONENT ===================== */

interface LeadItemProps {
  item: FilterLeadAppItem;
  admin: boolean;
  onPress: (enc_id: string) => void;
}

const LeadItem = React.memo<LeadItemProps>(({ item, admin, onPress }) => {
  const name = getDisplayName(item);
  const initial = (name?.charAt(0) || "L").toUpperCase();
  const phone = item.mobile || item.phone || "-";

  const handlePress = useCallback(() => {
    onPress(item.enc_id);
  }, [item.enc_id, onPress]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.container}
      onPress={handlePress}
    >
      {/* Avatar, name, code */}
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.pfix} numberOfLines={1}>
            {item.pfix}
          </Text>
        </View>
        <ChevronRight size={22} color="#9ca3af" strokeWidth={2.4} />
      </View>

      {/* Phone & Sub Status */}
      <View style={styles.seconderow}>
        <View style={styles.phoneContainer}>
          <PhoneCall size={15} color="#9ca3af" />
          <Text style={styles.phone} numberOfLines={1}>
            {phone}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusSubContainer}>
            <StatusDot
              color={getSubStatusColor(item.lead_main_status_name)}
              size={8}
            />
            <Text style={styles.statusText}>{item.lead_main_status_name}</Text>
          </View>
        </View>
      </View>

      {/* Campaign & Status */}
      <View style={styles.thirdrow}>
        <View>
          <Text style={styles.campaignName}>Damac Islands Landing Page</Text>
        </View>

        <View style={styles.statusSubContainer}>
          <StatusDot color={getStatusColor(item.lead_status_name)} size={8} />
          <Text style={styles.statusText}>{item.lead_status_name}</Text>
        </View>
      </View>

      {/* Date (Admin only) */}
      {admin && item.enquiry_date && (
        <View style={styles.fourrow}>
          <View style={styles.dateContainer}>
            <Calendar size={15} color="#9ca3af" />
            <Text style={styles.dateText}>{formatDate(item.enquiry_date)}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

LeadItem.displayName = "LeadItem";

/* ===================== EMPTY STATE COMPONENT ===================== */

interface EmptyStateProps {
  onClearFilters: () => void;
}

const EmptyState = React.memo<EmptyStateProps>(({ onClearFilters }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyTitle}>No leads found</Text>
    <Text style={styles.emptySubtitle}>
      Try adjusting or clearing your filters
    </Text>
    <TouchableOpacity style={styles.clearFilterBtn} onPress={onClearFilters}>
      <Text style={styles.clearFilterText}>Clear Filters</Text>
    </TouchableOpacity>
  </View>
));

EmptyState.displayName = "EmptyState";

/* ===================== LOADING STATE COMPONENT ===================== */

interface LoadingStateProps {
  message?: string;
}

const LoadingState = React.memo<LoadingStateProps>(
  ({ message = "Loading..." }) => (
    <View style={styles.center}>
      <ActivityIndicator />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  )
);

LoadingState.displayName = "LoadingState";

/* ===================== MAIN COMPONENT ===================== */

export default function ViewAllLeads() {
  const authData = useAuthStore(selectAuthData);
  const isHydrated = useAuthStore(selectIsHydrated);
  const router = useRouter();

  const params = useLocalSearchParams<{
    lead_main_status_id?: string;
    campaign_id?: string;
    agent_id?: string;
  }>();


  console.log("Lead main satus id: ", params.lead_main_status_id)
  console.log("campaign id: :", params.campaign_id)
  console.log("Agent id: ", params.agent_id)


  // Initial filters based on params
  const initialFilters = useMemo<LeadFilters>(
    () => ({
      ref: "",
      name: "",
      mobile: "",
      lead_status: "",
      lead_sub_status: params.lead_main_status_id ?? "",
      lead_source: "",
      lead_channel: "",
      lead_campaign: params.campaign_id ?? "",
      lead_agent: params.agent_id ?? "",
      date_created: "",
    }),
    [params.lead_main_status_id, params.campaign_id, params.agent_id]
  );

  const [draftFilters, setDraftFilters] = useState<LeadFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<LeadFilters>(initialFilters);
  const [menuOpen, setMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isHydrated) return;
    if (!authData) router.replace("/(auth)/login");
  }, [isHydrated, authData, router]);

  // Reset filters when params change
  useEffect(() => {
    if (params.lead_main_status_id || params.campaign_id || params.agent_id) {
      setDraftFilters(initialFilters);
      setAppliedFilters(initialFilters);
    }
  }, [
    initialFilters,
    params.lead_main_status_id,
    params.campaign_id,
    params.agent_id,
  ]);

  // Build API payload
  const payload = useMemo(() => {
    if (!authData?.encrypted_user_id) return null;

    return {
      user_id: authData.encrypted_user_id,
      limit: "20",
      lead_id: appliedFilters.ref,
      filter_firstname: appliedFilters.name,
      filter_mobile: appliedFilters.mobile,
      filter_lead_status: appliedFilters.lead_status,
      filter_lead_sub_status: appliedFilters.lead_sub_status,
      filter_source: appliedFilters.lead_source,
      filter_channel: appliedFilters.lead_channel,
      filter_campaigns: appliedFilters.lead_campaign,
      filter_agent: appliedFilters.lead_agent,
      hot_lead: "",
      filter_email: "",
      filter_phone: "",
      filter_lead_main_type: "",
      filter_lead_type: "",
      filter_category: "",
      lead_sanity: "",
      date_created: appliedFilters.date_created,
      type: "",
    };
  }, [authData?.encrypted_user_id, appliedFilters]);

  const query = useInfiniteFilterLeadApp(payload);

  const admin = useMemo(
    () => authData?.role.role_master_id === 1,
    [authData?.role.role_master_id]
  );

  const leads = useMemo(
    () => query.data?.pages.flatMap((p) => p.data.data ?? []) ?? [],
    [query.data]
  );

  const isEmpty = !query.isLoading && !query.isError && leads.length === 0;

  // Handlers
  const handleOpenLeadDetails = useCallback(
    (enc_id: string) => {
      router.push({
        pathname: "/(public)/lead-details",
        params: { enc_id },
      });
    },
    [router]
  );

  const handleClearFilters = useCallback(() => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }, [initialFilters]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setMenuOpen(false);
  }, [draftFilters]);

  const handleCloseModal = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleOpenModal = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  const renderItem = useCallback(
    ({ item }: { item: FilterLeadAppItem }) => (
      <LeadItem item={item} admin={admin} onPress={handleOpenLeadDetails} />
    ),
    [admin, handleOpenLeadDetails]
  );

  const keyExtractor = useCallback(
    (item: FilterLeadAppItem, index: number) => `${item.lead_id}-${index}`,
    []
  );

  const renderFooter = useCallback(() => {
    if (!query.isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  }, [query.isFetchingNextPage]);

  // Loading state before hydration
  if (!isHydrated) {
    return (
      <SafeAreaView
        edges={["top", "left", "right", "bottom"]}
        style={styles.safeArea}
      >
        <ScreenNavbar title="View All Leads" />
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScreenNavbar title="View All Leads" onMenuPress={handleOpenModal} />

      {query.isLoading ? (
        <LoadingState message="Loading leads..." />
      ) : query.isError ? (
        <LoadingState
          message={query.error?.message ?? "Something went wrong"}
        />
      ) : isEmpty ? (
        <EmptyState onClearFilters={handleClearFilters} />
      ) : (
        <FlatList
          data={leads}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={5}
        />
      )}

      <LeadFilterModal
        values={draftFilters}
        onChange={setDraftFilters}
        visible={menuOpen}
        onApply={handleApplyFilters}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  container: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    gap: 7,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    fontWeight: "800",
    fontSize: 16,
    color: "#0f172a",
  },
  textBlock: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  pfix: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "600",
  },
  phone: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  phoneContainer: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  footer: {
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 16,
  },
  seconderow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  statusSubContainer: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  thirdrow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  campaignName: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "600",
  },
  fourrow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
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
});
