let e = {};

const req = require("./requestHandler");

const _baseURL = "/apis/apps/v1";
var fs = require('fs');

function base64_encode(data) {
    return new Buffer(data).toString('base64');
}

e.createSecret = (ns) => {
    console.log("Creating a new secret :: in ", ns);
    let data = {
        "auths": { [process.env.DOCKER_HOST]: { username: process.env.DOCKER_USER, password: process.env.DOCKER_PASSWORD, email: process.env.DOCKER_EMAIL, auth:  base64_encode(`${process.env.DOCKER_USER}:${process.env.DOCKER_PASSWORD}`)} }
    }
    let base64En = base64_encode(data);
    var data = {
        "kind": "Secret",
        "apiVersion": "v1",
        "metadata": {
            "name": "regsecret",
            "namespace": ns
        },
        "data": {
            ".dockerconfigjson": base64En
        },
        "type": "kubernetes.io/dockerconfigjson"
    };
    logger.info(JSON.stringify(data));
    return req.post(_baseURL + "/namespaces/" + ns + "/secrets", data)
        .then(_d => {
            return data;
        }, _e => {
            return _e;
        });
}


module.exports = e;