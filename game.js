/* ================= CONFIGURAÇÃO DO CARRO ================= */
let configCarro = {
  cor: "#00ffff",
  roda: "normal"
};
/* ================= Melhor Pontuação ================= */
let recorde = 0;

fetch("http://localhost:3000/score")
  .then(res => res.json())
  .then(data => recorde = data.recorde);
/* ================= TELAS ================= */
const telaCustom = document.getElementById("customizacao");
const telaJogo = document.getElementById("jogo");

const carroPreview = document.getElementById("carroPreview");
const rodasPreview = document.querySelectorAll(".roda");

btnJogar.onclick = () => {
  telaCustom.style.display = "none";
  telaJogo.style.display = "block";
  iniciarJogo();
};

btnCustomizar.onclick = () => {
  telaJogo.style.display = "none";
  telaCustom.style.display = "block";
};

/* ================= CUSTOMIZAÇÃO ================= */
corCarro.oninput = e => {
  configCarro.cor = e.target.value;
  carroPreview.style.background = configCarro.cor;
};

tipoRoda.onchange = e => {
  configCarro.roda = e.target.value;
  rodasPreview.forEach(r =>
    r.classList.toggle("esportiva", configCarro.roda === "esportiva")
  );
};

/* ================= CANVAS ================= */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

/* ================= TECLADO ================= */
let teclas = {};
document.addEventListener("keydown", e => teclas[e.key] = true);
document.addEventListener("keyup", e => teclas[e.key] = false);

/* ================= JOGADOR ================= */
const jogador = {
  x: 0,
  y: 0,
  w: 60,
  h: 100,
  velocidade: 7,
  podeAtirar: true
};

/* ================= ESTADO ================= */
let tirosJogador = [];
let tirosInimigos = [];
let inimigos = [];
let pontuacao = 0;
let jogoRodando = true;
let botaoReiniciar;

/* ================= INIMIGOS ================= */
function gerarInimigo() {
  inimigos.push({
    x: Math.random() * (canvas.width - 60),
    y: -120,
    w: 60,
    h: 100,
    velocidade: 2 + Math.random() * 1.5,
    cor: corOposta(configCarro.cor),
    tempoTiro: 50 + Math.random() * 120
  });
}

let tempoSpawn = 2000;
let minimoSpawn = 300;
let reducao = 50;

function iniciarSpawnDinamico() {
  setInterval(() => {
    if (jogoRodando) gerarInimigo();
    if (tempoSpawn > minimoSpawn) tempoSpawn -= reducao;
  }, tempoSpawn);
}
iniciarSpawnDinamico();

/* ================= MOVIMENTOS ================= */
function moverJogador() {
  if ((teclas["ArrowLeft"] || teclas["a"]) && jogador.x > 0)
    jogador.x -= jogador.velocidade;

  if ((teclas["ArrowRight"] || teclas["d"]) && jogador.x < canvas.width - jogador.w)
    jogador.x += jogador.velocidade;

  if ((teclas["ArrowUp"] || teclas["w"]) && jogador.y > 0)
    jogador.y -= jogador.velocidade;

  if ((teclas["ArrowDown"] || teclas["s"]) && jogador.y < canvas.height - jogador.h)
    jogador.y += jogador.velocidade;

  if (teclas[" "] && jogador.podeAtirar) {
    tirosJogador.push({
      x: jogador.x + jogador.w / 2 - 5,
      y: jogador.y - 10,
      w: 10,
      h: 20,
      velocidade: 10,
      cor: "yellow"
    });
    jogador.podeAtirar = false;
    setTimeout(() => jogador.podeAtirar = true, 400);
  }
}

/* ================= MOBILE ================= */
esq.ontouchstart = () => teclas["ArrowLeft"] = true;
esq.ontouchend = () => teclas["ArrowLeft"] = false;

dir.ontouchstart = () => teclas["ArrowRight"] = true;
dir.ontouchend = () => teclas["ArrowRight"] = false;

tiro.ontouchstart = () => teclas[" "] = true;
tiro.ontouchend = () => teclas[" "] = false;

function isMobile() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

if (!isMobile()) {
  const controles = document.querySelector(".controles");
  if (controles) controles.style.display = "none";
}

