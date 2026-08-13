// ─── Every project gets the approach it needs - interactive project-approach timeline ───
// Desktop: a gantt chart (one lane per phase, overlaps stacked diagonally).
// Mobile: a vertical accordion. The switch is driven by a ResizeObserver on
// the component's own container (#sprint-app), not window width, so this
// still renders correctly if the section ever sits in a narrower column.
(function () {
  const appEl = document.getElementById('sprint-app');
  if (!appEl) return;

  const tabsEl = document.getElementById('sprint-tabs');
  const noteEl = document.getElementById('sprint-note');
  const totalEl = document.getElementById('sprint-total');
  const ganttEl = document.getElementById('sprint-gantt');
  const accordionEl = document.getElementById('sprint-accordion');
  const legendEl = document.getElementById('sprint-legend');
  const detailWrapEl = document.getElementById('sprint-detail-wrap');

  const INK = '#111111';
  const ACCENT = '#A63D1F';
  const MOBILE_BREAKPOINT = 680;
  const ROW_H = 56;
  const BAR_H = 44;

  const CAT_STYLE = {
    research: { label: 'Research', accent: '#4C6178' },
    design:   { label: 'Design',   accent: '#A63D1F' },
    build:    { label: 'Build',    accent: '#6B4423' },
    testing:  { label: 'Validate', accent: '#C98A12' },
    adopt:    { label: 'Adoption', accent: '#3F7D5C' },
    ship:     { label: 'Release',  accent: '#111111' },
  };

  const PROJECT_TYPES = {
    '0→1 Product': {
      note: "Framed as a focused product scope: a validated concept and a first releasable slice, not a finished platform.",
      defaultIdx: 0,
      phases: [
        { label: 'Discovery & Framing', weeks: 1.25, overlap: 0, cat: 'research', purpose: 'Get to the real problem and its constraints before any concept takes shape.', activities: ['Stakeholder interviews', 'Workflow & usage audit', 'Competitive scan', 'Problem framing'], outcome: 'A problem framing the team agrees on.', use: 'New problem space, with no existing validated framing.', skip: 'The problem is narrow and already validated by prior work.', collab: 'Product on scope, domain experts and Engineering on technical constraints.', ai: 'Synthesizing interview notes and support tickets into patterns worth investigating.', human: 'Deciding which problem is actually worth solving.' },
        { label: 'Concept & Core Flows', weeks: 1.25, overlap: 0.5, cat: 'design', purpose: 'Shape the first workable structure for the core flows.', activities: ['Journey mapping', 'Information architecture', 'Low-fi concepts', 'Key-flow wireframes'], outcome: 'A concept direction ready to prototype.', use: 'Default for a new flow or structure.', skip: 'Extending a pattern the design system already solved.', collab: 'Product on trade-offs, Engineering early on feasibility.', ai: 'Exploring alternative flow structures and surfacing edge cases quickly.', human: 'Judging which structure actually fits how people work.' },
        { label: 'Prototype & Validation', weeks: 1.25, overlap: 0.5, cat: 'testing', purpose: 'Test the concept against real use before committing engineering time.', activities: ['Clickable prototype', 'Moderated sessions', 'Synthesis', 'Prioritized revisions'], outcome: 'A validated concept, or a clear list of what to change.', use: 'The workflow is high-risk or high-frequency for real operators.', skip: 'Internal tooling with a tight timeline and low blast radius.', collab: "Research on test design, Product on what 'good enough' means.", ai: 'Synthesizing session recordings and feedback into patterns.', human: 'Interpreting what the evidence actually means for the design.' },
        { label: 'Build Partnership & QA', weeks: 1.5, overlap: 0.5, cat: 'build', purpose: 'Keep the design correct as it becomes real, not just handed off.', activities: ['Component specs', 'Edge-case states', 'Accessibility notes', 'Engineering pairing'], outcome: 'A releasable slice that matches the validated concept.', use: 'Default.', skip: 'Pairing live with an engineer in the same tool, start to finish.', collab: 'Engineering daily, QA on edge cases.', ai: 'Drafting specs, edge-case checklists and accessibility notes.', human: 'Catching the gap between spec and what actually shipped.' },
        { label: 'Release & Learn', weeks: 0.5, overlap: 0, cat: 'ship', purpose: 'Confirm the concept holds up with real usage, not just test sessions.', activities: ['Phased rollout', 'Adoption tracking', 'Regression watch'], outcome: 'Evidence for what to build next.', use: 'Always.', skip: 'Rarely. Shipping without watching is where regressions hide.', collab: 'Product and Data on what to measure.', ai: 'Monitoring usage signals and surfacing anomalies early.', human: 'Deciding whether the signal means keep going or rework.' },
      ],
    },
    'Rapid Prototype': {
      note: "The goal isn't polished delivery. It's reducing uncertainty fast enough to make a decision.",
      defaultIdx: 0,
      phases: [
        { label: 'Frame the Question', weeks: 0.5, overlap: 0, cat: 'research', purpose: 'Know exactly what decision this prototype needs to inform.', activities: ['Fast context conversations', 'Constraint check', 'Defining the question'], outcome: 'One clear question the prototype needs to answer.', use: 'Default.', skip: 'The brief is already tight and well understood.', collab: 'Product on what decision is riding on this.', ai: 'Quick synthesis of existing context and prior docs.', human: 'Picking the one question that actually matters.' },
        { label: 'Explore Directions', weeks: 0.75, overlap: 0.25, cat: 'design', purpose: 'Generate a few genuinely different ways to answer the question.', activities: ['Direction sketches', 'Quick UI explorations'], outcome: '2–3 directions worth prototyping.', use: 'Default.', skip: 'The direction is obvious, with only one sensible path.', collab: 'Design peers for a fast gut-check.', ai: 'Generating and varying alternative directions quickly.', human: 'Choosing which direction is worth building.' },
        { label: 'Prototype', weeks: 1, overlap: 0.25, cat: 'build', purpose: 'Make the idea concrete enough to react to.', activities: ['Clickable prototype build', 'Interaction polish where it matters'], outcome: 'Something real to put in front of people.', use: 'Default.', skip: 'A static concept is enough to make the decision.', collab: 'Engineering if feasibility is the open question.', ai: 'Rapid prototype build and interaction iteration.', human: 'Deciding what fidelity is actually needed.' },
        { label: 'Test or Gather Signals', weeks: 0.5, overlap: 0.25, cat: 'testing', purpose: 'Get real reactions before recommending a direction.', activities: ['Quick sessions or targeted feedback', 'Synthesis'], outcome: 'Signal on whether the direction works.', use: 'Default.', skip: 'Rarely.', collab: 'Whoever owns the decision sits in on sessions.', ai: 'Fast synthesis of feedback into themes.', human: 'Judging what the signal is actually worth.' },
        { label: 'Recommend the Next Step', weeks: 0.5, overlap: 0, cat: 'ship', purpose: 'Turn signal into a clear recommendation.', activities: ['Write-up', 'Recommendation', 'Next-step framing'], outcome: 'A decision the team can act on.', use: 'Always.', skip: 'Rarely.', collab: 'Product and stakeholders on the call.', ai: 'Drafting the recommendation write-up.', human: 'Owning the recommendation, not just presenting options.' },
      ],
    },
    'Design System': {
      note: "A foundation and pilot release. System growth continues through product adoption.",
      defaultIdx: 0,
      phases: [
        { label: 'Audit & Prioritisation', weeks: 1, overlap: 0, cat: 'research', purpose: 'Know what actually needs fixing before proposing foundations.', activities: ['Component inventory', 'Inconsistency mapping', 'Tech-debt notes', 'Prioritisation'], outcome: 'A prioritised list of what the system needs to solve first.', use: 'Default.', skip: 'Starting from zero, with no existing patterns to reconcile.', collab: 'Engineering on technical debt, Product on priority.', ai: 'Scanning components and screens for inconsistencies at scale.', human: "Deciding what's worth standardising versus leaving alone." },
        { label: 'Foundations', weeks: 1.5, overlap: 0.25, cat: 'design', purpose: 'Build the layer every component inherits from.', activities: ['Tokens', 'Spacing scale', 'Type scale', 'Core primitives'], outcome: 'Foundations components can be built on.', use: 'Almost always, this is the part that has to be right first.', skip: 'Rarely.', collab: 'Engineering on token implementation.', ai: 'Generating scale options and running consistency checks.', human: 'Deciding the actual values and naming.' },
        { label: 'Pilot Components', weeks: 2.5, overlap: 0.5, cat: 'build', purpose: 'Prove the foundations work on real components before scaling further.', activities: ['Pilot component set', 'Documented states', 'Props & variants', 'Accessibility behaviour'], outcome: 'A working pilot set other teams can start adopting.', use: 'Default.', skip: 'Rarely.', collab: 'Engineering builds, QA on accessibility behaviour.', ai: 'Scaffolding component variants and state permutations.', human: "Judging which components generalise and which don't." },
        { label: 'Documentation & Adoption', weeks: 2, overlap: 1, cat: 'adopt', purpose: 'Make the system usable by other teams, not just complete.', activities: ['Usage documentation', 'Migration guidance', 'Pairing with adopting teams'], outcome: 'At least one team successfully adopting the pilot set.', use: 'Default.', skip: 'A system built for a single internal use, not for reuse.', collab: 'Every team adopting the system.', ai: 'Drafting documentation and usage examples from component code.', human: 'Making sure docs answer the questions teams actually have.' },
        { label: 'Measure & Evolve', weeks: 0.75, overlap: 0.5, cat: 'ship', purpose: 'Confirm the system holds up in real product use.', activities: ['Adoption tracking', 'Gap identification', 'Roadmap for next components'], outcome: "A prioritised backlog for the system's next phase.", use: 'Always.', skip: 'Rarely.', collab: 'Product and every adopting team.', ai: 'Surfacing usage gaps and inconsistency drift.', human: 'Deciding what earns a place in the system next.' },
      ],
    },
    'Redesign': {
      note: "Framed as the redesign of a focused product area or workflow. Scope and duration adjust to what's actually being touched.",
      defaultIdx: 0,
      phases: [
        { label: 'Diagnose & Frame', weeks: 1, overlap: 0, cat: 'research', purpose: 'Understand why the current version fails before touching it.', activities: ['Usage data review', 'Support-ticket audit', 'Workflow observation'], outcome: "A clear diagnosis of what's actually broken.", use: 'Default.', skip: 'The problems are already well documented.', collab: 'Data on usage evidence, Support on recurring complaints.', ai: 'Clustering support tickets and usage logs into failure patterns.', human: 'Deciding which failure is the one worth solving first.' },
        { label: 'Prioritise', weeks: 0.5, overlap: 0.25, cat: 'research', purpose: 'Decide what actually needs to change versus what to leave alone.', activities: ['Scoping the redesign boundary', 'Trade-off framing'], outcome: 'A scoped boundary the team agrees on.', use: 'Default.', skip: 'The scope is already obvious from the diagnosis.', collab: 'Product on scope and timeline trade-offs.', ai: 'Modeling scope options against effort and impact.', human: 'Owning the scope call.' },
        { label: 'Redesign Core Flows', weeks: 1.5, overlap: 0.25, cat: 'design', purpose: 'Rework flows and UI without breaking muscle memory for existing users.', activities: ['Flow rework', 'UI design pass', 'Migration considerations'], outcome: 'A redesign direction ready to validate.', use: 'Default.', skip: 'Rarely.', collab: 'Design peers and Engineering on feasibility.', ai: 'Exploring alternative flow structures quickly.', human: "Judging what existing users can and can't re-learn." },
        { label: 'Validate', weeks: 1, overlap: 0.5, cat: 'testing', purpose: 'Make sure the redesign actually solves the diagnosed problem.', activities: ['Sessions with existing users', 'Synthesis', 'Prioritized revisions'], outcome: 'A validated direction, or a clear list of what to revise.', use: 'The redesign touches a workflow people rely on daily.', skip: 'A low-traffic screen with little risk.', collab: 'Research on session design.', ai: 'Synthesizing feedback across sessions quickly.', human: 'Interpreting whether hesitation is a real problem or just unfamiliarity.' },
        { label: 'Build & QA', weeks: 1.5, overlap: 0.5, cat: 'build', purpose: 'Keep the redesign correct as it becomes real.', activities: ['Component specs', 'Edge-case states', 'Engineering pairing', 'QA pass'], outcome: 'A releasable redesign that matches the validated direction.', use: 'Default.', skip: 'Rarely.', collab: 'Engineering daily, QA on regressions.', ai: 'Drafting specs and regression checklists.', human: "Catching regressions that testing alone won't reveal." },
        { label: 'Release & Measure', weeks: 0.5, overlap: 0, cat: 'ship', purpose: 'Confirm the redesign performs better than what it replaced.', activities: ['Phased rollout', 'Adoption tracking', 'Regression watch'], outcome: 'Evidence the redesign is working, or an early signal to fix.', use: 'Always.', skip: "Rarely. This is the step most redesigns skip and shouldn't.", collab: 'Product and Data on what to measure.', ai: 'Monitoring rollout signals and flagging anomalies.', human: 'Deciding if a dip is noise or a real regression.' },
      ],
    },
  };

  const typeNames = Object.keys(PROJECT_TYPES);
  let activeType = typeNames[0];
  let activeIdx = -1;
  let isMobile = appEl.offsetWidth < MOBILE_BREAKPOINT;

  function hexToRgba(hex, a) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function computeLayout(phases) {
    let cursor = 0;
    const withStart = phases.map((p, i) => {
      const start = i === 0 ? 0 : cursor - p.overlap;
      cursor = start + p.weeks;
      return Object.assign({}, p, { start });
    });
    return { withStart, total: cursor };
  }

  function durLabel(weeks, prefix) {
    const disp = Math.round(weeks * 2) / 2;
    const n = disp % 1 === 0 ? disp : disp.toFixed(1);
    return (prefix ? '~' : '') + n + 'w';
  }

  function selectType(name) {
    activeType = name;
    activeIdx = -1;
    render();
  }

  function selectPhase(i) {
    activeIdx = i;
    render();
  }

  function renderTabs() {
    tabsEl.innerHTML = '';
    typeNames.forEach(name => {
      const isActive = name === activeType;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sprint-tab font-mono text-[13px] px-6 py-3' + (isActive ? ' active font-medium' : '');
      b.textContent = name;
      b.onclick = () => selectType(name);
      tabsEl.appendChild(b);
    });
  }

  function renderTotal(total) {
    const low = Math.max(1, Math.floor(total));
    const high = Math.ceil(total) === low ? low + 1 : Math.ceil(total);
    totalEl.textContent = '~' + low + '–' + high + ' weeks';
  }

  function renderLegend(phasesRaw) {
    legendEl.innerHTML = '';
    const seenCats = [...new Set(phasesRaw.map(p => p.cat))];
    seenCats.forEach(cat => {
      const c = CAT_STYLE[cat];
      legendEl.insertAdjacentHTML('beforeend', `<span class="flex items-center gap-[6px] font-sans text-text text-xs"><span class="inline-block w-2 h-2 rounded-full" style="background:${c.accent}"></span>${c.label}</span>`);
    });
  }

  function renderGanttDesktop(withStart, total, effectiveIdx) {
    const ganttHeight = (withStart.length - 1) * ROW_H + BAR_H;

    ganttEl.innerHTML = '';
    const outer = document.createElement('div');
    outer.className = 'relative';
    outer.style.cssText = 'padding-top:26px;overflow:visible;';

    const tickCount = Math.ceil(total);
    for (let w = 1; w <= tickCount; w++) {
      const t = document.createElement('span');
      t.className = 'font-mono text-[10px] font-bold';
      t.style.cssText = `position:absolute;top:0;left:${Math.min(100, (w / total) * 100)}%;color:rgba(17,17,17,.35);transform:translateX(-50%);white-space:nowrap;`;
      t.textContent = 'W' + w;
      outer.appendChild(t);
    }

    const totalDays = Math.round(total * 7);
    for (let d = 1; d < totalDays; d++) {
      if (d % 7 === 0) continue;
      const dt = document.createElement('span');
      dt.style.cssText = `position:absolute;top:18px;left:${Math.min(100, (d / 7 / total) * 100)}%;width:1px;height:6px;background:rgba(17,17,17,.15);`;
      outer.appendChild(dt);
    }

    const inner = document.createElement('div');
    inner.className = 'relative';
    inner.style.cssText = `height:${ganttHeight}px;margin-top:4px;`;

    for (let w = 0; w <= Math.ceil(total); w++) {
      const g = document.createElement('div');
      g.style.cssText = `position:absolute;top:0;left:${Math.min(100, (w / total) * 100)}%;width:1px;height:${ganttHeight}px;background:rgba(17,17,17,.07);`;
      inner.appendChild(g);
    }

    withStart.forEach((p, i) => {
      const c = CAT_STYLE[p.cat];
      const leftPct = (p.start / total) * 100;
      const widthPct = (p.weeks / total) * 100;
      const isActive = i === effectiveIdx;

      if (p.overlap > 0 && i > 0) {
        const bottomCurr = i * ROW_H + BAR_H;
        const overlapWidthPct = (p.overlap / total) * 100;
        const band = document.createElement('div');
        band.style.cssText = `position:absolute;top:0;left:${leftPct}%;width:${overlapWidthPct}%;height:${bottomCurr}px;background:${hexToRgba(c.accent, 0.05)};border-radius:6px;z-index:0;`;
        inner.appendChild(band);
      }

      const bar = document.createElement('button');
      bar.type = 'button';
      bar.className = 'sprint-bar' + (isActive ? ' active' : '');
      bar.setAttribute('aria-pressed', String(isActive));
      bar.setAttribute('aria-controls', 'sprint-detail-panel');
      bar.title = p.label;
      bar.style.cssText = `--hover-ring:${hexToRgba(c.accent, 0.65)};position:absolute;top:${i * ROW_H}px;left:${leftPct}%;width:${widthPct}%;height:${BAR_H}px;min-width:0;display:flex;flex-direction:row;align-items:stretch;gap:8px;padding:7px 10px;text-align:left;border:1px solid ${hexToRgba(c.accent, isActive ? 0.65 : 0.4)};border-radius:10px;overflow:hidden;background:${hexToRgba(c.accent, isActive ? 0.32 : 0.2)};backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:${INK};z-index:1;box-shadow:${isActive ? '0 0 0 2px ' + INK : 'none'};`;
      bar.innerHTML = `
        <span style="width:3px;border-radius:2px;background:${c.accent};flex-shrink:0"></span>
        <span class="flex flex-col justify-center gap-[1px] min-w-0">
          <span class="font-sans font-medium text-[11px] leading-[1.15] text-text break-words">${p.label}</span>
          <span class="font-mono text-[9px]" style="color:rgba(17,17,17,.55)">${durLabel(p.weeks, true)}</span>
        </span>`;
      bar.onclick = () => selectPhase(i);
      inner.appendChild(bar);
    });

    outer.appendChild(inner);
    ganttEl.appendChild(outer);
  }

  function renderAccordionMobile(withStart, total, effectiveIdx) {
    accordionEl.innerHTML = '';
    withStart.forEach((p, i) => {
      const c = CAT_STYLE[p.cat];
      const isActive = i === effectiveIdx;
      const panelId = 'sprint-mobile-panel-' + i;

      const wrap = document.createElement('div');

      if (p.overlap > 0 && i > 0) {
        const note = document.createElement('div');
        note.className = 'flex items-center gap-[6px] font-mono text-[10.5px]';
        note.style.cssText = 'color:rgba(17,17,17,.5);padding:6px 4px 6px 18px;';
        note.textContent = '⟲ begins before the previous phase wraps up';
        wrap.appendChild(note);
      }

      const header = document.createElement('button');
      header.type = 'button';
      header.className = 'sprint-mobile-header flex items-center gap-[10px] w-full';
      header.setAttribute('aria-expanded', String(isActive));
      header.setAttribute('aria-controls', panelId);
      header.style.cssText = `background:${hexToRgba(c.accent, isActive ? 0.32 : 0.2)};backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:${isActive ? '1.5px solid ' + INK : '1px solid ' + hexToRgba(c.accent, 0.4)};border-radius:${isActive ? '14px 14px 0 0' : '14px'};padding:14px 16px;margin-bottom:${isActive ? '0' : '10px'};`;
      header.innerHTML = `
        <span style="width:4px;height:22px;border-radius:2px;background:${c.accent};flex-shrink:0"></span>
        <span class="flex-1 font-sans font-bold text-[14.5px] text-text text-left">${p.label}</span>
        <span class="font-mono text-[11px] whitespace-nowrap" style="color:rgba(17,17,17,.6)">${durLabel(p.weeks, false)}</span>`;
      header.onclick = () => selectPhase(i);
      wrap.appendChild(header);

      if (isActive) {
        const panel = document.createElement('div');
        panel.id = panelId;
        panel.className = 'bg-white border border-border';
        panel.style.cssText = 'border-top:none;border-radius:0 0 14px 14px;padding:20px 18px 24px;margin-bottom:12px;';
        panel.innerHTML = `
          <p class="font-sans text-text text-[14.5px] leading-[1.5] mb-4">${p.purpose}</p>
          <div class="font-mono text-[10.5px] tracking-[0.7px] mb-2" style="color:rgba(17,17,17,.55)">Key activities</div>
          ${p.activities.map(a => `<div class="flex items-start gap-2 font-sans text-text text-[13.5px] mb-2"><span class="w-[5px] h-[5px] rounded-full bg-text mt-[7px] flex-shrink-0"></span>${a}</div>`).join('')}
          <div class="font-mono text-[10.5px] tracking-[0.7px] mt-[14px] mb-[6px]" style="color:rgba(17,17,17,.55)">Expected outcome</div>
          <p class="font-sans text-text text-[13.5px] leading-[1.5] mb-4">${p.outcome}</p>
          <div class="grid grid-cols-1 gap-3 mb-4">
            <div class="bg-surface border-l-2 border-accent flex flex-col gap-1 pl-4 pr-3 py-3 rounded-xl">
              <p class="font-mono text-accent text-[10px] tracking-[0.6px] uppercase">When I use it</p>
              <p class="font-sans text-text text-[13px] leading-[1.5]">${p.use}</p>
            </div>
            <div class="bg-surface border-l-2 border-accent flex flex-col gap-1 pl-4 pr-3 py-3 rounded-xl">
              <p class="font-mono text-accent text-[10px] tracking-[0.6px] uppercase">When I reduce or skip it</p>
              <p class="font-sans text-text text-[13px] leading-[1.5]">${p.skip}</p>
            </div>
          </div>
          <div class="flex flex-col gap-3 pt-[14px] border-t border-border">
            <div class="flex flex-col gap-1"><p class="font-mono text-[10px] tracking-[0.6px]" style="color:rgba(17,17,17,.55)">Collaboration</p><p class="font-sans text-text text-[13px]">${p.collab}</p></div>
            <div class="flex flex-col gap-1"><p class="font-mono text-[10px] tracking-[0.6px]" style="color:rgba(17,17,17,.55)">AI acceleration</p><p class="font-sans text-text text-[13px]">${p.ai}</p></div>
            <div class="flex flex-col gap-1"><p class="font-mono text-[10px] tracking-[0.6px]" style="color:rgba(17,17,17,.55)">Human checkpoint</p><p class="font-sans text-text text-[13px]">${p.human}</p></div>
          </div>`;
        wrap.appendChild(panel);
      }

      accordionEl.appendChild(wrap);
    });
  }

  function renderDetail(withStart, effectiveIdx) {
    const dp = withStart[effectiveIdx];
    const disp = Math.round(dp.weeks * 2) / 2;
    const dur = disp + (disp === 1 ? ' week' : ' weeks');

    detailWrapEl.innerHTML = `
      <div id="sprint-detail-panel" aria-live="polite" class="bg-white border border-border rounded-[20px] p-8">
        <div class="flex items-baseline gap-4 flex-wrap pb-5 mb-6 border-b border-border">
          <div class="font-sans font-semibold text-text text-xl">${dp.label}</div>
          <div class="font-mono text-text text-[13px] ml-auto whitespace-nowrap">${dur}</div>
        </div>
        <p class="font-sans text-text text-[15px] leading-[1.65] mb-7 max-w-[760px]">${dp.purpose}</p>
        <div class="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 mb-7">
          <div>
            <div class="font-mono text-[11px] tracking-[0.8px] mb-[14px]" style="color:rgba(17,17,17,.55)">Key activities</div>
            ${dp.activities.map(a => `<div class="flex items-start gap-[9px] font-sans text-text text-sm font-semibold mb-[11px]"><span class="w-[6px] h-[6px] rounded-full bg-text mt-[6px] flex-shrink-0"></span>${a}</div>`).join('')}
            <div class="font-mono text-[11px] tracking-[0.8px] mt-5 mb-2" style="color:rgba(17,17,17,.55)">Expected outcome</div>
            <p class="font-sans text-text text-sm leading-[1.6]">${dp.outcome}</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            <div class="bg-surface border-l-2 border-accent flex flex-col gap-[6px] pl-6 pr-5 py-[18px] rounded-xl">
              <p class="font-mono text-accent text-[10px] tracking-[0.8px] uppercase">When I use it</p>
              <p class="font-sans text-text text-[13.5px] leading-[1.55]">${dp.use}</p>
            </div>
            <div class="bg-surface border-l-2 border-accent flex flex-col gap-[6px] pl-6 pr-5 py-[18px] rounded-xl">
              <p class="font-mono text-accent text-[10px] tracking-[0.8px] uppercase">When I reduce or skip it</p>
              <p class="font-sans text-text text-[13.5px] leading-[1.55]">${dp.skip}</p>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-border">
          <div>
            <div class="font-mono text-[11px] tracking-[0.8px] mb-2" style="color:rgba(17,17,17,.55)">Collaboration</div>
            <p class="font-sans text-text text-[13.5px] leading-[1.55]">${dp.collab}</p>
          </div>
          <div>
            <div class="font-mono text-[11px] tracking-[0.8px] mb-2" style="color:rgba(17,17,17,.55)">AI acceleration</div>
            <p class="font-sans text-text text-[13.5px] leading-[1.55]">${dp.ai}</p>
          </div>
          <div>
            <div class="font-mono text-[11px] tracking-[0.8px] mb-2" style="color:rgba(17,17,17,.55)">Human checkpoint</div>
            <p class="font-sans text-text text-[13.5px] leading-[1.55]">${dp.human}</p>
          </div>
        </div>
      </div>`;
  }

  function render() {
    const typeData = PROJECT_TYPES[activeType];
    const effectiveIdx = activeIdx === -1 ? typeData.defaultIdx : activeIdx;
    const { withStart, total } = computeLayout(typeData.phases);

    renderTabs();
    noteEl.textContent = typeData.note;
    renderTotal(total);
    renderLegend(typeData.phases);

    if (isMobile) {
      ganttEl.classList.add('hidden');
      accordionEl.classList.remove('hidden');
      detailWrapEl.innerHTML = '';
      renderAccordionMobile(withStart, total, effectiveIdx);
    } else {
      accordionEl.classList.add('hidden');
      ganttEl.classList.remove('hidden');
      renderGanttDesktop(withStart, total, effectiveIdx);
      renderDetail(withStart, effectiveIdx);
    }
  }

  const ro = new ResizeObserver(entries => {
    const w = entries[0].contentRect.width;
    const nowMobile = w < MOBILE_BREAKPOINT;
    if (nowMobile !== isMobile) {
      isMobile = nowMobile;
      render();
    }
  });
  ro.observe(appEl);

  render();
})();
