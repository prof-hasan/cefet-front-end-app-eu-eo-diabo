const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");

/* =====================
   ESTADO DO JOGO
===================== */
let pausado = false;
let gameOver = false;
let recorde = localStorage.getItem("recorde") || 0;
document.getElementById("recorde").textContent =
  "🏅 Seu recorde: " + recorde;
  let ultimoPowerUp = 0;
/* =====================
   HUD
===================== */
let vidas = 3;
let pontuacao = 0;

/* =====================
   JOGADOR
===================== */
const jogadorInicial = () => ({
  x: 60,
  y: canvas.height / 2 - 25,
  largura: 50,
  altura: 50,
  velocidade: 6,
  invencivel: false
});

let jogador = jogadorInicial();

/* =====================
   CONTROLES
===================== */
const teclas = {};

document.addEventListener("keydown", e => {
  teclas[e.key] = true;

  if (e.key === "p" && !gameOver) {
    pausado = !pausado;
    document.getElementById("pausa").style.display =
      pausado ? "flex" : "none";
  }

  if (gameOver && e.key === "r") reiniciarJogo();
});

document.addEventListener("keyup", e => teclas[e.key] = false);

/* =====================
   TIROS
===================== */
let tiros = [];
let LIMITE_TIROS = 4;
let INTERVALO_TIRO = 300;
let ultimoTiro = 0;

function atirar() {
  const agora = Date.now();
  if (agora - ultimoTiro < INTERVALO_TIRO) return;
  if (tiros.length >= LIMITE_TIROS) return;

  tiros.push({
    x: jogador.x + jogador.largura,
    y: jogador.y + jogador.altura / 2 - 2,
    largura: 10,
    altura: 4,
    velocidade: 9,
    ativo: true
  });

  ultimoTiro = agora;
}

/* =====================
   INIMIGOS
===================== */
let inimigos = [];
let ultimoInimigo = 0;

function criarInimigo() {
  inimigos.push({
    x: canvas.width,
    y: Math.random() * (canvas.height - 40),
    largura: 40,
    altura: 40,
    velocidade: 3 + pontuacao * 0.005, // CONTROLE AQUI
    ativo: true
  });
}

/* =====================
   POWER-UP (TIRO RÁPIDO)
===================== */
let powerUps = [];

function criarPowerUp() {
  powerUps.push({
    x: canvas.width,
    y: Math.random() * (canvas.height - 25),
    largura: 25,
    altura: 25,
    velocidade: 3,
    ativo: true
  });
}

/* =====================
   COLISÃO
===================== */
function colide(a, b) {
  return (
    a.x < b.x + b.largura &&
    a.x + a.largura > b.x &&
    a.y < b.y + b.altura &&
    a.y + a.altura > b.y
  );
}

/* =====================
   DANO NO JOGADOR
===================== */
function causarDano() {
  if (jogador.invencivel) return;

  vidas--;
  jogador.invencivel = true;

  setTimeout(() => jogador.invencivel = false, 1500);

  if (vidas <= 0) {
    if (pontuacao > recorde) {
  recorde = pontuacao;
  localStorage.setItem("recorde", recorde);
  document.getElementById("recorde").textContent =
    "🏅 Seu recorde: " + recorde;
}
    gameOver = true;
    document.getElementById("gameover").style.display = "flex";
  }
}

/* =====================
   REINICIAR
===================== */
function reiniciarJogo() {
  vidas = 3;
  pontuacao = 0;
  jogador = jogadorInicial();
  tiros = [];
  inimigos = [];
  powerUps = [];
  pausado = false;
  gameOver = false;
  LIMITE_TIROS = 4;
  INTERVALO_TIRO = 300;

  document.getElementById("pausa").style.display = "none";
  document.getElementById("gameover").style.display = "none";
}

/* =====================
   UPDATE
===================== */
function atualizar() {
  if (pausado || gameOver) return;

  // Movimento vertical
  if ((teclas["ArrowUp"] || teclas["w"]) && jogador.y > 0)
    jogador.y -= jogador.velocidade;

  if ((teclas["ArrowDown"] || teclas["s"]) &&
      jogador.y < canvas.height - jogador.altura)
    jogador.y += jogador.velocidade;

  if (teclas[" "]) atirar();

  // Tiros
  tiros.forEach(t => t.x += t.velocidade);

  // Inimigos
  if (Date.now() - ultimoInimigo > 1000) {
    criarInimigo();
    ultimoInimigo = Date.now();
  }
  inimigos.forEach(i => i.x -= i.velocidade);

  // Power-up aleatório
  if (Math.random() < 0.0010) criarPowerUp();
  powerUps.forEach(p => p.x -= p.velocidade);

  // Colisão tiro x inimigo
  tiros.forEach(t => {
  inimigos.forEach(i => {
    if (t.ativo && i.ativo && colide(t, i)) {
      t.ativo = false;
      i.ativo = false;
      pontuacao += 10;
      atualizarPontuacao();
    }
  });
});
  // Colisão jogador x inimigo
  inimigos.forEach(i => {
    if (i.ativo && colide(jogador, i)) {
      i.ativo = false;
      causarDano();
    }
  });

  // Colisão jogador x power-up
  powerUps.forEach(p => {
    if (p.ativo && colide(jogador, p)) {
      p.ativo = false;

      LIMITE_TIROS = 7;
      INTERVALO_TIRO = 120;

      setTimeout(() => {
        LIMITE_TIROS = 4;
        INTERVALO_TIRO = 300;
      }, 5000);
    }
  });

  // Limpeza
  tiros = tiros.filter(t => t.ativo && t.x < canvas.width);
  inimigos = inimigos.filter(i => i.ativo && i.x + i.largura > 0);
  powerUps = powerUps.filter(p => p.ativo && p.x + p.largura > 0);
}

/* =====================
   DRAW
===================== */
function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Jogador
  ctx.fillStyle = jogador.invencivel ? "yellow" : "#00ffcc";
  ctx.fillRect(jogador.x, jogador.y, jogador.largura, jogador.altura);

  // Tiros
  ctx.fillStyle = "white";
  tiros.forEach(t =>
    ctx.fillRect(t.x, t.y, t.largura, t.altura)
  );

  // Inimigos
  ctx.fillStyle = "red";
  inimigos.forEach(i =>
    ctx.fillRect(i.x, i.y, i.largura, i.altura)
  );

  // Power-ups
  ctx.fillStyle = "#00ff00";
  powerUps.forEach(p =>
    ctx.fillRect(p.x, p.y, p.largura, p.altura)
  );

  // HUD no canvas
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Vidas: " + vidas, 20, 30);
  ctx.fillText("Pontos: " + pontuacao, 20, 55);
}

/* =====================
   LOOP
===================== */
function loop() {
  atualizar();
  desenhar();
  requestAnimationFrame(loop);
}
function carregarRanking() {
  fetch("ranking.json")
    .then(res => res.json())
    .then(dados => {
      const ul = document.getElementById("lista-ranking");
      ul.innerHTML = "";

      dados.forEach(jogador => {
        const li = document.createElement("li");
        li.textContent = `${jogador.nome} — ${jogador.pontos} pts`;
        ul.appendChild(li);
      });
    })
}
function atualizarPontuacao() {
  document.getElementById("pontuacao").textContent =
    "Pontuação: " + pontuacao;
}
carregarRanking();
pontuacao = 0;
atualizarPontuacao();
loop();