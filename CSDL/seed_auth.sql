USE rubeanora_store;

CREATE TABLE IF NOT EXISTS dat_lai_mat_khau (
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

DELETE FROM dat_lai_mat_khau WHERE het_han_luc < NOW() OR da_su_dung = 1;
