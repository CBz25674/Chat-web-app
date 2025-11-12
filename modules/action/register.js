const conn = require("../connection");
const bcrypt = require("bcrypt");
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
    let registerQuery = `INSERT INTO \`account\` (\`username\`, \`displayname\`, \`email\`, \`password\`, \`avatar\`, \`publickey\`, \`privatekey\`) VALUES (?,?,?,?,'asset/default.jpg',?,?)`;
    conn.query(registerQuery, [data.username, data.username, data.email, data.password, publicKey, privateKey], (error, res) => {
        if (error) throw error;
    });
    
    let userSession = {
        username: data.username,
        displayname: data.username,
        email: data.email,
        avatar: 'asset/default.jpg',
        key: privateKey
    };
    return userSession;
};