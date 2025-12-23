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
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);

  // Form state untuk edit
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchNotes = async () => {
        const data = await loadNotes();
        // Sort by date descending (terbaru di atas)
        const sortedData = data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setNotes(sortedData);
        setFilteredNotes(sortedData); // Awalnya tampilkan semua
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
    const notesToExport =
      isSelectionMode && selectedNoteIds.length > 0
        ? notes.filter((note) => selectedNoteIds.includes(note.id))
        : notes;

    if (notesToExport.length === 0) {
      Alert.alert(
        "Info",
        isSelectionMode
          ? "Pilih catatan yang ingin diekspor."
          : "Tidak ada catatan untuk diekspor."
      );
      return;
    }

    let htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .note-page {
            padding: 30px;
            page-break-after: always;
          }
          .note-page:last-child {
            page-break-after: auto;
          }
        </style>
      </head>
      <body>`;

    notesToExport.forEach((note, index) => {
      console.log("Note:", note.title, "has imageBase64:", !!note.imageBase64);

      htmlContent += `
      <div class="note-page">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="margin: 0 0 8px 0; color: #333; font-size: 28px;">${
            note.title
          }</h1>
          <p style="margin: 0; color: #888; font-size: 13px;">
            ${new Date(note.date).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
    `;

      if (note.imageBase64) {
        console.log("Adding image to PDF for note:", note.title);
        htmlContent += `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${note.imageBase64}" style="max-width: 100%; max-height: 350px; width: auto; height: auto; border-radius: 8px;" />
          </div>
        `;
      }

      htmlContent += `
        <div style="font-size: 15px; line-height: 1.6; color: #333; white-space: pre-wrap; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #fafafa;">
          ${note.content}
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 11px;">
          Halaman ${index + 1} dari ${notesToExport.length}
        </div>
      </div>
      `;
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

      // Reset selection mode after export
      if (isSelectionMode) {
        setIsSelectionMode(false);
        setSelectedNoteIds([]);
      }
    } catch (error) {
      console.error("Error saat ekspor PDF:", error);
      Alert.alert("Error", "Gagal mengekspor catatan ke PDF.");
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNoteIds([]);
  };

  const toggleNoteSelection = (noteId) => {
    if (selectedNoteIds.includes(noteId)) {
      setSelectedNoteIds(selectedNoteIds.filter((id) => id !== noteId));
    } else {
      setSelectedNoteIds([...selectedNoteIds, noteId]);
    }
  };

  const selectAllNotes = () => {
    if (selectedNoteIds.length === filteredNotes.length) {
      setSelectedNoteIds([]);
    } else {
      setSelectedNoteIds(filteredNotes.map((note) => note.id));
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

  const renderItem = ({ item }) => {
    const isSelected = selectedNoteIds.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.noteCard, isSelected && styles.selectedCard]}
        onPress={() =>
          isSelectionMode ? toggleNoteSelection(item.id) : openNoteDetail(item)
        }
        onLongPress={() => !isSelectionMode && handleDelete(item.id)}
      >
        {isSelectionMode && (
          <View style={styles.checkboxContainer}>
            <Ionicons
              name={isSelected ? "checkbox" : "square-outline"}
              size={24}
              color={isSelected ? "#667eea" : "#b2bec3"}
            />
          </View>
        )}
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
  };

  const renderModalContent = () => {
    if (isEditing) {
      return (
        <ScrollView
          style={styles.modalScrollView}
          showsVerticalScrollIndicator={false}
        >
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
                <TouchableOpacity
                  onPress={takePhoto}
                  style={styles.cameraButton}
                >
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
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveEditedNote}
            >
              <Ionicons
                name="save"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.saveButtonText}>Simpan Catatan</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    } else {
      // Detail Catatan
      return (
        <ScrollView
          style={styles.modalScrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header dengan Gradient */}
          <LinearGradient
            colors={["#e0e7ef", "#f5f7fa"]}
            style={styles.modalHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="document-text" size={32} color="#2d3436" />
              </View>
              <Text style={styles.modalTitle}>{selectedNote.title}</Text>
              <View style={styles.modalDateBadge}>
                <Ionicons name="calendar-outline" size={14} color="#636e72" />
                <Text style={styles.modalDate}>
                  {new Date(selectedNote.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Content Area */}
          <View style={styles.modalContentArea}>
            {/* Tampilkan gambar dari imageBase64 */}
            {selectedNote.imageBase64 && (
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ uri: selectedNote.imageBase64 }}
                  style={styles.modalImage}
                />
              </View>
            )}

            <View style={styles.modalContentWrapper}>
              <Text style={styles.modalContentLabel}>Isi Catatan</Text>
              <Text style={styles.modalContentText}>
                {selectedNote.content}
              </Text>
            </View>
          </View>

          {/* Tombol Edit & Hapus */}
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={styles.editButton} onPress={openEditForm}>
              <Ionicons name="create-outline" size={20} color="white" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(selectedNote.id)}
            >
              <Ionicons name="trash-outline" size={20} color="white" />
              <Text style={styles.deleteButtonText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
  };

  return (
    <LinearGradient
      colors={["#e0e7ef", "#f5f7fa"]}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.screenContainer}>
        {/* Header: Judul + Ikon Search + Ikon Ekspor */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Catatan Saya</Text>
            <Text style={styles.subtitle}>
              {isSelectionMode
                ? `${selectedNoteIds.length} dipilih`
                : `${notes.length} catatan tersimpan`}
            </Text>
          </View>
          <View style={styles.headerIcons}>
            {isSelectionMode && (
              <TouchableOpacity
                onPress={selectAllNotes}
                style={styles.iconButton}
              >
                <Ionicons
                  name={
                    selectedNoteIds.length === filteredNotes.length
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={22}
                  color="#2d3436"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={exportNotesToPDF}
              style={styles.iconButton}
            >
              <Ionicons name="download-outline" size={22} color="#2d3436" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleSelectionMode}
              style={[
                styles.iconButton,
                isSelectionMode && styles.activeIconButton,
              ]}
            >
              <Ionicons
                name={isSelectionMode ? "close" : "checkmark-done-outline"}
                size={22}
                color={isSelectionMode ? "#fff" : "#2d3436"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSearch(!showSearch)}
              style={styles.iconButton}
            >
              <Ionicons
                name={showSearch ? "close" : "search"}
                size={22}
                color="#2d3436"
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
          keyExtractor={(item) => String(item.id || Math.random())}
          renderItem={renderItem}
          contentContainerStyle={
            filteredNotes.length === 0 ? styles.emptyState : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Ionicons
                name="document-text-outline"
                size={80}
                color="rgba(0,0,0,0.15)"
              />
              <Text style={styles.emptyStateTitle}>Belum Ada Catatan</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? "Tidak ada hasil yang ditemukan"
                  : "Mulai tambahkan catatan pertamamu!"}
              </Text>
            </View>
          }
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2d3436",
  },
  subtitle: {
    fontSize: 14,
    color: "#636e72",
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 10,
    borderRadius: 12,
  },
  activeIconButton: {
    backgroundColor: "#667eea",
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
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listContent: {
    paddingBottom: 20,
  },
  noteCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 18,
    marginBottom: 15,
    borderRadius: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  selectedCard: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderWidth: 2,
    borderColor: "#667eea",
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: "center",
  },
  noteImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 15,
  },
  noteTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d3436",
    marginBottom: 6,
  },
  noteContent: {
    fontSize: 14,
    color: "#636e72",
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
    color: "#b2bec3",
    marginTop: 6,
    fontWeight: "500",
  },
  emptyState: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3436",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#636e72",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  modalScrollView: {
    flex: 1,
  },
  modalHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  modalHeaderContent: {
    alignItems: "center",
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2d3436",
    textAlign: "center",
    marginBottom: 12,
  },
  modalDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  modalDate: {
    fontSize: 13,
    color: "#636e72",
    fontWeight: "500",
  },
  modalContentArea: {
    padding: 20,
  },
  modalImageContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modalImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  modalContentWrapper: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modalContentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalContentText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2d3436",
  },
  modalButtonContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
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
    backgroundColor: "#667eea",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginRight: 6,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  editButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#ff6b6b",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginLeft: 6,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
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
    backgroundColor: "#95a5a6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    margin: 20,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default HomeScreen;
