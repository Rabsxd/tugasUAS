import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AboutScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            try {
              // Hapus token/session dari AsyncStorage
              await AsyncStorage.removeItem("@user_session");
              // Dispatch logout action
              dispatch(logout());
              // Navigate ke Landing screen
              navigation.reset({
                index: 0,
                routes: [{ name: "Landing" }],
              });
            } catch (error) {
              console.error("Error saat logout:", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header dengan latar belakang gradient */}
      <View style={styles.header}>
        <Ionicons
          name="book-outline"
          size={80}
          color="white"
          style={styles.icon}
        />
        <Text style={styles.appName}>Pencatatan Donasi</Text>
        <Text style={styles.appSubtitle}>
          Catat, Kelola, dan Laporkan dengan Mudah
        </Text>
      </View>

      {/* Konten Utama */}
      <View style={styles.contentCard}>
        {/* Deskripsi Aplikasi */}
        <Text style={styles.sectionTitle}>Tentang Aplikasi</Text>
        <Text style={styles.content}>
          Aplikasi ini dirancang untuk memudahkan pencatatan, pengelolaan, dan
          pelaporan donasi bagi panti asuhan, sehingga setiap bantuan dapat
          tercatat dengan transparan, akurat, dan terpercaya.
        </Text>

        {/* Informasi Tambahan */}
        <Text style={styles.sectionTitle}>Fitur Utama</Text>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#28A745" />
          <Text style={styles.featureText}>Tambah, Edit, Hapus Catatan</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="search-outline" size={20} color="#28A745" />
          <Text style={styles.featureText}>Pencarian Cepat</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="download-outline" size={20} color="#28A745" />
          <Text style={styles.featureText}>Ekspor ke PDF</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="image-outline" size={20} color="#28A745" />
          <Text style={styles.featureText}>Tambah Gambar</Text>
        </View>
      </View>

      {/* Informasi Versi dan Developer */}
      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Versi</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Oleh</Text>
          <Text style={styles.infoValue}>Kelompok 2</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Paymuhslawi</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f7fa", // Latar belakang lembut
  },
  header: {
    backgroundColor: "#007BFF", // Gradient bisa diganti dengan LinearGradient jika ingin lebih halus
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  icon: {
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  appSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 5,
  },
  contentCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  content: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLabel: {
    fontSize: 14,
    color: "#888",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#DC3545",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    paddingVertical: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#888",
  },
});

export default AboutScreen;
