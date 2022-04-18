const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const jwt = require("jsonwebtoken");

cryptoUtils = {};

cryptoUtils.generateApiToken = async() => {
    const saltRounds = 10;
    const token = crypto.randomUUID();
    return await bcrypt.hash(token, saltRounds);
};

module.exports.cryptoUtils = cryptoUtils;