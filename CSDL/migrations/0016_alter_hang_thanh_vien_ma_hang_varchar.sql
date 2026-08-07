-- Migration 0016: Allow dynamic tier codes for customer loyalty ranks
ALTER TABLE hang_thanh_vien MODIFY ma_hang VARCHAR(50) NOT NULL;
