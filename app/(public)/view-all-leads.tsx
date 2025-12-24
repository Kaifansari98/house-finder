import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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

const getDisplayName = (lead: FilterLeadAppItem) => {
  const name = `${lead.firstname ?? ""} ${lead.lastname ?? ""}`.trim();
  return name || (lead.company_name as string) || `Lead #${lead.lead_id}`;
};

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

export default function ViewAllLeads() {
  const authData = useAuthStore(selectAuthData);
  const isHydrated = useAuthStore(selectIsHydrated);
  const initialFilters: LeadFilters = {
    ref: "",
    name: "",
    mobile: "",
    lead_status: "",
    lead_sub_status: "",
    lead_source: "",
    lead_channel: "",
    lead_campaign: "",
    lead_agent: "",
    date_created: "",
  };

  const [draftFilters, setDraftFilters] = useState<LeadFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<LeadFilters>(initialFilters);

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!isHydrated) return;
    if (!authData) router.replace("/(auth)/login");
  }, [isHydrated, authData]);

  const payload = useMemo(() => {
    if (!authData?.encrypted_user_id) return null;

    return {
      user_id: authData.encrypted_user_id,
      limit: "20",

      // text filters
      lead_id: appliedFilters.ref,
      filter_firstname: appliedFilters.name,
      filter_mobile: appliedFilters.mobile,

      // 🔥 DROPDOWN FILTERS (THIS WAS MISSING)
      filter_lead_status: appliedFilters.lead_status,
      filter_lead_sub_status: appliedFilters.lead_sub_status,
      filter_source: appliedFilters.lead_source,
      filter_channel: appliedFilters.lead_channel,
      filter_campaigns: appliedFilters.lead_campaign,
      filter_agent: appliedFilters.lead_agent,

      // unused / optional
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
  const admin = authData?.role.role_master_id === 1;
  const router = useRouter();

  const leads = useMemo(
    () => query.data?.pages.flatMap((p) => p.data.data ?? []) ?? [],
    [query.data]
  );

  useEffect(() => {
    // console.log("leads query:", {
    //   enabled: Boolean(payload?.user_id),
    //   status: query.status,
    //   fetchStatus: query.fetchStatus,
    //   error: query.error,
    //   pages: query.data?.pages?.length,
    //   count: leads.length,
    // });
  }, [
    payload,
    query.status,
    query.fetchStatus,
    query.error,
    query.data,
    leads.length,
  ]);

  const STATUS_COLOR_MAP: Record<string, string> = {
    open: "#22C55E", // Green
    closed: "#EF4444", // Red
  };

  const SUB_STATUS_COLOR_MAP: Record<string, string> = {
    newlead: "#0000FF", // Blue
    contactinginterested: "#FFFF00", // Yellow
    qualifiedready: "#32CD32", // Light Green
    wonconverted: "#008000", // Dark Green
    lostnotinterested: "#FFA500", // Orange
    disqualifiedinvalid: "#FF0000", // Red
    followupretry: "#800080", // Purple
  };

  const renderItem = ({ item }: { item: FilterLeadAppItem }) => {
    const name = getDisplayName(item);
    const initial = (name?.charAt(0) || "L").toUpperCase();
    const phone = item.mobile || item.phone || "-";
    const getStatusColor = (status?: string) => {
      if (!status) return "#9CA3AF"; // fallback gray

      return STATUS_COLOR_MAP[status.toLowerCase()] || "#9CA3AF";
    };

    const getSubStatusColor = (status?: string) => {
      const key = normalizeStatusKey(status);
      return SUB_STATUS_COLOR_MAP[key] || "#9CA3AF"; // fallback gray
    };

    const openLeadDetails = (enc_id: string) => {
      router.push({
        pathname: "/(public)/lead-details",
        params: { enc_id },
      });
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.container}
        onPress={() => openLeadDetails(item.enc_id)}
      >
        {/* avtar, name, code  */}
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

        <View style={styles.seconderow}>
          <View style={styles.phoneContainer}>
            <PhoneCall size={18} color={"#EFBF04"} />
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
              <Text style={styles.statusText}>
                {item.lead_main_status_name}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.thirdrow}>
          <View>
            <Text style={styles.campaignName}>Damac Islands Landing Page</Text>
          </View>

          <View style={styles.statusSubContainer}>
            <StatusDot color={getStatusColor(item.lead_status_name)} size={8} />
            <Text style={styles.statusText}>{item.lead_status_name}</Text>
          </View>
        </View>

        {admin && item.enquiry_date && (
          <View style={styles.fourrow}>
            <View style={styles.dateContainer}>
              <Calendar size={18} color="#EFBF04" />
              <Text style={styles.dateText}>
                {formatDate(item.enquiry_date)}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!isHydrated) {
    return (
      <SafeAreaView
        edges={["top", "left", "right", "bottom"]}
        style={styles.safeArea}
      >
        <ScreenNavbar title="View All Leads" />
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isEmpty = !query.isLoading && !query.isError && leads.length === 0;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScreenNavbar
        title="View All Leads"
        onMenuPress={() => setMenuOpen(true)}
      />

      {query.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>
            {query.error?.message ?? "Something went wrong"}
          </Text>
        </View>
      ) : isEmpty ? (
        /* ================= EMPTY STATE ================= */
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
          data={leads}
          keyExtractor={(item, index) => `${item.lead_id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage)
              query.fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator />
                <Text style={styles.footerText}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      )}

      <LeadFilterModal
        values={draftFilters}
        onChange={setDraftFilters}
        visible={menuOpen}
        onApply={() => {
          setAppliedFilters(draftFilters); // ✅ APPLY
          setMenuOpen(false);
        }}
        onClose={() => setMenuOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  listContent: { padding: 16, paddingBottom: 28 },
  container: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D3D3D3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#0f172a", fontWeight: "800", fontSize: 18 },
  textBlock: { flex: 1 },
  name: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 18,
    textTransform: "capitalize",
  },
  pfix: { color: "#808080", fontWeight: "700", fontSize: 14 },
  phone: { marginTop: 2, fontWeight: "600", fontSize: 16, color: "#0f172a" },
  phoneContainer: { flexDirection: "row", gap: 5, alignItems: "center" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  loadingText: { color: "#6b7280", fontWeight: "600", fontSize: 13 },
  footer: { paddingVertical: 14, alignItems: "center", gap: 6 },
  footerText: { color: "#6b7280", fontWeight: "600", fontSize: 16 },
  seconderow: { flexDirection: "row", justifyContent: "space-between" },
  statusText: { color: "#0f172a", fontWeight: "600", fontSize: 16 },
  statusSubContainer: { flexDirection: "row", gap: 5, alignItems: "center" },
  statusContainer: { flexDirection: "row", gap: 12, alignItems: "center" },
  thirdrow: { flexDirection: "row", justifyContent: "space-between" },
  campaignName: { color: "#0f172a", fontSize: 16, fontWeight: "600" },
  fourrow: { flexDirection: "row", justifyContent: "space-between" },

  dateContainer: { flexDirection: "row", gap: 6, alignItems: "center" },

  dateText: { fontSize: 16 },

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
