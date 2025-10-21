const fs = require('fs');
const readlineSync = require('readline-sync');
const Discord = require('discord.js-selfbot-v13');
const fetch = require('node-fetch');
const client = new Discord.Client({ checkUpdate: false });
const config = (() => {
  const configPath = './config.json';
  if (!fs.existsSync(configPath)) {
    criarConfig();
  }
  return require(configPath);
})();;
const RPC = require('discord-rpc');
const path = require('path');
const AdmZip = require('adm-zip');
const child_process = require("child_process");

const clientId = '1257500388408692800';
const theme = {
  "state": "v1.0.0",
  "details": "No menu principal",
  "largeImageKey": "bloodhound",
  "largeImageText": "Bloodhound 🩸",
  "smallImageKey": "bloodhound",
  "smallImageText": "hunting"
}

let cor = hex(config.cor_painel || '#FF0000');
const erro = hex('#FF4444');
const reset = hex('#FFFFFF');
const sucesso = hex('#00FF00');

const sleep = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000));
const VERSAO_ATUAL = "1.0.0"
const rpc = new RPC.Client({ transport: 'ipc' });

try {
  RPC.register(clientId);
  rpc.on('ready', () => {
    updatePresence(theme);
  });
  
  rpc.login({ clientId }).catch(console.error);
} catch (error) {
  console.error('Erro ao inicializar o RPC:', error);
}

async function updatePresence(presence, tempo = false) {
  if (!rpc) {
    console.error('RPC não inicializado');
    return;
  }
  try {
    const activity = {
      pid: process.pid,
      state: presence.state || theme.state,
      details: presence.details || theme.details,
      largeImageKey: presence.largeImageKey || theme.largeImageKey,
      largeImageText: presence.largeImageText || theme.largeImageText,
      smallImageKey: presence.smallImageKey || theme.smallImageKey,
      smallImageText: presence.smallImageText || theme.smallImageText,
    };
    await rpc.setActivity(activity);
  } catch (error) {
    console.error('Erro ao atualizar a presença:', error);
  }
}

function hex(hex) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error('Código hex inválido. Deve ser no formato #RRGGBB.');
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    throw new Error('Valores RGB fora do intervalo válido (0-255).');
  }

  return `\x1b[38;2;${r};${g};${b}m`;
}

async function fetchMsgs(canal) {
  const canall = client.channels.cache.get(canal);

  if (!canall) {
    return [];
  }

  let ultimoid;
  let messages = [];

  while (true) {
    const fetched = await canall.messages.fetch({
      limit: 100,
      ...(ultimoid && { before: ultimoid }),
    });

    if (fetched.size === 0) {
      return messages.filter(msg => msg.author.id === client.user.id && !msg.system);
    }

    messages = messages.concat(Array.from(fetched.values()));
    ultimoid = fetched.lastKey();
  }
}

async function titulo(username, userId) {
  console.log(`\n`);
  console.log(`${cor}╔══════════════════════════════════════════════════════════════════════════════╗${reset}`);
  console.log(`${cor}║                                                                              ║${reset}`);
  console.log(`${cor}║  ██████╗ ██╗      ██████╗  ██████╗ ██████╗ ██╗  ██╗ ██████╗ ██╗   ██╗██████╗ ███╗   ██╗██████╗  ║${reset}`);
  console.log(`${cor}║  ██╔══██╗██║     ██╔═══██╗██╔═══██╗██╔══██╗██║  ██║██╔═══██╗██║   ██║██╔══██╗████╗  ██║██╔══██╗ ║${reset}`);
  console.log(`${cor}║  ██████╔╝██║     ██║   ██║██║   ██║██║  ██║███████║██║   ██║██║   ██║██║  ██║██╔██╗ ██║██║  ██║ ║${reset}`);
  console.log(`${cor}║  ██╔══██╗██║     ██║   ██║██║   ██║██║  ██║██╔══██║██║   ██║██║   ██║██║  ██║██║╚██╗██║██║  ██║ ║${reset}`);
  console.log(`${cor}║  ██████╔╝███████╗╚██████╔╝╚██████╔╝██████╔╝██║  ██║╚██████╔╝╚██████╔╝██████╔╝██║ ╚████║██████╔╝ ║${reset}`);
  console.log(`${cor}║  ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═════╝  ║${reset}`);
  console.log(`${cor}║                                                                              ║${reset}`);
  console.log(`${cor}╚══════════════════════════════════════════════════════════════════════════════╝${reset}`);
  console.log(`\n`);
  console.log(`        ${cor}🩸 Usuário:${reset} ${username}`);
  console.log(`        ${cor}🩸 ID:${reset} ${userId}`);
  console.log(`        ${cor}🩸 Versão:${reset} ${VERSAO_ATUAL}`);
  console.log(`\n`);
}

