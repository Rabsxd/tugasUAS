import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons"; // Pastikan ini sudah ada
import { loadNotes, deleteNote, updateNote } from "../../utils/storage";

const HomeScreen = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false); // Tampilkan input search
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state untuk edit
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchNotes = async () => {
        const data = await loadNotes();
        setNotes(data);
        setFilteredNotes(data); // Awalnya tampilkan semua
      };
      fetchNotes();
    }, [])
  );

  // Filter catatan saat searchQuery berubah
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  }, [searchQuery, notes]);

  const exportNotesToPDF = async () => {
    if (notes.length === 0) {
      Alert.alert("Info", "Tidak ada catatan untuk diekspor.");
      return;
    }

    let htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="text-align: center;">Daftar Catatan</h1>
        <p style="text-align: center; color: #888;">Dibuat pada: ${new Date().toLocaleString()}</p>`;

    notes.forEach((note) => {
      console.log("Note:", note.title, "has imageBase64:", !!note.imageBase64);

      htmlContent += `
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
        <h2 style="margin: 0 0 10px 0; color: #333;">${note.title}</h2>
        <p style="margin: 0 0 10px 0;"><strong>Tanggal:</strong> ${new Date(
          note.date
        ).toLocaleString()}</p>
        <p style="margin: 0 0 10px 0;">${note.content}</p>
    `;

      if (note.imageBase64) {
        console.log("Adding image to PDF for note:", note.title);
        htmlContent += `<img src="${note.imageBase64}" style="max-width: 100%; max-height: 300px; width: auto; height: auto; object-fit: contain; border-radius: 8px; margin-top: 10px; display: block;" />`;
      }

      htmlContent += "</div>";
    });

    htmlContent += `
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Simpan ke file
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Ekspor Catatan ke PDF",
      });
    } catch (error) {
      console.error("Error saat ekspor PDF:", error);
      Alert.alert("Error", "Gagal mengekspor catatan ke PDF.");
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menghapus catatan ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            await deleteNote(id);
            const updatedNotes = notes.filter((note) => note.id !== id);
            setNotes(updatedNotes);
            closeNoteDetail();
          },
        },
      ]
    );
  };

  const openNoteDetail = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setImageUri(note.imageUri || null);
    setModalVisible(true);
    setIsEditing(false);
  };

  const closeNoteDetail = () => {
    setModalVisible(false);
    setSelectedNote(null);
    setIsEditing(false);
  };

  const openEditForm = () => {
    setIsEditing(true);
  };

  const saveEditedNote = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Judul catatan wajib diisi");
      return;
    }

    let imageBase64 = selectedNote.imageBase64 || null;

    // Jika gambar diubah, konversi ke base64
    if (imageUri && imageUri !== selectedNote.imageUri) {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const reader = new FileReader();

        imageBase64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error converting image:", error);
      }
    }

    const updatedNote = {
      ...selectedNote,
      title,
      content,
      imageUri: imageUri || null,
      imageBase64,
    };

    await updateNote(selectedNote.id, updatedNote);

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      )
    );

    Alert.alert("Sukses", "Catatan berhasil diperbarui");

    closeNoteDetail();
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin Ditolak", "Aplikasi membutuhkan izin akses galeri.");
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    console.log("Membuka kamera...");
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    console.log("Hasil kamera:", result);

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const chooseFromGallery = async () => {
    console.log("Membuka galeri...");
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    console.log("Hasil galeri:", result);

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => openNoteDetail(item)}
      onLongPress={() => handleDelete(item.id)}
    >
      {item?.imageUri && (
        <Image source={{ uri: item.imageUri }} style={styles.noteImage} />
      )}
      <View style={styles.noteTextContainer}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        <Text style={styles.noteContent} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.noteDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderModalContent = () => {
    if (isEditing) {
      return (
        <View style={styles.editCard}>
          {/* Header */}
          <Text style={styles.editTitle}>Edit Catatan</Text>
          <Text style={styles.editSubtitle}>
            Perbarui catatan Anda di bawah
          </Text>

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
              <TouchableOpacity onPress={takePhoto} style={styles.cameraButton}>
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.buttonText}>Kamera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={chooseFromGallery}
                style={[styles.galleryButton, { backgroundColor: "#6c757d" }]}
              >
                <Ionicons name="image" size={20} color="white" />
                <Text style={styles.buttonText}>Galeri</Text>
              </TouchableOpacity>
            </View>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            )}
          </View>

          {/* Tombol Simpan Catatan */}
          <TouchableOpacity style={styles.saveButton} onPress={saveEditedNote}>
            <Ionicons
              name="save"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.saveButtonText}>Simpan Catatan</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      // Detail Catatan
      return (
        <>
          <Text style={styles.modalTitle}>{selectedNote.title}</Text>
          <Text style={styles.modalDate}>
            {new Date(selectedNote.date).toLocaleDateString()}
          </Text>
          {/* Tampilkan gambar dari imageBase64 */}
          {selectedNote.imageBase64 && (
            <Image
              source={{ uri: selectedNote.imageBase64 }}
              style={styles.modalImage}
            />
          )}
          <Text style={styles.modalContentText}>{selectedNote.content}</Text>

          {/* Tombol Edit & Hapus */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.editButton} onPress={openEditForm}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(selectedNote.id)}
            >
              <Text style={styles.deleteButtonText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }
  };

  return (
    <View style={styles.screenContainer}>
      {/* Header: Judul + Ikon Search + Ikon Ekspor */}
      <View style={styles.header}>
        <Text style={styles.title}>Daftar Catatan</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={exportNotesToPDF}>
            <Ionicons name="download-outline" size={24} color="#007BFF" />{" "}
            {/* Ikon ekspor */}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            style={{ marginLeft: 15 }}
          >
            <Ionicons
              name={showSearch ? "close" : "search"}
              size={24}
              color="#007BFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input (muncul saat showSearch = true) */}
      {showSearch && (
        <TextInput
          style={styles.searchInput}
          placeholder="Cari catatan..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      )}

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => String(item.id || Math.random())} // ✅ Aman dari undefined
        renderItem={renderItem}
        contentContainerStyle={filteredNotes.length === 0 && styles.emptyState}
        ListEmptyComponent={<Text>Belum ada catatan atau tidak ditemukan</Text>}
      />

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeNoteDetail}
      >
        <View style={styles.modalContainer}>
          {selectedNote && renderModalContent()}
          {!isEditing && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeNoteDetail}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    top: 30,
    padding: 20,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f4f8", // Latar belakang lembut
    top: 30,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
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
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  noteCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    flexDirection: "row",
  },
  noteImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  noteTextContainer: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noteContent: {
    fontSize: 14,
    marginTop: 5,
  },
  noteDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalDate: {
    fontSize: 14,
    color: "#888",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  modalContentText: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 10,
  },
  editCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  editTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  editSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
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
  cameraButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 0.48,
    flexDirection: "row",
    justifyContent: "center",
  },
  galleryButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 0.48,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  editButton: {
    backgroundColor: "#28A745",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#DC3545",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#00C853", // Hijau cerah
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default HomeScreen;
