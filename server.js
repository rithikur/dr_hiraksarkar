const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;

// Hardcoded hashed password check for extra backend security
const VALID_HASH = '2fff2e6c12b3866d026c4c8be5fdd4fa731e08dcea568afaf46a758252500c3b'; // SHA-256 of hirak@sarkar9486

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  // Simple API to save data.json
  if (req.method === 'POST' && req.url === '/api/save') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        
        // Very basic security check
        if (payload.auth !== VALID_HASH) {
          res.writeHead(401);
          return res.end(JSON.stringify({ success: false, message: 'Unauthorized' }));
        }

        // Save to data.json
        fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(payload.data, null, 2));
        
        // Push changes to GitHub automatically so they reflect on the live page
        exec('git add data.json && git commit -m "Content update via Admin panel" && git push origin main', { cwd: __dirname }, (err, stdout, stderr) => {
          if (err) {
            console.error('Error pushing to GitHub:', err);
          } else {
            console.log('Successfully pushed to GitHub:', stdout);
          }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, message: e.message }));
      }
    });
    return;
  }

  // Serve Static Files
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';
  
  // Strip query parameters
  filePath = filePath.split('?')[0];
  
  // Handle clean URLs for Admin
  if (filePath === './admin' || filePath === './admin/') filePath = './admin/index.html';

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(path.join(__dirname, filePath), (err, content) => {
    if (err) {
      if(err.code === 'ENOENT') { 
        res.writeHead(404); 
        res.end('File Not Found'); 
      } else { 
        res.writeHead(500); 
        res.end('Server Error: ' + err.code); 
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\nLocal CMS Server running!`);
  console.log(`Open http://localhost:${PORT} to view website`);
  console.log(`Open http://localhost:${PORT}/admin to access Admin Panel\n`);
});
