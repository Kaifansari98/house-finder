import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { ChevronRight, PieChartIcon } from "lucide-react-native";
import type { DashboardLeadCountItem } from "@/api/dashboard";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

/* ===================== TYPES ===================== */

interface LeadStatusData {
  key: string;
  label: string;
  value: number;
  color: string;
  statusId: number;
}

interface PieSliceProps {
  color: string;
  startAngle: number;
  endAngle: number;
  animatedValue: SharedValue<number>;
  onPress: () => void;
  isHovered: boolean;
  midAngle: number;
  value: number;
  percentage: number;
}

interface TooltipData {
  label: string;
  value: number;
  color: string;
  angle: number;
}

interface LegendItemProps {
  item: LeadStatusData;
  index: number;
  progress: SharedValue<number>;
  isHovered: boolean;
  onPress: () => void;
}

interface LeadsPieChartProps {
  leadData: DashboardLeadCountItem[];
  onStatusPress?: (statusId: number, statusName: string) => void;
  loading?: boolean;
}

/* ===================== HELPERS ===================== */

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
};

// Color mapping based on status names
const getColorForStatus = (statusName?: string | null): string => {
  const normalizedName = (statusName ?? "unknown")
    .toLowerCase()
    .replace(/\s+/g, "");

  const colorMap: Record<string, string> = {
    newlead: "#3B82F6",
    "contacting/interested": "#F59E0B",
    contactinginterested: "#F59E0B",
    "qualified/ready": "#10B981",
    qualifiedready: "#10B981",
    "won/converted": "#059669",
    wonconverted: "#059669",
    "lost/notinterested": "#EF4444",
    lostnotinterested: "#EF4444",
    "disqualified/invalid": "#DC2626",
    disqualifiedinvalid: "#DC2626",
    "followup/retry": "#8B5CF6",
    followupretry: "#8B5CF6",
    unknown: "#6B7280",
  };

  return colorMap[normalizedName] ?? colorMap.unknown;
};

/* ===================== PIE SLICE ===================== */

const PieSlice: React.FC<PieSliceProps> = ({
  color,
  startAngle,
  endAngle,
  animatedValue,
  onPress,
  isHovered,
  midAngle,
  value,
  percentage,
}) => {
  const radius = isHovered ? 113 : 110;
  const cx = 120;
  const cy = 120;

  const animatedProps = useAnimatedProps(() => {
    "worklet";

    const isSingleSlice = endAngle - startAngle >= 359.9;

    const end = isSingleSlice
      ? endAngle
      : interpolate(animatedValue.value, [0, 1], [startAngle, endAngle]);

    if (end < startAngle + 0.01) {
      return { d: "" };
    }

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (end - 90) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = end - startAngle > 180 ? 1 : 0;

    return {
      d: `M ${cx} ${cy}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        Z`,
    };
  });

  // Show label for smaller percentages (reduced threshold)
  const showLabel = percentage > 3;

  const labelRadius = 70;
  const angleRad = (midAngle - 90) * (Math.PI / 180);
  const labelX = cx + labelRadius * Math.cos(angleRad);
  const labelY = cy + labelRadius * Math.sin(angleRad);

  const textAnimatedProps = useAnimatedProps(() => {
    "worklet";
    return {
      opacity: interpolate(animatedValue.value, [0, 0.5, 1], [0, 0, 1]),
    };
  });

  const isSingleSlice = endAngle - startAngle >= 359;

  return (
    <G onPress={onPress}>
      <AnimatedPath
        animatedProps={animatedProps}
        fill={color}
        stroke={isSingleSlice ? "none" : "#fff"}
        strokeWidth={1}
      />
      {showLabel && (
        <AnimatedSvgText
          x={labelX}
          y={labelY}
          fontSize="12"
          fontWeight="700"
          fill="#FFFFFF"
          textAnchor="middle"
          alignmentBaseline="middle"
          animatedProps={textAnimatedProps}
        >
          {formatNumber(value)}
        </AnimatedSvgText>
      )}
    </G>
  );
};

/* ===================== LEGEND ITEM ===================== */

