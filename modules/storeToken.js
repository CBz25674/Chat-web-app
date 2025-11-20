const conn = require("./connection");

module.exports = async (token) => {
    //เก็บ token ที่ได้รับลวในตาราง onetimetoken
    let connection;
    try {
        connection = await conn.getConnection();
        let storeTokenQuery = `INSERT INTO \`onetimetoken\`(\`id\`, \`token\`, \`action\`, \`data\`, \`status\`, \`expire\`) VALUES ('',?,?,?,?,?)`;
        connection.execute(storeTokenQuery, [token.token, token.action, token.dataJSON, token.status, token.expireDate]);
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) connection.release();
    }
}