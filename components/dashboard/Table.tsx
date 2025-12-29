import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react-native";

interface Column {
  key: string;
  title: string;
  flex: number;
  align?: "left" | "right" | "center";
  render?: (value: any, item: any) => string;
}

interface DynamicTableProps {
  title: string;
  data: any[];
  columns: Column[];
  searchKey: string;
  summaryStats?: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
  }[];
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  title,
  data,
  columns,
  searchKey,
  summaryStats,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Filter data based on search
  const filteredData = searchValue.trim()
    ? data.filter((item) =>
        item[searchKey]?.toLowerCase().includes(searchValue.toLowerCase())
      )
    : data;

  // Render Summary (Collapsed View)
  const renderSummary = () => {
    if (!summaryStats || summaryStats.length === 0) return null;

    return (
      <TouchableOpacity
        style={styles.summaryContainer}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.9}
      >
        <View style={styles.summaryContent}>
          {summaryStats.map((stat, index) => (
            <React.Fragment key={index}>
              {index > 0 && <View style={styles.statDivider} />}
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>{stat.icon}</View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.toggleIcon}>
          {isExpanded ? (
            <ChevronUp size={24} color="#6b7280" strokeWidth={2.5} />
          ) : (
            <ChevronDown size={24} color="#6b7280" strokeWidth={2.5} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Calculate column totals
  const calculateTotal = (columnKey: string) => {
    return filteredData.reduce((sum, item) => {
      const value = item[columnKey];
      return sum + (typeof value === "number" ? value : 0);
    }, 0);
  };

  return (
    <View style={styles.tableWrapper}>
      <Text style={styles.title}>{title}</Text>

      {!isExpanded && renderSummary()}

      {isExpanded && (
        <View style={{ gap: 5 }}>
          {/* Search Bar + Hide Button */}
          <View style={styles.searchRow}>
            <View style={styles.searchWrapper}>
              <View style={styles.searchContainer}>
                <Search size={18} color="#9ca3af" strokeWidth={2} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${searchKey}...`}
                  placeholderTextColor="#9ca3af"
                  value={searchValue}
                  onChangeText={setSearchValue}
                />
                {searchValue.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchValue("")}>
                    <X size={18} color="#9ca3af" strokeWidth={2.5} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.hideButton}
              onPress={() => setIsExpanded(false)}
              activeOpacity={0.8}
            >
              <ChevronUp size={20} color="#0f172a" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              {columns.map((column, index) => (
                <Text
                  key={index}
                  style={[
                    styles.headerText,
                    { flex: column.flex },
                    column.align === "right" && styles.textRight,
                    column.align === "center" && styles.textCenter,
                  ]}
                >
                  {column.title}
                </Text>
              ))}
            </View>

            {/* Table Body */}
            <ScrollView
              style={styles.tableBody}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tableRow,
                      index % 2 === 0 ? styles.evenRow : styles.oddRow,
                    ]}
                  >
                    {columns.map((column, colIndex) => {
                      const value = item[column.key];
                      const displayValue = column.render
                        ? column.render(value, item)
                        : value?.toLocaleString?.() || value || "N/A";

                      return (
                        <Text
                          key={colIndex}
                          style={[
                            styles.cellText,
                            { flex: column.flex },
                            column.align === "right" && styles.textRight,
                            column.align === "center" && styles.textCenter,
                          ]}
                          numberOfLines={1}
                        >
                          {displayValue}
                        </Text>
                      );
                    })}
                  </View>
                ))
              ) : (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No results found</Text>
                </View>
              )}
            </ScrollView>

            {/* Table Footer */}
            <View style={styles.tableFooter}>
              {columns.map((column, index) => {
                let footerText = "";

                if (index === 0) {
                  footerText = `Total: ${filteredData.length}${
                    searchValue ? ` of ${data.length}` : ""
                  }`;
                } else {
                  const total = calculateTotal(column.key);
                  if (total > 0) {
                    footerText = total.toLocaleString();
                  }
                }

                return (
                  <Text
                    key={index}
                    style={[
                      styles.footerText,
                      { flex: column.flex },
                      column.align === "right" && styles.textRight,
                      column.align === "center" && styles.textCenter,
                    ]}
                  >
                    {footerText}
                  </Text>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DynamicTable;

const styles = StyleSheet.create({
  tableWrapper: {
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  // Summary (Collapsed View)
  summaryContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#EFBF04",
    alignItems: "center",
    justifyContent: "center",
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  toggleIcon: {
    marginLeft: 12,
  },

  // Table Container
  tableContainer: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  // Search Bar
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
  },
  searchWrapper: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
    padding: 0,
  },
  hideButton: {
    backgroundColor: "#EFBF04",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // Table Header
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EFBF04",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Table Body
  tableBody: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  evenRow: {
    backgroundColor: "#FFFFFF",
  },
  oddRow: {
    backgroundColor: "#F9FAFB",
  },
  cellText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  noResults: {
    padding: 40,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
  },

  // Table Footer
  tableFooter: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Text Alignment
  textRight: {
    textAlign: "right",
  },
  textCenter: {
    textAlign: "center",
  },
});