function criarConfig() {
  const configData = {
    "token": "",
    "cor_painel": "#FF0000",
    "delay": "1",
    "kosame": {
      "ativado": false,
      "canal": "",
      "tokens": []
    }
  };

  if (!fs.existsSync('config.json')) {
    fs.writeFileSync('config.json', JSON.stringify(configData, null, 4));
  } else {
    const currentConfig = JSON.parse(fs.readFileSync('config.json'));
    if (!currentConfig.token || !currentConfig.delay) {
      fs.writeFileSync('config.json', JSON.stringify(configData, null, 4));
    }
  }
}

function escreverToken(token) {
  criarConfig();
  const currentConfig = JSON.parse(fs.readFileSync('config.json'));
  currentConfig.token = token;
  fs.writeFileSync('config.json', JSON.stringify(currentConfig, null, 4));
}

async function pedirToken() {
  while (true) {
    const token = readlineSync.question(`${cor}🩸 > ${reset}`);
    if (await validarToken(token)) {
      escreverToken(token);
      break;
    } else {
      console.clear();
      console.log(`${erro}[X] Token inválida, insira outra.${reset}`);
    }
  }
}

async function validarToken(token) {
  try {
    const response = await fetch('https://discord.com/api/v9/users/@me', {
      headers: {
        'Authorization': token.replace(/Bot|Bearer/ig, '').trim()
      }
    });
    const u = await response.json();
    return !!u.username;
  } catch {
    return false;
  }
}

async function verificarToken() {
  criarConfig();
  const config = JSON.parse(fs.readFileSync('config.json'));
  if (!config.token || !(await validarToken(config.token))) {
    console.clear();
    console.log(`${cor}🩸 Você não inseriu uma token válida, insira:${reset}`);
    await pedirToken();
  }
}

async function clearUnica() {
  console.clear();
  criarConfig();

  process.title = 'Bloodhound | Limpar DM única';
  const config = require('./config.json');
  console.log(`${cor}🩸 Insira o ID do usuário:${reset}`);
  let id = readlineSync.question(`${cor}🩸 > ${reset}`);

  const canal = client.channels.cache.get(id);
  let contador = 0;

  if (!canal) {
    const user = await client.users.fetch(id).catch(() => { });
    if (!user) {
      console.clear();
      console.log(`${erro}[X] Este ID é inválido.${reset}`);
      await sleep(3.5);
      await clearUnica();
    }

    await user?.createDM().then(c => id = c.id).catch(async () => {
      console.clear();
      console.log(`${erro}[X] Não foi possível abrir DM com o usuário.${reset}`);
      await sleep(3.5);
      await clearUnica();
    });
  }

  const msgs = await fetchMsgs(id);

  if (!msgs.length) {
    console.clear();
    console.log(`${erro}[X] Você não tem mensagens nesta DM.${reset}`);
    await sleep(3.5);
    menu(client);
  }

  for (const [index, msg] of msgs.entries()) {
    await sleep(parseFloat(config.delay) || 1);
    await msg.delete().then(async () => {
      contador++;
      process.title = `Bloodhound | Limpar DM única | ${contador}/${msgs.length} mensagens apagadas`;
      const porcentagem = ((contador) / msgs.length) * 100;
      const progresso = '[' + '█'.repeat(Math.floor(porcentagem / 2)) + '░'.repeat(50 - Math.floor(porcentagem / 2)) + ']';

      await updatePresence({
        state: `${Math.round(porcentagem)}%`,
        details: `Apagando mensagens: ${contador}/${msgs.length}`
      });

      console.clear();
      await titulo(client?.user?.username || 'a', client?.user?.id || 'ww');
      console.log(`\n${cor}${progresso}${reset} | ${porcentagem.toFixed(2)}% | ${contador}/${msgs.length} mensagens apagadas\n`);
    }).catch(() => { });
  }

  console.log(`\n${sucesso}[✓] DM limpa com sucesso!${reset}`);
  await sleep(2);
  menu(client);
}

