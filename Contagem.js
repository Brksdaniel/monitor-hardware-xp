const http = require('http');

function buscarTensoes() {
  http.get('http://localhost:8085/data.json', (res) => {
    let dados = '';
    res.on('data', (chunk) => { dados += chunk; });
    res.on('end', () => {
      const json = JSON.parse(dados);
      
      // Limpa o terminal a cada atualização
      console.clear();
      console.log('⚡ MONITOR DE TENSÕES - AO VIVO');
      console.log('🕐 Atualizado:', new Date().toLocaleTimeString());
      console.log('─────────────────────────────────\n');
      
      filtrarGrupo(json, '');
      
      console.log('\n─────────────────────────────────');
      console.log('🔄 Atualizando a cada 2 segundos...');
      console.log('❌ Pressione CTRL+C para parar');
    });
  }).on('error', () => {
    console.log('❌ Abre o LibreHardwareMonitor primeiro!');
  });
}

function filtrarGrupo(node, componente) {
  if (node.Text && !['Voltages','Temperatures','Fans','Controls','Powers','Sensor','DESKTOP'].some(x => node.Text.includes(x))) {
    componente = node.Text;
  }

  if (node.Text === 'Voltages') {
    if (node.Children) {
      node.Children.forEach(filho => {
        if (filho.Value && filho.Value !== '') {
          console.log(`🔋 [${componente}] ${filho.Text}: ${filho.Value}`);
        }
      });
    }
    return;
  }

  if (node.Children) {
    node.Children.forEach(filho => filtrarGrupo(filho, componente));
  }
}

// Roda imediatamente e depois a cada 2 segundos
buscarTensoes();
setInterval(buscarTensoes, 2000);