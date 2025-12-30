import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
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

interface SliceData extends LeadStatusData {
  startAngle: number;
  endAngle: number;
  midAngle: number;
  percentage: number;
  pathData: string;
  labelX: number;
  labelY: number;
}

interface PieSliceProps {
  slice: SliceData;
  animatedValue: SharedValue<number>;
  onPress: () => void;
  isHovered: boolean;
}

interface TooltipData {
  label: string;
  value: number;
  color: string;
  x: number;
  y: number;
}

interface LegendItemProps {
  item: LeadStatusData;
  index: number;
  isHovered: boolean;
  onPress: () => void;
}

interface LeadsPieChartProps {
  leadData: DashboardLeadCountItem[];
  onStatusPress?: (statusId: number, statusName: string) => void;
  loading?: boolean;
}

/* ===================== CONSTANTS ===================== */

const RADIUS = 110;
const CX = 120;
const CY = 120;
const LABEL_RADIUS = 70;
const TOOLTIP_DISTANCE = 85;
const DOUBLE_CLICK_DELAY = 300;
const TOOLTIP_DURATION = 3500;

const SUB_STATUS_COLOR_MAP: Record<string, string> = {
  newlead: "#0000FF",
  contactinginterested: "#FFFF00",
  qualifiedready: "#32CD32",
  wonconverted: "#008000",
  lostnotinterested: "#FFA500",
  disqualifiedinvalid: "#FF0000",
  followupretry: "#800080",
};

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

const normalizeStatus = (status?: string | null) =>
  (status ?? "unknown").toLowerCase().replace(/\s+/g, "").replace(/\//g, "");

const getColorForStatus = (statusName?: string | null): string => {
  const key = normalizeStatus(statusName);
  return SUB_STATUS_COLOR_MAP[key] ?? "#6B7280";
};

// Pre-calculate SVG path data
const createPathData = (
  startAngle: number,
  endAngle: number,
  radius: number = RADIUS
): string => {
  const isSingleSlice = endAngle - startAngle >= 359.9;

  if (isSingleSlice) {
    // Full circle path for single slice
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const midRad = (startAngle + 180 - 90) * (Math.PI / 180);

    const x1 = CX + radius * Math.cos(startRad);
    const y1 = CY + radius * Math.sin(startRad);
    const x2 = CX + radius * Math.cos(midRad);
    const y2 = CY + radius * Math.sin(midRad);

    return `M ${CX} ${CY}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 1 1 ${x2} ${y2}
      A ${radius} ${radius} 0 1 1 ${x1} ${y1}
      Z`;
  }

  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  const x1 = CX + radius * Math.cos(startRad);
  const y1 = CY + radius * Math.sin(startRad);
  const x2 = CX + radius * Math.cos(endRad);
  const y2 = CY + radius * Math.sin(endRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${CX} ${CY}
    L ${x1} ${y1}
    A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
    Z`;
};

// Calculate label position
const getLabelPosition = (midAngle: number) => {
  const angleRad = (midAngle - 90) * (Math.PI / 180);
  return {
    x: CX + LABEL_RADIUS * Math.cos(angleRad),
    y: CY + LABEL_RADIUS * Math.sin(angleRad),
  };
};

// Calculate tooltip position
const getTooltipPosition = (midAngle: number) => {
  const angleRad = (midAngle - 90) * (Math.PI / 180);
  return {
    x: TOOLTIP_DISTANCE * Math.cos(angleRad),
    y: TOOLTIP_DISTANCE * Math.sin(angleRad),
  };
};

/* ===================== PIE SLICE ===================== */

const PieSlice = React.memo<PieSliceProps>(
  ({ slice, animatedValue, onPress, isHovered }) => {
    const {
      color,
      startAngle,
      endAngle,
      pathData,
      labelX,
      labelY,
      value,
      percentage,
    } = slice;

    const animatedProps = useAnimatedProps(() => {
      "worklet";

      const isSingleSlice = endAngle - startAngle >= 359.9;

      if (isSingleSlice) {
        // For single slice, show full path immediately
        return {
          d: pathData,
          opacity: interpolate(animatedValue.value, [0, 0.3, 1], [0, 1, 1]),
        };
      }

      // Animate path drawing for multiple slices
      const end = interpolate(
        animatedValue.value,
        [0, 1],
        [startAngle, endAngle]
      );

      if (end < startAngle + 0.01) {
        return { d: "", opacity: 0 };
      }

      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (end - 90) * (Math.PI / 180);

      const x1 = CX + RADIUS * Math.cos(startRad);
      const y1 = CY + RADIUS * Math.sin(startRad);
      const x2 = CX + RADIUS * Math.cos(endRad);
      const y2 = CY + RADIUS * Math.sin(endRad);

      const largeArc = end - startAngle > 180 ? 1 : 0;

      return {
        d: `M ${CX} ${CY} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        opacity: 1,
      };
    });

    const showLabel = percentage > 3;

    const textAnimatedProps = useAnimatedProps(() => {
      "worklet";
      return {
        opacity: interpolate(animatedValue.value, [0, 0.5, 1], [0, 0, 1]),
      };
    });

    const isSingleSlice = endAngle - startAngle >= 359;

    // Hover effect using opacity only (no geometry changes)
    const hoverStyle = isHovered ? { opacity: 0.85 } : { opacity: 1 };

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
            textAnchor="middle"
            alignmentBaseline="middle"
            animatedProps={textAnimatedProps}
          >
            {formatNumber(value)}
          </AnimatedSvgText>
        )}
      </G>
    );
  }
);

