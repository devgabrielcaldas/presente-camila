// Seletores
const song = document.getElementById('song');
const gate = document.getElementById('gate');
const enterBtn = document.getElementById('enterBtn');
const togglePlay = document.getElementById('togglePlay');
const toggleMute = document.getElementById('toggleMute');

// NOVOS seletores do modal 2
const loveModal = document.getElementById('loveModal');
const loveInput  = document.getElementById('loveInput');
const loveSubmit = document.getElementById('loveSubmit');
const loveError  = document.getElementById('loveError');

// util: normaliza texto (remove acentos, espaços extras, caixa)
const norm = (s) => s
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .trim()
  .toLowerCase();

/* 1) Clique no "Abrir presente" (primeiro modal):
      - fecha o #gate
      - abre o modal #loveModal */
// Quando clica em "Abrir presente"
enterBtn.addEventListener('click', () => {
  gate.style.opacity = '0';
  gate.style.pointerEvents = 'none';
  setTimeout(() => (gate.style.display = 'none'), 200);

  // Ativa o lock (esconde o resto da página)
  document.body.setAttribute('data-locked', 'true');

  loveModal.hidden = false;
  setTimeout(() => loveInput.focus(), 50);
});

// Quando envia "te amo"
loveSubmit.addEventListener('click', async () => {
  const value = norm(loveInput.value);
  if (value === 'te amo') {
    loveModal.hidden = true;

    // Libera o conteúdo novamente
    document.body.removeAttribute('data-locked');

    try {
      await song.play();
    } catch (e) {
      console.warn(e);
    }
  } else {
    loveError.hidden = false;
    const box = document.querySelector('.love-content');
    box.classList.remove('shake');
    void box.offsetWidth;
    box.classList.add('shake');
    loveInput.focus();
  }
});

/* 2) Habilita o botão "Enviar" quando digitar algo */
loveInput.addEventListener('input', () => {
  loveSubmit.disabled = loveInput.value.trim().length === 0;
  if (!loveSubmit.disabled) {
    loveError.hidden = true;
    document.querySelector('.love-content')?.classList.remove('shake');
  }
});

/* 3) Valida "te amo" e libera o presente */
loveSubmit.addEventListener('click', async () => {
  const value = norm(loveInput.value);
  if (value === 'te amo') {
    // fecha o modal de amor
    loveModal.hidden = true;

    // toca a música e mostra a página
    try { await song.play(); } catch (e) { console.warn(e); }
  } else {
    loveError.hidden = false;
    const box = document.querySelector('.love-content');
    box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
    loveInput.focus();
  }
});

// 2) Controles simples
togglePlay.addEventListener('click', async () => {
  if (song.paused) {
    try { await song.play(); } catch(e){ console.warn(e); }
  } else {
    song.pause();
  }
});

toggleMute.addEventListener('click', () => {
  song.muted = !song.muted;
  toggleMute.textContent = song.muted ? '🔈' : '🔇';
});

// 3) Efeito de partículas roxas no fundo (discreto)
const canvas = document.getElementById('fxCanvas');
const ctx = canvas.getContext('2d');
let w, h, sparks;

function resize(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  // Recria partículas ao redimensionar
  sparks = createSparks(50); // quantidade moderada
}
window.addEventListener('resize', resize);

function createSparks(n){
  const arr = [];
  for(let i=0;i<n;i++){
    arr.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.8 + 0.6,
      a: Math.random()*Math.PI*2,
      spd: Math.random()*0.4 + 0.1,
      alpha: Math.random()*0.6 + 0.2
    });
  }
  return arr;
}

function tick(){
  ctx.clearRect(0,0,w,h);
  for(const s of sparks){
    s.x += Math.cos(s.a) * s.spd;
    s.y += Math.sin(s.a) * s.spd;
    s.alpha += (Math.random() - 0.5) * 0.02;

    // wrap nas bordas
    if(s.x<0) s.x=w; if(s.x>w) s.x=0;
    if(s.y<0) s.y=h; if(s.y>h) s.y=0;

    // desenha
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(155,107,255,${Math.max(0.05, Math.min(0.5, s.alpha))})`;
    ctx.fill();
  }
  requestAnimationFrame(tick);
}

resize();
tick();
