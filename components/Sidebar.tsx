// components/Sidebar.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import { SidebarMenuItem } from "@/api/api";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.8; // Slightly wider for better readability

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  parentMenu: SidebarMenuItem[];
  childMenu: SidebarMenuItem[];
  onMenuPress?: (item: SidebarMenuItem) => void;
}

export default function Sidebar({
  visible,
  onClose,
  parentMenu,
  childMenu,
  onMenuPress,
}: SidebarProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (parentId: number) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  // Group children by parent_id
  const childrenByParent = childMenu.reduce((acc, child) => {
    if (!acc[child.parent_id]) acc[child.parent_id] = [];
    acc[child.parent_id].push(child);
    return acc;
  }, {} as Record<number, SidebarMenuItem[]>);

  const getLucideIcon = (iconName?: string | null) => {
    if (!iconName) return null;

    const iconMap: Record<string, React.FC<any>> = {
      "bxs-buildings": require("lucide-react-native").Building2,
      "bxs-user-detail": require("lucide-react-native").Users,
      "bxs-lock": require("lucide-react-native").Lock,
      "bxs-report": require("lucide-react-native").FileText,
      "bx-task": require("lucide-react-native").CheckSquare,
      "bxs-file-find": require("lucide-react-native").Search,
      "bx-phone-call": require("lucide-react-native").Phone,
      "bx-cog": require("lucide-react-native").Settings,
    };

    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={20} color="#6b7280" /> : null;
  };

  return (
    <>
      {/* Backdrop Overlay */}
      {visible && (
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.overlay} />
        </TouchableOpacity>
      )}

      {/* Sidebar Panel */}
      <View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: visible ? 0 : -SIDEBAR_WIDTH - 50 }],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.Logo}>
            <Image
          source={require("../assets/imgs/Logo/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
            </View>
          <View style={styles.menuContainer}>
            {parentMenu.map((parent) => {
              const children = childrenByParent[parent.id] || [];
              const isExpanded = expandedIds.has(parent.id);
              const hasChildren = children.length > 0;
              const Icon = getLucideIcon(parent.svg);

              return (
                <View key={parent.id}>
                  {/* Parent Menu Item */}
                  <TouchableOpacity
                    style={[
                      styles.parentItem,
                      hasChildren && styles.parentItemExpandable,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (hasChildren) {
                        toggleExpand(parent.id);
                      } else if (parent.href && parent.href !== "#") {
                        onMenuPress?.(parent);
                        onClose();
                      }
                    }}
                  >
                    <View style={styles.parentContent}>
                      {Icon && <View style={styles.iconWrapper}>{Icon}</View>}
                      <Text style={styles.parentText}>{parent.page_name}</Text>
                    </View>
                    {hasChildren && (
                      <View style={styles.chevron}>
                        {isExpanded ? (
                          <ChevronDown size={18} color="#9ca3af" />
                        ) : (
                          <ChevronRight size={18} color="#9ca3af" />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Child Items (Accordion) */}
                  {hasChildren && isExpanded && (
                    <View style={styles.childrenContainer}>
                      {children.map((child) => (
                        <TouchableOpacity
                          key={child.id}
                          style={styles.childItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            if (child.href) {
                              onMenuPress?.(child);
                              onClose();
                            }
                          }}
                        >
                          <Text style={styles.childText}>{child.page_name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    zIndex: 20,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 80, // Space for navbar/status bar
    paddingBottom: 40,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  Logo: {
    paddingHorizontal: 20,
    width: "100%",
    height: "auto",
    alignItems: "center",
    marginBottom: 30,
  },
  parentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginVertical: 0,
    backgroundColor: "transparent",
  },
  parentItemExpandable: {
    // Subtle hover effect simulation
  },
  parentContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  parentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: -0.2,
  },
  chevron: {
    paddingLeft: 8,
  },
  childrenContainer: {
    marginLeft: 30,
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
    paddingLeft: 25,
  },
  childItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 1,
  },
  childText: {
    fontSize: 14.5,
    color: "#4b5563",
    fontWeight: "500",
  },
  logo: { width: 150, height: 100 },
});