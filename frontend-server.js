const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.FRONTEND_PORT) || 3000;
const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
const publicDirectory = path.join(__dirname, 'public');
const contentTypes = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript' };

function proxyApi(request, response) {
  const target = new URL(request.url, `${backendUrl}/`);
  const proxyRequest = http.request(target, { method: request.method, headers: request.headers }, (proxyResponse) => {
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    proxyResponse.pipe(response);
  });

  proxyRequest.on('error', () => response.writeHead(502).end('Backend unavailable'));
  request.pipe(proxyRequest);
}

const server = http.createServer((request, response) => {
  if (request.url.startsWith('/api/') || request.url === '/health') {
    return proxyApi(request, response);
  }

  const requestedPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const filePath = path.resolve(publicDirectory, `.${requestedPath}`);
  if (!filePath.startsWith(publicDirectory)) return response.writeHead(400).end('Invalid path');

  fs.readFile(filePath, (error, content) => {
    if (error) return response.writeHead(404).end('Not found');
    const contentType = contentTypes[path.extname(filePath)] || 'text/plain';
    response.writeHead(200, { 'content-type': contentType });
    return response.end(content);
  });
});

if (require.main === module) {
  server.listen(port, () => console.log(`ShipIt frontend listening on port ${port}`));
}

module.exports = { server };