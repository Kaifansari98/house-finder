// components/Navbar.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Menu, Bell, User, UserRound, BellDot } from "lucide-react-native";

interface NavbarProps {
  onMenuPress: () => void;
  user: {
    fullname: string;
  };
  role: {
    role_name: string;
  };
}

export default function Navbar({ onMenuPress, user, role }: NavbarProps) {
  const userInitial = user.fullname.charAt(0).toUpperCase();

  return (
    <View style={styles.navbar}>
      {/* Left: Hamburger Menu */}
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Menu size={24} color="#0B1A2B" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Center: User Info */}
      <View style={styles.userInfo}>
        <View style={styles.avatarCircle}>
          {/* <UserRound size={24} color="#fff" strokeWidth={2.5} /> */}
          {/* Optional: Use initial instead of User icon */}
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
        <View style={styles.userText}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.fullname}
          </Text>
          <Text style={styles.userRole}>{role.role_name}</Text>
        </View>
      </View>

      {/* Right: Bell Icon */}
      <TouchableOpacity style={styles.bellButton}>
        <Bell size={24} color="#0B1A2B" strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingLeft: 15,
  },
  menuButton: {
    paddingHorizontal: 0,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFBF04",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  userText: {
    justifyContent: "center",
    maxWidth: "80%",
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0B1A2B",
  },
  userRole: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    fontWeight: "500",
  },
  bellButton: {
    padding: 8,
  },
});