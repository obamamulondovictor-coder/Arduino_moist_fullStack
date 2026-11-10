require("dotenv").config({path : ".env.local"});
const mysql = require("mysql2/promise");



const pool = mysql.createPool({
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASS,
    host : process.env.MYSQL_HOST,
    database : process.env.MYSQL_DATABASE ?? "soilSystemDB"
});

module.exports = pool;


//immediate excution function to test and return and stop closing the connection

(async function testConnection() {

    const connection = await pool.getConnection();
    if (connection) {
        return console.log("Database connection successful");
        
    } else  {
        return console.error("Database connection failed");
    }
 } )();