/* ================= INIMIGOS / TIROS ================= */
function moverInimigos() {
  inimigos.forEach(i => {
    i.y += i.velocidade;
    i.tempoTiro--;

    if (i.tempoTiro <= 0) {
      tirosInimigos.push({
        x: i.x + i.w / 2 - 5,
        y: i.y + i.h,
        w: 10,
        h: 20,
        velocidade: 7,
        cor: "orange"
      });
      i.tempoTiro = 60 + Math.random() * 100;
    }
  });

  inimigos = inimigos.filter(i => i.y < canvas.height + 200);
}

function moverTiros() {
  tirosJogador.forEach(t => t.y -= t.velocidade);
  tirosInimigos.forEach(t => t.y += t.velocidade);

  tirosJogador = tirosJogador.filter(t => t.y > -50);
  tirosInimigos = tirosInimigos.filter(t => t.y < canvas.height + 50);
}
function corOposta(hex) {
  hex = hex.replace("#", "");

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = 255 - r;
  g = 255 - g;
  b = 255 - b;

  return `rgb(${r}, ${g}, ${b})`;
}
/* ================= COLISÃO ================= */
function colisao(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/* ================= DESENHO ================= */
function desenharCarro() {
  ctx.fillStyle = configCarro.cor;
  ctx.fillRect(jogador.x, jogador.y, jogador.w, jogador.h);

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(jogador.x + 12, jogador.y + jogador.h - 5, 8, 0, Math.PI * 2);
  ctx.arc(jogador.x + jogador.w - 12, jogador.y + jogador.h - 5, 8, 0, Math.PI * 2);
  ctx.fill();
}

function desenhar(obj) {
  ctx.fillStyle = obj.cor;
  ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
}

function desenharHUD() {
  ctx.fillStyle = "white";
  ctx.font = "26px Arial";
  ctx.textAlign = "right";
  ctx.fillText("Pontuação: " + pontuacao, canvas.width - 20, 40);
  ctx.fillText("Recorde: " + recorde, canvas.width - 20, 70);
  ctx.textAlign = "left"; // reset
}

/* ================= GAME LOOP ================= */
function gameLoop() {
  if (!jogoRodando) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  moverJogador();
  moverInimigos();
  moverTiros();

  desenharCarro();

  inimigos.forEach((i, idx) => {
    desenhar(i);

    tirosJogador.forEach((t, tidx) => {
      if (colisao(t, i)) {
        inimigos.splice(idx, 1);
        tirosJogador.splice(tidx, 1);
        pontuacao += 10;
      }
    });

    if (colisao(jogador, i)) fimDeJogo();
  });

  tirosJogador.forEach(t => desenhar(t));
  tirosInimigos.forEach(t => {
    desenhar(t);
    if (colisao(jogador, t)) fimDeJogo();
  });

  desenharHUD();
  requestAnimationFrame(gameLoop);
}

/* ================= INICIO / FIM / RESET ================= */
function iniciarJogo() {
  jogador.x = canvas.width / 2 - jogador.w / 2;
  jogador.y = canvas.height - 140;
  inimigos = [];
  tirosJogador = [];
  tirosInimigos = [];
  pontuacao = 0;
  jogoRodando = true;
}

function fimDeJogo() {
  if (!jogoRodando) return;

  jogoRodando = false;

  ctx.fillStyle = "white";
  ctx.font = "60px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2 - 180, canvas.height / 2);
  ctx.font = "30px Arial";
  ctx.fillText(
    "Pontuação: " + pontuacao,
    canvas.width / 2 - 90,
    canvas.height / 2 + 50
  );
  fetch("http://localhost:3000/score", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ pontos: pontuacao })
    });

  if (!botaoReiniciar) {
    botaoReiniciar = document.createElement("button");
    botaoReiniciar.innerText = "🔁 Resetar";
    botaoReiniciar.style.position = "fixed";
    botaoReiniciar.style.left = "50%";
    botaoReiniciar.style.top = "60%";
    botaoReiniciar.style.transform = "translateX(-50%)";
    botaoReiniciar.style.padding = "15px 30px";
    botaoReiniciar.style.fontSize = "20px";
    botaoReiniciar.style.borderRadius = "10px";
    botaoReiniciar.style.zIndex = "999";

    document.body.appendChild(botaoReiniciar);

    botaoReiniciar.onclick = reiniciar;
  }
}

gameLoop();
