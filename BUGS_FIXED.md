# 🐛 Bug Report & Fixes - Announcement System

## Summary
Found and fixed **3 critical bugs** dalam announcement system yang menyebabkan badge tidak hilang setelah read.

---

## Bug #1: 🔴 **File Load Order Salah**

### Masalah
```html
<!-- WRONG ORDER (sebelumnya) -->
1. app.js
2. artistStudio.js ❌ Butuh getUnreadCountForArtist() dari modal.js
3. announcementModal.js
4. announcement-data.js
5. navigation.js
6. modal.js ← Dimuat terakhir!
```

**Akibat:** `artistStudio.js` mencoba call `getUnreadCountForArtist()` pada line 246, tapi function belum ada di memory → `undefined` error!

### Fix
```html
<!-- CORRECT ORDER (sekarang) -->
1. app.js
2. modal.js ← Pindah ke urutan 2
3. artistStudio.js ← Sekarang dapat akses functions dari modal.js
4. announcementModal.js
5. announcement-data.js
6. navigation.js
7. context-menu.js
```

**File yang diubah:** `index.html` (lines 621-637)

---

## Bug #2: 🔴 **ID Type Mismatch (String vs Number)**

### Masalah

```javascript
// Announcement disimpan dengan tipe NUMBER
artistAnnouncements['Fourtwnty'].push({
  id: Date.now()  // ← NUMBER: 1703769600000
})

// Tapi onclick HTML kirim sebagai STRING
onclick="markAsRead('${a.id}')"  // ← STRING: "1703769600000"

// Set.has() type-sensitive!
readSet.has("1703769600000")  // ❌ FALSE (string !== number)
readSet.has(1703769600000)     // ✓ TRUE
```

**Akibat:** Badge calculation selalu salah karena ID tidak match dalam Set!

### Fix
**modal.js - markAsRead():**
```javascript
function markAsRead(id) {
  // CONVERT STRING → NUMBER
  const idNumber = typeof id === 'string' ? parseInt(id, 10) : id;
  const readSet = getReadAnnouncementsForArtist(artistName);
  readSet.add(idNumber);  // ← Add sebagai number
}
```

**modal.js - renderAnnouncements():**
```javascript
// KIRIM NUMBER BUKAN STRING
onclick="markAsRead(${a.id})"   // ← NO QUOTES = number
// bukan: onclick="markAsRead('${a.id}')" ← WITH QUOTES = string
```

**File yang diubah:** `modal.js` (lines 68-88 dan 176)

---

## Bug #3: 🔴 **Badge Update Tidak Dipicu Setelah Mark As Read**

### Masalah

```javascript
// Alur lama (broken):
markAsRead(id)
  → readSet.add(id)
  → updateNotificationDisplay()  // ← Indirect call
    → ArtistStudio.updateNotificationBadge()
  → renderAnnouncements()
```

Problem: Jika `updateNotificationDisplay()` tidak di-export atau tidak berfungsi, badge tidak update.

### Fix

```javascript
// Alur baru (correct):
markAsRead(id)
  → readSet.add(idNumber)
  → ArtistStudio.updateNotificationBadge()  // ← DIRECT CALL
  → renderAnnouncements()
```

**modal.js - markAsRead():**
```javascript
function markAsRead(id) {
  const idNumber = typeof id === 'string' ? parseInt(id, 10) : id;
  const readSet = getReadAnnouncementsForArtist(artistName);
  readSet.add(idNumber);

  // Direct call dengan safety check
  if (window.ArtistStudio && window.ArtistStudio.updateNotificationBadge) {
    ArtistStudio.updateNotificationBadge();
  }

  renderAnnouncements();
}
```

**Bonus:** Hapus unused function `updateNotificationDisplay()`
**File yang diubah:** `modal.js` (lines 68-88, hapus line 91-99)

---

## Expected Flow (After Fixes)

```
┌─────────────────────────────────────────────────────┐
│ User klik announcement card di modal                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ markAsRead(1703769600000)│ ← ID sebagai NUMBER
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ readSet.add(1703769600000)       │ ← Type match!
    │ (Fourtwnty → Set[1703...])       │
    └────────┬───────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ ArtistStudio.updateNotificationBadge() │
    └────────┬──────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ getUnreadCountForArtist()        │
    │ published.filter(a =>            │
    │   !readSet.has(a.id)             │ ← Now matches!
    │ ).length                          │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ if (unreadCount === 0)           │
    │   badge.display = "none"   ✓     │
    └─────────────────────────────────┘
```

---

## Testing Checklist

- [ ] Buka Browser DevTools (F12) → Console
- [ ] Klik "Mode Artist" di top-right
- [ ] Buka "Artist Studio" → Buat pengumuman minimal 2
- [ ] Klik tombol "Pengumuman" di halaman Fourtwnty
- [ ] **Lihat console log:**
  ```
  ✓ Mark as read: Fourtwnty - ID 1703... Set(1)
  🔔 Badge update: Fourtwnty - Published: 2, Unread: 1
  ✓ Badge MUNCUL (1 unread)
  ```
- [ ] Klik announcement lainnya → lihat unread count turun
- [ ] Setelah semua diklik:
  ```
  ✗ Badge HILANG (semua sudah dibaca)
  ```
- [ ] Tutup modal → Badge sudah hilang dari halaman ✓
- [ ] Klik "Sudah dibaca" tab → Lihat semua announcement disana
- [ ] Buka "Belum dibaca" tab → Kosong (empty state)

---

## Files Modified

| File | Lines | Change |
|------|-------|--------|
| `index.html` | 621-637 | ✅ Fix file load order |
| `modal.js` | 68-88 | ✅ Convert ID string→number, direct badge update |
| `modal.js` | 176 | ✅ Remove quotes from onclick (string→number) |
| `modal.js` | 91-99 | ✅ Delete unused `updateNotificationDisplay()` |
| `artistStudio.js` | 228-254 | ✅ Add debug console.log |

---

## Key Takeaways

1. **Type matters:** String "123" ≠ Number 123 in Sets/Maps
2. **Load order matters:** Dependencies harus loaded terlebih dahulu
3. **Direct calls > Indirect calls:** Reduce complexity & error paths
4. **Console logging helps:** Use `console.log()` untuk track state changes

---

*Last updated: Dec 28, 2025*
