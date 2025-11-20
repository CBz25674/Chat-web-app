const conn = require("../connection");
const crypto = require("crypto");

module.exports = async (data) => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: "spki",
            format: "pem"
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
            cipher: "aes-256-cbc",
            passphrase: process.env.keypassphrase
        }
    })
    let connection;
    try {
        connection = await conn.getConnection();
        let registerQuery = `INSERT INTO \`account\` (\`username\`, \`displayname\`, \`email\`, \`password\`, \`avatar\`, \`publickey\`, \`privatekey\`) VALUES (?,?,?,?,'asset/default.jpg',?,?)`;
        connection.execute(registerQuery, [data.username, data.username, data.email, data.password, publicKey, privateKey], (error, res) => {
            if (error) throw error;
        });
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) connection.release();
    }
};