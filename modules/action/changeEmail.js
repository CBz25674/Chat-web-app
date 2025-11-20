const conn = require("../connection");
let userSession;

module.exports = async (data) => {
    
    let connection;
    try {
        connection = await conn.getConnection();
        let sqlQuery = `UPDATE \`account\` SET \`email\`=? WHERE \`username\` = ?`;
        connection.execute(sqlQuery, [data.newEmail, data.user]);
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) connection.release();
    }
};