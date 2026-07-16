-- =============================================================
-- RUBEANORA - CO SO DU LIEU MYSQL CO BAN
-- Dung cho do an website ban my pham cham soc da tu hat dau do.
-- MySQL 8.0+, ma hoa UTF-8.
--
-- File nay se xoa cac bang cu trong database rubeanora_store
-- va tao lai 16 bang cot loi kem du lieu mau.
-- Anh chi luu duong dan tep, khong luu Base64 trong MySQL.
-- Mat khau phai duoc bam bang BCrypt/Argon2 o backend.
-- =============================================================

SET NAMES utf8mb4;

-- DROP DATABASE rubeanora_store;

CREATE DATABASE IF NOT EXISTS rubeanora_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rubeanora_store;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS binh_luan_bai_viet;
DROP TABLE IF EXISTS lien_he;
DROP TABLE IF EXISTS bai_viet;
DROP TABLE IF EXISTS danh_gia;
DROP TABLE IF EXISTS chi_tiet_phieu_kho;
DROP TABLE IF EXISTS phieu_kho;
DROP TABLE IF EXISTS chi_tiet_don_hang;
DROP TABLE IF EXISTS don_hang;
DROP TABLE IF EXISTS yeu_thich;
DROP TABLE IF EXISTS gio_hang;
DROP TABLE IF EXISTS khuyen_mai;
DROP TABLE IF EXISTS san_pham;
DROP TABLE IF EXISTS danh_muc_san_pham;
DROP TABLE IF EXISTS dia_chi_nguoi_dung;
DROP TABLE IF EXISTS nguoi_dung;
DROP TABLE IF EXISTS cau_hinh_cua_hang;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- 1. CAU HINH CUA HANG
-- =============================================================

