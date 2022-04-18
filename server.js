
require("dotenv").config();
const identityApi = require("./api/identity-api").identityService;
const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3003;
const HOSTNAME = process.env.HOSTNAME || "http://localhost";
const ENDPOINT = "/api/v1";


const app = express();
app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

app.use(ENDPOINT, apiRouter);

app.post(`${ENDPOINT}/security/register`, identityApi.createUser);
app.post(`${ENDPOINT}/security/authenticate/client/:login`, identityApi.authenticate);
app.post(`${ENDPOINT}/security/authorize`, identityApi.authorize);

try {
    app.listen(PORT, () => {
        console.log(`Sever started on ${HOSTNAME}:${PORT}`);
    });
} catch (e) {
    console.log(`Error occurred: ${e.message}`);
}
