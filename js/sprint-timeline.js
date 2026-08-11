// ─── Try it_ — Interactive Sprint Timeline (How I Work) ───
(function () {
  const tabsEl = document.getElementById('sprint-tabs');
  if (!tabsEl) return;

  const rulerEl = document.getElementById('sprint-ruler');
  const trackEl = document.getElementById('sprint-track');
  const trackOuterEl = document.getElementById('sprint-track-outer');
  const legendEl = document.getElementById('sprint-legend');
  const totalEl = document.getElementById('sprint-total');
  const detailEl = document.getElementById('sprint-detail');

  const CAT_STYLE = {
    research: { label: 'Research', bg: '#F2F2F2', fg: '#5c5c5c' },
    design:   { label: 'Design',   bg: '#E0E0E0', fg: '#333333' },
    build:    { label: 'Build',    bg: '#C7C7C7', fg: '#1f1f1f' },
    testing:  { label: 'Testing',  bg: '#A8A8A8', fg: '#111111' },
    ship:     { label: 'Ship',     bg: '#111111', fg: '#FFFFFF' },
  };

  const GRANULARITY = {
    'Discovery': ['Stakeholder interviews', 'Workflow & usage audit', 'Competitive scan', 'Constraints & risks'],
    'Flows & Design': ['Journey mapping', 'Information architecture', 'Wireframes', 'UI design pass'],
    'Testing': ['Test plan', 'Moderated sessions', 'Synthesis', 'Prioritized fixes'],
    'Build & Handoff': ['Component specs', 'Edge-case states', 'Accessibility notes', 'Engineering pairing'],
    'Ship': ['Phased rollout', 'Adoption tracking', 'Regression watch'],
    'Design': ['Wireframes', 'Hi-fi UI', 'Interaction details'],
    'Build': ['Prototype build', 'Interaction polish'],
    'Audit': ['Component inventory', 'Inconsistency mapping', 'Tech-debt notes'],
    'Foundations': ['Tokens', 'Spacing scale', 'Type scale'],
    'Components': ['Core components', 'Documented states', 'Props & variants'],
  };

  const PROJECT_TYPES = {
    '0→1 Product': [
      { label: 'Discovery', weeks: 1, cat: 'research', use: "Stakeholder interviews and workflow audits — understanding what's actually breaking before touching Figma.", skip: 'The problem is narrow and already validated by prior work.' },
      { label: 'Flows & Design', weeks: 2, cat: 'design', overlap: 0.25, use: 'Mapping multi-step, permission-aware workflows, then designing the UI on top - where hierarchy has to hold up under real complexity.', skip: 'Extending a pattern the design system already solved.' },
      { label: 'Testing', weeks: 1, cat: 'testing', overlap: 0.5, use: 'The workflow is high-risk or high-frequency for real operators.', skip: 'Internal tooling with a tight timeline and low blast radius.' },
      { label: 'Build & Handoff', weeks: 1.5, cat: 'build', use: 'Specs, states and accessibility notes, pairing with engineering until it ships correctly.', skip: 'Pairing live with an engineer in the same tool.' },
      { label: 'Ship', weeks: 0.5, cat: 'ship', use: 'Launch, then watch adoption and edge cases for the first two weeks.', skip: 'Never - shipping without watching is where regressions hide.' },
    ],
    'Rapid Prototype': [
      { label: 'Discovery', weeks: 0.5, cat: 'research', use: 'Enough context to know the constraints, fast - a few conversations, not a research plan.', skip: 'The brief is already tight and well understood.' },
      { label: 'Design', weeks: 1, cat: 'design', overlap: 0.25, use: 'Working directly in hi-fi, testing the idea rather than the process around it.', skip: '—' },
      { label: 'Build', weeks: 1, cat: 'build', overlap: 0.25, use: 'Getting it into a clickable, testable state as fast as possible.', skip: 'A static concept is enough to make the decision.' },
      { label: 'Ship', weeks: 0.5, cat: 'ship', use: 'Ship the prototype for feedback, then decide whether it earns real investment.', skip: '—' },
    ],
    'Design System': [
      { label: 'Audit', weeks: 1, cat: 'research', use: 'Cataloguing existing components, inconsistencies and technical debt before proposing foundations.', skip: 'Starting from zero, no existing patterns to reconcile.' },
      { label: 'Foundations', weeks: 1.5, cat: 'design', overlap: 0.25, use: 'Tokens, spacing, type scale - the layer every component inherits from.', skip: 'Almost never — this is the part that has to be right first.' },
      { label: 'Components', weeks: 2.5, cat: 'build', overlap: 0.25, use: 'Building the component set with documented states, props and accessibility behaviour.', skip: '—' },
      { label: 'Testing', weeks: 1, cat: 'testing', overlap: 0.25, use: 'Running components through real screens before calling them done.', skip: 'Low-risk, presentational-only components.' },
      { label: 'Ship', weeks: 0.5, cat: 'ship', use: 'Publish, document, and support the teams adopting it.', skip: '—' },
    ],
    'Redesign': [
      { label: 'Discovery', weeks: 1, cat: 'research', use: "Understanding why the current version fails — usage data, support tickets, the workflow as it's actually used.", skip: 'The problems are already well documented.' },
      { label: 'Design', weeks: 1.5, cat: 'design', overlap: 0.25, use: 'Reworking flows and UI without breaking muscle memory for existing users.', skip: '—' },
      { label: 'Testing', weeks: 1, cat: 'testing', overlap: 0.5, use: 'The redesign touches a workflow people rely on daily.', skip: 'A low-traffic screen with little risk.' },
      { label: 'Build & Handoff', weeks: 1.5, cat: 'build', use: 'Careful handoff, since a regression here is felt immediately by existing users.', skip: '—' },
      { label: 'Ship', weeks: 0.5, cat: 'ship', use: 'Phased rollout, watching adoption closely.', skip: "Never — this is the step most redesigns skip and shouldn't." },
    ],
  };

  const typeNames = Object.keys(PROJECT_TYPES);
  let activeType = typeNames[0];
  let activeIdx = -1;

  function renderDetail() {
    if (activeIdx === -1) {
      detailEl.innerHTML = '<p class="font-sans text-text text-[15px] leading-[1.5] text-center">Click any phase on the timeline to see how it breaks down — and when I use it or skip it.</p>';
      return;
    }
    const phases = PROJECT_TYPES[activeType];
    const p = phases[activeIdx];
    const c = CAT_STYLE[p.cat];
    const gran = GRANULARITY[p.label] || [];
    detailEl.innerHTML = `
      <div class="sprint-detail-header flex items-center justify-between gap-4 flex-wrap pb-5 mb-6 border-b border-border">
        <div class="flex items-baseline gap-3">
          <p class="font-sans font-extrabold text-text text-2xl">${p.label}</p>
          <div class="sprint-detail-dur text-text text-[13px]">${p.weeks} week${p.weeks === 1 ? '' : 's'}</div>
        </div>
        <span class="border border-[rgba(0,0,0,0.2)] font-mono text-text text-[11px] px-3 py-[5px] rounded-full">[${c.label}_]</span>
      </div>
      <div class="sprint-detail-body grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-10">
        <div>
          <p class="sprint-dl text-text text-[11px] tracking-[0.8px] uppercase mb-3">Breakdown</p>
          ${gran.map(g => `<div class="flex items-center gap-[9px] font-sans text-text text-sm font-semibold mb-[11px]"><span class="sprint-gran-dot"></span>${g}</div>`).join('')}
        </div>
        <div>
          <p class="sprint-dl text-text text-[11px] tracking-[0.8px] uppercase mb-3">When I use it</p>
          <p class="font-sans text-text text-[14.5px] leading-[1.6]">${p.use}</p>
        </div>
      </div>
      <div class="sprint-skip-box p-5 mt-6">
        <p class="sprint-dl text-text text-[11px] tracking-[0.8px] uppercase mb-3">I skip this when...</p>
        <p class="font-sans text-text text-[13.5px] leading-[1.5]">${p.skip}</p>
      </div>`;
  }

  function renderTrack() {
    const phases = PROJECT_TYPES[activeType];
    const total = phases.reduce((s, p) => s + p.weeks, 0);
    totalEl.textContent = '~' + (total % 1 === 0 ? total : total.toFixed(1)) + ' weeks';

    rulerEl.innerHTML = '';
    for (let w = 1; w <= Math.ceil(total); w++) {
      const t = document.createElement('span');
      t.className = 'tick font-mono text-[10px] font-bold';
      t.style.left = Math.min(100, (w / total) * 100) + '%';
      t.style.color = 'rgba(17,17,17,.35)';
      t.textContent = 'W' + w;
      rulerEl.appendChild(t);
    }

    trackEl.innerHTML = '';
    [...trackOuterEl.querySelectorAll('.sprint-badge')].forEach(b => b.remove());

    let cursor = 0;
    phases.forEach((p, i) => {
      const c = CAT_STYLE[p.cat];
      const b = document.createElement('button');
      b.className = 'sprint-clip' + (i === activeIdx ? ' active' : '');
      b.style.width = (p.weeks / total) * 100 + '%';
      b.style.background = c.bg;
      b.style.color = c.fg;
      b.innerHTML = `<div class="font-mono font-medium text-[13px] leading-[1.2]">${p.label}</div><div class="font-mono text-[11px] opacity-70 mt-[2px]">${p.weeks % 1 === 0 ? p.weeks : p.weeks.toFixed(1)}w</div>`;
      b.onclick = () => { activeIdx = i; renderTrack(); renderDetail(); };
      trackEl.appendChild(b);

      if (p.overlap) {
        const badge = document.createElement('div');
        badge.className = 'sprint-badge font-mono text-[10.5px] font-bold';
        badge.style.left = (cursor / total) * 100 + '%';
        badge.textContent = '⟲ iterating';
        trackOuterEl.appendChild(badge);
      }
      cursor += p.weeks;
    });

    legendEl.innerHTML = '';
    [...new Set(phases.map(p => p.cat))].forEach(cat => {
      const c = CAT_STYLE[cat];
      legendEl.insertAdjacentHTML('beforeend', `<span class="flex items-center gap-[6px] font-sans text-text text-xs"><span class="sprint-sw" style="background:${c.bg}"></span>${c.label}</span>`);
    });
  }

  typeNames.forEach(name => {
    const b = document.createElement('button');
    b.className = 'sprint-tab font-mono text-[13px]' + (name === activeType ? ' active' : '');
    b.textContent = name;
    b.onclick = () => {
      activeType = name;
      activeIdx = -1;
      [...tabsEl.children].forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      renderTrack();
      renderDetail();
    };
    tabsEl.appendChild(b);
  });

  renderTrack();
  renderDetail();
})();
