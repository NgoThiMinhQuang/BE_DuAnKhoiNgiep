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
