(function(){
  const $ = (sel) => document.querySelector(sel);
  const on = (el, evt, fn) => el.addEventListener(evt, fn);

  const sectionGreeting = $('#section-greeting');
  const sectionDob = $('#section-dob');
  const sectionGift = $('#section-gift');
  const sectionMessage = $('#section-message');
  const tapToSee = $('#tap-to-see');
  const giftBox = $('#gift-box');
  const dobInput = $('#dob-input');
  const dobSubmit = $('#dob-submit');
  const messageContainer = $('#message-container');
  const replayBtn = $('#replay');
  const confettiCanvas = $('#confetti-canvas');
  const fireworksCanvas = $('#fireworks-canvas');
  const musicEl = $('#bg-music');
  const musicToggle = $('#music-toggle');

  // Provide a royalty-free ambient track via data URI fallback if network blocked
  // Music setup - use your exact file path
  const preferredSrc = 'file:///C:/Users/Dell/Downloads/I Wanna Be Yours Song Download Ringtone - MobCup.Com.Co.mp3';
  const fallbackSrc = 'https://cdn.pixabay.com/download/audio/2022/08/10/audio_2f0d3b9f36.mp3?filename=romantic-ambient-116199.mp3';
  
  // Set source immediately and add error handling
  musicEl.src = preferredSrc;
  musicEl.addEventListener('error', () => {
    console.log('Local music failed, trying fallback...');
    musicEl.src = fallbackSrc;
  });
  musicEl.addEventListener('canplaythrough', () => {
    console.log('Music loaded successfully');
  });

  let musicEnabled = false;
  function tryStartMusic(){
    if (musicEnabled) return;
    musicEl.volume = 0.3;
    musicEl.play().then(()=>{
      musicEnabled = true;
      musicToggle.hidden = false;
      musicToggle.textContent = '♪';
      console.log('Music started playing');
    }).catch((err)=>{
      console.log('Music play failed:', err);
      musicToggle.hidden = false;
      musicToggle.textContent = '♪';
      musicToggle.style.background = '#ff6b6b';
    });
  }

  on(musicToggle, 'click', ()=>{
    if (!musicEnabled) return tryStartMusic();
    if (musicEl.paused) { musicEl.play(); musicToggle.textContent = '♪'; }
    else { musicEl.pause(); musicToggle.textContent = '✕'; }
  });

  // Simple helpers
  function show(el){ el.classList.remove('hidden'); el.classList.add('visible'); }
  function hide(el){ el.classList.remove('visible'); el.classList.add('hidden'); }

  // Confetti effect (lightweight)
  const confettiCtx = confettiCanvas.getContext('2d');
  let confettiPieces = [];
  function spawnConfettiBurst(x, y, count = 80){
    const colors = ['#ff7eb3','#ffd166','#7ee8fa','#80ff72','#b388ff'];
    for (let i=0;i<count;i++){
      confettiPieces.push({
        x, y,
        vx: (Math.random()-0.5)*6,
        vy: -Math.random()*6 - 2,
        size: Math.random()*6 + 4,
        color: colors[Math.floor(Math.random()*colors.length)],
        life: 0,
        ttl: 180 + Math.random()*60
      });
    }
  }

  function updateConfetti(){
    confettiCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    confettiPieces = confettiPieces.filter(p=>p.life < p.ttl);
    for (const p of confettiPieces){
      p.life++;
      p.vy += 0.05;
      p.x += p.vx;
      p.y += p.vy;
      confettiCtx.fillStyle = p.color;
      confettiCtx.globalAlpha = 1 - p.life/p.ttl;
      confettiCtx.fillRect(p.x, p.y, p.size, p.size);
    }
    confettiCtx.globalAlpha = 1;
    requestAnimationFrame(updateConfetti);
  }

  // Fireworks effect for finale
  const fwCtx = fireworksCanvas.getContext('2d');
  let fireworks = [];
  function launchFirework(){
    const startX = Math.random()*fireworksCanvas.width;
    const startY = fireworksCanvas.height + 10;
    const peakY = 80 + Math.random()* (fireworksCanvas.height*0.4);
    const color = `hsl(${Math.floor(Math.random()*360)}, 100%, 60%)`;
    fireworks.push({
      x: startX, y: startY, vy: - (4 + Math.random()*3), peakY, exploded:false, color, particles:[]
    });
  }
  function explodeAt(fw){
    const count = 90 + Math.floor(Math.random()*40);
    for (let i=0;i<count;i++){
      const angle = Math.random()*Math.PI*2;
      const speed = Math.random()*4 + 1;
      fw.particles.push({
        x: fw.x, y: fw.y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
        life: 0, ttl: 80 + Math.random()*40, color: fw.color
      });
    }
  }
  function updateFireworks(){
    fwCtx.fillStyle = 'rgba(0,0,0,0.15)';
    fwCtx.fillRect(0,0,fireworksCanvas.width, fireworksCanvas.height);
    const gravity = 0.04;
    fireworks = fireworks.filter(fw => fw.exploded ? fw.particles.some(p=>p.life<p.ttl) : fw.y > -20);
    for (const fw of fireworks){
      if (!fw.exploded){
        fw.y += fw.vy;
        fw.vy += gravity * -0.5; // slow as it rises
        fwCtx.fillStyle = fw.color;
        fwCtx.fillRect(fw.x, fw.y, 2, 6);
        if (fw.y <= fw.peakY){
          fw.exploded = true; explodeAt(fw);
        }
      } else {
        for (const p of fw.particles){
          if (p.life++ >= p.ttl) continue;
          p.vy += gravity; p.x += p.vx; p.y += p.vy;
          fwCtx.fillStyle = p.color;
          fwCtx.globalAlpha = 1 - p.life/p.ttl;
          fwCtx.fillRect(p.x, p.y, 2, 2);
        }
        fwCtx.globalAlpha = 1;
      }
    }
    requestAnimationFrame(updateFireworks);
  }

  // Creative message animation with ascending/descending order
  const messageLines = [
    "Happy Birthday my love 💖",
    "I still remember the very first time we met, how I fell in love with you and your smile and how everything happened unexpectedly. 🌟",
    "We both didn't expect it, it was God who made it happen, because he knows we both need each other to complete the love story he made. ✨",
    "You filled my life with so much joy and happiness. 🌈",
    "I am so grateful to have you by my side and to be able to call you MINE. 💕",
    "Although I might not be there physically, but if you listen to your heart, just know I am there. 💝",
    "You stole my heart, but I'll let you keep it. 💘",
    "You are my entire happiness in this world. 🌍",
    "Your eyes reflect the pure love you hold for me. 👀",
    "You proved that the right person truly exists. 💎",
    "My love for you will never fade – I will always be with you. 💫",
    "You make my world brighter, my days happier, and my soul complete. ☀️",
    "The upcoming years will be the most beautiful chapters of your life. 📖",
    "I know you'll achieve your dreams and shine with success. 🌟",
    "I'm forever proud of you. 🏆",
    "I love you endlessly. ♾️"
  ];

  async function animateMessage(){
    messageContainer.innerHTML = '';
    
    // Create lines in ascending order
    for (let i = 0; i < messageLines.length; i++) {
      const lineEl = document.createElement('div');
      lineEl.className = 'message-line';
      lineEl.textContent = messageLines[i];
      messageContainer.appendChild(lineEl);
      
      // Animate in ascending order with auto-scroll
      setTimeout(() => {
        lineEl.classList.add('visible');
        // Auto-scroll to the new line with slower timing
        setTimeout(() => {
          lineEl.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 600);
      }, i * 1200);
    }
    
    // After ascending, animate in descending order for extra effect
    setTimeout(() => {
      const lines = messageContainer.querySelectorAll('.message-line');
      for (let i = lines.length - 1; i >= 0; i--) {
        setTimeout(() => {
          lines[i].style.transform = 'scale(1.05)';
          setTimeout(() => {
            lines[i].style.transform = 'scale(1)';
          }, 300);
        }, (lines.length - 1 - i) * 500);
      }
    }, messageLines.length * 1200 + 1500);
    
    // Final scroll to bottom after all animations
    setTimeout(() => {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      });
    }, messageLines.length * 1200 + 3000);
  }

  // Flow handlers
  function proceedToDob(){
    hide(sectionGreeting);
    show(sectionDob);
    spawnConfettiBurst(confettiCanvas.width*0.5, confettiCanvas.height*0.6, 80);
  }
  
  function proceedToGift(){
    hide(sectionDob);
    show(sectionGift);
    spawnConfettiBurst(confettiCanvas.width*0.5, confettiCanvas.height*0.6, 60);
  }
  
  function proceedToMessage(){
    hide(sectionGift);
    show(sectionMessage);
    animateMessage();
    // Fireworks celebration
    setTimeout(() => {
      for (let i=0;i<8;i++) setTimeout(()=>launchFirework(), i*500);
    }, messageLines.length * 800 + 2000);
  }

  // Event handlers
  on(tapToSee, 'click', ()=>{
    tryStartMusic();
    proceedToDob();
  });

  on(dobSubmit, 'click', ()=>{
    const val = dobInput.value;
    if (!val){
      dobInput.focus();
      spawnConfettiBurst(confettiCanvas.width*0.5, confettiCanvas.height*0.3, 30);
      return;
    }
    proceedToGift();
  });

  on(giftBox, 'click', (e)=>{
    giftBox.classList.add('open');
    const rect = giftBox.getBoundingClientRect();
    spawnConfettiBurst(rect.left + rect.width/2, rect.top + rect.height/2, 160);
    // add extra heart balloons
    for (let i=0;i<4;i++) setTimeout(()=> spawnConfettiBurst(rect.left + rect.width/2, rect.top + rect.height/2, 60), 150 + i*120);
    // hearts/confetti burst for a moment then proceed
    setTimeout(proceedToMessage, 1200);
  });

  on(replayBtn, 'click', ()=>{
    animateMessage();
  });

  // Resize canvases
  function resize(){
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
  }
  on(window, 'resize', resize);
  resize();

  // Start render loops
  updateConfetti();
  updateFireworks();
})();


