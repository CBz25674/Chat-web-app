const mysql = require("mysql");

const conn = mysql.createPool({
    host: process.env.mysqlHost,
    user: process.env.mysqlUser,
    password: process.env.mysqlPassword,
    database: process.env.dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = conn;