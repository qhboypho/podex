(() => {
  'use strict';

  const PRESETS = Object.freeze([
    { id: 'champagne-glow', name: 'Champagne Glow', label: 'Champagne', colors: ['#fffaf3', '#ecd9c4', '#c79b72'], glow: '#fff6dd' },
    { id: 'rose-gold', name: 'Rose Gold Studio', label: 'Rose Gold', colors: ['#fff2f5', '#e8b9c5', '#a96f70'], glow: '#ffe5cf' },
    { id: 'sage-mist', name: 'Sage Mist', label: 'Sage Mist', colors: ['#f5f8f2', '#c8dacb', '#789483'], glow: '#edf4d8' },
    { id: 'ocean-silk', name: 'Ocean Silk', label: 'Ocean Silk', colors: ['#effafa', '#acd4d4', '#526f87'], glow: '#d6fbf2' },
    { id: 'lilac-dream', name: 'Lilac Dream', label: 'Lilac Dream', colors: ['#fcf7ff', '#d9c4e9', '#8e76b0'], glow: '#f9e4ff' },
    { id: 'peach-fizz', name: 'Peach Fizz', label: 'Peach Fizz', colors: ['#fff7eb', '#f2b8a2', '#c86978'], glow: '#fff0bd' },
    { id: 'blue-hour', name: 'Blue Hour', label: 'Blue Hour', colors: ['#3e5879', '#1b3152', '#09172d'], glow: '#8ea8c8', dark: true },
    { id: 'mocha-studio', name: 'Mocha Studio', label: 'Mocha', colors: ['#f1e7dc', '#bb9c83', '#59443a'], glow: '#f7d7b7' },
    { id: 'silver-fog', name: 'Silver Fog', label: 'Silver Fog', colors: ['#fbfcfd', '#d3d8df', '#77828f'], glow: '#ffffff' },
    { id: 'mint-coral', name: 'Mint Coral', label: 'Mint Coral', colors: ['#e8faf5', '#a8ddd1', '#e49a8a'], glow: '#fff0d5' },
    { id: 'berry-noir', name: 'Berry Noir', label: 'Berry Noir', colors: ['#7b365d', '#3c1b37', '#160f22'], glow: '#cd7898', dark: true },
    { id: 'aurora-pastel', name: 'Pastel Aurora', label: 'Pastel Aurora', colors: ['#e9f9ff', '#c7b9ed', '#f2b6c7', '#b8e4d4'], glow: '#fff8d9' },
  ]);
  const IDS = new Set(PRESETS.map((entry) => entry.id));
  const list = () => PRESETS.map((entry) => ({ ...entry, colors: [...entry.colors] }));
  const has = (id) => IDS.has(id);

  function draw(ctx, width, height, id) {
    const preset = PRESETS.find((entry) => entry.id === id);
    if (!preset || !width || !height) return false;
    ctx.save();

    const base = ctx.createLinearGradient(0, 0, width, height);
    preset.colors.forEach((color, index) => {
      base.addColorStop(index / Math.max(1, preset.colors.length - 1), color);
    });
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    // Ánh sáng studio lệch tâm giúp model nổi khối mà không tạo họa tiết rối.
    const glow = ctx.createRadialGradient(
      width * .38, height * .32, 0,
      width * .38, height * .32, Math.max(width, height) * .67,
    );
    glow.addColorStop(0, `${preset.glow}cc`);
    glow.addColorStop(.48, `${preset.glow}38`);
    glow.addColorStop(1, `${preset.glow}00`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const vignette = ctx.createRadialGradient(
      width * .5, height * .44, Math.min(width, height) * .14,
      width * .5, height * .5, Math.max(width, height) * .76,
    );
    vignette.addColorStop(0, preset.dark ? 'rgba(255,255,255,.055)' : 'rgba(255,255,255,.12)');
    vignette.addColorStop(1, preset.dark ? 'rgba(0,0,0,.28)' : 'rgba(30,24,20,.09)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
    return true;
  }

  globalThis.FormBackgroundGradients = { list, has, draw };
})();
