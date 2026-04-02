const http = require('http');

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
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