CREATE TABLE cau_hinh_cua_hang (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ten_cua_hang VARCHAR(150) NOT NULL,
    ten_du_an VARCHAR(150),
    mo_ta TEXT,
    logo_url VARCHAR(500),
    hotline VARCHAR(20),
    email_lien_he VARCHAR(150),
    email_ho_tro VARCHAR(150),
    dia_chi VARCHAR(500),
    gio_lam_viec VARCHAR(200),
    map_embed_url TEXT,
    tien_to_don_hang VARCHAR(10) NOT NULL DEFAULT 'RBB',
    phi_van_chuyen DECIMAL(12,2) NOT NULL DEFAULT 30000,
    nguong_mien_phi_van_chuyen DECIMAL(12,2) NOT NULL DEFAULT 300000,
    bat_mien_phi_van_chuyen BOOLEAN NOT NULL DEFAULT TRUE,
    cho_phep_cod BOOLEAN NOT NULL DEFAULT TRUE,
    cho_phep_chuyen_khoan BOOLEAN NOT NULL DEFAULT TRUE,
    cho_phep_momo BOOLEAN NOT NULL DEFAULT TRUE,
    cho_phep_vnpay BOOLEAN NOT NULL DEFAULT TRUE,
    email_nhan_thong_bao VARCHAR(150),
    bao_don_hang_moi BOOLEAN NOT NULL DEFAULT TRUE,
    bao_sap_het_hang BOOLEAN NOT NULL DEFAULT TRUE,
    bao_danh_gia_moi BOOLEAN NOT NULL DEFAULT TRUE,
    gui_email_xac_nhan_don BOOLEAN NOT NULL DEFAULT TRUE,
    facebook_url VARCHAR(500),
    instagram_url VARCHAR(500),
    youtube_url VARCHAR(500),
    tiktok_url VARCHAR(500),
    che_do_bao_tri BOOLEAN NOT NULL DEFAULT FALSE,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================================
-- 2. TAI KHOAN VA DIA CHI
-- =============================================================

CREATE TABLE nguoi_dung (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ho_ten VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20),
    mat_khau VARCHAR(255) NOT NULL,
    anh_dai_dien_url VARCHAR(500),
    ngay_sinh DATE,
    gioi_tinh ENUM('NAM', 'NU', 'KHAC'),
    vai_tro ENUM('ADMIN', 'NHAN_VIEN', 'KHACH_HANG') NOT NULL DEFAULT 'KHACH_HANG',
    trang_thai ENUM('HOAT_DONG', 'BI_KHOA') NOT NULL DEFAULT 'HOAT_DONG',
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE dia_chi_nguoi_dung (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nguoi_dung_id BIGINT UNSIGNED NOT NULL,
    ten_nguoi_nhan VARCHAR(150) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,
    tinh_thanh VARCHAR(150) NOT NULL,
    quan_huyen VARCHAR(150) NOT NULL,
    phuong_xa VARCHAR(150) NOT NULL,
    dia_chi_cu_the VARCHAR(300) NOT NULL,
    la_mac_dinh BOOLEAN NOT NULL DEFAULT FALSE,
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 3. DANH MUC VA SAN PHAM
-- =============================================================

CREATE TABLE danh_muc_san_pham (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ten_danh_muc VARCHAR(150) NOT NULL,
    duong_dan VARCHAR(180) NOT NULL UNIQUE,
    mo_ta TEXT,
    trang_thai ENUM('HOAT_DONG', 'DANG_AN') NOT NULL DEFAULT 'HOAT_DONG',
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE san_pham (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    danh_muc_id BIGINT UNSIGNED NOT NULL,
    ma_san_pham VARCHAR(50) NOT NULL UNIQUE,
    ten_san_pham VARCHAR(255) NOT NULL,
    ten_tieng_anh VARCHAR(255),
    duong_dan VARCHAR(280) NOT NULL UNIQUE,
    mo_ta_ngan TEXT,
    mo_ta_chi_tiet LONGTEXT,
    thanh_phan TEXT,
    cong_dung TEXT,
    huong_dan_su_dung TEXT,
    doi_tuong_su_dung VARCHAR(300),
    luu_y TEXT,
    bao_quan TEXT,
    khoi_luong VARCHAR(100),
    xuat_xu VARCHAR(100) DEFAULT 'Việt Nam',
    nha_san_xuat VARCHAR(255),
    gia_niem_yet DECIMAL(12,2) NOT NULL DEFAULT 0,
    gia_ban DECIMAL(12,2) NOT NULL DEFAULT 0,
    gia_von DECIMAL(12,2) NOT NULL DEFAULT 0,
    so_luong_ton INT NOT NULL DEFAULT 0,
    anh_chinh_url VARCHAR(500),
    danh_sach_anh JSON,
    nhan_san_pham JSON,
    la_noi_bat BOOLEAN NOT NULL DEFAULT FALSE,
    nguon_du_lieu ENUM('HO_SO_DE_AN', 'GIAO_DIEN_DEMO') NOT NULL DEFAULT 'HO_SO_DE_AN',
    trang_thai ENUM('DANG_BAN', 'TAM_AN', 'HET_HANG') NOT NULL DEFAULT 'DANG_BAN',
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_san_pham_danh_muc (danh_muc_id),
    INDEX idx_san_pham_trang_thai (trang_thai),
    FOREIGN KEY (danh_muc_id) REFERENCES danh_muc_san_pham(id)
) ENGINE=InnoDB;

-- =============================================================
-- 4. KHUYEN MAI
-- Mot ma co the ap dung toan bo, mot danh muc hoac mot san pham.
-- Khong can cac bang trung gian khuyen_mai_san_pham/danh_muc.
-- =============================================================

CREATE TABLE khuyen_mai (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ma_khuyen_mai VARCHAR(50) NOT NULL UNIQUE,
    ten_khuyen_mai VARCHAR(180) NOT NULL,
    mo_ta TEXT,
    loai ENUM('PHAN_TRAM', 'SO_TIEN', 'MIEN_PHI_VAN_CHUYEN', 'QUA_TANG') NOT NULL,
    gia_tri DECIMAL(12,2) NOT NULL DEFAULT 0,
    giam_toi_da DECIMAL(12,2),
    don_hang_toi_thieu DECIMAL(12,2) NOT NULL DEFAULT 0,
    pham_vi ENUM('TOAN_BO', 'DANH_MUC', 'SAN_PHAM') NOT NULL DEFAULT 'TOAN_BO',
    danh_muc_id BIGINT UNSIGNED,
    san_pham_id BIGINT UNSIGNED,
    so_luong INT,
    da_su_dung INT NOT NULL DEFAULT 0,
    ngay_bat_dau DATETIME NOT NULL,
    ngay_ket_thuc DATETIME NOT NULL,
    kich_hoat BOOLEAN NOT NULL DEFAULT TRUE,
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (danh_muc_id) REFERENCES danh_muc_san_pham(id) ON DELETE SET NULL,
    FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================
-- 5. GIO HANG VA YEU THICH
-- Gio hang duoc rut gon thanh mot bang chi tiet truc tiep.
-- =============================================================

CREATE TABLE gio_hang (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nguoi_dung_id BIGINT UNSIGNED NOT NULL,
    san_pham_id BIGINT UNSIGNED NOT NULL,
    so_luong INT NOT NULL DEFAULT 1,
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_gio_hang (nguoi_dung_id, san_pham_id),
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE yeu_thich (
    nguoi_dung_id BIGINT UNSIGNED NOT NULL,
    san_pham_id BIGINT UNSIGNED NOT NULL,
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (nguoi_dung_id, san_pham_id),
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 6. DON HANG
-- Thanh toan va van chuyen duoc luu ngay trong bang don_hang.
-- =============================================================

CREATE TABLE don_hang (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ma_don_hang VARCHAR(50) NOT NULL UNIQUE,
    nguoi_dung_id BIGINT UNSIGNED,
    khuyen_mai_id BIGINT UNSIGNED,
    ten_nguoi_nhan VARCHAR(150) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    dia_chi_giao_hang VARCHAR(500) NOT NULL,
    ghi_chu TEXT,
    tong_tien_hang DECIMAL(12,2) NOT NULL DEFAULT 0,
    giam_gia DECIMAL(12,2) NOT NULL DEFAULT 0,
    phi_van_chuyen DECIMAL(12,2) NOT NULL DEFAULT 0,
    tong_thanh_toan DECIMAL(12,2) NOT NULL DEFAULT 0,
    phuong_thuc_thanh_toan ENUM('COD', 'CHUYEN_KHOAN', 'MOMO', 'VNPAY', 'ZALOPAY')
      NOT NULL DEFAULT 'COD',
    trang_thai_thanh_toan ENUM('CHUA_THANH_TOAN', 'DA_THANH_TOAN', 'THAT_BAI', 'DA_HOAN_TIEN')
      NOT NULL DEFAULT 'CHUA_THANH_TOAN',
    trang_thai_don_hang ENUM(
      'CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_DONG_GOI',
      'DANG_GIAO_HANG', 'DA_GIAO_HANG', 'DA_HUY', 'TRA_HANG'
    ) NOT NULL DEFAULT 'CHO_XAC_NHAN',
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_don_hang_trang_thai (trang_thai_don_hang),
    INDEX idx_don_hang_ngay_tao (ngay_tao),
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL,
    FOREIGN KEY (khuyen_mai_id) REFERENCES khuyen_mai(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE chi_tiet_don_hang (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    don_hang_id BIGINT UNSIGNED NOT NULL,
    san_pham_id BIGINT UNSIGNED,
    ten_san_pham VARCHAR(255) NOT NULL,
    anh_san_pham_url VARCHAR(500),
    don_gia DECIMAL(12,2) NOT NULL,
    gia_von DECIMAL(12,2) NOT NULL DEFAULT 0,
    so_luong INT NOT NULL,
    thanh_tien DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE,
    FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================
-- 7. NHAP XUAT KHO
-- Khi ban hang, backend tao phieu XUAT gan voi don_hang_id va tru ton.
-- Khi nhap hang, tao phieu NHAP va cong ton.
-- =============================================================

CREATE TABLE phieu_kho (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ma_phieu VARCHAR(50) NOT NULL UNIQUE,
    loai_phieu ENUM('NHAP', 'XUAT') NOT NULL,
    don_hang_id BIGINT UNSIGNED,
    doi_tac VARCHAR(200),
    ghi_chu TEXT,
    tong_tien DECIMAL(12,2) NOT NULL DEFAULT 0,
    trang_thai ENUM('NHAP', 'DA_HOAN_TAT', 'DA_HUY') NOT NULL DEFAULT 'NHAP',
    nguoi_tao_id BIGINT UNSIGNED,
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE SET NULL,
    FOREIGN KEY (nguoi_tao_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE chi_tiet_phieu_kho (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phieu_kho_id BIGINT UNSIGNED NOT NULL,
    san_pham_id BIGINT UNSIGNED NOT NULL,
    so_luong INT NOT NULL,
    don_gia DECIMAL(12,2) NOT NULL DEFAULT 0,
    thanh_tien DECIMAL(12,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (phieu_kho_id) REFERENCES phieu_kho(id) ON DELETE CASCADE,
    FOREIGN KEY (san_pham_id) REFERENCES san_pham(id)
) ENGINE=InnoDB;

-- =============================================================
-- 8. DANH GIA SAN PHAM
-- Phan hoi cua cua hang nam ngay trong bang danh_gia.
-- =============================================================

CREATE TABLE danh_gia (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    san_pham_id BIGINT UNSIGNED NOT NULL,
    nguoi_dung_id BIGINT UNSIGNED,
    don_hang_id BIGINT UNSIGNED,
    so_sao TINYINT UNSIGNED NOT NULL,
    noi_dung TEXT,
    trang_thai ENUM('CHO_DUYET', 'DA_DUYET', 'TU_CHOI') NOT NULL DEFAULT 'CHO_DUYET',
    phan_hoi_cua_hang TEXT,
    ngay_phan_hoi DATETIME,
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE CASCADE,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL,
    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================
-- 9. BAI VIET, BINH LUAN VA LIEN HE
-- =============================================================

CREATE TABLE bai_viet (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nguoi_tao_id BIGINT UNSIGNED,
    tieu_de VARCHAR(255) NOT NULL,
    duong_dan VARCHAR(280) NOT NULL UNIQUE,
    danh_muc VARCHAR(100) DEFAULT 'Chăm sóc da',
    tom_tat TEXT,
    mo_dau TEXT,
    noi_dung LONGTEXT,
    anh_dai_dien_url VARCHAR(500),
    trang_thai ENUM('BAN_NHAP', 'DA_DANG', 'DA_LEN_LICH', 'DANG_AN') NOT NULL DEFAULT 'BAN_NHAP',
    luot_xem INT NOT NULL DEFAULT 0,
    la_noi_bat BOOLEAN NOT NULL DEFAULT FALSE,
    ngay_dang DATETIME,
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_tao_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE binh_luan_bai_viet (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    bai_viet_id BIGINT UNSIGNED NOT NULL,
    nguoi_dung_id BIGINT UNSIGNED,
    ho_ten VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    noi_dung TEXT NOT NULL,
    trang_thai ENUM('CHO_DUYET', 'DA_DUYET', 'TU_CHOI') NOT NULL DEFAULT 'CHO_DUYET',
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bai_viet_id) REFERENCES bai_viet(id) ON DELETE CASCADE,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE lien_he (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ho_ten VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    so_dien_thoai VARCHAR(20),
    noi_dung TEXT NOT NULL,
    trang_thai ENUM('MOI', 'DANG_XU_LY', 'DA_XU_LY') NOT NULL DEFAULT 'MOI',
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================================
-- 10. DU LIEU MAU DONG BO VOI DE AN VA FRONTEND
-- =============================================================

INSERT INTO cau_hinh_cua_hang (
  id, ten_cua_hang, ten_du_an, mo_ta, logo_url,
  hotline, email_lien_he, email_ho_tro, dia_chi, gio_lam_viec,
  map_embed_url, tien_to_don_hang, phi_van_chuyen,
  nguong_mien_phi_van_chuyen, bat_mien_phi_van_chuyen,
  cho_phep_cod, cho_phep_chuyen_khoan, cho_phep_momo, cho_phep_vnpay,
  email_nhan_thong_bao, bao_don_hang_moi, bao_sap_het_hang,
  bao_danh_gia_moi, gui_email_xac_nhan_don,
  facebook_url, instagram_url, youtube_url, tiktok_url, che_do_bao_tri
)
VALUES (
  1,
  'Rubeanora',
  'Red Bean Beauty',
  'Rubeanora phát triển các sản phẩm chăm sóc da từ hạt đậu đỏ Việt Nam, kết hợp cùng những thành phần thiên nhiên được chọn lọc. Công thức dịu nhẹ giúp làm sạch, cấp ẩm và nuôi dưỡng làn da sáng khỏe mỗi ngày. Sản phẩm không chứa Sulfate, Paraben hay Alcohol, phù hợp với nhiều loại da, kể cả làn da nhạy cảm.',
  '/images/logo1.png',
  '0986126955',
  'Hoangthingocmai2005@gmail.com',
  'Hoangthingocmai2005@gmail.com',
  'Cầu Treo, Yên Mỹ, Hưng Yên',
  '08:00 - 21:00, Thứ Hai - Chủ Nhật',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3727.4907528986323!2d106.04288550000001!3d20.8925666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135bb004441baf7%3A0xf0fb155ce48f80cb!2zQ-G7jyBDw6J5IEhvYSBMw6EgSMawbmcgWcOqbiAtIE5ow6AgcGjDom4gcGjhu5FpIEh14buHIExhbg!5e0!3m2!1svi!2s!4v1783694055196!5m2!1svi!2s',
  'RBB', 30000, 300000, TRUE,
  TRUE, TRUE, TRUE, TRUE,
  'Hoangthingocmai2005@gmail.com', TRUE, TRUE, TRUE, TRUE,
  'https://facebook.com/', 'https://instagram.com/',
  'https://youtube.com/', 'https://tiktok.com/', FALSE
);

-- Hash demo. Khi nối backend cần tạo hash BCrypt cho mật khẩu thật.
INSERT INTO nguoi_dung (
  id, ho_ten, email, so_dien_thoai, mat_khau,
  vai_tro, trang_thai, ngay_tao
)
VALUES
  (1, 'Quản trị viên', 'admin@rubeanora.vn', '0986126955', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'HOAT_DONG', '2026-01-08 15:00:00'),
  (2, 'Nguyễn Thu Hương', 'huong@rubeanora.vn', '0974286315', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NHAN_VIEN', 'HOAT_DONG', '2026-03-12 10:20:00'),
  (3, 'Lê Văn Quang', 'quang@gmail.com', '0987654321', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KHACH_HANG', 'HOAT_DONG', '2026-06-18 16:15:00'),
  (4, 'Nguyễn Minh Anh', 'minhanh@gmail.com', '0912456780', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KHACH_HANG', 'HOAT_DONG', '2026-07-10 09:40:00'),
  (5, 'Lê Thu Trang', 'thutrang@gmail.com', '0386921754', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KHACH_HANG', 'HOAT_DONG', '2026-07-04 17:05:00'),
  (6, 'Phạm Quốc Bảo', 'quocbao@gmail.com', '0963847120', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KHACH_HANG', 'BI_KHOA', '2026-05-22 14:50:00'),
  (7, 'Vũ Ngọc Hà', 'ngocha@gmail.com', '0325678419', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KHACH_HANG', 'HOAT_DONG', '2026-04-16 20:25:00'),
  (8, 'Trần Quang Huy', 'quanghuy@gmail.com', '0903147258', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KHACH_HANG', 'HOAT_DONG', '2026-07-12 11:12:00'),
  (9, 'Nguyễn Lan Anh', 'lananh@gmail.com', '0938127465', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KHACH_HANG', 'HOAT_DONG', '2026-05-28 08:30:00'),
  (10, 'Đỗ Minh Thư', 'minhthu@gmail.com', '0975612843', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KHACH_HANG', 'HOAT_DONG', '2026-06-02 09:20:00'),
  (11, 'Hoàng Mai Phương', 'maiphuong@gmail.com', '0357421869', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KHACH_HANG', 'HOAT_DONG', '2026-06-08 14:10:00'),
  (12, 'Bùi Đức Long', 'duclong@gmail.com', '0863971524', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KHACH_HANG', 'HOAT_DONG', '2026-06-12 10:45:00'),
  (13, 'Ngô Hải Yến', 'haiyen@gmail.com', '0391542876', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KHACH_HANG', 'HOAT_DONG', '2026-06-16 13:25:00'),
  (14, 'Trịnh Khánh Linh', 'khanhlinh@gmail.com', '0948251367', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'KHACH_HANG', 'HOAT_DONG', '2026-06-20 08:40:00');

INSERT INTO dia_chi_nguoi_dung (
  nguoi_dung_id, ten_nguoi_nhan, so_dien_thoai,
  tinh_thanh, quan_huyen, phuong_xa, dia_chi_cu_the, la_mac_dinh
)
VALUES
  (3, 'Lê Văn Quang', '0987654321', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Thành', '15 Trần Hưng Đạo', TRUE),
  (4, 'Nguyễn Minh Anh', '0912456780', 'Hà Nội', 'Thanh Xuân', 'Phường Thanh Xuân', '18 Nguyễn Trãi', TRUE),
  (5, 'Lê Thu Trang', '0386921754', 'Hà Nội', 'Hà Đông', 'Phường Hà Đông', '120 Trần Phú', TRUE),
  (7, 'Vũ Ngọc Hà', '0325678419', 'Hà Nội', 'Cầu Giấy', 'Phường Cầu Giấy', '266 Cầu Giấy', TRUE),
  (8, 'Trần Quang Huy', '0903147258', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', '45 Lê Lợi', TRUE);

INSERT INTO danh_muc_san_pham (
  id, ten_danh_muc, duong_dan, mo_ta, trang_thai, ngay_tao
)
VALUES
  (1, 'Sữa rửa mặt', 'sua-rua-mat', 'Các sản phẩm làm sạch dịu nhẹ, hỗ trợ loại bỏ bụi bẩn và bã nhờn trên da.', 'HOAT_DONG', '2026-01-08 08:00:00'),
  (2, 'Mặt nạ', 'mat-na', 'Mặt nạ đậu đỏ giúp làm sạch tế bào chết, dưỡng ẩm và hỗ trợ làm sáng da.', 'HOAT_DONG', '2026-01-09 08:00:00'),
  (3, 'Toner', 'toner', 'Sản phẩm cân bằng, làm dịu và bổ sung độ ẩm cho làn da sau bước làm sạch.', 'HOAT_DONG', '2026-01-10 08:00:00'),
  (4, 'Combo', 'combo', 'Bộ sản phẩm chăm sóc da kết hợp nhiều bước, phù hợp dùng hằng ngày hoặc làm quà tặng.', 'HOAT_DONG', '2026-01-11 08:00:00');

INSERT INTO san_pham (
  id, danh_muc_id, ma_san_pham, ten_san_pham, ten_tieng_anh,
  duong_dan, mo_ta_ngan, mo_ta_chi_tiet, thanh_phan, cong_dung,
  huong_dan_su_dung, doi_tuong_su_dung, luu_y, bao_quan,
  khoi_luong, xuat_xu, nha_san_xuat,
  gia_niem_yet, gia_ban, gia_von, so_luong_ton,
  anh_chinh_url, danh_sach_anh, nhan_san_pham,
  la_noi_bat, nguon_du_lieu, trang_thai
)
VALUES
  (
    1, 4, 'RBB-001', 'Combo chăm sóc da toàn diện đậu đỏ 3 món 150g',
    'Red Bean Complete Skincare Combo',
    'combo-cham-soc-da-toan-dien-dau-do-3-mon-150g',
    'Bộ combo gồm Sữa rửa mặt tạo bọt đậu đỏ, Mặt nạ tẩy tế bào chết đậu đỏ và Toner dưỡng da đậu đỏ.',
    'Combo chăm sóc da toàn diện gồm ba sản phẩm 150g, phù hợp cho mọi loại da. Thuộc tính sản phẩm: Không Sulfate, Không Paraben, Không Alcohol.',
    'Bột đậu đỏ, Bột cám gạo, Chiết xuất nghệ, Nước hoa hồng.',
    'Hỗ trợ làm sạch, loại bỏ tế bào chết định kỳ, dưỡng ẩm và giúp làn da trông sáng khỏe, mềm mại.',
    'Dùng theo thứ tự: sữa rửa mặt hằng ngày, mặt nạ 2-3 lần mỗi tuần và toner vào sáng, tối.',
    'Phù hợp với mọi loại da.',
    'Ngưng sử dụng nếu xuất hiện dấu hiệu kích ứng.',
    'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và nhiệt độ cao.',
    '150g x 3', 'Việt Nam', 'Công ty Cổ phần Quốc tế Napro',
    550000, 450000, 305000, 18,
    '/images/products/combo-3mon6.jpg',
    JSON_ARRAY('/images/products/combo-3mon6.jpg', '/images/products/combo-3mon.jpg', '/images/products/combo-3mon2.png', '/images/products/combo-3mon3.png'),
    JSON_ARRAY('Không Sulfate', 'Không Paraben', 'Không Alcohol'),
    TRUE, 'HO_SO_DE_AN', 'DANG_BAN'
  ),
  (
    2, 1, 'RBB-002', 'Sữa rửa mặt tạo bọt đậu đỏ 150g',
    'Red Bean Foaming Facial Cleanser',
    'sua-rua-mat-tao-bot-dau-do-150g',
    'Sữa rửa mặt tạo bọt giúp làm sạch da mặt, loại bỏ bụi bẩn, bã nhờn và mồ hôi một cách dịu nhẹ.',
    'Đậu đỏ Việt Nam là nguyên liệu thiên nhiên giúp mang tới làn da mềm mại, sáng khỏe cùng cảm giác thư giãn sau khi sử dụng.',
    'Chiết xuất đậu đỏ, Chiết xuất hoa cúc La Mã, Niacinamide, Panthenol, Nước hoa hồng, Chiết xuất rễ Cam Thảo.',
    'Giúp làm sạch da mặt, loại bỏ bụi bẩn, bã nhờn và mồ hôi; giúp da ẩm mượt, mềm mại và trông sáng mịn.',
    'Rửa sạch tay, làm ướt mặt. Nhấn 2-3 lần lấy lượng bọt vừa đủ, massage nhẹ khoảng 30 giây theo vòng tròn, sau đó rửa sạch và thấm khô.',
    'Phù hợp cho mọi loại da.',
    'Tránh tiếp xúc với mắt. Nếu sản phẩm dính vào mắt, rửa kỹ bằng nước sạch.',
    'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và nhiệt độ cao.',
    '150g', 'Việt Nam', 'Công ty Cổ phần Quốc tế Napro',
    270000, 220000, 150000, 42,
    '/images/products/sua-rua-mat-tao-bot3.jpg',
    JSON_ARRAY('/images/products/sua-rua-mat-tao-bot3.jpg', '/images/products/sua-rua-mat-tao-bot1.png', '/images/products/sua-rua-mat-tao-bot2.png', '/images/products/sua-rua-mat-tao-bot4.png'),
    JSON_ARRAY('Làm sạch sâu', 'Dưỡng ẩm', 'Sáng da'),
    TRUE, 'HO_SO_DE_AN', 'DANG_BAN'
  ),
  (
    3, 2, 'RBB-003', 'Mặt nạ tẩy tế bào chết đậu đỏ 150g',
    'Red Bean Exfoliating Mask',
    'mat-na-tay-te-bao-chet-dau-do-150g',
    'Mặt nạ giúp làm sạch và loại bỏ bụi bẩn, tế bào chết, giúp da ẩm mượt và mềm mại.',
    'Sản phẩm kết hợp bột đậu đỏ, bột cám gạo, Hyaluronic Acid và Niacinamide; đặc biệt phù hợp cho làn da xỉn màu.',
    'Hyaluronic Acid, Niacinamide, Bột đậu đỏ, Bột cám gạo, Glycerin, Allantoin, Bisabolol, Tocopherol.',
    'Làm sạch và loại bỏ bụi bẩn, tế bào chết; giúp da ẩm mượt, góp phần mang lại làn da sáng khỏe, mềm mại.',
    'Thoa lượng vừa đủ lên da còn ẩm, để 3-5 phút, massage nhẹ theo chuyển động tròn rồi rửa sạch. Dùng 2-3 lần mỗi tuần sau bước làm sạch.',
    'Phù hợp cho mọi loại da, đặc biệt là làn da xỉn màu.',
    'Tránh tiếp xúc trực tiếp với mắt. Không dùng lên vùng da tổn thương. Để xa tầm tay trẻ em.',
    'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và nhiệt độ cao.',
    '150g', 'Việt Nam', 'Công ty Cổ phần Quốc tế Napro',
    300000, 250000, 170000, 9,
    '/images/products/mat-na-tay-te-bao-chet6.jpg',
    JSON_ARRAY('/images/products/mat-na-tay-te-bao-chet6.jpg', '/images/products/mat-na-tay-te-bao-chet1.jpg', '/images/products/mat-na-tay-te-bao-chet2.jpg', '/images/products/mat-na-tay-te-bao-chet4.png'),
    JSON_ARRAY('Tẩy tế bào chết', 'Sáng da', 'Dưỡng ẩm'),
    TRUE, 'HO_SO_DE_AN', 'DANG_BAN'
  ),
  (
    4, 3, 'RBB-004', 'Toner dưỡng da đậu đỏ',
    'Red Bean Moisturizing Toner',
    'toner-duong-da-dau-do',
    'Toner giúp dưỡng ẩm, làm dịu da khi bị khô căng, ửng đỏ hoặc ngứa rát.',
    'Sản phẩm đã được kiểm nghiệm da liễu theo tiêu chuẩn của Nhật Bản và được dùng sau bước làm sạch mỗi ngày.',
    'Chiết xuất đậu đỏ, Chiết xuất hoa cúc La Mã, Chiết xuất rễ Cam Thảo, Nước hoa hồng, Niacinamide, Panthenol, Sodium Hyaluronate.',
    'Giúp dưỡng ẩm, giữ làn da ẩm mượt, mềm mại và làm dịu cảm giác khô căng, ửng đỏ, ngứa rát.',
    'Sau khi rửa mặt, cho lượng vừa đủ ra tay hoặc bông tẩy trang, thoa đều và vỗ nhẹ. Dùng hai lần mỗi ngày vào sáng và tối.',
    'Phù hợp cho mọi loại da.',
    'Tránh tiếp xúc với mắt. Nếu sản phẩm dính vào mắt, rửa kỹ bằng nước sạch.',
    'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và nhiệt độ cao.',
    '150g', 'Việt Nam', 'Công ty Cổ phần Quốc tế Napro',
    270000, 220000, 145000, 31,
    '/images/products/toner-duong-da4.jpg',
    JSON_ARRAY('/images/products/toner-duong-da4.jpg', '/images/products/toner-duong-da1.png', '/images/products/toner-duong-da2.jpg', '/images/products/toner-duong-da3.jpg'),
    JSON_ARRAY('Dưỡng ẩm', 'Làm dịu da', 'Cân bằng pH'),
    TRUE, 'HO_SO_DE_AN', 'DANG_BAN'
  ),
  (
    5, 4, 'RBB-005', 'Bộ combo dưỡng da đậu đỏ mini',
    'Red Bean Mini Skincare Set',
    'combo-duong-da-dau-do-mini',
    'Bộ combo mini tiện lợi gồm phiên bản nhỏ gọn của Sữa rửa mặt, Mặt nạ tẩy tế bào chết và Toner đậu đỏ.',
    'Phiên bản trải nghiệm nhỏ gọn, phù hợp mang theo khi du lịch hoặc dùng làm quà tặng.',
    'Bột đậu đỏ, Bột cám gạo, Chiết xuất nghệ, Nước hoa hồng.',
    'Trải nghiệm chu trình làm sạch, chăm sóc tế bào chết định kỳ và cấp ẩm trong kích thước nhỏ gọn.',
    'Dùng từng sản phẩm theo hướng dẫn tương ứng.',
    'Phù hợp với mọi loại da.',
    'Ngưng sử dụng nếu xuất hiện dấu hiệu kích ứng.',
    'Bảo quản nơi khô ráo, thoáng mát.',
    'Mini size', 'Việt Nam', 'Công ty Cổ phần Quốc tế Napro',
    320000, 250000, 170000, 6,
    '/images/products/combo-duong-da-mini4.png',
    JSON_ARRAY('/images/products/combo-duong-da-mini4.png', '/images/products/combo-duong-da-mini.png', '/images/products/combo-duong-da-mini2.jpg', '/images/products/combo-duong-da-mini3.jpg'),
    JSON_ARRAY('Mini size', 'Tiện lợi', 'Quà tặng'),
    FALSE, 'HO_SO_DE_AN', 'DANG_BAN'
  ),
  (
    6, 3, 'RBB-006', 'Serum Đậu Đỏ Dưỡng sáng da',
    'Red Bean Brightening Serum',
    'serum-dau-do-duong-sang-da',
    'Serum dưỡng sáng da từ đậu đỏ giúp cải thiện làn da xỉn màu, dưỡng ẩm sâu và hỗ trợ da đều màu.',
    'Sản phẩm mở rộng đang có trên giao diện demo, cần bổ sung hồ sơ công bố trước khi bán chính thức.',
    'Chiết xuất đậu đỏ, Vitamin B3, Hyaluronic Acid.',
    'Hỗ trợ dưỡng sáng, mờ thâm và cấp ẩm.',
    'Dùng lượng vừa đủ sau bước toner, ưu tiên sử dụng vào buổi tối.',
    'Đang cập nhật theo hồ sơ sản phẩm.',
    'Thử trên vùng da nhỏ trước khi sử dụng toàn mặt.',
    'Bảo quản nơi khô ráo, thoáng mát.',
    '30ml', 'Việt Nam', NULL,
    350000, 280000, 185000, 24,
    '/images/products/toner-duong-da6.png',
    JSON_ARRAY('/images/products/toner-duong-da6.png'),
    JSON_ARRAY('Dưỡng sáng da', 'Mờ thâm', 'Cấp ẩm'),
    FALSE, 'GIAO_DIEN_DEMO', 'TAM_AN'
  ),
  (
    7, 3, 'RBB-007', 'Kem dưỡng ẩm Cấp ẩm, mịn da',
    'Red Bean Moisturizing Cream',
    'kem-duong-am-dau-do',
    'Kem dưỡng ẩm đậu đỏ giúp duy trì độ ẩm tự nhiên, tăng độ đàn hồi và làm dịu làn da nhạy cảm.',
    'Sản phẩm mở rộng đang có trên giao diện demo, cần bổ sung hồ sơ công bố trước khi bán chính thức.',
    'Bột đậu đỏ, Ceramide, Shea Butter.',
    'Hỗ trợ cấp ẩm, làm mịn da và duy trì độ ẩm.',
    'Dùng ở bước cuối của chu trình dưỡng da.',
    'Đang cập nhật theo hồ sơ sản phẩm.',
    'Thử trên vùng da nhỏ trước khi sử dụng toàn mặt.',
    'Bảo quản nơi khô ráo, thoáng mát.',
    '50g', 'Việt Nam', NULL,
    360000, 290000, 190000, 0,
    '/images/products/combo-duong-da-mini.png',
    JSON_ARRAY('/images/products/combo-duong-da-mini.png'),
    JSON_ARRAY('Cấp ẩm', 'Mịn da', 'Dịu nhẹ'),
    FALSE, 'GIAO_DIEN_DEMO', 'TAM_AN'
  ),
  (
    8, 1, 'RBB-008', 'Tẩy trang dịu nhẹ Làm sạch sâu',
    'Red Bean Gentle Cleansing Water',
    'tay-trang-dau-do-lam-sach-sau',
    'Nước tẩy trang đậu đỏ làm sạch lớp trang điểm và bụi bẩn mà không gây khô rát.',
    'Sản phẩm mở rộng đang có trên giao diện demo, cần bổ sung hồ sơ công bố trước khi bán chính thức.',
    'Chiết xuất đậu đỏ, Nước khoáng tự nhiên, Glycerin.',
    'Làm sạch lớp trang điểm và bụi bẩn bám trên da.',
    'Thấm sản phẩm ra bông tẩy trang và lau nhẹ nhàng trên da.',
    'Đang cập nhật theo hồ sơ sản phẩm.',
    'Tránh tiếp xúc trực tiếp với mắt.',
    'Bảo quản nơi khô ráo, thoáng mát.',
    '200ml', 'Việt Nam', NULL,
    300000, 240000, 160000, 15,
    '/images/products/sua-rua-mat-tao-bot2.png',
    JSON_ARRAY('/images/products/sua-rua-mat-tao-bot2.png'),
    JSON_ARRAY('Tẩy trang', 'Làm sạch sâu', 'Dịu nhẹ'),
    FALSE, 'GIAO_DIEN_DEMO', 'TAM_AN'
  );

INSERT INTO khuyen_mai (
  id, ma_khuyen_mai, ten_khuyen_mai, mo_ta, loai,
  gia_tri, giam_toi_da, don_hang_toi_thieu, pham_vi,
  danh_muc_id, san_pham_id, so_luong, da_su_dung,
  ngay_bat_dau, ngay_ket_thuc, kich_hoat
)
VALUES
  (1, 'REDBEAN', 'Ưu đãi khách hàng mới', 'Áp dụng cho khách hàng mua lần đầu với đơn hàng từ 200.000đ.', 'PHAN_TRAM', 10, 100000, 200000, 'TOAN_BO', NULL, NULL, 500, 186, '2026-07-01', '2026-12-31 23:59:59', TRUE),
  (2, 'COMBO20', 'Ưu đãi Combo 3 món', 'Giảm 20% cho combo chăm sóc da đậu đỏ 3 món.', 'PHAN_TRAM', 20, 150000, 400000, 'SAN_PHAM', NULL, 1, 250, 92, '2026-07-01', '2026-08-31 23:59:59', TRUE),
  (3, 'FREESHIP', 'Miễn phí giao hàng toàn quốc', 'Miễn phí vận chuyển cho đơn hàng có giá trị từ 300.000đ.', 'MIEN_PHI_VAN_CHUYEN', 30000, NULL, 300000, 'TOAN_BO', NULL, NULL, 800, 347, '2026-01-01', '2026-12-31 23:59:59', TRUE),
  (4, 'SKINCARE', 'Tặng mẫu thử chăm sóc da', 'Tặng mẫu thử đậu đỏ khi đơn hàng đạt từ 250.000đ.', 'QUA_TANG', 0, NULL, 250000, 'TOAN_BO', NULL, NULL, 300, 0, '2026-07-15', '2026-09-30 23:59:59', TRUE),
  (5, 'REDBEAN50', 'Giảm 50K đơn hàng đầu tiên', 'Giảm trực tiếp 50.000đ cho đơn hàng từ 200.000đ.', 'SO_TIEN', 50000, 50000, 200000, 'TOAN_BO', NULL, NULL, 400, 128, '2026-06-01', '2026-09-30 23:59:59', TRUE),
  (6, 'WELCOME15', 'Chào hè cùng Red Bean Beauty', 'Giảm 15% cho toàn bộ sản phẩm trong chương trình chào hè.', 'PHAN_TRAM', 15, 120000, 250000, 'TOAN_BO', NULL, NULL, 200, 200, '2026-05-01', '2026-06-30 23:59:59', TRUE),
  (7, 'MEMBER10', 'Ưu đãi thành viên thân thiết', 'Mã thử nghiệm dành cho khách hàng thành viên.', 'PHAN_TRAM', 10, 80000, 300000, 'TOAN_BO', NULL, NULL, 300, 46, '2026-07-01', '2026-12-31 23:59:59', FALSE);

INSERT INTO gio_hang (nguoi_dung_id, san_pham_id, so_luong)
VALUES
  (3, 2, 1),
  (3, 4, 1),
  (4, 1, 1);

INSERT INTO yeu_thich (nguoi_dung_id, san_pham_id)
VALUES
  (3, 1), (3, 3), (4, 2), (5, 4), (10, 1);

INSERT INTO don_hang (
  id, ma_don_hang, nguoi_dung_id, khuyen_mai_id,
  ten_nguoi_nhan, so_dien_thoai, email, dia_chi_giao_hang,
  ghi_chu, tong_tien_hang, giam_gia, phi_van_chuyen,
  tong_thanh_toan, phuong_thuc_thanh_toan,
  trang_thai_thanh_toan, trang_thai_don_hang, ngay_tao
)
VALUES
  (1, 'RBB-26071401', 4, NULL, 'Nguyễn Minh Anh', '0912456780', 'minhanh@gmail.com', '18 Nguyễn Trãi, Phường Thanh Xuân, Hà Nội', 'Giao hàng trong giờ hành chính.', 670000, 0, 30000, 700000, 'COD', 'CHUA_THANH_TOAN', 'CHO_XAC_NHAN', '2026-07-14 08:35:00'),
  (2, 'RBB-26071402', 8, NULL, 'Trần Quang Huy', '0903147258', 'quanghuy@gmail.com', '45 Lê Lợi, Phường Bến Nghé, TP. Hồ Chí Minh', NULL, 450000, 30000, 30000, 450000, 'CHUYEN_KHOAN', 'DA_THANH_TOAN', 'DA_XAC_NHAN', '2026-07-14 07:10:00'),
  (3, 'RBB-26071303', 5, NULL, 'Lê Thu Trang', '0386921754', 'thutrang@gmail.com', '120 Trần Phú, Phường Hà Đông, Hà Nội', NULL, 690000, 30000, 0, 660000, 'MOMO', 'DA_THANH_TOAN', 'DANG_DONG_GOI', '2026-07-13 19:42:00'),
  (4, 'RBB-26071304', 7, NULL, 'Vũ Ngọc Hà', '0325678419', 'ngocha@gmail.com', '266 Cầu Giấy, Phường Cầu Giấy, Hà Nội', NULL, 500000, 0, 0, 500000, 'VNPAY', 'DA_THANH_TOAN', 'DANG_GIAO_HANG', '2026-07-13 16:18:00'),
  (5, 'RBB-26071205', 6, NULL, 'Phạm Quốc Bảo', '0963847120', 'quocbao@gmail.com', '32 Hai Bà Trưng, Phường Hồng Bàng, Hải Phòng', NULL, 250000, 0, 30000, 280000, 'COD', 'DA_THANH_TOAN', 'DA_GIAO_HANG', '2026-07-12 20:18:00'),
  (6, 'RBB-26071206', 3, 5, 'Lê Văn Quang', '0987654321', 'quang@gmail.com', '15 Trần Hưng Đạo, Phường Bến Thành, TP. Hồ Chí Minh', 'Khách hàng yêu cầu thay đổi sản phẩm.', 440000, 50000, 0, 390000, 'COD', 'CHUA_THANH_TOAN', 'DA_HUY', '2026-07-12 18:06:00'),
  (7, 'RBB-26071107', 9, NULL, 'Nguyễn Lan Anh', '0938127465', 'lananh@gmail.com', '75 Nguyễn Huệ, Phường Thuận Hóa, Huế', 'Sản phẩm bị móp hộp khi vận chuyển.', 280000, 0, 0, 280000, 'ZALOPAY', 'DA_HOAN_TIEN', 'TRA_HANG', '2026-07-11 14:22:00'),
  (8, 'RBB-26071008', 10, 5, 'Đỗ Minh Thư', '0975612843', 'minhthu@gmail.com', '19 Lý Thường Kiệt, Phường Ninh Kiều, Cần Thơ', NULL, 900000, 50000, 0, 850000, 'COD', 'DA_THANH_TOAN', 'DA_GIAO_HANG', '2026-07-10 10:05:00'),
  (9, 'RBB-26070909', 11, NULL, 'Hoàng Mai Phương', '0357421869', 'maiphuong@gmail.com', '88 Võ Nguyên Giáp, Phường Hải Châu, Đà Nẵng', NULL, 540000, 0, 0, 540000, 'VNPAY', 'DA_THANH_TOAN', 'DA_GIAO_HANG', '2026-07-09 13:45:00'),
  (10, 'RBB-26070810', 12, NULL, 'Bùi Đức Long', '0863971524', 'duclong@gmail.com', '102 Trần Phú, Phường Nam Định, Ninh Bình', NULL, 220000, 0, 30000, 250000, 'COD', 'DA_THANH_TOAN', 'DA_GIAO_HANG', '2026-07-08 09:30:00'),
  (11, 'RBB-26070711', 13, 5, 'Ngô Hải Yến', '0391542876', 'haiyen@gmail.com', '27 Hùng Vương, Phường Việt Trì, Phú Thọ', NULL, 530000, 50000, 0, 480000, 'MOMO', 'DA_THANH_TOAN', 'DA_GIAO_HANG', '2026-07-07 21:12:00'),
  (12, 'RBB-26070512', 14, NULL, 'Trịnh Khánh Linh', '0948251367', 'khanhlinh@gmail.com', '60 Quang Trung, Phường Hạ Long, Quảng Ninh', NULL, 440000, 0, 30000, 470000, 'CHUYEN_KHOAN', 'DA_THANH_TOAN', 'DA_GIAO_HANG', '2026-07-05 11:40:00');

INSERT INTO chi_tiet_don_hang (
  don_hang_id, san_pham_id, ten_san_pham, anh_san_pham_url,
  don_gia, gia_von, so_luong, thanh_tien
)
VALUES
  (1, 1, 'Combo chăm sóc da toàn diện đậu đỏ 3 món 150g', '/images/products/combo-3mon6.jpg', 450000, 305000, 1, 450000),
  (1, 4, 'Toner dưỡng da đậu đỏ', '/images/products/toner-duong-da4.jpg', 220000, 145000, 1, 220000),
  (2, 1, 'Combo chăm sóc da toàn diện đậu đỏ 3 món 150g', '/images/products/combo-3mon6.jpg', 450000, 305000, 1, 450000),
  (3, 2, 'Sữa rửa mặt tạo bọt đậu đỏ 150g', '/images/products/sua-rua-mat-tao-bot3.jpg', 220000, 150000, 2, 440000),
  (3, 3, 'Mặt nạ tẩy tế bào chết đậu đỏ 150g', '/images/products/mat-na-tay-te-bao-chet6.jpg', 250000, 170000, 1, 250000),
  (4, 6, 'Serum Đậu Đỏ Dưỡng sáng da', '/images/products/toner-duong-da6.png', 280000, 185000, 1, 280000),
  (4, 4, 'Toner dưỡng da đậu đỏ', '/images/products/toner-duong-da4.jpg', 220000, 145000, 1, 220000),
  (5, 3, 'Mặt nạ tẩy tế bào chết đậu đỏ 150g', '/images/products/mat-na-tay-te-bao-chet6.jpg', 250000, 170000, 1, 250000),
  (6, 2, 'Sữa rửa mặt tạo bọt đậu đỏ 150g', '/images/products/sua-rua-mat-tao-bot3.jpg', 220000, 150000, 1, 220000),
  (6, 4, 'Toner dưỡng da đậu đỏ', '/images/products/toner-duong-da4.jpg', 220000, 145000, 1, 220000),
  (7, 6, 'Serum Đậu Đỏ Dưỡng sáng da', '/images/products/toner-duong-da6.png', 280000, 185000, 1, 280000),
  (8, 1, 'Combo chăm sóc da toàn diện đậu đỏ 3 món 150g', '/images/products/combo-3mon6.jpg', 450000, 305000, 2, 900000),
  (9, 5, 'Bộ combo dưỡng da đậu đỏ mini', '/images/products/combo-duong-da-mini4.png', 250000, 170000, 1, 250000),
  (9, 7, 'Kem dưỡng ẩm Cấp ẩm, mịn da', '/images/products/combo-duong-da-mini.png', 290000, 190000, 1, 290000),
  (10, 2, 'Sữa rửa mặt tạo bọt đậu đỏ 150g', '/images/products/sua-rua-mat-tao-bot3.jpg', 220000, 150000, 1, 220000),
  (11, 3, 'Mặt nạ tẩy tế bào chết đậu đỏ 150g', '/images/products/mat-na-tay-te-bao-chet6.jpg', 250000, 170000, 1, 250000),
  (11, 6, 'Serum Đậu Đỏ Dưỡng sáng da', '/images/products/toner-duong-da6.png', 280000, 185000, 1, 280000),
  (12, 4, 'Toner dưỡng da đậu đỏ', '/images/products/toner-duong-da4.jpg', 220000, 145000, 2, 440000);

INSERT INTO phieu_kho (
  id, ma_phieu, loai_phieu, don_hang_id, doi_tac,
  ghi_chu, tong_tien, trang_thai, nguoi_tao_id, ngay_tao
)
VALUES
  (1, 'PN-260714-005', 'NHAP', NULL, 'Xưởng sản xuất Rubeanora', 'Nhập thành phẩm đợt 2 tháng 7.', 7400000, 'DA_HOAN_TAT', 2, '2026-07-14 08:35:00'),
  (2, 'PX-260714-009', 'XUAT', 2, 'Đơn hàng RBB-26071402', 'Xuất bán cho đơn hàng đã xác nhận.', 305000, 'DA_HOAN_TAT', 4, '2026-07-14 07:15:00'),
  (3, 'PX-260713-008', 'XUAT', 3, 'Đơn hàng RBB-26071303', 'Xuất hàng giao cho đơn vị vận chuyển.', 470000, 'DA_HOAN_TAT', 4, '2026-07-13 18:40:00'),
  (4, 'PN-260712-004', 'NHAP', NULL, 'Xưởng sản xuất Rubeanora', 'Nhập combo và serum thành phẩm.', 6990000, 'DA_HOAN_TAT', 2, '2026-07-12 10:20:00'),
  (5, 'PX-260711-007', 'XUAT', NULL, 'Bộ phận Marketing', 'Xuất sản phẩm mẫu cho buổi chụp hình.', 710000, 'DA_HOAN_TAT', 8, '2026-07-11 14:10:00'),
  (6, 'PN-260709-003', 'NHAP', NULL, 'Xưởng sản xuất Rubeanora', 'Bổ sung mặt nạ và nước tẩy trang.', 6600000, 'DA_HOAN_TAT', 2, '2026-07-09 09:05:00');

INSERT INTO chi_tiet_phieu_kho (
  phieu_kho_id, san_pham_id, so_luong, don_gia, thanh_tien
)
VALUES
  (1, 2, 30, 150000, 4500000),
  (1, 4, 20, 145000, 2900000),
  (2, 1, 1, 305000, 305000),
  (3, 2, 2, 150000, 300000),
  (3, 3, 1, 170000, 170000),
  (4, 1, 12, 305000, 3660000),
  (4, 6, 18, 185000, 3330000),
  (5, 5, 2, 170000, 340000),
  (5, 6, 2, 185000, 370000),
  (6, 3, 20, 170000, 3400000),
  (6, 8, 20, 160000, 3200000);

INSERT INTO danh_gia (
  id, san_pham_id, nguoi_dung_id, don_hang_id, so_sao,
  noi_dung, trang_thai, phan_hoi_cua_hang, ngay_phan_hoi, ngay_tao
)
VALUES
  (1, 1, 10, 8, 5, 'Combo đóng gói rất đẹp, mùi nhẹ và dùng đủ ba bước da mềm hơn hẳn. Mình sẽ tiếp tục sử dụng.', 'DA_DUYET', 'Cảm ơn bạn đã tin dùng bộ sản phẩm. Chúc bạn luôn có làn da khỏe đẹp!', '2026-07-14 10:10:00', '2026-07-14 09:24:00'),
  (2, 2, 12, 10, 4, 'Sữa rửa mặt tạo bọt mịn, rửa xong không bị khô căng. Giao hàng hơi chậm một chút nhưng sản phẩm ổn.', 'CHO_DUYET', NULL, NULL, '2026-07-14 08:15:00'),
  (3, 3, 6, 5, 5, 'Mặt nạ có hạt mịn, tẩy tế bào chết khá dịu. Sau vài lần dùng da sáng và đều màu hơn.', 'DA_DUYET', 'Cảm ơn bạn đã chia sẻ trải nghiệm thực tế với mặt nạ đậu đỏ.', '2026-07-14 07:30:00', '2026-07-13 20:42:00'),
  (4, 4, 7, 4, 3, 'Toner cấp ẩm ổn nhưng phần nắp chai của mình hơi lỏng. Mong shop kiểm tra kỹ hơn trước khi gửi.', 'CHO_DUYET', NULL, NULL, '2026-07-13 15:05:00'),
  (5, 5, 11, 9, 2, 'Nội dung chứa liên kết quảng cáo không liên quan đến sản phẩm.', 'TU_CHOI', NULL, NULL, '2026-07-12 18:30:00'),
  (6, 6, 9, 7, 5, 'Serum thấm nhanh, không bết dính. Dùng buổi tối khoảng hai tuần thấy da có độ bóng khỏe hơn.', 'DA_DUYET', NULL, NULL, '2026-07-11 16:48:00'),
  (7, 7, 11, 9, 4, 'Kem dưỡng mềm, hợp da khô. Mình thích thiết kế bao bì và mùi đậu đỏ rất nhẹ.', 'CHO_DUYET', NULL, NULL, '2026-07-10 11:22:00'),
  (8, 4, 14, 12, 5, 'Toner làm dịu da tốt, dùng sau khi rửa mặt rất dễ chịu. Chai chắc chắn và giao đủ số lượng.', 'DA_DUYET', NULL, NULL, '2026-07-09 09:16:00');

INSERT INTO bai_viet (
  id, nguoi_tao_id, tieu_de, duong_dan, danh_muc,
  tom_tat, mo_dau, noi_dung, anh_dai_dien_url,
  trang_thai, luot_xem, la_noi_bat, ngay_dang, ngay_cap_nhat
)
VALUES
  (
    1, 1,
    '5 lợi ích của đậu đỏ đối với làn da bạn nên biết',
    '5-loi-ich-cua-dau-do-doi-voi-lan-da-ban-nen-biet',
    'Kiến thức làm đẹp',
    'Đậu đỏ chứa nhiều vitamin và chất chống oxy hóa, giúp làm sạch nhẹ nhàng, hỗ trợ da sáng khỏe và mịn màng hơn.',
    'Không chỉ là một loại thực phẩm quen thuộc, đậu đỏ còn được ứng dụng trong chăm sóc da nhờ nguồn dưỡng chất tự nhiên và khả năng làm sạch dịu nhẹ.',
    '<h2>1. Hỗ trợ làm sạch da nhẹ nhàng</h2><p>Bột đậu đỏ có kết cấu mịn, giúp lấy đi bụi bẩn và lớp tế bào cũ trên bề mặt da. Khi được sử dụng đúng cách, nguyên liệu này mang lại cảm giác sạch thoáng mà không làm da bị khô căng.</p><h2>2. Giúp làn da trông sáng và đều màu hơn</h2><p>Đậu đỏ chứa vitamin nhóm B cùng các hợp chất chống oxy hóa. Việc làm sạch đều đặn kết hợp dưỡng ẩm và chống nắng giúp bề mặt da tươi sáng, mịn màng hơn theo thời gian.</p><h2>3. Hỗ trợ duy trì độ ẩm tự nhiên</h2><p>Các sản phẩm chăm sóc da từ đậu đỏ của Red Bean Beauty được phát triển theo hướng dịu nhẹ, kết hợp thành phần cấp ẩm để hạn chế cảm giác khô ráp sau khi làm sạch.</p><h2>4. Góp phần bảo vệ da trước tác động môi trường</h2><p>Chất chống oxy hóa giúp hỗ trợ làn da trước những tác động thường gặp như khói bụi và ánh nắng. Tuy nhiên, bạn vẫn cần sử dụng kem chống nắng mỗi ngày và che chắn da khi ra ngoài.</p><h2>5. Phù hợp với chu trình chăm sóc da tối giản</h2><p>Một chu trình cơ bản gồm sữa rửa mặt, sản phẩm tẩy tế bào chết dùng với tần suất phù hợp và toner cấp ẩm đã có thể đáp ứng nhu cầu chăm sóc hằng ngày.</p>',
    '/images/products/combo-3mon.jpg', 'DA_DANG', 1842, TRUE,
    '2026-06-15 08:00:00', '2026-06-15 08:00:00'
  ),
  (
    2, 1,
    'Chu trình chăm sóc da 3 bước đơn giản mỗi ngày',
    'chu-trinh-cham-soc-da-3-buoc-don-gian-moi-ngay',
    'Chăm sóc da',
    'Làm sạch, loại bỏ tế bào chết và cân bằng độ ẩm là ba bước cơ bản giúp làn da duy trì vẻ tươi sáng tự nhiên.',
    'Một chu trình chăm sóc da không cần quá nhiều bước. Điều quan trọng là chọn đúng sản phẩm và duy trì thói quen đều đặn.',
    '<h2>Bước 1: Làm sạch</h2><p>Rửa mặt vào buổi sáng và buổi tối để loại bỏ dầu thừa, bụi bẩn và cặn sản phẩm trên da. Massage nhẹ nhàng, tránh chà xát mạnh.</p><h2>Bước 2: Làm sạch lớp tế bào cũ</h2><p>Sử dụng sản phẩm tẩy tế bào chết từ một đến hai lần mỗi tuần tùy tình trạng da. Không nên dùng khi da đang kích ứng hoặc có tổn thương hở.</p><h2>Bước 3: Cân bằng và cấp ẩm</h2><p>Toner giúp làm dịu và bổ sung độ ẩm sau bước làm sạch. Ban ngày, hãy hoàn thiện chu trình bằng kem chống nắng phù hợp.</p>',
    '/images/products/combo-3mon7.jpg', 'DA_DANG', 1276, FALSE,
    '2026-06-10 08:00:00', '2026-06-10 08:00:00'
  ),
  (
    3, 1,
    'Cách chọn sữa rửa mặt dịu nhẹ cho từng loại da',
    'cach-chon-sua-rua-mat-diu-nhe-cho-tung-loai-da',
    'Hướng dẫn sử dụng',
    'Một sản phẩm làm sạch phù hợp sẽ giúp loại bỏ bụi bẩn mà không khiến da khô căng hay mất đi độ ẩm cần thiết.',
    'Làm sạch là bước đầu tiên và cũng là nền tảng của mọi chu trình dưỡng da. Mỗi loại da sẽ cần một cách lựa chọn khác nhau.',
    '<h2>Da dầu và da hỗn hợp</h2><p>Ưu tiên sản phẩm tạo bọt mịn, làm sạch tốt nhưng không khiến bề mặt da khô rít.</p><h2>Da khô và da nhạy cảm</h2><p>Nên chọn công thức dịu nhẹ, hạn chế hương liệu mạnh và chú trọng thành phần giữ ẩm.</p><h2>Dấu hiệu sản phẩm phù hợp</h2><p>Da không bị căng, ngứa hoặc đỏ sau khi rửa. Nếu xuất hiện khó chịu kéo dài, hãy ngừng sử dụng và tham khảo ý kiến chuyên gia da liễu.</p>',
    '/images/products/sua-rua-mat-tao-bot3.jpg', 'DA_DANG', 968, FALSE,
    '2026-06-05 08:00:00', '2026-06-05 08:00:00'
  ),
  (
    4, 1,
    'Tẩy tế bào chết đúng cách để da luôn mịn màng',
    'tay-te-bao-chet-dung-cach-de-da-luon-min-mang',
    'Kiến thức làm đẹp',
    'Tần suất và cách sử dụng phù hợp giúp làm sạch lớp da cũ hiệu quả, đồng thời hạn chế cảm giác kích ứng trên da.',
    'Tẩy tế bào chết đúng cách hỗ trợ bề mặt da thông thoáng và mịn hơn, nhưng sử dụng quá thường xuyên có thể khiến da nhạy cảm.',
    '<h2>Chọn tần suất phù hợp</h2><p>Phần lớn làn da chỉ cần tẩy tế bào chết từ một đến hai lần mỗi tuần. Với da nhạy cảm, nên bắt đầu ở tần suất thấp hơn.</p><h2>Thao tác nhẹ nhàng</h2><p>Thoa sản phẩm trên da ẩm và massage nhẹ theo hướng vòng tròn. Không chà xát vào vùng da đang viêm, trầy xước hoặc kích ứng.</p><h2>Dưỡng da sau khi sử dụng</h2><p>Cấp ẩm và chống nắng đầy đủ giúp da được bảo vệ tốt hơn sau bước làm sạch lớp tế bào cũ.</p>',
    '/images/products/mat-na-tay-te-bao-chet6.jpg', 'DA_DANG', 754, FALSE,
    '2026-05-28 08:00:00', '2026-05-28 08:00:00'
  ),
  (
    5, 1,
    'Toner đậu đỏ có vai trò gì trong chu trình dưỡng da?',
    'toner-dau-do-co-vai-tro-gi-trong-chu-trinh-duong-da',
    'Chăm sóc da',
    'Toner giúp cân bằng da sau bước làm sạch, cấp ẩm nhẹ và chuẩn bị cho da hấp thu các sản phẩm dưỡng tiếp theo.',
    'Toner là bước chuyển tiếp giữa làm sạch và dưỡng ẩm, đặc biệt hữu ích khi làn da cần được làm dịu và bổ sung nước.',
    '<h2>Cân bằng cảm giác trên da</h2><p>Sau khi rửa mặt, toner hỗ trợ làm dịu cảm giác căng và giúp bề mặt da mềm hơn trước các bước dưỡng tiếp theo.</p><h2>Cách sử dụng</h2><p>Cho một lượng vừa đủ ra lòng bàn tay hoặc bông mềm, sau đó vỗ nhẹ lên da. Không cần chà xát hay sử dụng quá nhiều sản phẩm.</p><h2>Lưu ý khi lựa chọn</h2><p>Ưu tiên công thức phù hợp với loại da và tránh thành phần từng gây kích ứng cho bạn. Toner không thay thế kem dưỡng hoặc kem chống nắng.</p>',
    '/images/products/toner-duong-da4.jpg', 'DA_DANG', 683, FALSE,
    '2026-05-22 08:00:00', '2026-05-22 08:00:00'
  ),
  (
    6, 1,
    'Bí quyết chăm sóc da sáng khỏe từ nguyên liệu Việt',
    'bi-quyet-cham-soc-da-sang-khoe-tu-nguyen-lieu-viet',
    'Hướng dẫn sử dụng',
    'Những nguyên liệu gần gũi như đậu đỏ đang trở thành lựa chọn được yêu thích trong xu hướng làm đẹp lành tính.',
    'Nguyên liệu Việt có tiềm năng lớn trong ngành mỹ phẩm khi được nghiên cứu, xử lý và kết hợp trong công thức phù hợp.',
    '<h2>Lựa chọn sản phẩm có thông tin rõ ràng</h2><p>Nguồn gốc nguyên liệu, thành phần, hướng dẫn sử dụng và hạn dùng là những thông tin cần kiểm tra trước khi mua mỹ phẩm.</p><h2>Duy trì thói quen đều đặn</h2><p>Hiệu quả chăm sóc da đến từ sự kiên trì. Làm sạch, dưỡng ẩm, chống nắng và sinh hoạt lành mạnh nên được duy trì mỗi ngày.</p><h2>Lắng nghe làn da</h2><p>Không phải nguyên liệu thiên nhiên nào cũng phù hợp với tất cả mọi người. Hãy ngừng dùng sản phẩm nếu da xuất hiện dấu hiệu khó chịu bất thường.</p>',
    '/images/products/combo-duong-da-mini2.jpg', 'DA_DANG', 521, FALSE,
    '2026-05-16 08:00:00', '2026-05-16 08:00:00'
  ),
  (
    7, 1,
    'Nhật ký phát triển mỹ phẩm từ hạt đậu đỏ Việt Nam',
    'nhat-ky-phat-trien-my-pham-tu-hat-dau-do-viet-nam',
    'Câu chuyện thương hiệu',
    'Hành trình nghiên cứu nguyên liệu bản địa và phát triển bộ sản phẩm chăm sóc da dịu nhẹ của Rubeanora.',
    'Mỗi sản phẩm bắt đầu từ mong muốn nâng tầm nguyên liệu Việt và tạo ra trải nghiệm chăm sóc da gần gũi hơn.',
    '<h2>Bắt đầu từ nguyên liệu Việt</h2><p>Đậu đỏ được lựa chọn nhờ nguồn dưỡng chất tự nhiên và sự gần gũi với người tiêu dùng Việt Nam.</p><h2>Quá trình hoàn thiện sản phẩm</h2><p>Công thức được thử nghiệm, điều chỉnh để phù hợp với thói quen chăm sóc da hằng ngày.</p>',
    '/images/chung_toi.png', 'BAN_NHAP', 0, FALSE,
    '2026-07-18 08:00:00', '2026-07-14 16:20:00'
  ),
  (
    8, 1,
    '5 lưu ý khi bắt đầu chu trình chăm sóc da đậu đỏ',
    '5-luu-y-khi-bat-dau-chu-trinh-cham-soc-da-dau-do',
    'Hướng dẫn sử dụng',
    'Những lưu ý đơn giản giúp bạn sử dụng sản phẩm đúng tần suất và hạn chế kích ứng không mong muốn.',
    'Một chu trình hiệu quả nên bắt đầu chậm rãi, theo dõi phản ứng của da và duy trì đều đặn.',
    '<h2>Thử sản phẩm trên vùng da nhỏ</h2><p>Luôn kiểm tra phản ứng của da trước khi dùng sản phẩm trên toàn khuôn mặt.</p><h2>Duy trì tần suất phù hợp</h2><p>Không nên tẩy tế bào chết quá thường xuyên, đặc biệt khi da đang nhạy cảm.</p>',
    '/images/products/combo-duong-da-mini3.jpg', 'DA_LEN_LICH', 0, FALSE,
    '2026-07-20 09:00:00', '2026-07-15 08:10:00'
  );

INSERT INTO binh_luan_bai_viet (
  bai_viet_id, nguoi_dung_id, ho_ten, email,
  noi_dung, trang_thai, ngay_tao
)
VALUES
  (1, 3, 'Lê Văn Quang', 'quang@gmail.com', 'Bài viết dễ hiểu, mình sẽ thử duy trì chu trình ba bước đều đặn hơn.', 'DA_DUYET', '2026-07-15 19:30:00'),
  (2, 10, 'Đỗ Minh Thư', 'minhthu@gmail.com', 'Phần hướng dẫn ba bước rất rõ ràng và dễ áp dụng.', 'CHO_DUYET', '2026-07-16 09:15:00');

INSERT INTO lien_he (
  ho_ten, email, so_dien_thoai, noi_dung, trang_thai
)
VALUES
  ('Nguyễn Thu Hà', 'thuhatest@gmail.com', '0987000010', 'Mình có làn da nhạy cảm và muốn được tư vấn cách sử dụng bộ ba sản phẩm đậu đỏ.', 'MOI'),
  ('Trần Minh Ngọc', 'minhngoc@gmail.com', '0977000011', 'Mình muốn hỏi thời gian giao hàng về khu vực Hưng Yên.', 'DA_XU_LY');

-- =============================================================
-- 11. TRUY VAN MAU CHO ADMIN
-- =============================================================

-- 5 don hang gan nhat:
-- * FROM don_hang ORDER BY ngay_tao DESC LIMIT 5;

-- San pham ban chay:
-- SELECT ct.san_pham_id, ct.ten_san_pham, SUM(ct.so_luong) AS da_ban
-- FROM chi_tiet_don_hang ct
-- JOIN don_hang dh ON dh.id = ct.don_hang_id
-- WHERE dh.trang_thai_don_hang = 'DA_GIAO_HANG'
-- GROUP BY ct.san_pham_id, ct.ten_san_pham
-- ORDER BY da_ban DESC;

-- Doanh thu thuan va loi nhuan gop theo thang:
-- SELECT
--   DATE_FORMAT(dh.ngay_tao, '%Y-%m') AS thang,
--   SUM(dh.tong_tien_hang - dh.giam_gia) AS doanh_thu_thuan,
--   SUM(dh.tong_tien_hang - dh.giam_gia - gv.tong_gia_von) AS loi_nhuan_gop
-- FROM don_hang dh
-- JOIN (
--   SELECT don_hang_id, SUM(gia_von * so_luong) AS tong_gia_von
--   FROM chi_tiet_don_hang
--   GROUP BY don_hang_id
-- ) gv ON gv.don_hang_id = dh.id
-- WHERE dh.trang_thai_don_hang = 'DA_GIAO_HANG'
--   AND dh.trang_thai_thanh_toan = 'DA_THANH_TOAN'
-- GROUP BY DATE_FORMAT(dh.ngay_tao, '%Y-%m')
-- ORDER BY thang DESC;

-- Ton kho hien tai:
-- SELECT ma_san_pham, ten_san_pham, so_luong_ton
-- FROM san_pham
-- ORDER BY so_luong_ton ASC;

-- LUU Y NGHIEP VU KHO:
-- Khi don hang chuyen sang DANG_DONG_GOI, backend nen tao mot phieu XUAT,
-- them chi tiet phieu va tru san_pham.so_luong_ton trong cung transaction.
