import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { addNote } from "../../utils/storage";
import { Ionicons } from "@expo/vector-icons"; // Pastikan sudah diinstal

const AddNoteScreen = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(null);

  const navigation = useNavigation();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin Ditolak", "Aplikasi membutuhkan izin akses galeri.");
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const chooseFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const saveNote = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Judul catatan wajib diisi");
      return;
    }

    let imageBase64 = null;

    // Konversi imageUri ke base64 jika ada gambar
    if (imageUri) {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const reader = new FileReader();

        imageBase64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        console.log(
          "Image converted successfully, base64 length:",
          imageBase64?.length
        );
      } catch (error) {
        console.error("Error converting image:", error);
      }
    }

    const newNote = {
      title,
      content,
      imageUri, // Untuk tampilan di app
      imageBase64, // Untuk PDF
      date: new Date().toISOString(),
    };

    console.log("Saving note with imageBase64:", !!imageBase64);
    await addNote(newNote);

    Alert.alert("Sukses", "Catatan berhasil disimpan!", [
      {
        text: "OK",
        onPress: () => {
          navigation.navigate("Home");
        },
      },
    ]);

    // Reset form
    setTitle("");
    setContent("");
    setImageUri(null);
  };

  return (
    <LinearGradient
      colors={["#e0e7ef", "#f5f7fa"]}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header dengan Icon */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="create-outline" size={40} color="#667eea" />
          </View>
          <Text style={styles.headerTitle}>Tambah Catatan Baru</Text>
          <Text style={styles.headerSubtitle}>
            Isi dan simpan catatan Anda disini
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Input Judul */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="text-outline" size={20} color="#667eea" />
              <Text style={styles.label}>Judul Catatan</Text>
            </View>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Contoh: Daftar Belanja, Ide Bisnis..."
              placeholderTextColor="#b2bec3"
            />
          </View>

          {/* Input Isi Catatan */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#667eea"
              />
              <Text style={styles.label}>Isi Catatan</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Tulis catatanmu di sini..."
              multiline
              textAlignVertical="top"
              placeholderTextColor="#b2bec3"
            />
          </View>

          {/* Tambah Gambar */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="images-outline" size={20} color="#667eea" />
              <Text style={styles.label}>Tambah Gambar (Opsional)</Text>
            </View>
            <View style={styles.imageButtons}>
              <TouchableOpacity onPress={takePhoto} style={styles.imageButton}>
                <Ionicons name="camera" size={22} color="white" />
                <Text style={styles.imageButtonText}>Kamera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={chooseFromGallery}
                style={[styles.imageButton, styles.galleryButton]}
              >
                <Ionicons name="image" size={22} color="white" />
                <Text style={styles.imageButtonText}>Galeri</Text>
              </TouchableOpacity>
            </View>

            {imageUri && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri(null)}
                >
                  <Ionicons name="close-circle" size={28} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Tombol Simpan */}
          <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.saveButtonText}>Simpan Catatan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#636e72",
  },
  formContainer: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#dfe6e9",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
    color: "#2d3436",
  },
  textArea: {
    height: 140,
    textAlignVertical: "top",
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  imageButton: {
    backgroundColor: "#667eea",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  galleryButton: {
    backgroundColor: "#95a5a6",
    shadowColor: "#95a5a6",
  },
  imageButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  imagePreviewContainer: {
    position: "relative",
    marginTop: 15,
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 14,
  },
  saveButton: {
    backgroundColor: "#00C853",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#00C853",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default AddNoteScreen;
