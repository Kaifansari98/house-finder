import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenNavbar from "@/components/ScreenNavbar";

const LeadEnquiry = () => {
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScreenNavbar
        title="Call Center All Leads"
        // onMenuPress={() => setOpenFilter(true)}
      />
    </SafeAreaView>
  );
};

export default LeadEnquiry;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
