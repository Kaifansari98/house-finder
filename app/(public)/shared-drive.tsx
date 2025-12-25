import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenNavbar from "@/components/ScreenNavbar";
import { WebView } from "react-native-webview";
const SHARED_DRIVE_URL =
  "https://workdrive.zohoexternal.com/embed/pd8cp09a553e1a5ad4ddca7d4522d619764cd?toolbar=false&layout=grid&appearance=light&themecolor=blue";

const SharedDrive = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenNavbar title="Shared Drive" />

      <View style={styles.container}>
        <WebView
          source={{ uri: SHARED_DRIVE_URL }}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    </SafeAreaView>
  );
};

export default SharedDrive;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1 },
  loader: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
