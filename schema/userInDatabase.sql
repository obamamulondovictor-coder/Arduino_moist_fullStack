CREATE USER "soilSystem"@"localhost" IDENTIFIED BY 'soilSystem123';
--create the database
CREATE DATABASE IF NOT EXISTS soilSystemDB;
--grant all privileges to the user on the database
GRANT ALL PRIVILEGES ON soilSystemDB.* TO "soilSystem"@"localhost";

