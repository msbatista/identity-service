const identityRepository = require('../data/identity-repository').identityRepository;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

service = {}

service.authorize = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: 'Token required!' });
        }

        if (token.includes("Bearer")) {
            token = token.split(" ")[1];
        }

        jwt.verify(token, process.env.SECRET_KEY, (err, decodeToken) => {
            if (err) {
                return res.status(401).json({ 
                    message: "Invalid token!" 
                });
            }

            return res.status(200).json({
                valid: true,
                userId: decodeToken.id,
                data: decodeToken.data,
            });
        });


    } catch (err) {
        res.status(500).json({
            title: 'Internal Error',
            status: 500,
            message: `Not able to validate user: ${err.message}.`
        });
    }
}

service.authenticate = async (req, res, next) => {
    try {
        const foundUserByLogin = await identityRepository.getUserByLogin(req.params.login);

        if (foundUserByLogin && bcrypt.compareSync(req.headers.apikey, foundUserByLogin.key)) {
            let token = jwt.sign({ 
                id: foundUserByLogin.login,
                data: {
                    claims: foundUserByLogin.roles.split(',')
                }
            }, process.env.SECRET_KEY, {
                expiresIn: 3600,
            });

            return res.status(200).json({
                login: foundUserByLogin.login,
                bearerToken: token,
                roles: foundUserByLogin.roles.split(',')
            });
        }

        return res.status(401).json({
            title: 'Not Authorized',
            status: 401,
            message: 'You have no powers here'
        });

    } catch (err) {
        res.status(500).json({
            title: 'Internal Error',
            status: 500,
            message: `Not able to authenticate user: ${err.message}.`
        });
    }
}

service.createUser = async (req, res, next) => {
    try {
        const foundUserByEmail = await identityRepository.getUserByEmail(req.body.email);

        if (foundUserByEmail) {
            return res.status(409).json({
                title: 'Conflict',
                status: 409,
                message: `User email '${foundUserByEmail.email}' is already in use.`
            });
        }

        const foundUserByLogin = await identityRepository.getUserByLogin(req.body.login);

        if (foundUserByLogin) {
            return res.status(409).json({
                title: 'Conflict',
                status: 409,
                message: `User login '${foundUserByLogin.login}' is already in use.`
            });
        }

        const createdUser = await identityRepository.createUser(req.body);

        return res.status(200).json(createdUser);
    } catch (err) {
        res.status(500).json({
            title: 'Internal Error',
            status: 500,
            message: `Not able to create user: ${err.message}.`
        });
    }
};

module.exports.identityService = service;