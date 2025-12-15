import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

const LandingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logodepan.png")}
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Logo / Brand */}
      <Text style={styles.brand}>Paymuhslawi</Text>

      {/* Judul */}
      <Text style={styles.title}>Pencatatan Donasi</Text>

      {/* Deskripsi */}
      <Text style={styles.description}>
        Dirancang untuk memudahkan pencatatan, pengelolaan, dan pelaporan donasi
        bagi panti asuhan, sehingga setiap bantuan dapat tercatat dengan
        transparan, akurat, dan terpercaya.
      </Text>

      {/* Tombol Get Started */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Mulai</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footer}>oleh Kelompok 2</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Putih bersih
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  illustration: {
    width: "80%",
    height: 250,
    marginBottom: 20,
  },
  brand: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#000",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#555",
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 15,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 55,
    fontSize: 12,
    color: "#888",
  },
});

export default LandingScreen;
