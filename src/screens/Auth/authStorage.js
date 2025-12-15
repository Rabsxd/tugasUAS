import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_STORAGE_KEY = "users"; // ✅ Ganti ke jamak

export const saveUser = async (user) => {
  try {
    // Ambil array akun yang sudah ada
    const existingUsers = await loadUsers();
    // Tambahkan akun baru ke array
    const updatedUsers = [...existingUsers, user];
    // Simpan kembali ke AsyncStorage
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  } catch (e) {
    console.error("Gagal menyimpan user:", e);
  }
};

export const loadUsers = async () => {
  try {
    const data = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Gagal memuat users:", e);
    return [];
  }
};

// Fungsi baru: Cek apakah username sudah ada
export const checkUserExists = async (username) => {
  const users = await loadUsers();
  return users.some((user) => user.username === username);
};

export const removeUser = async (username) => {
  try {
    const users = await loadUsers();
    const updatedUsers = users.filter((user) => user.username !== username);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  } catch (e) {
    console.error("Gagal menghapus user:", e);
  }
};
