const conn = require("../connection");
let userSession;

module.exports = (data) => {
    
    let sqlQuery = `UPDATE \`account\` SET \`email\`=? WHERE \`username\` = ?`;
    conn.query(sqlQuery, [data.newEmail, data.user]);
    conn.query(`SELECT * FROM \`account\` WHERE username = ?`, [data.user], (error, result, field) => {
        userSession = {
            username: data.username,
            displayname: result[0].displayname,
            email: data.newEmail,
            avatar: result[0].avatar
        };
    });
    return userSession;
};