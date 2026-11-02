/* Brick calculator + specification table.
   Figures come from the factory catalogue table. `walls` lists the wall
   thickness (cm) each brick builds and how many bricks cover 1 m² of that wall. */
const BRICKS = [
  { id: 'A', mpa: 22,  use: 'load',      size: '24 × 11.5 × 7.5',   w: 2.5,  pallet: 1250, perPallet: 500, perM3: 483, walls: [{ t: 11.5, n: 58 }, { t: 24, n: 116 }] },
  { id: 'I', mpa: 12,  use: 'load',      size: '40 × 15 × 20',      w: 11.5, pallet: 1587, perPallet: 138, perM3: 83,  walls: [{ t: 15, n: 12.5 }] },
  { id: 'F', mpa: 11,  use: 'load',      size: '40 × 20 × 20',      w: 14.6, pallet: 1489, perPallet: 102, perM3: 63,  walls: [{ t: 20, n: 12.5 }] },
  { id: 'J', mpa: 12,  use: 'load',      size: '40 × 24 × 20',      w: 17.5, pallet: 1470, perPallet: 84,  perM3: 52,  walls: [{ t: 24, n: 12.5 }] },
  { id: 'C', mpa: 3.8, use: 'partition', size: '40 × 10 × 20',      w: 5.5,  pallet: 1122, perPallet: 204, perM3: 125, walls: [{ t: 10, n: 12.5 }] },
  { id: 'D', mpa: 4.2, use: 'partition', size: '40 × 15 × 20',      w: 7.6,  pallet: 1026, perPallet: 135, perM3: 83,  walls: [{ t: 15, n: 12.5 }] },
  { id: 'E', mpa: 4,   use: 'partition', size: '40 × 20 × 20',      w: 9.5,  pallet: 969,  perPallet: 102, perM3: 63,  walls: [{ t: 20, n: 12.5 }] },
  { id: 'K', mpa: 5,   use: 'partition', size: '40 × 24 × 20',      w: 13.5, pallet: 1134, perPallet: 84,  perM3: 52,  walls: [{ t: 24, n: 12.5 }] },
  { id: 'H', mpa: 5.2, use: 'partition', size: '18.5 × 14.5 × 24',  w: 5.5,  pallet: 1265, perPallet: 230, perM3: 156, walls: [{ t: 18.5, n: 29 }] },
];

const USE_LABEL = { load: 'Load bearing', partition: 'Partition' };
const USE_AR = { load: 'حامل', partition: 'قاطع' };
const fmt = (n, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d });
const imgOf = (b) => `assets/aso/types/type-${b.id.toLowerCase()}.png`;

