# 📱 Qasir App Exploration Summary
> Dokumentasi lengkap hasil eksplorasi Qasir App (Native Android)
> Tanggal: 17 Februari 2026

---

## 🏠 1. Beranda (Home Screen)

### Layout
- **Header**: Hamburger menu (☰) + Title "Beranda" + Notification bell icon
- **Banner Carousel**: Sliding banners (Program Cicilan, Konsultasi, dll)
- **Quick Access Grid** (5 icons):
  - 🛒 Kelola Produk
  - 👥 Pegawai
  - 🏪 Outlet
  - 💰 Saldo Wallet
  - 🆘 Bantuan
- **Laporan Section**:
  - "Lihat Semua >" link
  - Horizontal scroll cards:
    - Penjualan bulan ini: Rp0 (0,00% vs bulan lalu)
    - Penjualan hari ini: Rp0 (0,00% vs kemarin)
    - Saldo Wallet: Rp0
- **Paket Berlangganan**: Banner Qasir PRO (pink/polka dot)
- **Perangkat Tambahan**: Section untuk device accessories
- **CTA Button**: "Transaksi" (full-width, merah, sticky bottom)

### Design Notes
- Warna utama: **Merah (#E53935)** dan **Putih**
- Accent PRO: **Hijau (#4CAF50)**
- Font weight hierarchy yang jelas (Bold titles, Regular descriptions)
- Border-radius konsisten pada cards
- Ads banner di bagian bawah (AppLovin MAX SDK)

---

## 📋 2. Sidebar Navigation (Drawer)

### Layout
- **Profile Section**:
  - Avatar placeholder (circle, red border) + Badge "FREE"
  - Username: infiatin
  - Role: Pemilik (Owner)
  - Arrow ">" menuju Profile detail
- **Outlet Selector**:
  - Nama outlet: infiatin
  - Lokasi: Pusat
  - Button "Pilih Outlet" (merah)
- **Upgrade Banner**:
  - "Saatnya beralih ke Pro"
  - "Upgrade ke Pro >" (green circle arrow)
  - Background: gradient hijau muda

### Menu Items (Top to Bottom):
| Menu | Badge | Description |
|------|-------|-------------|
| Katalog Online | - | GrabFood, Website Usaha |
| Pesanan Online | - | Online orders |
| ─── separator ─── | | |
| Beranda | - | Home screen |
| Absensi | **PRO** 🟢 | Employee attendance |
| Kelola Produk | - | Product management |
| Transaksi | 🔴 active | POS cashier |
| Riwayat Transaksi | - | Transaction history |
| Rekap Kas | - | Cash recap |
| Pengingat | - | Reminders |
| Pelanggan | - | Customer management |
| Laporan | - | Reports |
| Outlet | - | Multi-outlet management |
| Pegawai | - | Employee management |

### Design Notes
- Active menu: Red left border indicator
- PRO badge: Green rounded pill
- Menu spacing: ~127px per item (1080px width sidebar)
- Scrollable area (NestedScrollView)
- Semi-transparent overlay on right side

---

## 💳 3. POS / Transaksi (Cashier)

### Layout
- **Header**:
  - Hamburger menu (☰)
  - Search bar: "🔍 Cari Produk" (rounded, gray bg)
  - Barcode scanner icon
  - Pending sales icon
- **Tab Filter**: Manual | **Produk** | Favorit
  - Active tab: Bold text, red underline
- **Empty State**:
  - Cute sad box illustration (3D style)
  - Title: "Belum Ada Produk"
  - Description: "Pilih 'Tambah Produk' untuk menambahkan produk kamu ke dalam inventori."
  - Link: "+ Tambah Produk" (red text)
- **Bottom CTA**: "Tagih = Rp0" (full-width, red bg, white text)

### Design Notes
- 3 tab system: Manual entry / Product catalog / Favorites
- Search with barcode scanner integration
- Persistent billing button at bottom
- Clean empty state with illustrations

---

## 📦 4. Kelola Produk (Product Management)

### Menu Structure
| Feature | Description |
|---------|-------------|
| **Produk** | Kelola semua produk untuk katalog toko kamu di sini |
| **Atur Stok** | Ubah, tambah, atau kurangi stok produk dengan cepat |
| **Opsi Tambahan** | Atur opsi tambahan (modifiers) yang kamu butuhkan untuk produk |
| **Bundel** | Kelola bundel kumpulan produk untuk katalog toko |
| **Bahan Baku & Resep** | Buat resep produk dari bahan baku |

### Produk List
- **Tabs**: Produk | Kategori
- Active tab: Red text + red underline
- Empty state: Same sad box illustration
- FAB: Red circle "+" button (bottom-right)

### Design Notes
- Simple list layout with arrow indicators
- Gray description text below bold titles
- Divider lines between items
- Consistent back arrow navigation

---

## ➕ 5. Form Tambah Produk (Add Product)

### Form Fields (Top → Bottom)
1. **Foto Produk** - Placeholder avatar "NP" + camera icon overlay
2. **Nama Produk** - Text input (outlined border)
3. **Harga Jual** - Text input (outlined border)
4. **Merk** - Dropdown → "Pilih Merek >"
5. **Kategori** - Dropdown → "Pilih Kategori >"

### Toggle Sections
6. **Produk Favorit** 🆕 - Toggle switch
   - "Tampilkan produk di kategori terdepan"
   - Badge "Baru" (blue pill)
7. **Atur Harga Modal dan Barcode** - Toggle switch
8. **Kelola Stok** - "Stok Tidak Aktif >" (link)

### PRO Features
9. **Atur Harga Grosir** - Yellow/orange dashed border
   - "Kamu akan lebih leluasa mengatur harga grosir sesuai keinginanmu."
   - PRO feature upsell

### Action Buttons
10. **Tambah Varian** - Gray outlined button
11. **Hapus Produk** - Text + delete icon (red text)
12. **Simpan** - Full-width red button (bottom)

### Design Notes
- Form uses outlined text fields
- PRO features highlighted with orange dashed border
- Toggle switches for optional settings
- Gray separator between sections
- Sticky bottom save button

---

## 🏪 6. Pilih Outlet (Outlet Selection)

### Layout
- **Search**: "🔍 Cari Outlet"
- **Outlet List**:
  - Name: Pusat + Badge "Utama" (gray pill)
  - Address: Tegalsari, Sidareja, Kab. Cilacap
- **FAB**: Red "+" button to add new outlet

---

## 👤 7. Atur Profil (Profile Settings)

### Layout
- **Profile Card**:
  - Large circle avatar (red border)
  - Name: Infiatin
  - Role: Owner
  - Badge: "FREE" (red pill)
- **Menu Items**:
  - Informasi Usaha → infiatin
  - Buka Dashboard Qasir → infiatin-1216255.qasir.id
  - Syarat dan Ketentuan
  - Kebijakan Privasi
- **Upgrade Card**:
  - "Qasir Pro - Untuk bisnis yang berkembang"
  - Button "Upgrade" (green)
- **Danger Zone**: "Ajukan Hapus Akun" (red text)

---

## 📊 8. Katalog Online

### Integrations
- **GrabFood** →
- **Website Usaha** →

---

## 🎨 Design System Summary

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Primary Red | `#E53935` | Buttons, active states, CTA |
| White | `#FFFFFF` | Background |
| Light Gray | `#F5F5F5` | Card backgrounds, dividers |
| Dark Text | `#212121` | Headings |
| Gray Text | `#757575` | Descriptions, placeholders |
| PRO Green | `#4CAF50` | PRO badges, upgrade buttons |
| Warning Orange | `#FF9800` | PRO feature borders |
| Blue Badge | `#2196F3` | "Baru" badges |

### Typography
- **Headings**: Bold, ~16-18sp
- **Body**: Regular, ~14sp
- **Caption**: Regular, ~12sp, gray

### Component Patterns
1. **Search Bar**: Rounded input with search icon, gray bg
2. **Tab Bar**: Segmented control with active underline
3. **Cards**: White bg, rounded corners, subtle shadow
4. **Toggle Switch**: Standard Material toggle
5. **FAB**: Circular red button with white "+"
6. **Empty State**: Illustration + Title + Description + CTA
7. **List Item**: Bold title + gray description + arrow indicator
8. **Bottom CTA**: Full-width, fixed position, colored button
9. **Badges**: Small pills (rounded) with text
10. **Avatar**: Circle with colored border

### Navigation Pattern
- **Drawer/Sidebar**: Hamburger menu → full drawer
- **Back Navigation**: Arrow button in toolbar
- **Tab Navigation**: Horizontal tabs with swipe support
- **Bottom CTA**: Persistent action button

### Empty States
- Custom 3D illustrations (sad box character)
- Clear messaging with CTA

---

## 🔄 Relevance to BUMAS Ansor

### Features to Implement
1. ✅ **POS System** - Tab-based product selection (Manual/Product/Favorite)
2. ✅ **Product Management** - CRUD with categories, variants, pricing
3. ✅ **Wholesale Pricing** - Harga Grosir (PRO feature styling)
4. ✅ **Modifiers** - Opsi Tambahan
5. ✅ **Stock Management** - Atur Stok
6. ✅ **Bundling** - Product bundles
7. ✅ **Recipe/BOM** - Bahan Baku & Resep
8. ⬜ **Attendance** - Absensi
9. ⬜ **Reports** - Laporan dashboard with cards
10. ⬜ **Multi-outlet** - Outlet management
11. ⬜ **Customer Management** - Pelanggan
12. ⬜ **Cash Recap** - Rekap Kas

### Design Patterns to Adopt
1. 🎨 **Sidebar Navigation** with user profile, outlet selector, menu
2. 🎨 **Empty States** with custom illustrations
3. 🎨 **PRO Feature Upsell** with colored borders
4. 🎨 **Tab-based Layouts** with red active indicator
5. 🎨 **FAB Buttons** for primary actions
6. 🎨 **Search with Barcode** integration
7. 🎨 **Dashboard Cards** for report summaries
8. 🎨 **Badge System** (PRO, Baru, Utama)
9. 🎨 **Sticky Bottom CTA** buttons
10. 🎨 **Clean Form Design** with outlined inputs + toggles