const LegendItem: React.FC<LegendItemProps> = ({
  item,
  index,
  progress,
  isHovered,
  onPress,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const delay = index * 0.08;
    const animValue = Math.max(0, Math.min(1, progress.value - delay));

    return {
      opacity: 1,
      transform: [
        { scale: interpolate(animValue, [0, 1], [0.95, 1]) },
        { translateY: interpolate(animValue, [0, 1], [10, 0]) },
      ],
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.legendItemWrapper}
    >
      <Animated.View
        style={[
          styles.legendItem,
          isHovered && styles.legendItemHovered,
          animatedStyle,
        ]}
      >
        {/* status dot and status name */}
        <View style={styles.lagendRow}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendLabel} numberOfLines={1}>
            {item.label}
          </Text>
        </View>

        {/* total leads value and chevronright icon*/}
        <View style={styles.legendTextContainer}>
          <Text style={styles.legendValue}>{item.value.toLocaleString()}</Text>
          <ChevronRight size={15} strokeWidth={2} color={"#9ca3af"} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

/* ===================== MAIN COMPONENT ===================== */

export default function LeadsPieChart({
  leadData,
  onStatusPress,
  loading = false,
}: LeadsPieChartProps) {
  const progress = useSharedValue(0);
  const tooltipOpacity = useSharedValue(0);
  const tooltipScale = useSharedValue(0.85);
  const tooltipX = useSharedValue(0);
  const tooltipY = useSharedValue(0);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [tooltipTimer, setTooltipTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Double click detection
  const lastTapRef = useRef<{ time: number; index: number } | null>(null);
  const DOUBLE_CLICK_DELAY = 300; // 300ms window for double click

  // Transform API data to chart format
  const chartData: LeadStatusData[] = leadData
    .filter((item) => item.lead_count > 0) // 🚨 FIX
    .map((item) => ({
      key: `status_${item.lead_main_status_id}`,
      label: item.lead_main_status_name ?? "Unknown",
      value: item.lead_count,
      color: getColorForStatus(item.lead_main_status_name),
      statusId: item.lead_main_status_id,
    }));

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 1800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [leadData]);

  const totalLeads = chartData.reduce((s, i) => s + i.value, 0);

  // Calculate slices with minimum angle for visibility

  let currentAngle = 0;

  const slices = chartData.map((item) => {
    // ✅ SINGLE STATUS → NEAR FULL CIRCLE (SVG SAFE)
    if (chartData.length === 1) {
      return {
        ...item,
        startAngle: 0,
        endAngle: 359.99, // ⭐ THIS IS THE FIX
        midAngle: 179.995,
        percentage: 100,
      };
    }

    const percentage = totalLeads > 0 ? (item.value / totalLeads) * 100 : 0;

    const angle = (percentage / 100) * 360;

    const slice = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      midAngle: currentAngle + angle / 2,
      percentage,
    };

    currentAngle += angle;
    return slice;
  });

  // Show tooltip function (single click)
  const showTooltip = (item: LeadStatusData, index: number) => {
    const midAngle = slices[index].midAngle;
    const angleRad = (midAngle - 90) * (Math.PI / 180);
    const distance = 85;

    const targetX = distance * Math.cos(angleRad);
    const targetY = distance * Math.sin(angleRad);

    if (!tooltip) {
      tooltipX.value = targetX;
      tooltipY.value = targetY;

      tooltipOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
      tooltipScale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
    } else {
      tooltipX.value = withSpring(targetX, {
        damping: 18,
        stiffness: 180,
        mass: 0.8,
      });
      tooltipY.value = withSpring(targetY, {
        damping: 18,
        stiffness: 180,
        mass: 0.8,
      });
    }

    setTooltip({
      label: item.label,
      value: item.value,
      color: item.color,
      angle: midAngle,
    });
    setHoveredIndex(index);

    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
    }

    const timer = setTimeout(() => {
      tooltipOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      tooltipScale.value = withTiming(0.85, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });

      setTimeout(() => {
        setTooltip(null);
        setHoveredIndex(null);
      }, 200);
    }, 3500);

    setTooltipTimer(timer);
  };

  // Handle slice press with double click detection
  const handleSlicePress = (item: LeadStatusData, index: number) => {
    const now = Date.now();
    const lastTap = lastTapRef.current;

    // Check if it's a double click
    if (
      lastTap &&
      lastTap.index === index &&
      now - lastTap.time < DOUBLE_CLICK_DELAY
    ) {
      // DOUBLE CLICK - Navigate
      if (onStatusPress) {
        onStatusPress(item.statusId, item.label);
      }
      lastTapRef.current = null; // Reset
    } else {
      // SINGLE CLICK - Show tooltip
      showTooltip(item, index);
      lastTapRef.current = { time: now, index };
    }
  };

  // Handle legend press with double click detection (same as pie slices)
  const handleLegendPress = (item: LeadStatusData, index: number) => {
    const now = Date.now();
    const lastTap = lastTapRef.current;

    // Check if it's a double click
    if (
      lastTap &&
      lastTap.index === index &&
      now - lastTap.time < DOUBLE_CLICK_DELAY
    ) {
      // DOUBLE CLICK - Navigate
      if (onStatusPress) {
        onStatusPress(item.statusId, item.label);
      }
      lastTapRef.current = null; // Reset
    } else {
      // SINGLE CLICK - Show tooltip
      showTooltip(item, index);
      lastTapRef.current = { time: now, index };
    }
  };

  useEffect(() => {
    return () => {
      if (tooltipTimer) {
        clearTimeout(tooltipTimer);
      }
    };
  }, [tooltipTimer]);

  const tooltipAnimatedStyle = useAnimatedStyle(() => {
    "worklet";

    return {
      opacity: tooltipOpacity.value,
      transform: [
        { translateX: tooltipX.value },
        { translateY: tooltipY.value },
        { scale: tooltipScale.value },
      ],
    };
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D1D5DB" />
      </View>
    );
  }

  if (!chartData.length || totalLeads === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <PieChartIcon size={48} color="#D1D5DB" strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>No Lead Data</Text>
        <Text style={styles.emptyDescription}>
          There are no leads available for the selected filters.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.chartContainer}>
        <Svg width={240} height={240} viewBox="0 0 240 240">
          {slices.map((slice, index) => (
            <PieSlice
              key={slice.key}
              color={slice.color}
              startAngle={slice.startAngle}
              endAngle={slice.endAngle}
              animatedValue={progress}
              isHovered={hoveredIndex === index}
              onPress={() => handleSlicePress(slice, index)}
              midAngle={slice.midAngle}
              value={slice.value}
              percentage={slice.percentage}
            />
          ))}
        </Svg>

        {tooltip && (
          <Animated.View style={[styles.tooltipWrapper, tooltipAnimatedStyle]}>
            <View style={styles.tooltip}>
              <View style={styles.tooltipHeader}>
                <View
                  style={[
                    styles.tooltipDot,
                    { backgroundColor: tooltip.color },
                  ]}
                />
                <Text style={styles.tooltipLabel} numberOfLines={1}>
                  {tooltip.label}
                </Text>
              </View>
              <Text style={styles.tooltipValue}>
                {tooltip.value.toLocaleString()} leads
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      <View style={styles.legendGrid}>
        {chartData.map((item, index) => (
          <LegendItem
            key={item.key}
            item={item}
            index={index}
            progress={progress}
            isHovered={hoveredIndex === index}
            onPress={() => handleLegendPress(item, index)}
          />
        ))}
      </View>
    </View>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    position: "relative",
    height: 240,
    zIndex: 10,
  },
  tooltipWrapper: {
    position: "absolute",
    left: 120,
    top: 120,
    zIndex: 1000,
  },
  tooltip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    minWidth: 140,
    maxWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  tooltipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tooltipLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  tooltipHint: {
    fontSize: 10,
    fontWeight: "500",
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    zIndex: 1,
  },
  legendItemWrapper: {
    width: "48%",
  },
  lagendRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "column",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  legendItemHovered: {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 6,
  },
  legendTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  loadingContainer: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
});
