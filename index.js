const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let teclas = {};
document.addEventListener("keydown", e => teclas[e.key] = true);
document.addEventListener("keyup", e => teclas[e.key] = false);

const jogador = {
    x: canvas.width / 2 - 30,
    y: canvas.height - 120,
    w: 60,
    h: 100,
    velocidade: 7,
    cor: "cyan",
    podeAtirar: true
};

let tirosJogador = [];
let tirosInimigos = [];
let inimigos = [];
let pontuacao = 0;
let jogoRodando = true;
let botaoReiniciar;

function gerarInimigo() {
    inimigos.push({
        x: Math.random() * (canvas.width - 60),
        y: -120,
        w: 60,
        h: 100,
        velocidade: 2 + Math.random() * 1.5,
        cor: "red",
        tempoTiro: 50 + Math.random() * 120
    });
}

let tempoSpawn = 2000;
let minimoSpawn = 300;
let reducao = 50;

function iniciarSpawnDinamico() {
    setInterval(() => {
        gerarInimigo();
        if (tempoSpawn > minimoSpawn) tempoSpawn -= reducao;
    }, tempoSpawn);
}
iniciarSpawnDinamico();

function moverJogador() {
    if (teclas["ArrowLeft"] && jogador.x > 0) jogador.x -= jogador.velocidade;
    if (teclas["ArrowRight"] && jogador.x < canvas.width - jogador.w) jogador.x += jogador.velocidade;
    if (teclas["ArrowUp"] && jogador.y > 0) jogador.y -= jogador.velocidade;
    if (teclas["ArrowDown"] && jogador.y < canvas.height - jogador.h) jogador.y += jogador.velocidade;
    if (teclas["a"] && jogador.x > 0) jogador.x -= jogador.velocidade;
    if (teclas["d"] && jogador.x < canvas.width - jogador.w) jogador.x += jogador.velocidade;
    if (teclas["w"] && jogador.y > 0) jogador.y -= jogador.velocidade;
    if (teclas["s"] && jogador.y < canvas.height - jogador.h) jogador.y += jogador.velocidade;

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
        setTimeout(() => jogador.podeAtirar = true, 500);
    }
}

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
    tirosJogador = tirosJogador.filter(t => t.y > -50);

    tirosInimigos.forEach(t => t.y += t.velocidade);
    tirosInimigos = tirosInimigos.filter(t => t.y < canvas.height + 50);
}

function colisao(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

function desenhar(obj) {
    ctx.fillStyle = obj.cor;
    ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
}

function explosao(x, y, tamanho) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, tamanho, 0, Math.PI * 2);
    ctx.fill();
}

function desenharHUD() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Pontuação: " + pontuacao, 20, 40);
}

function gameLoop() {
    if (!jogoRodando) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moverJogador();
    moverInimigos();
    moverTiros();

    desenhar(jogador);

    inimigos.forEach((i, idx) => {
        desenhar(i);

        tirosJogador.forEach((t, tidx) => {
            if (colisao(t, i)) {
                explosao(i.x + i.w / 2, i.y + i.h / 2, 30);
                inimigos.splice(idx, 1);
                tirosJogador.splice(tidx, 1);
                pontuacao += 10;
            }
        });

        if (colisao(jogador, i)) {
            fimDeJogo();
            return;
        }
    });

    tirosJogador.forEach(t => desenhar(t));
    tirosInimigos.forEach(t => {
        desenhar(t);
        if (colisao(jogador, t)) {
            fimDeJogo();
            return;
        }
    });

    desenharHUD();
    requestAnimationFrame(gameLoop);
}

function fimDeJogo() {
    jogoRodando = false;

    ctx.fillStyle = "white";
    ctx.font = "70px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 200, canvas.height / 2);
    ctx.font = "40px Arial";
    ctx.fillText("Pontuação: " + pontuacao, canvas.width / 2 - 80, canvas.height / 2 + 60);

    if (!botaoReiniciar) {
        botaoReiniciar = document.createElement("button");
        botaoReiniciar.innerText = "Reiniciar";
        botaoReiniciar.style.position = "absolute";
        botaoReiniciar.style.top = (canvas.offsetTop + canvas.height / 2 + 120) + "px";
        botaoReiniciar.style.left = (canvas.offsetLeft + canvas.width / 2 - 50) + "px";
        botaoReiniciar.style.padding = "12px 20px";
        botaoReiniciar.style.fontSize = "20px";
        document.body.appendChild(botaoReiniciar);

        botaoReiniciar.addEventListener("click", reiniciar);
    }
}

function reiniciar() {
    pontuacao = 0;
    inimigos = [];
    tirosJogador = [];
    tirosInimigos = [];

    jogador.x = canvas.width / 2 - 30;
    jogador.y = canvas.height - 120;
    jogador.podeAtirar = true;

    botaoReiniciar.remove();
    botaoReiniciar = null;

    jogoRodando = true;
    gameLoop();
}

gameLoop();
