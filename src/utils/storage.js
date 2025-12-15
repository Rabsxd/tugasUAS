import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTES_STORAGE_KEY = "notes";

export const addNote = async (note) => {
  const notes = await loadNotes();
  // Beri id jika belum ada
  const newNote = {
    ...note,
    id: note.id || Date.now(), // Gunakan timestamp sebagai fallback
  };
  notes.push(newNote);
  await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
};

export const loadNotes = async () => {
  const data = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteNote = async (id) => {
  const notes = await loadNotes();
  const updatedNotes = notes.filter((note) => note.id !== id);
  await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
};

export const updateNote = async (id, updatedNote) => {
  const notes = await loadNotes();
  const index = notes.findIndex((note) => note.id === id);
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updatedNote, id }; // Pastikan id tetap ada
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  }
};
