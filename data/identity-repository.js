const queryBuilder = require("./db").knexQueryBuilder;
const cryptoUtils = require("../utils/crypto-utils").cryptoUtils;
const bcrypt = require("bcryptjs");

var repository = {};

repository.createUser = async (user) => {
    const apiKey = await cryptoUtils.generateApiToken();

    const newUser = {
        name: user.name,
        login: user.login,
        email: user.email,
        roles: user.roles,
        key: bcrypt.hashSync(apiKey),
    };

    let result = await queryBuilder('user').insert(newUser).returning('id');

    return { id: result[0].id, key: apiKey };
}

repository.getUserByEmail = async (email) => {
    let result = await queryBuilder.select("*").from("user").where({
        email: email
    });

    if (result.length) {
        return result[0];
    } else {
        return undefined;
    }
}

repository.getUserByLogin = async (login) => {
    let result = await queryBuilder.select("*").from("user").where({
        login: login
    });

    if (result.length) {
        return result[0];
    } else {
        return undefined;
    }
}

module.exports.identityRepository = repository;