PieSlice.displayName = "PieSlice";

/* ===================== LEGEND ITEM ===================== */

const LegendItem = React.memo<LegendItemProps>(
  ({ item, isHovered, onPress }) => {
    // Minimal animation - only scale on hover
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { scale: withTiming(isHovered ? 0.98 : 1, { duration: 150 }) },
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
          <View style={styles.lagendRow}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {item.label}
            </Text>
          </View>

          <View style={styles.legendTextContainer}>
            <Text style={styles.legendValue}>
              {item.value.toLocaleString()}
            </Text>
            <ChevronRight size={15} strokeWidth={2} color={"#9ca3af"} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

LegendItem.displayName = "LegendItem";

/* ===================== TOOLTIP ===================== */

const Tooltip = React.memo<{ tooltip: TooltipData; style: any }>(
  ({ tooltip, style }) => (
    <Animated.View style={[styles.tooltipWrapper, style]}>
      <View style={styles.tooltip}>
        <View style={styles.tooltipHeader}>
          <View
            style={[styles.tooltipDot, { backgroundColor: tooltip.color }]}
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
  )
);

Tooltip.displayName = "Tooltip";

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
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ time: number; index: number } | null>(null);

  // Memoize chart data transformation
  const chartData: LeadStatusData[] = useMemo(
    () =>
      leadData
        .filter((item) => item.lead_count > 0)
        .map((item) => ({
          key: `status_${item.lead_main_status_id}`,
          label: item.lead_main_status_name ?? "Unknown",
          value: item.lead_count,
          color: getColorForStatus(item.lead_main_status_name),
          statusId: item.lead_main_status_id,
        })),
    [leadData]
  );

  const totalLeads = useMemo(
    () => chartData.reduce((s, i) => s + i.value, 0),
    [chartData]
  );

  // Pre-calculate all slice data with paths
  const slices: SliceData[] = useMemo(() => {
    if (chartData.length === 0) return [];

    // Single slice case
    if (chartData.length === 1) {
      const item = chartData[0];
      const pathData = createPathData(0, 359.99);
      const { x: labelX, y: labelY } = getLabelPosition(179.995);

      return [
        {
          ...item,
          startAngle: 0,
          endAngle: 359.99,
          midAngle: 179.995,
          percentage: 100,
          pathData,
          labelX,
          labelY,
        },
      ];
    }

    // Multiple slices
    let currentAngle = 0;
    return chartData.map((item) => {
      const percentage = totalLeads > 0 ? (item.value / totalLeads) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const midAngle = currentAngle + angle / 2;

      const pathData = createPathData(startAngle, endAngle);
      const { x: labelX, y: labelY } = getLabelPosition(midAngle);

      currentAngle += angle;

      return {
        ...item,
        startAngle,
        endAngle,
        midAngle,
        percentage,
        pathData,
        labelX,
        labelY,
      };
    });
  }, [chartData, totalLeads]);

  // Animation runs ONCE on mount
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 1200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, []);

  // Clear tooltip timer on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  // Memoized tooltip show function
  const showTooltip = useCallback(
    (slice: SliceData, index: number) => {
      const { x: targetX, y: targetY } = getTooltipPosition(slice.midAngle);

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
        label: slice.label,
        value: slice.value,
        color: slice.color,
        x: targetX,
        y: targetY,
      });
      setHoveredIndex(index);

      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }

      tooltipTimerRef.current = setTimeout(() => {
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
      }, TOOLTIP_DURATION);
    },
    [tooltip, tooltipX, tooltipY, tooltipOpacity, tooltipScale]
  );

  // Memoized press handlers
  const handleSlicePress = useCallback(
    (slice: SliceData, index: number) => {
      const now = Date.now();
      const lastTap = lastTapRef.current;

      if (
        lastTap &&
        lastTap.index === index &&
        now - lastTap.time < DOUBLE_CLICK_DELAY
      ) {
        // DOUBLE CLICK - Navigate
        if (onStatusPress) {
          onStatusPress(slice.statusId, slice.label);
        }
        lastTapRef.current = null;
      } else {
        // SINGLE CLICK - Show tooltip
        showTooltip(slice, index);
        lastTapRef.current = { time: now, index };
      }
    },
    [onStatusPress, showTooltip]
  );

  const handleLegendPress = useCallback(
    (item: LeadStatusData, index: number) => {
      const now = Date.now();
      const lastTap = lastTapRef.current;

      if (
        lastTap &&
        lastTap.index === index &&
        now - lastTap.time < DOUBLE_CLICK_DELAY
      ) {
        // DOUBLE CLICK - Navigate
        if (onStatusPress) {
          onStatusPress(item.statusId, item.label);
        }
        lastTapRef.current = null;
      } else {
        // SINGLE CLICK - Show tooltip
        const slice = slices[index];
        if (slice) {
          showTooltip(slice, index);
          lastTapRef.current = { time: now, index };
        }
      }
    },
    [onStatusPress, showTooltip, slices]
  );

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
              slice={slice}
              animatedValue={progress}
              isHovered={hoveredIndex === index}
              onPress={() => handleSlicePress(slice, index)}
            />
          ))}
        </Svg>

        {tooltip && <Tooltip tooltip={tooltip} style={tooltipAnimatedStyle} />}
      </View>

      <View style={styles.legendGrid}>
        {chartData.map((item, index) => (
          <LegendItem
            key={item.key}
            item={item}
            index={index}
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
