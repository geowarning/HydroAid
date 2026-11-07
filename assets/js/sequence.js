(() => {
  'use strict';
  const root = document.querySelector('[data-sequence]');
  if (!root) return;
  const get = (name) => root.querySelector(`[data-${name}]`);
  const steps = Array.from(root.querySelectorAll('[data-sequence-step]'));
  const controls = get('sequence-controls');
  const stepControls = get('sequence-steps');
  const play = get('sequence-play');
  const replay = get('sequence-replay');
  const progress = get('sequence-progress');
  const timeLabel = get('sequence-time');
  const stageNumber = get('sequence-number');
  const stageTitle = get('sequence-title');
  const stageDescription = get('sequence-description');
  const person = get('person');
  const target = get('target');
  const armLeft = get('arm-left');
  const armRight = get('arm-right');
  const legLeft = get('leg-left');
  const legRight = get('leg-right');
  const scan = get('scan');
  const aim = get('aim');
  const trajectory = get('trajectory');
  const capsule = get('capsule');
  const buoy = get('buoy');
  const splash = get('splash');
  const calculation = get('sequence-calculation');
  const distanceMeasure = get('distance-measure');
  const distanceLine = get('distance-line');
  const distanceArrow = get('distance-arrow');
  const distanceLabel = get('distance-label');
  const angleMeasure = get('angle-measure');
  const angleLabel = get('angle-label');
  const angleText = get('angle-text');
  const equation = get('sequence-equation');
  const exampleDistance = 9, exampleSpeed = 10, gravity = 9.81;
  const exampleAngle = (Math.asin(gravity * exampleDistance / (exampleSpeed ** 2)) * 90 / Math.PI).toFixed(1);
  equation.textContent = `θ = ½ sin⁻¹((${gravity} × ${exampleDistance}) / ${exampleSpeed}²) ≈ ${exampleAngle}°`;
  angleText.textContent = `θ ≈ ${exampleAngle}° · simulated`;
  const duration = 10000;
  const stageStarts = [0, 1600, 3200, 5200, 6800];
  const descriptions = [
    ['Detect', 'The camera monitors the water for a person in distress.'],
    ['Track', 'The vision system follows the person as they move.'],
    ['Calculate', 'An example distance and launch speed give an estimated elevation angle.'],
    ['Aim', 'The launcher aligns with the tracked target.'],
    ['Launch', 'The lifebuoy is launched and inflates near the person.']
  ];
  let elapsed = 0;
  let previousTime = null;
  let playing = false;
  let frame = 0;
  let stage = -1;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const smooth = (n) => { const x = clamp(n, 0, 1); return x * x * (3 - 2 * x); };
  const opacity = (element, value) => element.setAttribute('opacity', String(clamp(value, 0, 1)));
  function setStage(index) {
    if (index === stage) return;
    stage = index;
    calculation.hidden = index !== 2 && index !== 3;
    stageNumber.textContent = `${String(index + 1).padStart(2, '0')} / 05`;
    stageTitle.textContent = descriptions[index][0];
    stageDescription.textContent = descriptions[index][1];
    steps.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }
  function render() {
    const seconds = elapsed / 400;
    const index = seconds < 4 ? 0 : seconds < 8 ? 1 : seconds < 13 ? 2 : seconds < 17 ? 3 : 4;
    setStage(index);
    const x = 685 + 30 * smooth((seconds - 4) / 4);
    const y = 267 + 1.5 * Math.sin(seconds * 3);
    const motion = Math.sin(seconds * 4);
    const otherMotion = Math.sin(seconds * 4 + 1.4);
    armLeft.setAttribute('transform', `rotate(${motion * 20} -6 19)`);
    armRight.setAttribute('transform', `rotate(${otherMotion * 20} 6 19)`);
    legLeft.setAttribute('transform', `rotate(${otherMotion * 16} -5 38)`);
    legRight.setAttribute('transform', `rotate(${-motion * 16} 5 38)`);
    person.setAttribute('transform', `translate(${x} ${y})`);
    target.setAttribute('transform', `translate(${x} ${y})`);
    opacity(target, smooth((seconds - 1) / 1.2));
    scan.setAttribute('d', `M284 152L${x + 56} 205L${x + 56} 350Z`);
    opacity(scan, seconds < 8 ? .8 : .25);
    const showingDistance = smooth((seconds - 8) / 1) * (1 - smooth((seconds - 17) / 1));
    const showingAngle = smooth((seconds - 10) / 1) * (1 - smooth((seconds - 17) / 1));
    distanceLine.setAttribute('d', `M315 378H${x}M315 369v18M${x} 369v18`);
    distanceArrow.setAttribute('d', `M${x - 11} 372l11 6-11 6`);
    distanceLabel.setAttribute('x', String((315 + x) / 2));
    opacity(distanceMeasure, showingDistance); opacity(distanceLabel, showingDistance);
    opacity(angleMeasure, showingAngle); opacity(angleLabel, showingAngle);
    const alignment = smooth((seconds - 13) / 3);
    aim.setAttribute('d', `M283 156L${x - 125 * (1 - alignment)} ${y - 80 * (1 - alignment)}`);
    opacity(aim, smooth((seconds - 13) / 1.3) * (1 - smooth((seconds - 17) / 1)));
    opacity(trajectory, smooth((seconds - 16.5) / 1) * (1 - smooth((seconds - 21) / 1)));
    const t = smooth((seconds - 17) / 4);
    const startX = 283, startY = 156, endX = 715, endY = 286;
    const arcX = (1 - t) ** 2 * startX + 2 * (1 - t) * t * 490 + t ** 2 * endX;
    const arcY = (1 - t) ** 2 * startY + 2 * (1 - t) * t * 31.6 + t ** 2 * endY;
    capsule.setAttribute('transform', `translate(${arcX} ${arcY}) rotate(${t * 270})`);
    opacity(capsule, seconds >= 17 && seconds < 21 ? 1 : 0);
    const inflate = smooth((seconds - 21) / 1.7);
    buoy.setAttribute('transform', `translate(715 286) scale(${Math.max(.02, inflate)})`);
    opacity(buoy, seconds >= 21 ? 1 : 0);
    splash.setAttribute('cx', '715'); splash.setAttribute('cy', '286');
    splash.setAttribute('r', String(4 + 42 * smooth((seconds - 21) / 1.4)));
    opacity(splash, seconds >= 21 ? (1 - smooth((seconds - 21) / 1.4)) * .8 : 0);
    progress.value = String(Math.round(elapsed / 100));
    const whole = Math.floor(elapsed / 1000);
    timeLabel.textContent = `0:${String(whole).padStart(2, '0')} / 0:10`;
    progress.setAttribute('aria-valuetext', `${whole} seconds of 10 seconds, ${descriptions[index][0]}`);
  }
  function setPlaying(value) {
    playing = value;
    previousTime = null;
    cancelAnimationFrame(frame);
    play.textContent = value ? 'Pause animation' : (elapsed >= duration ? 'Play again' : 'Play animation');
    if (value) frame = requestAnimationFrame(tick);
  }
  function tick(now) {
    if (!playing) return;
    if (previousTime !== null) elapsed = Math.min(duration, elapsed + now - previousTime);
    previousTime = now;
    render();
    if (elapsed >= duration) setPlaying(false);
    else frame = requestAnimationFrame(tick);
  }
  play.addEventListener('click', () => {
    if (playing) { setPlaying(false); return; }
    if (elapsed >= duration) { elapsed = 0; render(); }
    setPlaying(true);
  });
  replay.addEventListener('click', () => { elapsed = 0; render(); setPlaying(true); });
  progress.addEventListener('input', () => { setPlaying(false); elapsed = Number(progress.value) * 100; render(); });
  steps.forEach((button, index) => button.addEventListener('click', () => { setPlaying(false); elapsed = stageStarts[index]; render(); }));
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) setPlaying(false); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { if (!entries[0].isIntersecting && playing) setPlaying(false); }, { threshold: 0 }).observe(root);
  }
  person.setAttribute('transform', 'translate(685 267)');
  controls.hidden = false;
  stepControls.hidden = false;
  render();
})();
