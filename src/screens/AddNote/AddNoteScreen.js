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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tambah Catatan Baru</Text>
        <Text style={styles.headerSubtitle}>Simpan catatan Anda di bawah</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Input Judul */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Judul</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Contoh: buku"
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Input Isi Catatan */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Isi Catatan</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="Tulis catatanmu di sini..."
            multiline
            textAlignVertical="top"
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Tambah Gambar */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tambah Gambar</Text>
          <View style={styles.imageButtons}>
            <TouchableOpacity onPress={takePhoto} style={styles.imageButton}>
              <Ionicons name="camera-outline" size={24} color="white" />
              <Text style={styles.imageButtonText}>Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={chooseFromGallery}
              style={[styles.imageButton, { backgroundColor: "#6c757d" }]}
            >
              <Ionicons name="image-outline" size={24} color="white" />
              <Text style={styles.imageButtonText}>Galeri</Text>
            </TouchableOpacity>
          </View>

          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          )}
        </View>

        {/* Tombol Simpan */}
        <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
          <Ionicons
            name="save-outline"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.saveButtonText}>Simpan Catatan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f4f8", // Latar belakang lembut
    top: 30,
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 0.48,
    flexDirection: "row",
    justifyContent: "center",
  },
  imageButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "500",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    resizeMode: "cover",
  },
  saveButton: {
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row", // Agar ikon dan teks sejajar
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddNoteScreen;