async function clearAbertas() {
  console.clear();
  criarConfig();

  process.title = 'Bloodhound | Limpar DMs abertas';
  const config = require('./config.json');
  const dms = await client.channels.cache.filter(c => c.type == "DM").map(a => a);
  let contador = 0;

  if (!dms.length) {
    console.clear();
    console.log(`${erro}[X] Você não tem DMs abertas.${reset}`);
    await sleep(3.5);
    menu(client);
  }

  console.log(`${cor}🩸 Fechar cada DM após apagar as mensagens? [s/n]:${reset}`);
  const pergunta = readlineSync.question(`${cor}🩸 > ${reset}`);
  const fechar = pergunta.toLowerCase() === "s" || pergunta.toLowerCase() === "sim";

  for (const dm of dms) {
    contador++;
    process.title = `Bloodhound | Limpar DMs abertas | ${contador}/${dms.length} DMs limpas`;
    let contador_msgs = 0;
    const msgs = await fetchMsgs(dm.id);

    if (!msgs.length) continue;
    for (const [index, msg] of msgs.entries()) {
      await sleep(parseFloat(config.delay) || 1);
      await msg.delete().then(async () => {
        contador_msgs++;

        const porcentagem = ((contador_msgs) / msgs.length) * 100;
        const progresso = '[' + '█'.repeat(Math.floor(porcentagem / 2)) + '░'.repeat(50 - Math.floor(porcentagem / 2)) + ']';
        await updatePresence({
          state: `Na dm com ${dm.recipient.globalName || dm.recipient.username}`,
          details: `Apagando ${contador_msgs}/${msgs.length} [${Math.round(porcentagem)}%]`,
          largeImageText: `${contador}/${dms.length} DMs limpas`
        });

        console.clear();
        await titulo(client?.user?.username || 'a', client?.user?.id || 'ww');
        console.log(`\n        ${cor}🩸 Apagando DM com:${reset} ${dm.recipient.globalName || dm.recipient.username}\n`);
        console.log(`${cor}${progresso}${reset} | ${porcentagem.toFixed(2)}% | ${contador_msgs}/${msgs.length} mensagens | ${contador}/${dms.length} DMs\n`);
      }).catch(() => { })
    }
    if (fechar) await dm.delete().catch(() => { });
  }
  
  console.log(`\n${sucesso}[✓] Todas as DMs foram processadas!${reset}`);
  await sleep(2);
  menu(client);
}

async function removerAmigos() {
  console.clear();
  criarConfig();

  process.title = 'Bloodhound | Remover amigos';
  const amigos = client.relationships.cache.filter(value => value === 1).map((value, key) => key);
  let contador = 0;

  if (!amigos.length) {
    console.clear();
    console.log(`${erro}[X] Você não tem amigos :(${reset}`);
    await sleep(3.5);
    menu(client);
  }

  for (const amigo of amigos) {
    await sleep(parseFloat(config.delay) || 1);
    const user = await client.users.fetch(amigo).catch(() => { });
    await client.relationships.deleteRelationship(user).then(async () => {
      contador++;
      process.title = `Bloodhound | Remover amigos | ${contador}/${amigos.length} amigos removidos`;
      const porcentagem = ((contador) / amigos.length) * 100;
      const progresso = '[' + '█'.repeat(Math.floor(porcentagem / 2)) + '░'.repeat(50 - Math.floor(porcentagem / 2)) + ']';

      console.clear();
      await updatePresence({
        details: `Removendo amigos ${contador}/${amigos.length} [${Math.round(porcentagem)}%]`,
      });
      await titulo(client?.user?.username || 'a', client?.user?.id || 'ww');
      console.log(`\n${cor}${progresso}${reset} | ${porcentagem.toFixed(2)}% | ${contador}/${amigos.length} amigos removidos\n`);
    }).catch(() => { });
  }

  console.log(`\n${sucesso}[✓] Amigos removidos com sucesso!${reset}`);
  await sleep(2);
  menu(client);
}

