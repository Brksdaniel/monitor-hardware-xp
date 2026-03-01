const http = require('http');
const fs = require('fs');
const path = require('path');

// Busca dados do LibreHardwareMonitor
function buscarDados(callback) {
  http.get('http://localhost:8085/data.json', (res) => {
    let dados = '';
    res.on('data', (chunk) => { dados += chunk; });
    res.on('end', () => {
      try { callback(JSON.parse(dados)); }
      catch (e) { callback(null); }
    });
  }).on('error', () => callback(null));
}

function filtrarTudo(node, componente, resultado) {
  if (node.Text && !['Voltages','Temperatures','Fans','Controls','Powers','Sensor','DESKTOP'].some(x => node.Text.includes(x))) {
    componente = node.Text;
  }
  if (['Voltages','Temperatures','Fans'].includes(node.Text) && node.Children) {
    node.Children.forEach(filho => {
      if (filho.Value && filho.Value !== '') {
        resultado.push({ grupo: node.Text, componente, nome: filho.Text, valor: filho.Value });
      }
    });
    return;
  }
  if (node.Children) {
    node.Children.forEach(filho => filtrarTudo(filho, componente, resultado));
  }
}

// Servidor
const server = http.createServer((req, res) => {

  // Rota: página principal
  if (req.url === '/' || req.url === '/index.html') {
    const html = fs.readFileSync(path.join(__dirname, 'monitor-xp.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // Rota: dados em tempo real (chamada pelo HTML)
  if (req.url === '/dados') {
    buscarDados((json) => {
      if (!json) {
        res.writeHead(500);
        res.end(JSON.stringify({ erro: 'LibreHardwareMonitor não encontrado' }));
        return;
      }
      const resultado = [];
      filtrarTudo(json, '', resultado);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(resultado));
    });
    return;
  }

  res.writeHead(404);
  res.end('Não encontrado');
});

server.listen(3000, () => {
  console.log('✅ Servidor rodando!');
  console.log('🌐 Abre no navegador: http://localhost:3000');
  console.log('❌ CTRL+C para parar');
});