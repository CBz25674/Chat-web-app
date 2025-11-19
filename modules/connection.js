const mysql = require("mysql");

const conn = mysql.createConnection({
    host: process.env.mysqlHost,
    user: process.env.mysqlUser,
    password: process.env.mysqlPassword,
    database: process.env.dbName
});

conn.connect((err) => {
    if (err) throw err;
    console.log("Connected to mysql.");
});

module.exports = conn;