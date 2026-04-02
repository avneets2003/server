const http = require('http');
const https = require('https');
const url = require('url');

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/riskScore' && req.method === 'GET') {
        const score = Math.floor(Math.random() * 101);
        res.writeHead(200);
        res.end(JSON.stringify({ result: score }));
    } else if (req.url === '/identityProofing' && req.method === 'GET') {
        const result = Math.random() < 0.5;
        res.writeHead(200);
        res.end(JSON.stringify({ result: result }));
    } else if (req.url.startsWith('/updateGroup') && req.method === 'GET') {
        const queryParams = url.parse(req.url, true).query;
        const userId = queryParams.userId;
        const groupId = queryParams.groupId;

        if (!userId || !groupId) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Missing userId or groupId' }));
            return;
        }

        const payload = {
            schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
            Operations: [
                {
                    op: "add",
                    path: "members",
                    value: [{ type: "user", value: userId }]
                },
                {
                    op: "add",
                    path: "urn:ietf:params:scim:schemas:extension:ibm:2.0:Notification:notifyType",
                    value: "NONE"
                }
            ]
        };

        const headers = {
            'Authorization': req.headers.authorization,
            'Content-Type': req.headers['content-type'] || 'application/scim+json;charset=utf-8'
        };

        const options = {
            hostname: 'flows-demo-icd.dev.verify.ibmcloudsecurity.com',
            path: `/v2.0/Groups/${groupId}`,
            method: 'PATCH',
            headers: headers
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => data += chunk);
            proxyRes.on('end', () => {
                if (proxyRes.statusCode === 204) {
                    res.writeHead(200);
                    res.end(JSON.stringify({ result: 'done' }));
                } else {
                    res.writeHead(proxyRes.statusCode);
                    res.end(data);
                }
            });
        });

        proxyReq.on('error', (error) => {
            res.writeHead(500);
            res.end(JSON.stringify({ error: error.message }));
        });

        proxyReq.write(JSON.stringify(payload));
        proxyReq.end();
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
