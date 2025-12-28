# ⚡ Quick Test Guide

## Langkah-langkah Test Announcement System

### 1️⃣ Buat Pengumuman (2+)

```
1. Mode: Listener (default)
2. Klik "Mode Artist" (top-right)
   → Sekarang jadi "🎤 Mode: Artist"
3. Klik "Artist Studio" button
4. Scroll ke section "Pengumuman"
5. Klik tombol "Buat Pengumuman"
6. Type: "Pengumuman pertama"
7. Select: "Publish"
8. Klik "Publish"
9. Repeat step 5-8 untuk pengumuman ke-2
```

### 2️⃣ Verifikasi Badge Muncul

```
1. Klik logo Spotify (top-left) → Balik ke Dashboard
2. Klik salah satu card artist (misal: "Fourtwnty")
3. Lihat button "PENGUMUMAN" di artist page
4. ✓ Badge hijau (notifikasi dot) sudah muncul?
   - Badge = lingkaran hijau kecil di kanan atas tombol
```

### 3️⃣ Test Read/Unread & Badge Hide

```
1. Klik tombol "PENGUMUMAN"
   → Modal terbuka, tab "Belum dibaca" aktif
2. Verifikasi 2 announcement cards visible
3. Console check (F12):
   Lihat log: "🔔 Badge update: Fourtwnty - Published: 2, Unread: 2"
4. Klik announcement card PERTAMA
   → Card berubah warna (lebih gelap/fade)
   → Pindah ke tab "Belum dibaca" (should be 1 card)
5. Console check:
   "✓ Mark as read: Fourtwnty - ID [number]"
   "✓ Badge MUNCUL (1 unread)"
6. Klik announcement card KEDUA
7. Console check:
   "✗ Badge HILANG (semua sudah dibaca)"
8. Tutup modal (X button) → Lihat di halaman
   ✓ Badge HILANG? Benar!
9. Klik "PENGUMUMAN" lagi
   → Tab "Sudah dibaca" = 2 cards (yang sudah dibaca)
   → Tab "Belum dibaca" = kosong
```

### 4️⃣ Test Per-Artist Isolation

```
1. Dashboard → Klik "Nadhif Basalamah" card
2. Lihat button "PENGUMUMAN"
   ✓ Badge TIDAK ada (Nadhif punya announcement terpisah)
3. Klik "PENGUMUMAN"
   → Modal kosong atau minimal ada announcement dari Nadhif
4. Back → Klik "Fourtwnty" lagi
   ✓ Badge masih hilang (sudah semua dibaca)
```

---

## Console Logs to Expect

### When Opening Announcement Modal

```javascript
🔔 Badge update: Fourtwnty - Published: 2, Unread: 2
✓ Badge MUNCUL (2 unread)
```

### When Clicking 1st Announcement

```javascript
✓ Mark as read: Fourtwnty - ID 1703769600000 Set(1) {1703769600000}
🔔 Badge update: Fourtwnty - Published: 2, Unread: 1
✓ Badge MUNCUL (1 unread)
```

### When Clicking 2nd Announcement (Last One)

```javascript
✓ Mark as read: Fourtwnty - ID 1703769600001 Set(2) {1703769600000, 1703769600001}
🔔 Badge update: Fourtwnty - Published: 2, Unread: 0
✗ Badge HILANG (semua sudah dibaca)
```

---

## Troubleshooting

### ❌ Badge masih muncul setelah read semua

**Check:**
1. Buka DevTools → Console
2. Cek ada error message?
3. Cek log terakhir: "unreadCount" berapa?
4. Kalau masih ada unread, berarti ID type masih salah

### ❌ Modal kosong / tidak bisa buka

**Check:**
1. Sudah switch ke "Mode Artist"?
2. Sudah buat pengumuman di Studio?
3. Buka DevTools → Console
4. Cek ada JavaScript error?

### ❌ Announcement tidak muncul di modal

**Check:**
1. Artist yang dibuka = "Fourtwnty"?
2. Announcement status = "published"?
3. Modal: lihat `announcementContainer` element di HTML
4. Tab "Belum dibaca" - ada di sana?

---

## Expected Results Summary

✅ Announcement created & visible di Studio list  
✅ Badge appears on Fourtwnty artist page  
✅ Badge disappears after marking all as read  
✅ Announcement moves to "Sudah dibaca" tab  
✅ Unread tab becomes empty  
✅ Per-artist isolation (Nadhif has no badge)  
✅ Console logs show correct IDs & counts

---

*If all tests pass, the system is working correctly!* 🎉
