// Servidor de desenvolvimento com suporte a SPA routing
// Todas as rotas que não são arquivos físicos redirecionam para index.html

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8100;
const WWW_DIR = path.join(__dirname, 'www');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch {
        return false;
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Remover query string e hash
    pathname = pathname.split('?')[0].split('#')[0];

    // Se for a raiz, servir index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Caminho completo do arquivo
    let filePath = path.join(WWW_DIR, pathname);

    // Verificar se o arquivo existe
    if (fileExists(filePath)) {
        // Servir o arquivo
        const content = fs.readFileSync(filePath);
        const mimeType = getMimeType(filePath);
        
        res.writeHead(200, {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
        });
        res.end(content);
    } else {
        // Arquivo não existe - fazer fallback para index.html (SPA routing)
        const indexPath = path.join(WWW_DIR, 'index.html');
        
        if (fileExists(indexPath)) {
            const content = fs.readFileSync(indexPath);
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            });
            res.end(content);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        }
    }
});

server.listen(PORT, () => {
    const networkInterfaces = require('os').networkInterfaces();
    let localIP = 'localhost';
    
    // Tentar encontrar IP local
    for (const name of Object.keys(networkInterfaces)) {
        for (const iface of networkInterfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                if (iface.address.startsWith('192.168.') || 
                    iface.address.startsWith('10.') || 
                    iface.address.startsWith('172.16.')) {
                    localIP = iface.address;
                    break;
                }
            }
        }
        if (localIP !== 'localhost') break;
    }
    
    console.log('');
    console.log('🚀 Servidor de desenvolvimento iniciado!');
    console.log('');
    console.log(`📱 Local:    http://localhost:${PORT}`);
    console.log(`🌐 Rede:     http://${localIP}:${PORT}`);
    console.log('');
    console.log('✅ SPA routing ativado (fallback para index.html)');
    console.log('   Pressione Ctrl+C para parar');
    console.log('');
});

