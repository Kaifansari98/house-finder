import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenNavbar from "@/components/ScreenNavbar";
import AddGeneralEnquiryModal from "@/modals/enquiry/AddAndEditEnquiryModal";

const AddNewEnquiry = () => {
  const [openGeneralModal, setOpenGeneralModal] = useState(false);
  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={styles.safeArea}
    >
      <ScreenNavbar title="Add New Enquiry" />

      <View style={styles.container}>
        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.7} onPress={() => setOpenGeneralModal(true)}>
          <Text style={styles.text}>Add General Enquiry</Text>
        </TouchableOpacity>

        {/* search box inputs */}

        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Lead ID</Text>
            <TextInput
              placeholder="e.g. 884633"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
              style={[styles.input]}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Lead Name</Text>
            <TextInput
              placeholder="e.g. john doe"
              placeholderTextColor="#9ca3af"
              style={[styles.input]}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Lead Mobile</Text>
            <TextInput
              placeholder="e.g. 9876543210"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
              style={[styles.input]}
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} activeOpacity={0.7}>
            <Text style={styles.text}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      <AddGeneralEnquiryModal
        visible={openGeneralModal}
        onClose={() => setOpenGeneralModal(false)}
      />
    </SafeAreaView>
  );
};

export default AddNewEnquiry;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 10,
    gap: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },

  inputWrapper: {
    gap: 0,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 5,
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  searchBtn: {
    flexDirection: "row",
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EFBF04",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  text: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
});
