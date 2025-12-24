import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
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
import BottomSheet from "@gorhom/bottom-sheet";
import EditEnquiryModal from "@/modals/enquiry/EditEnquiryModal";

const StatusDot = ({ color = "green", size = 8 }) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
};

export const leadEnquiries = [
  {
    id: 1,
    leadName: "Rahul Sharma",
    rentSell: "rent",
    location: "Andheri West, Mumbai",
    budget: 35000,
    paymentType: "monthly",
    description: "Looking for a 2BHK near metro station with parking.",
  },
  {
    id: 2,
    leadName: "Ayesha Khan",
    rentSell: "sell",
    location: "Bandra East, Mumbai",
    budget: 9500000,
    paymentType: "loan",
    description: "Interested in selling a semi-furnished 3BHK.",
  },
  {
    id: 3,
    leadName: null,
    rentSell: "rent",
    location: "Navrangpura, Ahmedabad",
    budget: 18000,
    paymentType: "monthly",
    description: "1BHK required for family, ready to move immediately.",
  },
  {
    id: 4,
    leadName: "Neha Verma",
    rentSell: "sell",
    location: "Indiranagar, Bangalore",
    budget: 12500000,
    paymentType: "emi",
    description: "Planning to sell a newly constructed flat.",
  },
  {
    id: 5,
    leadName: "Suresh Iyer",
    rentSell: "rent",
    location: "T Nagar, Chennai",
    budget: 25000,
    paymentType: "monthly",
    description: "Office-going bachelor looking for clean apartment.",
  },
  {
    id: 6,
    leadName: null,
    rentSell: "sell",
    location: "Vashi, Navi Mumbai",
    budget: 8700000,
    paymentType: "cash",
    description: "Urgent sale required due to relocation.",
  },
  {
    id: 7,
    leadName: "Rohan Singh",
    rentSell: "rent",
    location: "Noida Sector 62",
    budget: 22000,
    paymentType: "monthly",
    description: "Need flat close to IT offices.",
  },
  {
    id: 8,
    leadName: "Kavita Joshi",
    rentSell: "sell",
    location: "Kothrud, Pune",
    budget: 7800000,
    paymentType: "loan",
    description: "Selling 2BHK with modular kitchen.",
  },
  {
    id: 9,
    leadName: "Imran Shaikh",
    rentSell: "rent",
    location: "Kurla West, Mumbai",
    budget: 30000,
    paymentType: "monthly",
    description: "Family of 4, school nearby preferred.",
  },
  {
    id: 10,
    leadName: null,
    rentSell: "sell",
    location: "Baner, Pune",
    budget: 11000000,
    paymentType: "emi",
    description: "Premium society, possession ready.",
  },
];

const LeadEnquiry = () => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [openEditModal, setOpenEditModal] = useState(false);

  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatBudget = (budget: number) => {
    if (budget >= 10000000) {
      return `${(budget / 10000000).toFixed(2)} Cr`;
    } else if (budget >= 100000) {
      return `${(budget / 100000).toFixed(2)} L`;
    } else if (budget >= 1000) {
      return `${(budget / 1000).toFixed(0)} K`;
    }
    return budget.toString();
  };

  const getRentSellColor = (type: string) => {
    return type === "rent" ? "#3b82f6" : "#22c55e";
  };
  const handleEdit = (item: (typeof leadEnquiries)[0]) => {
    setSelectedEnquiry(item); // 👈 full object
    setOpenMenuId(null);
    setOpenEditModal(true);
  };

  const handleDelete = (id: number) => {
    console.log("Delete lead:", id);
    setOpenMenuId(null);
  };

  const renderItem = ({ item }: { item: (typeof leadEnquiries)[0] }) => {
    const isMenuOpen = openMenuId === item.id;
    const avtarName = item.leadName ? getInitials(item.leadName) : "NA";
    const hasName = !!item.leadName;

    return (
      <View style={styles.itemContainer}>
        {/* Header Container */}
        <View style={styles.headerContainer}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, !hasName && styles.avatarEmpty]}>
              <Text style={styles.avatarText}>{avtarName}</Text>
            </View>
            <View style={styles.headerTextBlock}>
              <Text style={styles.nameText} numberOfLines={1}>
                {item.leadName || "Name Not Provided"}
              </Text>
              <View style={styles.rentSellRow}>
                <StatusDot color={getRentSellColor(item.rentSell)} size={8} />
                <Text style={styles.rentSellText}>
                  {item.rentSell === "rent" ? "Rent" : "Sell"}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={() => setOpenMenuId(isMenuOpen ? null : item.id)}
          >
            <MoreVertical size={18} color="#9ca3af" strokeWidth={2.2} />
          </TouchableOpacity>

          {/* Menu Popover */}
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

        {/* Flex Wrap Container */}
        <View style={styles.flexWrapContainer}>
          {/* Budget & Payment Type Combined */}
          <View style={styles.wrapItem}>
            <View style={styles.iconAndText}>
              <Wallet size={15} color="#9ca3af" />
              <Text style={styles.labelText} numberOfLines={1}>
                ₹{formatBudget(item.budget)} / {item.paymentType}
              </Text>
            </View>
          </View>
        </View>

        {/* Location - Full Width */}
        <View style={styles.fullWidthRow}>
          <MapPin size={15} color="#9ca3af" />
          <Text style={styles.labelText} numberOfLines={2}>
            {item.location}
          </Text>
        </View>

        {/* Description - Full Width */}
        {item.description && (
          <View style={styles.noteContainer}>
            <View style={styles.noteHeader}>
              <StickyNote size={13} color="#9CA3AF" />
              <Text style={styles.noteLabel}>Description</Text>
            </View>
            <Text style={styles.noteText} numberOfLines={3}>
              {item.description}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <ScreenNavbar title="View My Enquiry" />
        <FlatList
          data={leadEnquiries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        <EditEnquiryModal
          item={selectedEnquiry}
          visible={openEditModal}
          onClose={() => setOpenEditModal(false)}
        />
      </SafeAreaView>
    </>
  );
};

export default LeadEnquiry;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContainer: {
    padding: 10,
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
    alignItems: "flex-start",
    gap: 10,
    position: "relative",
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
  avatarEmpty: {
    backgroundColor: "#E5E7EB",
  },
  avatarText: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 16,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  nameText: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 16,
    textTransform: "capitalize",
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
    textTransform: "capitalize",
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
  popover: {
    position: "absolute",
    top: 35,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 8,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  menuItemTextDanger: {
    color: "#ef4444",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  flexWrapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  wrapItem: {
    width: "50%",
    padding: 4,
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
    textTransform: "capitalize",
  },
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
});
