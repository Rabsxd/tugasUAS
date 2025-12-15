import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
} from "react-native";
import { useDispatch } from "react-redux";
import { login } from "../../store/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
import { loadUsers } from "./authStorage";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Username dan password wajib diisi");
      return;
    }

    const users = await loadUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      dispatch(login(user));
      navigation.replace("HomeTabNavigator");
    } else {
      Alert.alert("Error", "Username atau password salah");
    }
  };

  const handleGoToRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>

        <Text style={styles.welcomeText}>Selamat</Text>
        <Text style={styles.welcomeBold}>Datang</Text>

        <Image
          source={require("../../assets/images/logo1.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* CARD FORM */}
      <View style={styles.card}>
        {/* Username */}
        <View style={styles.inputGroup}>
          <Ionicons name="person-outline" size={20} color="#4A90E2" />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed-outline" size={20} color="#4A90E2" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Sign In */}
        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInText}>Masuk</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Belum memiliki akun? </Text>
          <TouchableOpacity onPress={handleGoToRegister}>
            <Text style={styles.signUpText}>Daftar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A90E2",
  },

  header: {
    height: 280,
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  logo: {
    position: "absolute",
    top: 40,
    right: 10,
    width: 50,
    height: 50,
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
  },

  welcomeText: {
    color: "white",
    fontSize: 28,
    fontWeight: "300",
  },

  welcomeBold: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    marginTop: -10,
  },

  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
    backgroundColor: "#FAFAFA",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },

  forgotContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },

  forgotText: {
    color: "#4A90E2",
    fontSize: 14,
  },

  signInButton: {
    backgroundColor: "#4A90E2",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  signInText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },

  footerText: {
    color: "#777",
    fontSize: 14,
  },

  signUpText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default LoginScreen;