const picker = document.getElementById('brickPicker');
if (picker) {
  const state = { mode: 'size', brick: BRICKS[2], wallIdx: 0, waste: 5 };
  const $ = (id) => document.getElementById(id);
  const result = $('calcResult');

  /* ----- brick picker ----- */
  picker.innerHTML = BRICKS.map((b) => `
    <button type="button" class="brick-opt${b === state.brick ? ' active' : ''}" data-id="${b.id}" aria-pressed="${b === state.brick}">
      <img src="${imgOf(b)}" alt="" loading="lazy">
      <b>Type ${b.id}</b>
      <span>${USE_LABEL[b.use]}</span>
      <em>${b.walls.map((w) => fmt(w.t, 1)).join(' / ')} cm wall</em>
    </button>`).join('');

  const renderThickness = () => {
    const wrap = $('thicknessWrap');
    const walls = state.brick.walls;
    wrap.hidden = walls.length < 2;
    $('thicknessSeg').innerHTML = walls
      .map((w, i) => `<button type="button" data-i="${i}" class="${i === state.wallIdx ? 'active' : ''}">${fmt(w.t, 1)} cm</button>`)
      .join('');
  };

  /* ----- calculation ----- */
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const calc = () => {
    const area = state.mode === 'size'
      ? Math.max(0, num('inLength') * num('inHeight') - num('inOpenings'))
      : num('inArea');
    const b = state.brick;
    const wall = b.walls[state.wallIdx] || b.walls[0];
    const base = area * wall.n;
    const bricks = Math.ceil(base * (1 + state.waste / 100));
    const pallets = Math.ceil(bricks / b.perPallet);
    const kg = bricks * b.w;
    const weight = kg >= 1000 ? `${fmt(kg / 1000, 2)} tons` : `${fmt(kg)} kg`;

    if (!area || !bricks) {
      result.innerHTML = `<p class="res-label">Your result</p><p class="res-empty">Enter the size of your wall to see how many bricks you need.</p>`;
      return;
    }
    const extra = state.waste ? ` + ${state.waste}% extra` : '';
    result.innerHTML = `
      <p class="res-label">You need about</p>
      <p class="res-big">${fmt(bricks)}<span>Type ${b.id} bricks</span></p>
      <div class="res-stats">
        <div><b>${fmt(pallets)}</b><span>pallet${pallets === 1 ? '' : 's'}<br><small>${fmt(b.perPallet)} bricks each</small></span></div>
        <div><b>≈ ${weight.split(' ')[0]}</b><span>${weight.split(' ')[1]}<br><small>total weight</small></span></div>
        <div><b>${fmt(area, 1)}</b><span>m² of wall<br><small>${fmt(wall.t, 1)} cm thick</small></span></div>
      </div>
      <div class="res-how">
        <p class="res-label">How it is calculated</p>
        <ol>
          <li><b>Wall area</b> = ${state.mode === 'size'
            ? `${fmt(num('inLength'), 2)} m × ${fmt(num('inHeight'), 2)} m${num('inOpenings') ? ` − ${fmt(num('inOpenings'), 2)} m² openings` : ''}`
            : 'the area you entered'} = <b>${fmt(area, 1)} m²</b></li>
          <li><b>Bricks</b> = ${fmt(area, 1)} m² × ${fmt(wall.n, 1)} bricks per m² = ${fmt(base, 1)}${extra} → <b>${fmt(bricks)}</b></li>
          <li><b>Pallets</b> = ${fmt(bricks)} ÷ ${fmt(b.perPallet)} per pallet, rounded up → <b>${fmt(pallets)}</b></li>
          <li><b>Weight</b> = ${fmt(bricks)} × ${fmt(b.w, 1)} kg per brick → <b>≈ ${weight}</b></li>
        </ol>
      </div>
      <a class="res-quote" href="#contact">Get a quote for this order →</a>`;
  };

  /* ----- events ----- */
  const selectBrick = (id) => {
    state.brick = BRICKS.find((b) => b.id === id);
    state.wallIdx = 0;
    picker.querySelectorAll('.brick-opt').forEach((el) => {
      const on = el.dataset.id === id;
      el.classList.toggle('active', on);
      el.setAttribute('aria-pressed', on);
    });
    renderThickness();
    calc();
  };
  picker.addEventListener('click', (e) => {
    const btn = e.target.closest('.brick-opt');
    if (btn) selectBrick(btn.dataset.id);
  });
  $('thicknessSeg').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-i]');
    if (!btn) return;
    state.wallIdx = Number(btn.dataset.i);
    renderThickness();
    calc();
  });
  $('modeSeg').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-mode]');
    if (!btn) return;
    state.mode = btn.dataset.mode;
    $('modeSeg').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
    $('fieldsSize').hidden = state.mode !== 'size';
    $('fieldsArea').hidden = state.mode !== 'area';
    calc();
  });
  $('wasteSeg').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-waste]');
    if (!btn) return;
    state.waste = Number(btn.dataset.waste);
    $('wasteSeg').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
    calc();
  });
  ['inLength', 'inHeight', 'inOpenings', 'inArea'].forEach((id) => $(id).addEventListener('input', calc));

  /* ----- specification table ----- */
  const cell = (label, html) => `<td data-label="${label}">${html}</td>`;
  document.querySelector('#specTable tbody').innerHTML = BRICKS.map((b) => {
    const m2 = b.walls.length > 1
      ? b.walls.map((w) => `≈ ${fmt(w.n)} <small>${fmt(w.t, 1)} cm wall</small>`).join('<br>')
      : `≈ ${fmt(b.walls[0].n, 1)}`;
    return `<tr data-id="${b.id}">
      <th scope="row" data-label="Type"><span class="tbl-type"><img src="${imgOf(b)}" alt=""><b>${b.id}</b></span></th>
      ${cell('Use', `${USE_LABEL[b.use]} <small lang="ar" dir="rtl">${USE_AR[b.use]}</small>`)}
      ${cell('Size (cm)', `≈ ${b.size}`)}
      ${cell('Strength', `${b.mpa} MPa`)}
      ${cell('Weight per brick', `≈ ${fmt(b.w, 1)} kg`)}
      ${cell('Weight per pallet', `≈ ${fmt(b.pallet)} kg`)}
      ${cell('Bricks per pallet', fmt(b.perPallet))}
      ${cell('Bricks per m³', `≈ ${fmt(b.perM3)}`)}
      ${cell('Bricks per m²', m2)}
      <td class="tbl-action"><button type="button" class="tbl-calc" data-id="${b.id}">Calculate →</button></td>
    </tr>`;
  }).join('');
  document.getElementById('specTable').addEventListener('click', (e) => {
    const btn = e.target.closest('.tbl-calc');
    if (!btn) return;
    selectBrick(btn.dataset.id);
    $('calcInputs').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  renderThickness();
  calc();
}
