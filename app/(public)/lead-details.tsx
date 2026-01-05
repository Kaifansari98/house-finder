import ScreenNavbar from "@/components/ScreenNavbar";
import { useLeadDetails } from "@/hooks/sidebar/useLeadsApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import {
  FolderPlus,
  LaptopMinimal,
  Phone,
  SquarePen,
  Video,
} from "lucide-react-native";
import StatusDot from "@/components/StatusDot";
import { normalizeStatusKey } from "@/utils/utils";
import { selectAuthData, useAuthStore } from "@/stores/auth-store";
import LeadNotesModal from "@/modals/LeadNotesModal";
import ScheduleMeetingModal from "@/modals/ScheduleMeetingModal";
import LeadTerminalSheet, { LeadTerminalSheetRef } from "@/modals/LeadTerminalModal";

export default function LeadDetails() {
  const { enc_id } = useLocalSearchParams<{ enc_id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, error } = useLeadDetails(enc_id);

  const authData = useAuthStore(selectAuthData);
  const adminId = authData?.role.role_master_id;

  const terminalSheetRef = useRef<LeadTerminalSheetRef>(null);
  const [notesOpen, setNotesopen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);

  const STATUS_COLOR_MAP: Record<string, { dot: string; bg: string }> = {
    open: {
      dot: "#22C55E", // Green
      bg: "#DCFCE7", // Light Green
    },
    closed: {
      dot: "#EF4444", // Red
      bg: "#FEE2E2", // Light Red
    },
  };

  const SUB_STATUS_COLOR_MAP: Record<string, { dot: string; bg: string }> = {
    newlead: {
      dot: "#0000FF",
      bg: "#E0E7FF",
    },
    contactinginterested: {
      dot: "#FFFF00",
      bg: "#FEF9C3",
    },
    qualifiedready: {
      dot: "#32CD32",
      bg: "#ECFDF5",
    },
    wonconverted: {
      dot: "#008000",
      bg: "#DCFCE7",
    },
    lostnotinterested: {
      dot: "#FFA500",
      bg: "#FFEDD5",
    },
    disqualifiedinvalid: {
      dot: "#FF0000",
      bg: "#FEE2E2",
    },
    followupretry: {
      dot: "#800080",
      bg: "#F3E8FF",
    },
  };

  const HOT_LEAD_STYLE = {
    dot: "#EF4444", // Red
    bg: "#FEE2E2", // Light Red
  };

  const NOT_HOT_STYLE = {
    dot: "#6B7280", // Gray
    bg: "#F3F4F6", // Light Gray
  };
  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenNavbar title="Lead Details" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#EFBF04" />
          <Text style={styles.muted}>Loading lead details…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenNavbar title="Lead Details" />
        <View style={styles.center}>
          <Text style={styles.error}>
            {error?.message ?? "Failed to load lead details"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusKey = normalizeStatusKey(data.lead_status_name);
  const subStatusKey = normalizeStatusKey(data.lead_main_status_name);

  const statusStyle = STATUS_COLOR_MAP[statusKey] ?? {
    dot: "#9CA3AF",
    bg: "#F3F4F6",
  };

  const subStatusStyle = SUB_STATUS_COLOR_MAP[subStatusKey] ?? {
    dot: "#9CA3AF",
    bg: "#F3F4F6",
  };

  const DetailRow = ({ icon, label, value, iconType = "ionicons" }: any) => (
    <View style={styles.detailRow}>
      <View style={styles.detailRowLeft}>
        {iconType === "ionicons" && (
          <Ionicons name={icon} size={16} color="#9CA3AF" />
        )}
        {iconType === "material" && (
          <MaterialCommunityIcons name={icon} size={16} color="#9CA3AF" />
        )}
        {iconType === "fa5" && (
          <FontAwesome5 name={icon} size={14} color="#9CA3AF" />
        )}
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue} numberOfLines={2}>
        {value || "—"}
      </Text>
    </View>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIndicator} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScreenNavbar title="Lead Details" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Action Buttons */}
        <View style={styles.card}>
          <SectionHeader title="ACTIONS" />
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => terminalSheetRef.current?.open()}
            >
              <LaptopMinimal size={20} color="#EFBF04" />
              <Text style={styles.actionButtonText}>Terminal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setNotesopen(true)}
              style={styles.actionButton}
            >
              <FolderPlus size={20} color="#EFBF04" />
              <Text style={styles.actionButtonText}>Notes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push({
                  pathname: "/(public)/edit-lead",
                  params: {
                    lead_id_enc: enc_id,
                  },
                }) 
              }
            >
              <SquarePen size={20} color="#EFBF04" />
              <Text style={styles.actionButtonText}>Update</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Phone size={20} color="#EFBF04" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMeetingOpen(true)}
              style={styles.actionButton}
            >
              <Video size={20} color="#EFBF04" />
              <Text style={styles.actionButtonText}>Meeting</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status  */}
        <View style={styles.card}>
          <SectionHeader title="Status" />

          <View style={styles.statusContainer}>
            <View>
              <Text style={styles.statusLabel}>Status</Text>
              <View
                style={[
                  styles.statusWrapper,
                  { backgroundColor: statusStyle.bg },
                ]}
              >
                <StatusDot size={8} color={statusStyle.dot} />
                <Text>{data.lead_status_name}</Text>
              </View>
            </View>

            <View>
              <Text style={styles.statusLabel}>Sub Status</Text>
              <View
                style={[
                  styles.statusWrapper,
                  { backgroundColor: subStatusStyle.bg },
                ]}
              >
                <StatusDot size={8} color={subStatusStyle.dot} />
                <Text>{data.lead_main_status_name}</Text>
              </View>
            </View>

            <View>
              <Text style={styles.statusLabel}>Hot Lead</Text>
              {data.hot_lead === 1 ? (
                <View
                  style={[
                    styles.statusWrapper,
                    { backgroundColor: HOT_LEAD_STYLE.bg },
                  ]}
                >
                  <StatusDot size={8} color={HOT_LEAD_STYLE.dot} />
                  <Text>Yes</Text>
                </View>
              ) : data.hot_lead === 0 ? (
                <View
                  style={[
                    styles.statusWrapper,
                    { backgroundColor: NOT_HOT_STYLE.bg },
                  ]}
                >
                  <StatusDot size={8} color={NOT_HOT_STYLE.dot} />
                  <Text>No</Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.statusWrapper,
                    { backgroundColor: NOT_HOT_STYLE.bg },
                  ]}
                >
                  <StatusDot size={8} color={NOT_HOT_STYLE.dot} />
                  <Text>Not Available</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Lead Information */}
        <View style={styles.card}>
          <SectionHeader title="LEAD INFORMATION" />

          <DetailRow
            icon="document-text-outline"
            label="Reference No"
            value={data.pfix}
          />
          <DetailRow
            icon="person-outline"
            label="Full Name"
            value={data.firstname}
          />

          <DetailRow
            icon="people-outline"
            label="Agent"
            value={data.agent_fullname}
          />

          <DetailRow
            icon="home-city-outline"
            iconType="material"
            label="Property ID"
            value={data.property_id || "Not assigned"}
          />

          <DetailRow
            icon="home-outline"
            label="Category"
            value={data.category_name}
          />

          <DetailRow
            icon="pricetag-outline"
            label="Lead Type"
            value={data.ltype_name}
          />

          <DetailRow
            icon="briefcase-outline"
            label="Main Type"
            value={data.lead_main_type}
          />

          <DetailRow
            icon="megaphone-outline"
            label="Campaign Name"
            value={data.campaign_name}
          />

          <DetailRow
            icon="cube-outline"
            label="Lead Main Type"
            value={data.lead_main_type}
          />
        </View>

        {/* Contact Information */}
        <View style={styles.card}>
          <SectionHeader title="CONTACT INFORMATION" />

          <DetailRow icon="call-outline" label="Mobile" value={data.mobile} />
          <DetailRow
            icon="phone-portrait-outline"
            label="Phone"
            value={data.phone}
          />
          <DetailRow icon="mail-outline" label="Email" value={data.email} />
        </View>

        {/* Timeline */}

        {adminId && (
          <View style={styles.card}>
            <SectionHeader title="TIMELINE" />
            <DetailRow
              icon="calendar-outline"
              label="Created Date"
              value={
                data.date_created
                  ? new Date(data.date_created).toLocaleDateString()
                  : "—"
              }
            />
            <DetailRow
              icon="calendar-outline"
              label="Enquiry Date"
              value={
                data.enquiry_date
                  ? new Date(data.enquiry_date).toLocaleDateString()
                  : "Not set"
              }
            />
            <DetailRow
              icon="calendar-outline"
              label="Expiry Date"
              value={
                data.close_date
                  ? new Date(data.close_date).toLocaleDateString()
                  : "—"
              }
            />
          </View>
        )}

        {/* Source & Channel */}
        <View style={styles.card}>
          <SectionHeader title="SOURCE & CHANNEL" />
          <DetailRow
            icon="git-branch-outline"
            label="Lead Source"
            value={data.source_name}
          />
          <DetailRow
            icon="chatbubbles-outline"
            label="Channel"
            value={data.channel_name}
          />
          <DetailRow
            icon="person-add-outline"
            label="Created By"
            value={data.created_by_name}
          />
        </View>

        {/* Additional Details */}
        <View style={[styles.card, { marginBottom: 24 }]}>
          <SectionHeader title="ADDITIONAL DETAILS" />
          <DetailRow
            icon="flame-outline"
            label="Hot Lead"
            value={data.hot_lead === 1 ? "Yes" : "No"}
          />
          <DetailRow
            icon="checkmark-circle-outline"
            label="Sanity"
            value={
              data.lead_sanity === 1
                ? "Good"
                : data.lead_sanity === 2
                ? "Bad"
                : "Not Specified"
            }
          />
        </View>

        <LeadTerminalSheet
          leadId={enc_id}
          referenceNo={data.pfix}
          ref={terminalSheetRef}
        />

        <LeadNotesModal
          visible={notesOpen}
          leadId={enc_id}
          onClose={() => setNotesopen(false)}
        />

        <ScheduleMeetingModal
          visible={meetingOpen}
          onClose={() => setMeetingOpen(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  muted: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
  },
  error: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
  },

  // Header Card
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 13,
    color: "#6B7280",
  },
  hotBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  hotBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EF4444",
  },
  statusContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 16,
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIndicator: {
    width: 4,
    height: 16,
    backgroundColor: "#EFBF04",
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: 0.5,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 2,
  },

  actionButton: {
    width: "18%", // ✅ 5 per row
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 5,
    marginBottom: 10,
  },

  actionButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0f172a",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 14,
  },

  // Detail Row
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  detailRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    textAlign: "right",
    flex: 1,
  },
  statusWrapper: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
  },

  statusLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
});
