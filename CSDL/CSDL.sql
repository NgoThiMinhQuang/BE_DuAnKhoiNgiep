
CREATE DATABASE rubeanora_store
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE rubeanora_store;

-- ================================================================
-- 1. CAU HINH CUA HANG
-- ================================================================

CREATE TABLE cau_hinh_cua_hang (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    ten_cua_hang VARCHAR(150) NOT NULL,
    logo_url VARCHAR(500) NULL,
    mo_ta TEXT NULL,

    hotline VARCHAR(20) NULL,
    email VARCHAR(150) NULL,
    dia_chi VARCHAR(500) NULL,
    gio_lam_viec VARCHAR(255) NULL,

    phi_van_chuyen DECIMAL(15,2)
        NOT NULL DEFAULT 30000,

    nguong_mien_phi_van_chuyen DECIMAL(15,2)
        NOT NULL DEFAULT 300000,

    facebook_url VARCHAR(500) NULL,
    instagram_url VARCHAR(500) NULL,
    tiktok_url VARCHAR(500) NULL,

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ================================================================
-- 2. NGUOI DUNG
-- ================================================================

CREATE TABLE nguoi_dung (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    ho_ten VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    so_dien_thoai VARCHAR(20) NULL,

    mat_khau_hash VARCHAR(255) NOT NULL,
    anh_dai_dien_url LONGTEXT NULL,
    google_sub VARCHAR(255) NULL,

    ngay_sinh DATE NULL,

    gioi_tinh ENUM(
        'NAM',
        'NU',
        'KHAC'
    ) NULL,

    vai_tro ENUM(
        'ADMIN',
        'KHACH_HANG'
    ) NOT NULL DEFAULT 'KHACH_HANG',

    trang_thai ENUM(
        'HOAT_DONG',
        'BI_KHOA'
    ) NOT NULL DEFAULT 'HOAT_DONG',

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_nguoi_dung_email (
        email
    ),

    UNIQUE KEY uk_nguoi_dung_so_dien_thoai (
        so_dien_thoai
    ),

    UNIQUE KEY uk_nguoi_dung_google_sub (
        google_sub
    ),

    KEY idx_nguoi_dung_vai_tro (
        vai_tro
    ),

    KEY idx_nguoi_dung_trang_thai (
        trang_thai
    )
) ENGINE=InnoDB;

-- ================================================================
-- 2.1. TOKEN DAT LAI MAT KHAU
-- ================================================================

CREATE TABLE dat_lai_mat_khau (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nguoi_dung_id INT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL,
    het_han_luc DATETIME NOT NULL,
    da_su_dung TINYINT UNSIGNED NOT NULL DEFAULT 0,
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_dat_lai_mat_khau_token (token_hash),
    KEY idx_dat_lai_mat_khau_nguoi_dung (nguoi_dung_id),
    CONSTRAINT fk_dat_lai_mat_khau_nguoi_dung
        FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================================================
-- 3. DIA CHI NGUOI DUNG
-- ================================================================

CREATE TABLE dia_chi_nguoi_dung (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    nguoi_dung_id INT UNSIGNED NOT NULL,

    ten_nguoi_nhan VARCHAR(150) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,

    tinh_thanh VARCHAR(150) NOT NULL,
    quan_huyen VARCHAR(150) NOT NULL,
    phuong_xa VARCHAR(150) NOT NULL,

    dia_chi_chi_tiet VARCHAR(500) NOT NULL,

    la_mac_dinh TINYINT UNSIGNED
        NOT NULL DEFAULT 0,

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_dia_chi_nguoi_dung (
        nguoi_dung_id
    ),

    CONSTRAINT fk_dia_chi_nguoi_dung
        FOREIGN KEY (nguoi_dung_id)
        REFERENCES nguoi_dung(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================================================
-- 4. DANH MUC SAN PHAM
-- ================================================================

CREATE TABLE danh_muc_san_pham (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    ten_danh_muc VARCHAR(150) NOT NULL,
    duong_dan VARCHAR(180) NOT NULL,

    mo_ta TEXT NULL,
    hinh_anh_url VARCHAR(500) NULL,

    thu_tu_hien_thi INT UNSIGNED
        NOT NULL DEFAULT 0,

    trang_thai ENUM(
        'HOAT_DONG',
        'DANG_AN'
    ) NOT NULL DEFAULT 'HOAT_DONG',

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_danh_muc_duong_dan (
        duong_dan
    ),

    KEY idx_danh_muc_trang_thai (
        trang_thai
    )
) ENGINE=InnoDB;

-- ================================================================
-- 5. SAN PHAM
-- ================================================================

CREATE TABLE san_pham (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    danh_muc_id INT UNSIGNED NOT NULL,

    ma_san_pham VARCHAR(50) NOT NULL,
    ma_sku VARCHAR(100) NOT NULL,

    ten_san_pham VARCHAR(255) NOT NULL,
    duong_dan VARCHAR(280) NOT NULL,

    loai_san_pham ENUM(
        'DON',
        'COMBO'
    ) NOT NULL DEFAULT 'DON',

    mo_ta_ngan VARCHAR(1000) NULL,
    mo_ta_chi_tiet LONGTEXT NULL,

    thanh_phan TEXT NULL,
    cong_dung TEXT NULL,
    huong_dan_su_dung TEXT NULL,

    quy_cach VARCHAR(100) NULL,
    xuat_xu VARCHAR(100) NULL,

    anh_chinh_url VARCHAR(500) NULL,

    gia_niem_yet DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    gia_ban DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    gia_von DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    so_luong_ton INT UNSIGNED
        NOT NULL DEFAULT 0,

    ton_toi_thieu INT UNSIGNED
        NOT NULL DEFAULT 0,

    la_noi_bat TINYINT UNSIGNED
        NOT NULL DEFAULT 0,

    trang_thai ENUM(
        'NHAP',
        'DANG_BAN',
        'TAM_AN',
        'NGUNG_BAN'
    ) NOT NULL DEFAULT 'NHAP',

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_san_pham_ma (
        ma_san_pham
    ),

    UNIQUE KEY uk_san_pham_sku (
        ma_sku
    ),

    UNIQUE KEY uk_san_pham_duong_dan (
        duong_dan
    ),

    KEY idx_san_pham_danh_muc (
        danh_muc_id
    ),

    KEY idx_san_pham_trang_thai (
        trang_thai
    ),

    KEY idx_san_pham_noi_bat (
        la_noi_bat
    ),

    CONSTRAINT fk_san_pham_danh_muc
        FOREIGN KEY (danh_muc_id)
        REFERENCES danh_muc_san_pham(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ================================================================
-- 6. ANH SAN PHAM
-- ================================================================

CREATE TABLE anh_san_pham (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    san_pham_id INT UNSIGNED NOT NULL,

    duong_dan_anh VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255) NULL,

    thu_tu_hien_thi INT UNSIGNED
        NOT NULL DEFAULT 0,

    PRIMARY KEY (id),

    KEY idx_anh_san_pham (
        san_pham_id
    ),

    CONSTRAINT fk_anh_san_pham
        FOREIGN KEY (san_pham_id)
        REFERENCES san_pham(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================================================
-- 7. GIO HANG
-- ================================================================

CREATE TABLE gio_hang (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    nguoi_dung_id INT UNSIGNED NOT NULL,

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_gio_hang_nguoi_dung (
        nguoi_dung_id
    ),

    CONSTRAINT fk_gio_hang_nguoi_dung
        FOREIGN KEY (nguoi_dung_id)
        REFERENCES nguoi_dung(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================================================
-- 8. CHI TIET GIO HANG
-- ================================================================

CREATE TABLE chi_tiet_gio_hang (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    gio_hang_id INT UNSIGNED NOT NULL,
    san_pham_id INT UNSIGNED NOT NULL,

    so_luong INT UNSIGNED
        NOT NULL DEFAULT 1,

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_ctgh_gio_san_pham (
        gio_hang_id,
        san_pham_id
    ),

    KEY idx_ctgh_san_pham (
        san_pham_id
    ),

    CONSTRAINT fk_ctgh_gio_hang
        FOREIGN KEY (gio_hang_id)
        REFERENCES gio_hang(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ctgh_san_pham
        FOREIGN KEY (san_pham_id)
        REFERENCES san_pham(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================================================
-- 9. DANH SACH YEU THICH
-- ================================================================

CREATE TABLE yeu_thich (
    nguoi_dung_id INT UNSIGNED NOT NULL,
    san_pham_id INT UNSIGNED NOT NULL,

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (
        nguoi_dung_id,
        san_pham_id
    ),

    KEY idx_yeu_thich_san_pham (
        san_pham_id
    ),

    CONSTRAINT fk_yeu_thich_nguoi_dung
        FOREIGN KEY (nguoi_dung_id)
        REFERENCES nguoi_dung(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_yeu_thich_san_pham
        FOREIGN KEY (san_pham_id)
        REFERENCES san_pham(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================================================
-- 10. KHUYEN MAI
-- ================================================================

CREATE TABLE khuyen_mai (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    ma_khuyen_mai VARCHAR(50) NOT NULL,
    ten_khuyen_mai VARCHAR(180) NOT NULL,

    mo_ta TEXT NULL,

    loai_khuyen_mai ENUM(
        'PHAN_TRAM',
        'SO_TIEN',
        'MIEN_PHI_VAN_CHUYEN'
    ) NOT NULL,

    gia_tri DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    giam_toi_da DECIMAL(15,2) NULL,

    gia_tri_don_toi_thieu DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    so_luot_su_dung_toi_da INT UNSIGNED NULL,

    so_luot_da_su_dung INT UNSIGNED
        NOT NULL DEFAULT 0,

    ngay_bat_dau DATETIME NOT NULL,
    ngay_ket_thuc DATETIME NOT NULL,

    trang_thai ENUM(
        'HOAT_DONG',
        'TAM_DUNG',
        'HET_HAN'
    ) NOT NULL DEFAULT 'HOAT_DONG',

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_khuyen_mai_ma (
        ma_khuyen_mai
    ),

    KEY idx_khuyen_mai_trang_thai (
        trang_thai
    ),

    KEY idx_khuyen_mai_thoi_gian (
        ngay_bat_dau,
        ngay_ket_thuc
    )
) ENGINE=InnoDB;

-- ================================================================
-- 10.1. KHUYEN MAI SAN PHAM
-- ================================================================

CREATE TABLE khuyen_mai_san_pham (
    khuyen_mai_id INT UNSIGNED NOT NULL,
    san_pham_id INT UNSIGNED NOT NULL,

    PRIMARY KEY (khuyen_mai_id, san_pham_id),
    KEY idx_kmsp_san_pham (san_pham_id),

    CONSTRAINT fk_kmsp_khuyen_mai
        FOREIGN KEY (khuyen_mai_id) REFERENCES khuyen_mai(id) ON DELETE CASCADE,

    CONSTRAINT fk_kmsp_san_pham
        FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================================================
-- 11. DON HANG
-- ================================================================

CREATE TABLE don_hang (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    ma_don_hang VARCHAR(50) NOT NULL,

    nguoi_dung_id INT UNSIGNED NOT NULL,
    khuyen_mai_id INT UNSIGNED NULL,

    ten_nguoi_nhan VARCHAR(150) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,
    email VARCHAR(150) NULL,

    tinh_thanh VARCHAR(150) NOT NULL,
    quan_huyen VARCHAR(150) NOT NULL,
    phuong_xa VARCHAR(150) NOT NULL,

    dia_chi_chi_tiet VARCHAR(500) NOT NULL,

    tong_tien_hang DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    tien_giam DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    phi_van_chuyen DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    tong_thanh_toan DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    phuong_thuc_thanh_toan ENUM(
        'COD',
        'CHUYEN_KHOAN',
        'MOMO',
        'VNPAY'
    ) NOT NULL DEFAULT 'COD',

    trang_thai_thanh_toan ENUM(
        'CHUA_THANH_TOAN',
        'DA_THANH_TOAN',
        'THAT_BAI',
        'DA_HOAN_TIEN'
    ) NOT NULL DEFAULT 'CHUA_THANH_TOAN',

    trang_thai_don_hang ENUM(
        'CHO_XAC_NHAN',
        'DA_XAC_NHAN',
        'DANG_CHUAN_BI',
        'DANG_GIAO',
        'DA_GIAO',
        'DA_HUY'
    ) NOT NULL DEFAULT 'CHO_XAC_NHAN',

    ghi_chu_khach_hang TEXT NULL,
    ghi_chu_admin TEXT NULL,
    ly_do_huy TEXT NULL,

    don_vi_van_chuyen VARCHAR(100) NULL,
    ma_van_don VARCHAR(100) NULL,

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_don_hang_ma (
        ma_don_hang
    ),

    UNIQUE KEY uk_don_hang_ma_van_don (
        ma_van_don
    ),

    KEY idx_don_hang_nguoi_dung (
        nguoi_dung_id
    ),

    KEY idx_don_hang_khuyen_mai (
        khuyen_mai_id
    ),

    KEY idx_don_hang_trang_thai (
        trang_thai_don_hang
    ),

    CONSTRAINT fk_don_hang_nguoi_dung
        FOREIGN KEY (nguoi_dung_id)
        REFERENCES nguoi_dung(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_don_hang_khuyen_mai
        FOREIGN KEY (khuyen_mai_id)
        REFERENCES khuyen_mai(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================================================================
-- 11.1. GIAO DICH THANH TOAN SEPAY
-- ================================================================

CREATE TABLE IF NOT EXISTS giao_dich_thanh_toan (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    don_hang_id INT UNSIGNED NOT NULL,
    nha_cung_cap ENUM('SEPAY') NOT NULL DEFAULT 'SEPAY',
    ma_thanh_toan VARCHAR(32) NOT NULL,
    so_tien DECIMAL(15,2) NOT NULL,
    trang_thai ENUM(
        'CHO_THANH_TOAN',
        'DA_THANH_TOAN',
        'HET_HAN',
        'DA_HUY'
    ) NOT NULL DEFAULT 'CHO_THANH_TOAN',
    ma_giao_dich_nha_cung_cap VARCHAR(100) NULL,
    ngay_thanh_toan DATETIME NULL,
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_gdtt_don_hang (don_hang_id),
    UNIQUE KEY uk_gdtt_ma_thanh_toan (ma_thanh_toan),
    UNIQUE KEY uk_gdtt_ma_nha_cung_cap (ma_giao_dich_nha_cung_cap),
    KEY idx_gdtt_trang_thai (trang_thai),

    CONSTRAINT fk_gdtt_don_hang
        FOREIGN KEY (don_hang_id)
        REFERENCES don_hang(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sepay_webhook_log (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    sepay_transaction_id BIGINT UNSIGNED NOT NULL,
    don_hang_id INT UNSIGNED NULL,
    ma_thanh_toan VARCHAR(32) NULL,
    payload_json JSON NOT NULL,
    trang_thai ENUM(
        'DA_NHAN',
        'DA_XU_LY',
        'KHONG_KHOP',
        'SAI_SO_TIEN',
        'BO_QUA'
    ) NOT NULL DEFAULT 'DA_NHAN',
    ly_do VARCHAR(500) NULL,
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_sepay_webhook_transaction (sepay_transaction_id),
    KEY idx_sepay_webhook_don_hang (don_hang_id),
    KEY idx_sepay_webhook_trang_thai (trang_thai),

    CONSTRAINT fk_sepay_webhook_don_hang
        FOREIGN KEY (don_hang_id)
        REFERENCES don_hang(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================================================================
-- 12. CHI TIET DON HANG
-- ================================================================

CREATE TABLE chi_tiet_don_hang (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    don_hang_id INT UNSIGNED NOT NULL,
    san_pham_id INT UNSIGNED NULL,

    ma_san_pham VARCHAR(50) NULL,
    ten_san_pham VARCHAR(255) NOT NULL,
    anh_san_pham_url VARCHAR(500) NULL,

    so_luong INT UNSIGNED NOT NULL,

    don_gia DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    thanh_tien DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    PRIMARY KEY (id),

    KEY idx_ctdh_don_hang (
        don_hang_id
    ),

    KEY idx_ctdh_san_pham (
        san_pham_id
    ),

    CONSTRAINT fk_ctdh_don_hang
        FOREIGN KEY (don_hang_id)
        REFERENCES don_hang(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ctdh_san_pham
        FOREIGN KEY (san_pham_id)
        REFERENCES san_pham(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================================================================
-- 13. NHA CUNG CAP
-- ================================================================

CREATE TABLE nha_cung_cap (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    ma_nha_cung_cap VARCHAR(50) NOT NULL,
    ten_nha_cung_cap VARCHAR(200) NOT NULL,

    nguoi_lien_he VARCHAR(150) NULL,
    so_dien_thoai VARCHAR(20) NULL,
    email VARCHAR(150) NULL,
    dia_chi VARCHAR(500) NULL,

    ghi_chu TEXT NULL,

    trang_thai ENUM(
        'HOAT_DONG',
        'NGUNG_HOP_TAC'
    ) NOT NULL DEFAULT 'HOAT_DONG',

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_nha_cung_cap_ma (
        ma_nha_cung_cap
    )
) ENGINE=InnoDB;

-- ================================================================
-- 14. PHIEU NHAP
-- ================================================================

CREATE TABLE phieu_nhap (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    ma_phieu_nhap VARCHAR(50) NOT NULL,

    nha_cung_cap_id INT UNSIGNED NOT NULL,
    nguoi_tao_id INT UNSIGNED NULL,

    ngay_nhap DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    tong_tien DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    ghi_chu TEXT NULL,

    trang_thai ENUM(
        'NHAP_TAM',
        'DA_HOAN_THANH',
        'DA_HUY'
    ) NOT NULL DEFAULT 'NHAP_TAM',

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_phieu_nhap_ma (
        ma_phieu_nhap
    ),

    KEY idx_phieu_nhap_ncc (
        nha_cung_cap_id
    ),

    KEY idx_phieu_nhap_nguoi_tao (
        nguoi_tao_id
    ),

    KEY idx_phieu_nhap_trang_thai (
        trang_thai
    ),

    CONSTRAINT fk_phieu_nhap_ncc
        FOREIGN KEY (nha_cung_cap_id)
        REFERENCES nha_cung_cap(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_phieu_nhap_nguoi_tao
        FOREIGN KEY (nguoi_tao_id)
        REFERENCES nguoi_dung(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================================================================
-- 15. CHI TIET PHIEU NHAP
-- ================================================================

CREATE TABLE chi_tiet_phieu_nhap (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    phieu_nhap_id INT UNSIGNED NOT NULL,
    san_pham_id INT UNSIGNED NOT NULL,

    so_luong INT UNSIGNED NOT NULL,

    don_gia_nhap DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    thanh_tien DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    PRIMARY KEY (id),

    UNIQUE KEY uk_ctpn_phieu_san_pham (
        phieu_nhap_id,
        san_pham_id
    ),

    KEY idx_ctpn_san_pham (
        san_pham_id
    ),

    CONSTRAINT fk_ctpn_phieu_nhap
        FOREIGN KEY (phieu_nhap_id)
        REFERENCES phieu_nhap(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ctpn_san_pham
        FOREIGN KEY (san_pham_id)
        REFERENCES san_pham(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ================================================================
-- 16. PHIEU XUAT
-- ================================================================

CREATE TABLE phieu_xuat (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    ma_phieu_xuat VARCHAR(50) NOT NULL,

    don_hang_id INT UNSIGNED NULL,
    nguoi_tao_id INT UNSIGNED NULL,

    loai_xuat ENUM(
        'BAN_HANG',
        'XUAT_HUY',
        'XUAT_KHAC'
    ) NOT NULL DEFAULT 'BAN_HANG',

    ngay_xuat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    nguoi_nhan VARCHAR(200) NULL,

    tong_gia_tri DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    ghi_chu TEXT NULL,

    trang_thai ENUM(
        'NHAP_TAM',
        'DA_HOAN_THANH',
        'DA_HUY'
    ) NOT NULL DEFAULT 'NHAP_TAM',

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_phieu_xuat_ma (
        ma_phieu_xuat
    ),

    KEY idx_phieu_xuat_don_hang (
        don_hang_id
    ),

    KEY idx_phieu_xuat_nguoi_tao (
        nguoi_tao_id
    ),

    KEY idx_phieu_xuat_trang_thai (
        trang_thai
    ),

    CONSTRAINT fk_phieu_xuat_don_hang
        FOREIGN KEY (don_hang_id)
        REFERENCES don_hang(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_phieu_xuat_nguoi_tao
        FOREIGN KEY (nguoi_tao_id)
        REFERENCES nguoi_dung(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================================================================
-- 17. CHI TIET PHIEU XUAT
-- ================================================================

CREATE TABLE chi_tiet_phieu_xuat (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    phieu_xuat_id INT UNSIGNED NOT NULL,
    san_pham_id INT UNSIGNED NOT NULL,

    so_luong INT UNSIGNED NOT NULL,

    don_gia_xuat DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    thanh_tien DECIMAL(15,2)
        NOT NULL DEFAULT 0,

    PRIMARY KEY (id),

    UNIQUE KEY uk_ctpx_phieu_san_pham (
        phieu_xuat_id,
        san_pham_id
    ),

    KEY idx_ctpx_san_pham (
        san_pham_id
    ),

    CONSTRAINT fk_ctpx_phieu_xuat
        FOREIGN KEY (phieu_xuat_id)
        REFERENCES phieu_xuat(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ctpx_san_pham
        FOREIGN KEY (san_pham_id)
        REFERENCES san_pham(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ================================================================
-- 18. DANH GIA SAN PHAM
-- ================================================================

CREATE TABLE danh_gia (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    nguoi_dung_id INT UNSIGNED NOT NULL,
    san_pham_id INT UNSIGNED NOT NULL,

    chi_tiet_don_hang_id INT UNSIGNED NULL,

    so_sao TINYINT UNSIGNED NOT NULL,
    noi_dung TEXT NULL,

    phan_hoi_admin TEXT NULL,

    trang_thai ENUM(
        'CHO_DUYET',
        'DA_DUYET',
        'TU_CHOI'
    ) NOT NULL DEFAULT 'CHO_DUYET',

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_danh_gia_chi_tiet_don (
        chi_tiet_don_hang_id
    ),

    KEY idx_danh_gia_nguoi_dung (
        nguoi_dung_id
    ),

    KEY idx_danh_gia_san_pham (
        san_pham_id
    ),

    KEY idx_danh_gia_trang_thai (
        trang_thai
    ),

    CONSTRAINT fk_danh_gia_nguoi_dung
        FOREIGN KEY (nguoi_dung_id)
        REFERENCES nguoi_dung(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_danh_gia_san_pham
        FOREIGN KEY (san_pham_id)
        REFERENCES san_pham(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_danh_gia_chi_tiet_don
        FOREIGN KEY (chi_tiet_don_hang_id)
        REFERENCES chi_tiet_don_hang(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================================================================
-- 19. BAI VIET / TIN TUC
-- ================================================================

CREATE TABLE bai_viet (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    tac_gia_id INT UNSIGNED NULL,

    chuyen_muc VARCHAR(100) NULL,

    tieu_de VARCHAR(255) NOT NULL,
    duong_dan VARCHAR(280) NOT NULL,

    tom_tat VARCHAR(1000) NULL,
    noi_dung LONGTEXT NOT NULL,

    anh_dai_dien_url VARCHAR(500) NULL,

    la_noi_bat TINYINT UNSIGNED
        NOT NULL DEFAULT 0,

    luot_xem INT UNSIGNED
        NOT NULL DEFAULT 0,

    trang_thai ENUM(
        'NHAP',
        'DA_DANG',
        'DANG_AN'
    ) NOT NULL DEFAULT 'NHAP',

    ngay_dang DATETIME NULL,

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_bai_viet_duong_dan (
        duong_dan
    ),

    KEY idx_bai_viet_tac_gia (
        tac_gia_id
    ),

    KEY idx_bai_viet_trang_thai (
        trang_thai
    ),

    CONSTRAINT fk_bai_viet_tac_gia
        FOREIGN KEY (tac_gia_id)
        REFERENCES nguoi_dung(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================================================================
-- 19.1. BINH LUAN BAI VIET
-- ================================================================

CREATE TABLE binh_luan_bai_viet (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    bai_viet_id INT UNSIGNED NOT NULL,
    ho_ten VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    noi_dung TEXT NOT NULL,
    trang_thai ENUM('CHO_DUYET','DA_DUYET','TU_CHOI') NOT NULL DEFAULT 'CHO_DUYET',
    ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_binh_luan_bai_viet (bai_viet_id),
    KEY idx_binh_luan_trang_thai (trang_thai),
    CONSTRAINT fk_binh_luan_bai_viet FOREIGN KEY (bai_viet_id) REFERENCES bai_viet(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================================================
-- 20. LIEN HE
-- ================================================================

CREATE TABLE lien_he (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,

    ho_ten VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    so_dien_thoai VARCHAR(20) NULL,

    tieu_de VARCHAR(255) NULL,
    noi_dung TEXT NOT NULL,

    trang_thai ENUM(
        'MOI',
        'DANG_XU_LY',
        'DA_XU_LY'
    ) NOT NULL DEFAULT 'MOI',

    ghi_chu_admin TEXT NULL,
    nguoi_xu_ly_id INT UNSIGNED NULL,

    ngay_tao DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_lien_he_trang_thai (
        trang_thai
    ),

    KEY idx_lien_he_nguoi_xu_ly (
        nguoi_xu_ly_id
    ),

    CONSTRAINT fk_lien_he_nguoi_xu_ly
        FOREIGN KEY (nguoi_xu_ly_id)
        REFERENCES nguoi_dung(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================================================================
-- KIEM TRA KET QUA
-- ================================================================

USE rubeanora_store;

UPDATE nguoi_dung
SET ho_ten = CONVERT(0x44757920546875E1BAAD6E USING utf8mb4)
WHERE email = 'thuan@gmail.com';

UPDATE nguoi_dung
SET ho_ten = CONVERT(0x4E67E1BB8D63204D6169 USING utf8mb4)
WHERE email = 'admin@gmail.com';

UPDATE nguoi_dung
SET ho_ten = CONVERT(0x4CC3AA2056C4836E205175616E67 USING utf8mb4)
WHERE email = 'quang@gmail.com';


SELECT DATABASE();

SHOW TABLES;
