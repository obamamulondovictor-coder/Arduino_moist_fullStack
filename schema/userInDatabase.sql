-- Run as MySQL admin/root
CREATE DATABASE IF NOT EXISTS soilSystemDB;

CREATE USER IF NOT EXISTS 'soilSystem'@'localhost' IDENTIFIED BY 'soilSystem123';
GRANT ALL PRIVILEGES ON soilSystemDB.* TO 'soilSystem'@'localhost';
FLUSH PRIVILEGES;
