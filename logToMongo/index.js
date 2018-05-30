const mongoose = require('mongoose');
const pathNotToLog = ["/audit", "/audit/count", "/webHookStatus", "/webHookStatus/count", "/logs", "/logs/count"];
function logToMongo(name) {
    let mongoDB = mongoose.connection.db.collection('logs');
    return function (req, res, next) {
        let start = new Date();
        res.on('finish', function () {
            let end = new Date();
            let diff = end - start;
            let headers = JSON.parse(JSON.stringify(req.headers));
            headers.authorization = "JWT *************************";
            if (pathNotToLog.some(_k => req.path.endsWith(_k))) {
                next();
                return;
            }
            mongoDB.insert({
                name: name,
                url: req.originalUrl,
                method: req.method,
                reqHeaders: headers,
                reqBody: req.body,
                timestamp: start,
                resHeaders: res.getHeaders(),
                resStatusCode: res.statusCode,
                source: req.connection.remoteAddress,
                completionTime: diff,
                _deleted: false
            });
        });
        next();
    };
}

module.exports = logToMongo;