async function removerServidores() {
  console.clear();
  criarConfig();

  process.title = 'Bloodhound | Remover servidores';
  const servers = client.guilds.cache.map(a => a);
  let contador = 0;

  if (!servers.length) {
    console.clear();
    console.log(`${erro}[X] Você não está em nenhum servidor.${reset}`);
    await sleep(3.5);
    menu(client);
  }

  for (const server of servers) {
    await sleep(parseFloat(config.delay) || 1);
    await server.leave().then(async () => {
      contador++;
      process.title = `Bloodhound | Remover servidores | ${contador}/${servers.length} servidores removidos`;
      const porcentagem = ((contador) / servers.length) * 100;
      const progresso = '[' + '█'.repeat(Math.floor(porcentagem / 2)) + '░'.repeat(50 - Math.floor(porcentagem / 2)) + ']';
      await updatePresence({
        details: `Removendo servidores ${contador}/${servers.length} [${Math.round(porcentagem)}%]`,
      });
      console.clear();
      await titulo(client?.user?.username || 'a', client?.user?.id || 'ww');
      console.log(`\n${cor}${progresso}${reset} | ${porcentagem.toFixed(2)}% | ${contador}/${servers.length} servidores removidos\n`);
    }).catch(() => { });
  }

  console.log(`\n${sucesso}[✓] Servidores removidos com sucesso!${reset}`);
  await sleep(2);
  menu(client);
}

async function fecharDMs() {
  console.clear();
  criarConfig();

  process.title = 'Bloodhound | Fechar DMs';
  const dms = await client.channels.cache.filter(c => c.type == "DM").map(a => a);
  let contador = 0;

  if (!dms.length) {
    console.clear();
    console.log(`${erro}[X] Você não tem DMs abertas.${reset}`);
    await sleep(3.5);
    menu(client);
  }

  for (const dm of dms) {
    await sleep(1.3);
    await dm.delete().then(async () => {
      contador++;
      process.title = `Bloodhound | Fechar DMs | ${contador}/${dms.length} DMs fechadas`;
      const porcentagem = ((contador) / dms.length) * 100;
      const progresso = '[' + '█'.repeat(Math.floor(porcentagem / 2)) + '░'.repeat(50 - Math.floor(porcentagem / 2)) + ']';
      await updatePresence({
        details: `Fechando DMs ${contador}/${dms.length} [${Math.round(porcentagem)}%]`,
      });
      console.clear();
      await titulo(client?.user?.username || 'a', client?.user?.id || 'ww');
      console.log(`\n${cor}${progresso}${reset} | ${porcentagem.toFixed(2)}% | ${contador}/${dms.length} DMs fechadas\n`);
    }).catch(() => { });
  }

  console.log(`\n${sucesso}[✓] DMs fechadas com sucesso!${reset}`);
  await sleep(2);
  menu(client);
}

async function configurar() {
  console.clear();
  criarConfig();

  process.title = 'Bloodhound | Configuração';
  await titulo(client?.user?.username || 'a', client?.user?.id || 'ww');

  console.log(`
        ${cor}🩸 [1]${reset} Mudar delay
        ${cor}🩸 [2]${reset} Mudar cor do painel
        ${cor}🩸 [3]${reset} Voltar
  `);

  const opcoes = {
    "1": async () => {
      console.clear();
      console.log(`${cor}🩸 Insira o delay em segundos (ex: 1.5 para 1 segundo e meio):${reset}`);
      const delayInput = readlineSync.question(`${cor}🩸 > ${reset}`);

      const delayInSeconds = parseFloat(delayInput);
      if (isNaN(delayInSeconds) || delayInSeconds <= 0) {
        console.clear();
        console.log(`${erro}[X] Isso não é um delay válido.${reset}`);
        await sleep(3.5);
      } else {
        const currentConfig = JSON.parse(fs.readFileSync('config.json'));
        currentConfig.delay = delayInSeconds.toString();
        fs.writeFileSync('config.json', JSON.stringify(currentConfig, null, 4));
        console.log(`\n${sucesso}[✓] Delay alterado para ${delayInSeconds} segundos!${reset}`);
        await sleep(1.5);
      }
    },
    "2": async () => {
      console.clear();
      console.log(`${cor}🩸 Insira a cor em formato HEX (ex: #ff0000):${reset}`);
      const cor = readlineSync.question(`${cor}🩸 > ${reset}`);

      try {
        const cor_convertida = hex(cor);
        const currentConfig = JSON.parse(fs.readFileSync('config.json'));
        currentConfig.cor_painel = cor;
        fs.writeFileSync('config.json', JSON.stringify(currentConfig, null, 4));
        console.clear();
        console.log(`${sucesso}[✓] Cor trocada com sucesso! Reinicie o programa.${reset}`);
        await sleep(3);
        process.exit(0);
      } catch {
        console.clear();
        console.log(`${erro}[X] Isso não é uma cor HEX válida.${reset}`);
        await sleep(3.5);
      }
    },
    "3": async () => {
      menu(client);
    },
    "default": async () => {
      console.clear();
      console.log(`${erro}[X] Opção inválida, tente novamente.${reset}`);
      await sleep(1.5);
    }
  };

  const opcao = readlineSync.question(`${cor}🩸 > ${reset}`);
  await (opcoes[opcao] || opcoes["default"])();
  await configurar();
}

