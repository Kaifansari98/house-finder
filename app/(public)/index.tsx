import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const images = [
    require("../../assets/imgs/welcome_image1.jpg"),
    require("../../assets/imgs/welcome_image2.png"),
    require("../../assets/imgs/welcome_image3.jpg"),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // opacity for next image
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeInContent = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  const router = useRouter();

  // Foreground content animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeInContent, {
        toValue: 1,
        duration: 800,
        delay: 0,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 800,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ✨ Smooth background crossfade every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      fadeAnim.setValue(0); // next image starts invisible

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000, // smoother fade
        useNativeDriver: true,
      }).start(() => {
        // After fade completes → update image
        setCurrentIndex((prev) => (prev + 1) % images.length);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const nextIndex = (currentIndex + 1) % images.length;

  return (
    <View style={styles.screen}>
      {/* CURRENT IMAGE (always fully visible) */}
      <Image
        source={images[currentIndex]}
        style={styles.image}
        resizeMode="cover"
      />

      {/* NEXT IMAGE fading in smoothly */}
      <Animated.Image
        source={images[nextIndex]}
        style={[styles.image, { opacity: fadeAnim }]}
        resizeMode="cover"
      />

      {/* Dark overlay */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/imgs/Logo/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Foreground content */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeInContent, transform: [{ translateY: slideUp }] },
        ]}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Find your next home</Text>
        </View>

        <Text style={styles.title}>House Finder</Text>
        <Text style={styles.subtitle}>
          Discover curated listings, tailored recommendations, and guided tours
          to get you moving faster.
        </Text>

        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.ctaText}>Get Started</Text>
          <Feather name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  logoContainer: {
    position: "absolute",
    top: 58,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  logo: { width: 250, height: 250 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: "flex-end",
    gap: 12,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  badgeText: {
    color: "#E8F0FF",
    fontSize: 13,
    letterSpacing: 0.4,
  },
  title: { color: "#fff", fontSize: 36, fontWeight: "700" },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    lineHeight: 22,
    marginTop: 4,
  },
  cta: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EFBF04",
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  ctaText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
