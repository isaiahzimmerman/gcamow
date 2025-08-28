// image-scroller.js
class ImageScroller extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });

    const tpl = document.createElement('template');
    tpl.innerHTML = `
      <style>
        :host{ --gap:12px; --img-height:110px; --img-radius:6px; display:block; overflow:visible; }
        .marquee{ overflow:visible; width:100%; }
        .track{ display:flex; gap:var(--gap); align-items:center; will-change:transform; padding:6px 0; }
        .image-set{ display:flex; gap:var(--gap); align-items:center; }
        img{ height:var(--img-height); width:auto; border-radius:var(--img-radius); object-fit:cover;
             transition: transform 220ms cubic-bezier(.2,.9,.2,1); cursor:pointer; position:relative; z-index:2; -webkit-user-drag:none;}
        img.hovered{ transform: scale(1.18) translateY(-10px); z-index:100; border-radius: 0}
        img:focus{ outline:3px solid rgba(255,255,255,0.06); outline-offset:6px; }
        @media (max-width:520px){ :host{ --img-height:78px; --gap:8px; } }
      </style>
      <div class="marquee">
        <div class="track">
          <div class="image-set" id="setA"></div>
        </div>
      </div>
    `;
    this._shadow.appendChild(tpl.content.cloneNode(true));
    this._setA = this._shadow.getElementById('setA');
    this._track = this._shadow.querySelector('.track');

    this._setWidth = 0; this._offset = 0; this._currentSpeed = 0; this._targetSpeed = 0;
    this._lastTime = null; this._running = true; this._imgs = []; this._rafId = null;
    this._reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._resizeObserver = null;
  }

  connectedCallback() {
    const attrSpeed = Number(this.getAttribute('speed'));
    const attrImgHeight = this.getAttribute('img-height');
    const attrGap = this.getAttribute('gap');
    if (!isNaN(attrSpeed)) this.style.setProperty('--default-speed', String(attrSpeed));
    if (attrImgHeight) this.style.setProperty('--img-height', attrImgHeight + 'px');
    if (attrGap) this.style.setProperty('--gap', attrGap + 'px');

    // move <img> children from light DOM into shadow setA
    const childrenImgs = Array.from(this.querySelectorAll('img'));
    if (childrenImgs.length === 0) return;
    childrenImgs.forEach(img => {
      const clone = img.cloneNode(true);
      if (!clone.hasAttribute('tabindex')) clone.setAttribute('tabindex','0');
      this._setA.appendChild(clone);
      img.remove();
    });

    // clone setA to setB for seamless loop
    const setB = this._setA.cloneNode(true);
    setB.id = 'setB';
    this._track.appendChild(setB);

    this._imgs = Array.from(this._track.querySelectorAll('img'));
    const defaultSpeed = Number(this.getAttribute('speed')) || Number(getComputedStyle(document.documentElement).getPropertyValue('--default-speed')) || 160;
    this._defaultSpeed = defaultSpeed;
    this._targetSpeed = this._reduced ? 0 : this._defaultSpeed;
    this._currentSpeed = this._targetSpeed;

    this._measureAndObserve();
    this._imgs.forEach(img => this._attachHoverHandlers(img));
    this._imgs.forEach(img => img.addEventListener('click', () => window.open(img.src, '_blank', 'noopener')));

    this._running = true; this._lastTime = null;
    this._rafId = requestAnimationFrame(this._step.bind(this));
    document.addEventListener('visibilitychange', this._onVisibilityChangeBound = this._onVisibilityChange.bind(this));
  }

  disconnectedCallback() {
    this._running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    if (this._resizeObserver) this._resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', this._onVisibilityChangeBound);
  }

  _measureAndObserve() {
    const measure = () => {
      this._setWidth = this._setA.getBoundingClientRect().width || 0;
      this._track.style.minWidth = (this._setWidth * 2) + 'px';
    };
    setTimeout(measure, 50);
    this._resizeObserver = new ResizeObserver(() => measure());
    this._resizeObserver.observe(this._setA);
  }

  _attachHoverHandlers(img) {
    const onEnter = () => { this._targetSpeed = 0; img.classList.add('hovered'); };
    const onLeave = () => { this._targetSpeed = this._defaultSpeed; img.classList.remove('hovered'); };
    img.addEventListener('mouseenter', onEnter);
    img.addEventListener('mouseleave', onLeave);
    img.addEventListener('focus', onEnter);
    img.addEventListener('blur', onLeave);
    img.addEventListener('pointerdown', onEnter);
    img.addEventListener('pointerup', onLeave);
  }

  _onVisibilityChange() {
    if (document.hidden) { this._running = false; if (this._rafId) cancelAnimationFrame(this._rafId); }
    else { if (!this._running) { this._running = true; this._lastTime = null; this._rafId = requestAnimationFrame(this._step.bind(this)); } }
  }

  _step(ts) {
    if (!this._lastTime) this._lastTime = ts;
    const dt = (ts - this._lastTime) / 1000;
    this._lastTime = ts;
    const easeFactor = 0.12;
    this._currentSpeed += (this._targetSpeed - this._currentSpeed) * easeFactor;
    if (Math.abs(this._currentSpeed) < 0.05) this._currentSpeed = 0;
    if (this._currentSpeed !== 0 && this._setWidth > 0) {
      this._offset += this._currentSpeed * dt;
      if (this._offset >= this._setWidth) this._offset -= this._setWidth;
      if (this._offset < 0) this._offset += this._setWidth;
    }
    this._track.style.transform = `translateX(${-this._offset}px)`;
    if (this._running) this._rafId = requestAnimationFrame(this._step.bind(this));
  }
}

// Guard against double-define (useful during HMR/dev or if script included twice)
if (!customElements.get('image-scroller')) {
  customElements.define('image-scroller', ImageScroller);
}
