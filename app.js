const board = document.getElementById('board');
const stopAllBtn = document.getElementById('stop-all');
const emptyMsg = document.getElementById('empty-msg');

const activePlayers = new Set();
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function formatName(file) {
  return file
    .replace(/^sounds\//, '')
    .replace(/\.mp3$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function playSound(sound) {
  const audio = new Audio(sound.file);
  const source = audioCtx.createMediaElementSource(audio);
  const gain = audioCtx.createGain();
  gain.gain.value = sound.volume ?? 1.0;
  source.connect(gain);
  gain.connect(audioCtx.destination);

  activePlayers.add(audio);
  audio.addEventListener('ended', () => activePlayers.delete(audio));
  // Resume context in case browser suspended it before a user gesture
  audioCtx.resume().then(() => audio.play()).catch(() => activePlayers.delete(audio));
}

function createButton(sound) {
  const name = sound.name || formatName(sound.file);
  const btn = document.createElement('button');
  btn.className = 'sound-btn';

  if (sound.icon) {
    const icon = document.createElement('span');
    icon.className = 'icon';
    // Image path (contains a dot suggesting a file extension)
    if (sound.icon.includes('.')) {
      const img = document.createElement('img');
      img.src = sound.icon;
      img.alt = '';
      icon.appendChild(img);
    } else {
      icon.textContent = sound.icon;
    }
    btn.appendChild(icon);
  }

  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = name;
  btn.appendChild(label);

  btn.addEventListener('click', () => playSound(sound));

  return btn;
}

function render(sounds) {
  board.querySelectorAll('.sound-btn').forEach(b => b.remove());
  emptyMsg.style.display = sounds.length === 0 ? 'block' : 'none';
  sounds.forEach(s => board.appendChild(createButton(s)));
}

stopAllBtn.addEventListener('click', () => {
  activePlayers.forEach(a => { a.pause(); a.currentTime = 0; });
  activePlayers.clear();
});

render(typeof SOUNDS !== 'undefined' ? SOUNDS : []);