async function userInfo() {
  console.clear();
  process.title = "Bloodhound | Informações do Usuário";

  await titulo(client.user.username, client.user.id);
  
  try {
    const dmsAbertas = client.channels.cache.filter(c => c.type === "DM").size;
    
    console.log(`
    ${reset}├─>${cor} 🩸 Usuário:${reset} ${client.user.username}
    ${reset}├─>${cor} 🩸 ID:${reset} ${client.user.id}
    ${reset}├─>${cor} 🩸 DMs abertas:${reset} ${dmsAbertas}
    ${reset}├─>${cor} 🩸 Servidores:${reset} ${client.guilds.cache.size}
    ${reset}├─>${cor} 🩸 Amigos:${reset} ${client.relationships.cache.filter(r => r.type === 1).size}
    ${reset}└─>${cor} 🩸 Criada em:${reset} ${client.user.createdAt.toLocaleDateString()}
    `);
  } catch (error) {
    console.log(`${erro}[X] Erro ao buscar informações.${reset}`);
  }
  
  readlineSync.question(`\n${cor}🩸 >${reset} Aperte ${cor}ENTER${reset} para voltar`);
  menu(client);
}

async function menu(client) {
  await updatePresence(theme);
  process.title = `Bloodhound | Menu | v${VERSAO_ATUAL}`;
  console.clear();

  await titulo(client?.user?.username || 'Bloodhound', client?.user?.id || 'N/A');
  
  if (await checarUpdates()) {
    console.log(`        ${cor}🩸 [!] Há uma atualização disponível!${reset}`);
  }

  console.log(`\n`);
  console.log(`        ${cor}🩸 [1]${reset} Apagar DM única`);
  console.log(`        ${cor}🩸 [2]${reset} Apagar DMs abertas`);
  console.log(`        ${cor}🩸 [3]${reset} Remover amigos`);
  console.log(`        ${cor}🩸 [4]${reset} Remover servidores`);
  console.log(`        ${cor}🩸 [5]${reset} Fechar DMs`);
  console.log(`        ${cor}🩸 [6]${reset} Informações da conta`);
  console.log(`        ${cor}🩸 [7]${reset} Configurações`);
  console.log(`        ${cor}🩸 [8]${reset} Sair`);
  console.log(`\n`);

  const opcao = readlineSync.question(`${cor}🩸 > ${reset}`);
  switch (opcao) {
    case '1':
      await clearUnica();
      break;
    case '2':
      await clearAbertas();
      break;
    case '3':
      await removerAmigos();
      break;
    case '4':
      await removerServidores();
      break;
    case '5':
      await fecharDMs();
      break;
    case '6':
      await userInfo();
      break;
    case '7':
      await configurar();
      break;
    case '8':
      console.clear();
      console.log(`${cor}🩸 Bloodhound encerrado. Até mais! 🩸${reset}`);
      process.exit(0);
      break;
    default:
      console.clear();
      console.log(`${erro}[X] Opção inválida, tente novamente.${reset}`);
      await sleep(1.5);
      await menu(client);
      break;
  }
}

async function checarUpdates() {
  try {
    const response = await fetch("https://api.github.com/repos/seu-usuario/bloodhound/releases/latest");
    const data = await response.json();
    return data.tag_name !== VERSAO_ATUAL;
  } catch {
    return false;
  }
}

async function iniciarCliente() {
  try {
    const config = JSON.parse(fs.readFileSync('config.json'));
    await client.login(config.token);
    menu(client);
  } catch {
    console.log(`${erro}[X] Falha ao fazer login, verifique seu token.${reset}`);
    await pedirToken();
    await iniciarCliente();
  }
}

console.clear();
console.log(`${cor}🩸 Iniciando Bloodhound... 🩸${reset}`);
verificarToken().then(() => {
  iniciarCliente();
});
