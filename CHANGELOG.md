# Changelog - Aplikasi Pencatatku

## Tanggal: 15 Desember 2025

### 🐛 Bug Fix: Gambar Tidak Muncul di PDF Export

#### Masalah Awal
- Gambar pada catatan tidak muncul saat melakukan export ke PDF
- Gambar tersimpan sebagai `imageUri` (path lokal: `file:///...`)
- Path lokal tidak bisa dibaca di HTML/PDF, perlu format base64

#### Solusi yang Diterapkan

**1. File: `src/screens/AddNote/AddNoteScreen.js`**

**Perubahan pada fungsi `saveNote()`:**
```javascript
// SEBELUM: Hanya simpan imageUri
const newNote = {
  title,
  content,
  imageUri, // Path lokal saja
  date: new Date().toISOString(),
};

// SESUDAH: Simpan imageUri + imageBase64
let imageBase64 = null;

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
    
    console.log("Image converted successfully, base64 length:", imageBase64?.length);
  } catch (error) {
    console.error("Error converting image:", error);
  }
}

const newNote = {
  title,
  content,
  imageUri,     // Untuk tampilan di app (cepat)
  imageBase64,  // Untuk PDF (format: data:image/jpeg;base64,...)
  date: new Date().toISOString(),
};
```

**Teknologi yang Digunakan:**
- `Fetch API` - Membaca file lokal sebagai blob
- `FileReader API` - Konversi blob ke base64 data URL
- `Promise` - Handle proses asynchronous

---

**2. File: `src/screens/Home/HomeScreen.js`**

**a) Perubahan pada fungsi `saveEditedNote()`:**
```javascript
// Ditambahkan konversi base64 saat edit catatan
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
  imageBase64,  // Simpan base64 baru atau gunakan yang lama
};
```

**b) Perubahan pada fungsi `exportNotesToPDF()`:**
```javascript
// SEBELUM: Menggunakan imageUri (tidak bisa dibaca di HTML)
if (note.imageUri) {
  htmlContent += `<img src="${note.imageUri}" ... />`;
}

// SESUDAH: Menggunakan imageBase64 (bisa dibaca di HTML)
if (note.imageBase64) {
  console.log("Adding image to PDF for note:", note.title);
  htmlContent += `<img src="${note.imageBase64}" ... />`;
}
```

**Debugging yang Ditambahkan:**
- Console log untuk tracking konversi gambar
- Console log untuk tracking catatan yang punya imageBase64
- Memudahkan troubleshooting jika ada masalah

---

### ✨ Fitur yang Ditambahkan/Diperbaiki

1. **✅ Export PDF dengan Gambar**
   - Gambar sekarang muncul di file PDF yang diekspor
   - Format gambar: Base64 data URI (kompatibel dengan HTML/PDF)

2. **✅ Konversi Otomatis**
   - Saat tambah catatan baru → otomatis convert gambar ke base64
   - Saat edit catatan → convert ulang jika gambar diganti
   - Tidak perlu konversi manual dari user

3. **✅ Dual Storage**
   - `imageUri` → untuk tampilan cepat di aplikasi
   - `imageBase64` → untuk export PDF
   - Optimasi performa dan kompatibilitas

---

### 📝 Catatan Penting

**Untuk Developer:**
- `imageBase64` berukuran ~33% lebih besar dari file asli
- Catatan lama (sebelum update) tidak punya `imageBase64`
- Hanya catatan baru atau yang diedit setelah update yang gambarnya muncul di PDF

**Untuk User:**
- Buat catatan baru dengan gambar → gambar akan muncul di PDF
- Edit catatan lama dan ubah/tambah gambar → gambar akan muncul di PDF
- Catatan lama tanpa edit → gambar tidak muncul di PDF (perlu edit ulang)

---

### 🔧 Technical Details

**Dependencies yang Digunakan:**
- `expo-print` - Generate PDF
- `expo-sharing` - Share/save PDF
- `expo-image-picker` - Ambil gambar dari kamera/galeri
- Native Web APIs (Fetch, FileReader, Blob)

**API yang Deprecated (Dihindari):**
- ❌ `expo-file-system.readAsStringAsync()` - Deprecated di versi terbaru
- ✅ Diganti dengan Fetch API + FileReader (lebih standard)

**Format Data:**
```javascript
note = {
  id: timestamp,
  title: "Judul Catatan",
  content: "Isi catatan...",
  imageUri: "file:///path/to/image.jpg",           // Path lokal
  imageBase64: "data:image/jpeg;base64,/9j/4AAQ...", // Base64 data URI
  date: "2025-12-15T09:31:00.000Z"
}
```

---

### 🧪 Testing yang Dilakukan

1. ✅ Tambah catatan baru dengan gambar → gambar tersimpan
2. ✅ Export PDF → gambar muncul di PDF
3. ✅ Edit catatan dan ganti gambar → gambar baru muncul di PDF
4. ✅ Console log menunjukkan konversi berhasil
5. ✅ Tidak ada error saat save/export

---

### 🎯 Kesimpulan

Bug gambar tidak muncul di PDF sudah berhasil diperbaiki dengan:
- Menambahkan konversi otomatis imageUri → imageBase64
- Menggunakan base64 data URI untuk kompatibilitas PDF
- Implementasi debugging untuk troubleshooting

**Status: ✅ RESOLVED**
