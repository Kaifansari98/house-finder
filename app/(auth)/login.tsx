// screens/LoginScreen.tsx
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { useLogin } from "@/hooks/login/useLogin";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "expo-router";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const { mutate, isPending } = useLogin({
    onSuccess: (data) => {
      setAuthData(data.data);
      router.replace("/(public)/dashboard");
    },
    onError: () => {
      // TODO: surface an error toast/message
    },
  });

  const handleLogin = () => {
    mutate({
      username,
      password,
      device: "mobile",
      version: "1.0.0",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Top Logo - Centered */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/imgs/illustrations/ils2.png")} // ← your logo
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={{width: "100%", height: "auto", alignItems: "center", paddingBottom: 35}}>
          <Text style={{fontSize: 25, fontWeight: "700", color: "#FF6D1F"}}>Login Here</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Username Field */}
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Username or Email"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isPending}
          >
            <Text style={styles.loginButtonText}>
              {isPending ? "Logging in..." : "Log In"}
            </Text>
          </TouchableOpacity>

          {/* Optional: Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "space-between",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  logo: {
    width: 280,
    height: 280,
  },
  form: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#eee",
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: "#FF6D1F",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  forgotPassword: {
    alignSelf: "center",
    marginTop: 8,
  },
  forgotText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
});
