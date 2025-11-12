const conn = require("./connection");

module.exports = (token) => {
    //เก็บ token ที่ได้รับลวในตาราง onetimetoken
    let storeTokenQuery = `INSERT INTO \`onetimetoken\`(\`id\`, \`token\`, \`action\`, \`data\`, \`status\`, \`expire\`) VALUES ('',?,?,?,?,?)`;
    conn.query(storeTokenQuery, [token.token, token.action, token.dataJSON, token.status, token.expireDate]);
}