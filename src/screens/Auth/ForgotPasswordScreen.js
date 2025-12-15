import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const navigation = useNavigation();

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert("Error", "Email wajib diisi");
      return;
    }

    // Simulasi kirim link reset password
    Alert.alert(
      "Link Reset Dikirim",
      `Link untuk reset password telah dikirim ke ${email}`,
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(), // Kembali ke LoginScreen
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Latar Belakang Gradient */}
      <View style={styles.background} />

      {/* Ilustrasi Lupa Password */}
      <Image
        source={require("../../assets/images/logo.png")} // Ganti dengan ilustrasi Anda
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Form Lupa Password */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Lupa Password?</Text>
        <Text style={styles.subtitle}>
          Masukkan email Anda untuk reset password
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetPassword}
        >
          <Text style={styles.resetButtonText}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Kembali ke Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f5f5f5", // Latar belakang abu muda
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#9C27B0", // Gradient ungu (bisa diganti dengan LinearGradient jika ingin lebih halus)
  },
  illustration: {
    width: "60%",
    height: 200,
    alignSelf: "center",
    marginBottom: 20,
    tintColor: "#fff", // Agar ilustrasi berwarna putih
  },
  formContainer: {
    backgroundColor: "white",
    marginHorizontal: 30,
    padding: 25,
    borderRadius: 15,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    textAlign: "center",
    color: "#888",
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 5,
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },
  resetButton: {
    backgroundColor: "#9C27B0", // Ungu
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  resetButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  backText: {
    textAlign: "center",
    color: "#9C27B0",
    marginTop: 15,
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;
