/* ═══════════════════════════════════════════════
   NOI DUE — tela da disegno (Pictionary e bigliettini)
═══════════════════════════════════════════════ */
class Sketch {
  constructor(canvas, { bg = '#ffffff', color = '#2a2340', size = 6 } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bg = bg; this.color = color; this.size = size;
    this.history = [];
    this.drawing = false;
    this.dirty = false;
    this.last = null;
    this._resize();
    this._bind();
  }

  _resize() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.dpr = dpr;
    this.canvas.width = Math.round((r.width || 520) * dpr);
    this.canvas.height = Math.round((r.height || 360) * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.clear(true);
  }

  _pos(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  _bind() {
    const c = this.canvas;
    this._down = e => {
      e.preventDefault();
      c.setPointerCapture && c.setPointerCapture(e.pointerId);
      this.drawing = true;
      const p = this._pos(e);
      this.last = p; this.mid = p;
      this.ctx.strokeStyle = this.color;
      this.ctx.fillStyle = this.color;
      this.ctx.lineWidth = this.size;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, this.size / 2, 0, Math.PI * 2);
      this.ctx.fill();
    };
    this._move = e => {
      if (!this.drawing) return;
      e.preventDefault();
      const p = this._pos(e);
      const mid = { x: (this.last.x + p.x) / 2, y: (this.last.y + p.y) / 2 };
      this.ctx.beginPath();
      this.ctx.moveTo(this.mid.x, this.mid.y);
      this.ctx.quadraticCurveTo(this.last.x, this.last.y, mid.x, mid.y);
      this.ctx.stroke();
      this.last = p; this.mid = mid;
    };
    this._up = () => {
      if (!this.drawing) return;
      this.drawing = false;
      this.dirty = true;
      this._snapshot();
    };
    c.addEventListener('pointerdown', this._down);
    c.addEventListener('pointermove', this._move);
    c.addEventListener('pointerup', this._up);
    c.addEventListener('pointercancel', this._up);
    c.addEventListener('pointerleave', this._up);
  }

  _snapshot() {
    this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
    if (this.history.length > 30) this.history.shift();
  }

  clear(silent) {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (this.bg) {
      this.ctx.fillStyle = this.bg;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // trasparente: lo sfondo lo dà la carta
    }
    this.ctx.restore();
    this.history = [];
    this._snapshot();
    if (!silent) this.dirty = false;
  }

  undo() {
    if (this.history.length < 2) return;
    this.history.pop();
    this.ctx.putImageData(this.history[this.history.length - 1], 0, 0);
    if (this.history.length < 2) this.dirty = false;
  }

  // Esporta in JPEG compatto (max 900px di lato) per stare leggeri nel database
  toDataURL(quality = 0.72, maxSide = 900, bg = this.bg || '#ffffff') {
    const w = this.canvas.width, h = this.canvas.height;
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const c = document.createElement('canvas');
    c.width = Math.round(w * scale); c.height = Math.round(h * scale);
    const x = c.getContext('2d');
    x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
    x.drawImage(this.canvas, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', quality);
  }

  destroy() {
    const c = this.canvas;
    c.removeEventListener('pointerdown', this._down);
    c.removeEventListener('pointermove', this._move);
    c.removeEventListener('pointerup', this._up);
    c.removeEventListener('pointercancel', this._up);
    c.removeEventListener('pointerleave', this._up);
    this.history = [];
  }
}

const INK_COLORS = ['#2a2340', '#6d4fa3', '#b39ddb', '#e0607e', '#ecc978', '#5f9b7a', '#5d8fbf', '#ffffff'];

function sketchToolbarHtml(id) {
  return `<div class="sketch-tools" id="st-${id}">
    <div class="swatches">${INK_COLORS.map((c, i) => `<button type="button" class="swatch ${i === 0 ? 'on' : ''}" style="--c:${c}" data-color="${c}" aria-label="colore"></button>`).join('')}</div>
    <div class="sketch-row">
      <div class="sizes">${[3, 6, 12, 22].map((s, i) => `<button type="button" class="size ${i === 1 ? 'on' : ''}" data-size="${s}" aria-label="spessore"><i style="width:${Math.max(4, s)}px;height:${Math.max(4, s)}px"></i></button>`).join('')}</div>
      <span class="grow"></span>
      <button type="button" class="icon-btn sm" data-act="undo" aria-label="Annulla">${icon('undo', 18)}</button>
      <button type="button" class="icon-btn sm" data-act="clear" aria-label="Cancella tutto">${icon('trash', 18)}</button>
    </div>
  </div>`;
}

function bindSketchToolbar(root, id, sketch) {
  const box = root.querySelector('#st-' + id); if (!box) return;
  box.querySelectorAll('[data-color]').forEach(b => b.addEventListener('click', () => {
    sketch.color = b.dataset.color;
    box.querySelectorAll('[data-color]').forEach(x => x.classList.toggle('on', x === b));
  }));
  box.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => {
    sketch.size = parseInt(b.dataset.size);
    box.querySelectorAll('[data-size]').forEach(x => x.classList.toggle('on', x === b));
  }));
  box.querySelector('[data-act=undo]').addEventListener('click', () => sketch.undo());
  box.querySelector('[data-act=clear]').addEventListener('click', () => sketch.clear());
}
