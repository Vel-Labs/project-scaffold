"use strict";
const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const status = document.querySelector("#status");
const start = document.querySelector("#start");
const pause = document.querySelector("#pause");
const restart = document.querySelector("#restart");
const held = new Set();
const keys = { ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right", ArrowUp: "up", w: "up", ArrowDown: "down", s: "down" };
let running = false;
let score = 0;
let x = 320;
let y = 180;
let target = { x: 440, y: 180 };
let previous = 0;

function report(label) {
  status.textContent = `${label} · Stars: ${score}`;
  pause.textContent = running ? "Pause" : "Resume";
}
function begin() {
  running = true;
  pause.disabled = false;
  report("Playing");
  canvas.focus();
}
function togglePause() {
  if (pause.disabled) return;
  running = !running;
  held.clear();
  report(running ? "Playing" : "Paused");
}
function reset() {
  running = false;
  score = 0;
  x = 320;
  y = 180;
  target = { x: 440, y: 180 };
  held.clear();
  pause.disabled = true;
  report("Ready — press Start");
}
start.addEventListener("click", begin);
pause.addEventListener("click", togglePause);
restart.addEventListener("click", reset);
window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (keys[key]) { event.preventDefault(); if (running) held.add(keys[key]); }
  if (!event.repeat && key === "p") togglePause();
  if (!event.repeat && key === "r") reset();
});
window.addEventListener("keyup", (event) => held.delete(keys[event.key.toLowerCase()] || keys[event.key]));
window.addEventListener("blur", () => { held.clear(); if (running) togglePause(); });
document.addEventListener("visibilitychange", () => { if (document.hidden && running) togglePause(); });
for (const button of document.querySelectorAll("[data-direction]")) {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    if (running) held.add(button.dataset.direction);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    button.addEventListener(type, () => held.delete(button.dataset.direction));
  }
}
function frame(now) {
  const step = Math.min((now - previous) / 1000, 0.05) * 220;
  previous = now;
  if (running) {
    x = Math.max(12, Math.min(628, x + step * (Number(held.has("right")) - Number(held.has("left")))));
    y = Math.max(12, Math.min(348, y + step * (Number(held.has("down")) - Number(held.has("up")))));
    if (Math.hypot(x - target.x, y - target.y) < 24) {
      score += 1;
      target = { x: 24 + Math.random() * 592, y: 24 + Math.random() * 312 };
      report("Playing");
    }
  }
  ctx.clearRect(0, 0, 640, 360);
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(target.x, target.y, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#93c5fd";
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
