import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";

import ScreenNavbar from "@/components/ScreenNavbar";
import { useAuthStore, selectAuthData, selectIsHydrated } from "@/stores/auth-store";
import { useInfiniteFilterLeadApp } from "@/hooks/sidebar/useLeadsApi";
import type { FilterLeadAppItem } from "@/api/api";

const getDisplayName = (lead: FilterLeadAppItem) => {
  const name = `${lead.firstname ?? ""} ${lead.lastname ?? ""}`.trim();
  return name || (lead.company_name as string) || `Lead #${lead.lead_id}`;
};

export default function ViewAllLeads() {
  const authData = useAuthStore(selectAuthData);
  const isHydrated = useAuthStore(selectIsHydrated);

  useEffect(() => {
    if (!isHydrated) return;
    if (!authData) router.replace("/(auth)/login");
  }, [isHydrated, authData]);

  const payload = useMemo(() => {
    if (!authData?.encrypted_user_id) return null;

    return {
      user_id: authData.encrypted_user_id,
      limit: "20",
      lead_id: "",
      hot_lead: "",
      filter_firstname: "",
      filter_mobile: "",
      filter_email: "",
      filter_phone: "",
      filter_lead_main_type: "",
      filter_lead_type: "",
      filter_lead_status: "",
      filter_lead_sub_status: "",
      filter_category: "",
      filter_agent: "",
      filter_source: "",
      filter_channel: "",
      filter_campaigns: "",
      lead_sanity: "",
      date_created: "",
      type: "",
    };
  }, [authData?.encrypted_user_id]);

  const query = useInfiniteFilterLeadApp(payload);

  const leads = useMemo(
    () => query.data?.pages.flatMap((p) => p.data.data ?? []) ?? [],
    [query.data]
  );

  useEffect(() => {
    console.log("leads query:", {
      enabled: Boolean(payload?.user_id),
      status: query.status,
      fetchStatus: query.fetchStatus,
      error: query.error,
      pages: query.data?.pages?.length,
      count: leads.length,
    });
  }, [payload, query.status, query.fetchStatus, query.error, query.data, leads.length]);

  const renderItem = ({ item }: { item: FilterLeadAppItem }) => {
    const name = getDisplayName(item);
    const initial = (name?.charAt(0) || "L").toUpperCase();
    const phone = item.mobile || item.phone || "-";

    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.row}>
        <View style={styles.left}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.phone} numberOfLines={1}>{phone}</Text>
          </View>
        </View>
        <ChevronRight size={18} color="#9ca3af" strokeWidth={2.4} />
      </TouchableOpacity>
    );
  };

  if (!isHydrated) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <ScreenNavbar title="View All Leads" />
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScreenNavbar title="View All Leads" />

      {query.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>{query.error?.message ?? "Error"}</Text>
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => String(item.lead_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  listContent: { padding: 16, paddingBottom: 28 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, marginRight: 10 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#111827",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  textBlock: { flex: 1 },
  name: { color: "#0f172a", fontWeight: "800", fontSize: 14.5 },
  phone: { marginTop: 2, color: "#6b7280", fontWeight: "600", fontSize: 12.5 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 8 },
  loadingText: { color: "#6b7280", fontWeight: "600", fontSize: 13 },
  footer: { paddingVertical: 14, alignItems: "center", gap: 6 },
  footerText: { color: "#6b7280", fontWeight: "600", fontSize: 12 },
});
