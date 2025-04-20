/**
 * Chunky‑scroll – v1.1
 * Inserts a viewport wrapper and chunky fake scrollbars
 * on tables flagged via the “chunky-scroll” CSS class.
 */
document.addEventListener('DOMContentLoaded', () => {

  /* ── 1.  Find every target table exactly once ───────────────────────── */
  const targets = document.querySelectorAll(
    'table.chunky-scroll,          /* class directly on <table>          */' +
    '.chunky-scroll > table'       /* class on parent wrapper (figure)   */
  );

  targets.forEach(tbl => {
    /* Skip if already processed (wrapper already in place) */
    if (tbl.parentElement?.classList.contains('chunky-scroll-wrapper')) return;

    /* ── 2.  Build the viewport wrapper ──────────────────────────────── */
    const wrap = document.createElement('div');
    wrap.className = 'chunky-scroll-wrapper';
    tbl.before(wrap);
    wrap.appendChild(tbl);

    /* ── 3.  Build one fake bar helper ───────────────────────────────── */
/* ----------------  helper that builds one complete row --------------- */
const makeBarRow = pos => {

  /* outer row (sticky) */
  const row = document.createElement('div');
  row.className = `fake-scroll-row ${pos}`;

  /* book‑end buttons */
  const btnStart = document.createElement('div');
  btnStart.className = 'scroll-btn start';
  btnStart.textContent = '\u{23EE}';              // Unicode previous track

  const btnEnd = document.createElement('div');
  btnEnd.className = 'scroll-btn end';
  btnEnd.textContent = '\u{23ED}';                // Unicode next track

  /* track */
  const track = document.createElement('div');
  track.className = 'fake-scrollbar';

  const thumb = document.createElement('div');
  thumb.className = 'thumb';
  thumb.textContent = 'SCROLL ME';
  track.appendChild(thumb);

  /* assemble row */
  row.append(btnStart, track, btnEnd);

  /* insert above/ below wrapper */
  (pos === 'top') ? wrap.before(row) : wrap.after(row);

  /* jump handlers */
  btnStart.addEventListener('click', () => wrap.scrollLeft = 0);
  btnEnd  .addEventListener('click', () => wrap.scrollLeft = wrap.scrollWidth - wrap.clientWidth);

  /* return the track (used later for thumb sync & drag) */
  return track;
};

/* ---------- build the rows ---------- */
const topBar = makeBarRow('top');
const botBar = makeBarRow('bottom');

      /* ── 4.  Keep thumb size & position in sync ──────────────────────── */
const syncThumb = () => {
  const ratio  = wrap.clientWidth / wrap.scrollWidth;
  const offset = wrap.scrollLeft   / wrap.scrollWidth;
  [topBar, botBar].forEach(bar => {
    const t = bar.querySelector('.thumb');
    t.style.width =  (ratio  * 100) + '%';
    t.style.left  =  (offset * 100) + '%';

    // ⇨ dynamically scale font so it never overflows ⇦
    const parentH = t.parentElement.clientHeight;
    const maxSize = parentH * 0.7;
    const charCount = Math.max(1, t.textContent.length);
    let fs = t.clientWidth / charCount;
    fs = Math.max(4, Math.min(fs, maxSize));
    t.style.fontSize = fs + 'px';
  });
};
      syncThumb();
    wrap.addEventListener('scroll',  syncThumb);
    addEventListener('resize', syncThumb);

      /* ── 5.  Drag‑to‑scroll behaviour for fake bars ──────────────────── */
const attachDrag = bar => {
  /* Tunable pixel distance that distinguishes a click from a drag */
  const DRAG_THRESHOLD = 5;      // pixels

  let active      = false;
  let moved       = false;
  let startX      = 0;
  let startScroll = 0;
  let clickedOnThumb = false;

  /* pointerdown – arm a possible drag or click */
  bar.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;   // primary btn only
    e.preventDefault();                                        // stop text‑select / page‑swipe

    active         = true;
    moved          = false;
    startX         = e.clientX;
    startScroll    = wrap.scrollLeft;
    clickedOnThumb = !!e.target.closest('.thumb');

    wrap.classList.add('dragging');
  }, { passive:false });

  /* pointermove – if movement exceeds threshold, treat as drag */
  window.addEventListener('pointermove', e => {
    if (!active) return;

    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) >= DRAG_THRESHOLD) moved = true;

    if (moved) {
      e.preventDefault();                          // keep scrolling smooth on touch
      wrap.scrollLeft = startScroll - dx;
    }
  }, { passive:false });

  /* pointerup – decide if it was a click or a drag */
  window.addEventListener('pointerup', e => {
    if (!active) return;
    wrap.classList.remove('dragging');
    active = false;

    if (!moved && !clickedOnThumb) {
      /* It was a click on the *track* → jump */
      const rect = bar.getBoundingClientRect();
      const rel  = (e.clientX - rect.left) / rect.width;
      wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) * rel;
    }
  });
};

      attachDrag(topBar); attachDrag(botBar);

    /* ── 6.  Optional: grab‑to‑pan on desktop ────────────────────────── */
    (() => {
      let down = false, startX = 0, startScroll = 0;
      wrap.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        down = true; wrap.classList.add('dragging');
        startX = e.pageX; startScroll = wrap.scrollLeft; e.preventDefault();
      }, { passive:false });
      addEventListener('mousemove', e => {
        if (!down) return;
        wrap.scrollLeft = startScroll - (e.pageX - startX);
      });
      addEventListener('mouseup', () => {
        down = false; wrap.classList.remove('dragging');
      });
    })();
  });
});
