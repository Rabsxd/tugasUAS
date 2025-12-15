import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "react-native-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { updateNote } from "../../utils/storage";

const EditNoteScreen = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();
  const { note } = route.params;

  useEffect(() => {
    // Isi form dengan data catatan lama
    setTitle(note.title);
    setContent(note.content);
    setImageUri(note.imageUri);
  }, [note]);

  const takePhoto = () => {
    ImagePicker.launchCamera(
      { mediaType: "photo", quality: 0.5 },
      (response) => {
        if (response.didCancel) {
          Alert.alert("Dibatalkan", "Pengambilan foto dibatalkan");
        } else if (response.errorCode) {
          Alert.alert("Error", response.errorMessage);
        } else {
          setImageUri(response.assets?.[0]?.uri);
        }
      }
    );
  };

  const chooseFromGallery = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: "photo", quality: 0.5 },
      (response) => {
        if (response.didCancel) {
          Alert.alert("Dibatalkan", "Pemilihan gambar dibatalkan");
        } else if (response.errorCode) {
          Alert.alert("Error", response.errorMessage);
        } else {
          setImageUri(response.assets?.[0]?.uri);
        }
      }
    );
  };

  const saveEditedNote = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Judul catatan wajib diisi");
      return;
    }

    // Simpan perubahan ke storage
    await updateNote(note.id, { title, content, imageUri });

    Alert.alert("Sukses", "Catatan berhasil diperbarui", [
      {
        text: "OK",
        onPress: () => {
          navigation.navigate("Home"); // Kembali ke Home
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Judul:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Masukkan judul catatan"
      />

      <Text style={styles.label}>Isi Catatan:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={content}
        onChangeText={setContent}
        placeholder="Tulis catatan di sini..."
        multiline
      />

      <Text style={styles.label}>Tambah Gambar:</Text>
      <View style={styles.imageButtons}>
        <TouchableOpacity onPress={takePhoto} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>Ambil Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={chooseFromGallery}
          style={styles.imageButton}
        >
          <Text style={styles.imageButtonText}>Pilih dari Galeri</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={saveEditedNote}>
        <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  imageButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  imageButtonText: {
    color: "white",
  },
  previewImage: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditNoteScreen;
