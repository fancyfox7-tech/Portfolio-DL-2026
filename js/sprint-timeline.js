// ─── Every project gets the approach it needs - interactive project-approach timeline ───
// Desktop: phases stack as a vertical track, one block per phase, overlapping
// phases shift upward and layer over the end of the previous block.
// Mobile: a vertical accordion. The switch is driven by a ResizeObserver on
// the component's own container (#sprint-app), not window width, so this
// still renders correctly if the section ever sits in a narrower column.
(function () {
  const appEl = document.getElementById('sprint-app');
  if (!appEl) return;

  const tabsEl = document.getElementById('sprint-tabs');
  const totalEl = document.getElementById('sprint-total');
  const ganttEl = document.getElementById('sprint-gantt');
  const accordionEl = document.getElementById('sprint-accordion');
  const detailWrapEl = document.getElementById('sprint-detail-wrap');

  const MOBILE_BREAKPOINT = 680;
  const MIN_BLOCK = 56;
  const MIN_CLEAR = 54; // px a phase's own title/duration is guaranteed before the next phase's overlap begins

  const CAT_LABEL = {
    research: 'Research',
    design:   'Design',
    build:    'Build',
    testing:  'Validate',
    adopt:    'Adoption',
    ship:     'Release',
  };

  const PROJECT_TYPES = {
    '0→1 Product': {
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

  // Desktop: a vertical track. Each phase is an absolutely-positioned block
  // whose top/height are percentages of the total week-span. Phases that
  // overlap the previous one shift upward by that overlap (as a % of span,
  // clamped to a sane pixel range) and sit at a higher z-index, so they
  // visually layer over the tail end of the phase before them.
  function renderVTrack(withStart, total, effectiveIdx) {
    ganttEl.innerHTML = '';

    const GUTTER = 40; // px reserved left of the blocks for the tick rail — enough for the label+dot unit to sit centered with room on both sides

    const wrap = document.createElement('div');
    wrap.className = 'relative h-full';
    wrap.style.cssText = `margin-left:${GUTTER}px;`;
    ganttEl.appendChild(wrap); // mount before measuring so heights below are real

    const trackH = wrap.getBoundingClientRect().height || 440;

    // A solid line, not dashed — the "dotted" look comes from the round
    // week-markers on it, not from breaking up the line itself. The week
    // label sits beside its dot as one centered unit, off the line's own
    // axis, so the line never has to run visibly behind a "W#" — it only
    // ever threads through the (opaque, later-painted) dots, which fully
    // mask it.
    const tickCount = Math.ceil(total);
    const dotEls = [];
    for (let w = 0; w < tickCount; w++) {
      const pct = (w / total) * 100;
      const row = document.createElement('div');
      row.style.cssText = `position:absolute;left:${-GUTTER}px;width:${GUTTER}px;top:${pct}%;transform:translateY(-50%);z-index:1;display:flex;align-items:center;justify-content:center;gap:5px;`;
      const label = document.createElement('span');
      label.className = 'font-mono';
      label.style.cssText = 'font-size:9.5px;line-height:1;color:rgba(17,17,17,.45);white-space:nowrap;';
      label.textContent = 'W' + (w + 1);
      const dot = document.createElement('span');
      dot.style.cssText = 'width:5px;height:5px;border-radius:50%;background:rgba(17,17,17,.42);flex-shrink:0;';
      row.appendChild(label);
      row.appendChild(dot);
      wrap.appendChild(row);
      dotEls.push(dot);
    }

    // The line is measured to the dots' actual x-center rather than
    // hand-computed from font metrics, so it stays pixel-aligned with the
    // centered label+dot unit above regardless of font rendering.
    if (dotEls.length) {
      const wrapLeft = wrap.getBoundingClientRect().left;
      const dotRect = dotEls[0].getBoundingClientRect();
      const dotCenterX = dotRect.left + dotRect.width / 2 - wrapLeft;
      const spine = document.createElement('div');
      spine.style.cssText = `position:absolute;left:${dotCenterX}px;top:2px;bottom:2px;width:1px;background:rgba(17,17,17,.16);z-index:0;transform:translateX(-50%);`;
      wrap.insertBefore(spine, wrap.firstChild);
    }

    // Phase start positions, computed in real pixels (not %) so a minimum
    // clear gap can be enforced before positioning: p.start already bakes
    // the overlap into the raw position, and for short, heavily-overlapped
    // phases that raw gap can be tighter than a title + duration need. Each
    // start is nudged down just enough to guarantee MIN_CLEAR px of
    // uncovered space for the *previous* phase's own label — the overlap
    // stays visible, it's just never allowed to eat the previous title.
    let prevStart = 0;
    const positioned = withStart.map((p, i) => {
      const rawStart = (p.start / total) * trackH;
      const start = i === 0 ? rawStart : Math.max(rawStart, prevStart + MIN_CLEAR);
      prevStart = start;
      const height = Math.max(MIN_BLOCK, (p.weeks / total) * trackH);
      return { p, start, height };
    });

    positioned.forEach(({ p, start, height }, i) => {
      const isActive = i === effectiveIdx;

      // Fills are translucent + blurred (not flat) so a later phase's
      // block visibly frosts over the tail of the phase before it — the
      // overlap has to be *seen*, not just implied by z-index.
      const block = document.createElement('button');
      block.type = 'button';
      block.className = 'sprint-bar' + (isActive ? ' active' : '');
      block.setAttribute('aria-pressed', String(isActive));
      block.setAttribute('aria-controls', 'sprint-detail-panel');
      block.title = p.label;

      // display:flex + align-items:flex-start is load-bearing, not
      // decorative: a plain <button> vertically centers block-level
      // content internally in Chrome regardless of an explicit
      // display:block, so taller phases had their title pushed down
      // toward the overlap zone below. Flex fully overrides that.
      //
      // Active is a lighter, more transparent terracotta wash rather than
      // a heavy solid fill — selection reads from the stronger 2px border
      // instead. Since the fill is that light, white title text would lose
      // contrast, so both states keep the standard dark #111 text; only
      // the accent bar (matching the mobile accordion's own left bar, for
      // consistency between the two views) switches to solid terracotta
      // to still make the active phase pop over its neighbors.
      block.style.cssText = `position:absolute;left:0;right:0;top:${start}px;height:${height}px;z-index:${i + 2};display:flex;flex-direction:row;align-items:flex-start;gap:9px;text-align:left;padding:10px 13px;border-radius:12px;overflow:hidden;color:#111111;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:background 150ms ease,border-color 150ms ease,box-shadow 150ms ease;` +
        (isActive
          ? 'background:rgba(166,61,31,.22);border:2px solid rgba(166,61,31,.75);'
          : 'background:rgba(17,17,17,.055);border:1px solid rgba(17,17,17,.08);');

      block.innerHTML = `
        <span style="width:3px;border-radius:2px;flex-shrink:0;margin-top:1px;align-self:stretch;background:${isActive ? '#A63D1F' : 'rgba(17,17,17,.2)'}"></span>
        <span style="display:flex;flex-direction:column;min-width:0;">
          <span class="block font-sans font-semibold text-[12.5px] leading-[1.2]">${p.label}</span>
          <span class="block font-mono text-[10px] mt-[3px]" style="opacity:${isActive ? 0.7 : 0.55}">${durLabel(p.weeks, true)}</span>
        </span>`;
      block.onclick = () => selectPhase(i);
      wrap.appendChild(block);
    });
  }

  function renderAccordionMobile(withStart, total, effectiveIdx) {
    accordionEl.innerHTML = '';
    withStart.forEach((p, i) => {
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
      header.style.cssText = `background:${isActive ? '#A63D1F' : '#F5F5F5'};color:${isActive ? '#ffffff' : '#111111'};border:1px solid ${isActive ? '#A63D1F' : 'rgba(0,0,0,.08)'};border-radius:${isActive ? '14px 14px 0 0' : '14px'};padding:14px 16px;margin-bottom:${isActive ? '0' : '10px'};`;
      header.innerHTML = `
        <span style="width:4px;height:22px;border-radius:2px;background:${isActive ? '#ffffff' : '#111111'};flex-shrink:0"></span>
        <span class="flex-1 font-sans font-bold text-[14.5px] text-left">${p.label}</span>
        <span class="font-mono text-[11px] whitespace-nowrap" style="opacity:${isActive ? 0.85 : 0.55}">${durLabel(p.weeks, false)}</span>`;
      header.onclick = () => selectPhase(i);
      wrap.appendChild(header);

      if (isActive) {
        const panel = document.createElement('div');
        panel.id = panelId;
        panel.className = 'bg-white border border-border';
        panel.style.cssText = 'border-top:none;border-radius:0 0 14px 14px;padding:20px 18px 24px;margin-bottom:12px;';
        panel.innerHTML = `
          <p class="font-sans text-text text-[14.5px] leading-[1.5] mb-4">${p.purpose}</p>
          <div class="font-mono text-[10.5px] tracking-[0.7px] mb-2" style="color:rgba(17,17,17,.55)">Breakdown</div>
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
    const catLabel = CAT_LABEL[dp.cat] || '';

    detailWrapEl.innerHTML = `
      <div id="sprint-detail-panel" aria-live="polite" class="bg-white border border-border rounded-3xl p-7 flex flex-col md:h-[545px]">
        <div class="flex items-baseline gap-3 flex-wrap pb-5 mb-5 border-b border-border shrink-0">
          <div class="font-sans font-semibold text-text text-xl">${dp.label}</div>
          <span class="font-mono text-[10px] tracking-[0.6px] uppercase bg-surface text-text px-3 py-1 rounded-full">${catLabel}</span>
          <div class="font-mono text-text text-[13px] ml-auto whitespace-nowrap">${dur}</div>
        </div>
        <div class="flex-1 min-h-0 md:overflow-y-auto">
          <p class="font-sans text-text text-[15px] leading-[1.65] mb-7 max-w-[760px]">${dp.purpose}</p>
          <div class="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 mb-7">
            <div>
              <div class="font-mono text-[11px] tracking-[0.8px] mb-[14px]" style="color:rgba(17,17,17,.55)">Breakdown</div>
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
        </div>
      </div>`;
  }

  function render() {
    const typeData = PROJECT_TYPES[activeType];
    const effectiveIdx = activeIdx === -1 ? typeData.defaultIdx : activeIdx;
    const { withStart, total } = computeLayout(typeData.phases);

    renderTabs();
    renderTotal(total);

    if (isMobile) {
      ganttEl.classList.add('hidden');
      accordionEl.classList.remove('hidden');
      detailWrapEl.innerHTML = '';
      renderAccordionMobile(withStart, total, effectiveIdx);
    } else {
      accordionEl.classList.add('hidden');
      ganttEl.classList.remove('hidden');
      renderVTrack(withStart, total, effectiveIdx);
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
