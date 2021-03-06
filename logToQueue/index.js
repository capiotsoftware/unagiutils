const pathNotToLog = ["/audit", "/audit/count", "/webHookStatus", "/webHookStatus/count", "/logs", "/logs/count", "/health"];
const reqHeaderNotToLog = ['x-forwarded-for', 'dnt','authorization','access-control-allow-methods','content-type','access-control-allow-origin','accept','referer','accept-encoding','accept-language','cookie','connection'];
const resHeaderNotToLog = ['x-powered-by', 'access-control-allow-origin','content-type','content-length','etag'];
function deleteProps (obj, properties) {
    for (let property of properties) 
        (property in obj) && (delete obj[property]);
}

function logToQueue(name, client, queueName, collectionName) {
    return function (req, res, next) {
        let start = new Date();
        res.on('finish', function () {
            let end = new Date();
            let diff = end - start;
            let headers = JSON.parse(JSON.stringify(req.headers));[]
            deleteProps(headers,reqHeaderNotToLog );
            if (pathNotToLog.some(_k => req.path.endsWith(_k))) {
                next();
                return;
            }
            let resHeader = res.getHeaders();
            deleteProps(resHeader, resHeaderNotToLog);
            if(Object.keys(resHeader).length===0){
                resHeader = null;
            }
            let body = {
                data: {
                    name: name,
                    url: req.originalUrl,
                    method: req.method,
                    reqHeaders: headers,
                    reqBody: req.body,
                    timestamp: start,
                    resHeaders: resHeader,
                    resStatusCode: res.statusCode,
                    source: req.connection.remoteAddress,
                    completionTime: diff,
                    _metadata: { 'deleted': false, 'createdAt': new Date(), 'lastUpdated': new Date() }
                }
            };
            if (collectionName) {
                body.collectionName = collectionName;
            }
            if(req.originalUrl == '/rbac/login'){
                next();
            }
            else{
            let bodyStr = JSON.stringify(body);
            try {
                client.publish(queueName, bodyStr);
            } finally {
                next();
            }}
        });
        next();
    };
}

module.exports = logToQueue;
