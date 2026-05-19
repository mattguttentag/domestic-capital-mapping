/* African PF/SWF Capital Mapping — Main App */

// ─── Data accessors ────────────────────────────────────────────────
const D = {
  commitments: () => DATASET['Commitments_Database'] || [],
  pipeline:    () => DATASET['Pipeline_and_Mandates'] || [],
  funds:       () => DATASET['Funds_and_LP_Co-Investors'] || [],
  dfis:        () => DATASET['DFI_Co-Investor_Patterns'] || [],
  swfs:        () => DATASET['Sovereign_Wealth_Funds'] || [],
  pensions:    () => DATASET['Pension_Funds'] || [],
  tier1:       () => DATASET['Tier_1_Candidates'] || [],
  country:     () => DATASET['Country_Summary'] || [],
  regulatory:  () => DATASET['Regulatory_vs_Behaviour'] || [],
  absentees:   () => DATASET['Absentees_Investigation'] || [],
};

// ─── Helpers ───────────────────────────────────────────────────────
function fmt(v) {
  if (v == null || v === '' || v === 'Not disclosed publicly') return '—';
  return String(v);
}

function fmtAUM(v) {
  if (!v || v == null) return '—';
  const n = parseFloat(String(v).replace(/[,$]/g, ''));
  if (isNaN(n)) return fmt(v);
  if (n >= 100000) return `$${(n/1000).toFixed(0)}bn`;
  if (n >= 1000)   return `$${(n/1000).toFixed(1)}bn`;
  return `$${n.toFixed(0)}m`;
}

function assetClass(str) {
  if (!str) return 'Other';
  const s = String(str).toLowerCase();
  if (s.includes('fof') || s.includes('fund of fund') || s.includes('fund-of-fund') || s.includes('fundoffunds')) return 'FundOfFunds';
  if (s.includes('infrastructure') || s.includes('infra')) return 'Infra';
  if (s.includes('private credit') || s.includes('sme debt') || s.includes('credit')) return 'Credit';
  if (s.includes('vc') || s.includes('venture')) return 'VC';
  if (s.includes('direct')) return 'Direct';
  if (s.includes('mixed')) return 'Mixed';
  if (s.includes('pe') || s.includes('private equity') || s.includes('equity')) return 'PE';
  return 'Other';
}

function assetLabel(key) {
  return key === 'FundOfFunds' ? 'Fund of Funds' : key;
}

function uniq(arr) { return [...new Set(arr.filter(Boolean))].sort(); }

function searchText(v) {
  return String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function rowMatchesSearch(row, keys, query) {
  const q = searchText(query);
  if (!q) return true;
  return keys.some(k => searchText(row[k]).includes(q));
}

function parseSemicolon(str) {
  if (!str) return [];
  const text = String(str).trim();
  const parts = [];
  let buf = '';
  let depth = 0;
  for (const ch of text) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if ((ch === ';' || ch === ',' || ch === '\n') && depth === 0) {
      if (buf.trim()) parts.push(buf.trim());
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts.filter(Boolean);
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function assetTag(ac) {
  const key = assetClass(ac);
  return `<span class="asset-tag asset-${key}">${assetLabel(key)}</span>`;
}

function confBadge(c) {
  const v = String(c || '').trim().charAt(0).toUpperCase();
  if (!v || v === 'N') return '';
  return `<span class="conf-${v}">${v}</span>`;
}

function instType(row) {
  // Returns 'SWF' or 'PF'
  const t = String(row['Type'] || row['Allocator type'] || row['Mandate type'] || '').toLowerCase();
  if (t.includes('swf') || t.includes('sovereign') || t.includes('saving') || t.includes('stabilisation') || t.includes('strategic')) return 'SWF';
  return 'PF';
}

// ─── Tab switching ──────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${target}`).classList.add('active');
      if (target === 'network') initNetworkIfNeeded();
      if (target === 'charts')  renderCharts();
    });
  });
}

// ─── OVERVIEW TAB ───────────────────────────────────────────────────
function renderOverview() {
  const comms = D.commitments().filter(r => String(r['Confidence'] || '').trim() !== 'L');
  const allAllocators = uniq(comms.map(r => r['Allocator (institution)']));

  document.getElementById('stat-allocators').textContent = allAllocators.length;
  document.getElementById('stat-commitments').textContent = comms.length;
  document.getElementById('stat-funds').textContent = D.funds().length;
  document.getElementById('stat-dfis').textContent = D.dfis().length;

  // Top allocators by commitment count
  const byAlloc = {};
  comms.forEach(r => {
    const k = r['Allocator (institution)'];
    if (k) byAlloc[k] = (byAlloc[k] || 0) + 1;
  });
  const topAlloc = Object.entries(byAlloc).sort((a, b) => b[1] - a[1]).slice(0, 10);
  document.getElementById('top-allocators-list').innerHTML = topAlloc.map(([name, n]) =>
    `<tr>
      <td class="truncate" style="max-width:220px" title="${escHtml(name)}">${escHtml(name)}</td>
      <td class="num">${n}</td>
      <td style="width:120px">
        <div style="height:8px;background:#e4e8f0;border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${Math.round(n/topAlloc[0][1]*100)}%;background:#1e7b5e;border-radius:4px"></div>
        </div>
      </td>
    </tr>`
  ).join('');

  // Commitments by asset class
  const byAsset = {};
  comms.forEach(r => {
    const k = assetClass(r['Asset class']);
    byAsset[k] = (byAsset[k] || 0) + 1;
  });
  document.getElementById('asset-breakdown').innerHTML = Object.entries(byAsset)
    .sort((a,b) => b[1]-a[1])
    .map(([k, n]) => `<tr>
      <td>${assetTag(k)}</td>
      <td class="num">${n}</td>
      <td style="width:120px">
        <div style="height:8px;background:#e4e8f0;border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${Math.round(n/comms.length*100)}%;background:#1a3a5c;border-radius:4px"></div>
        </div>
      </td>
    </tr>`).join('');
}

// ─── INSTITUTIONS TAB ───────────────────────────────────────────────
let instSort = { col: 'AUM (USD m, approx)', dir: -1 };

function renderInstitutions() {
  const pfs  = D.pensions().map(r => ({ ...r, _entityType: 'PF' }));
  const swfs = D.swfs().map(r => ({ ...r, _entityType: 'SWF' }));
  const tier1Names = new Set(D.tier1().map(r => r['Institution']).filter(Boolean));

  let rows = [...pfs, ...swfs];

  // Filter
  const q   = (document.getElementById('inst-search')?.value || '').toLowerCase();
  const typ = document.getElementById('inst-type-filter')?.value || '';
  const ctry = document.getElementById('inst-country-filter')?.value || '';
  const t1Only = document.getElementById('inst-tier1')?.checked || false;

  rows = rows.filter(r => {
    if (q && !String(r['Institution'] || '').toLowerCase().includes(q) &&
             !String(r['Country'] || '').toLowerCase().includes(q)) return false;
    if (typ === 'PF' && r._entityType !== 'PF') return false;
    if (typ === 'SWF' && r._entityType !== 'SWF') return false;
    if (ctry && r['Country'] !== ctry) return false;
    if (t1Only && !tier1Names.has(r['Institution'])) return false;
    return true;
  });

  // Sort
  rows.sort((a, b) => {
    const col = instSort.col;
    let av = a[col], bv = b[col];
    if (col === 'AUM (USD m, approx)') { av = parseFloat(av) || 0; bv = parseFloat(bv) || 0; }
    else { av = String(av || '').toLowerCase(); bv = String(bv || '').toLowerCase(); }
    if (av < bv) return -instSort.dir;
    if (av > bv) return instSort.dir;
    return 0;
  });

  document.getElementById('inst-result-count').textContent = `${rows.length} institutions`;

  const tbody = document.getElementById('inst-tbody');
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="icon">🔍</div>No institutions match your filters.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r => {
    const isTier1 = tier1Names.has(r['Institution']);
    return `<tr>
      <td><span class="tag ${r._entityType === 'SWF' ? 'tag-swf' : 'tag-pf'}">${r._entityType}</span></td>
      <td class="truncate" style="max-width:240px;font-weight:500" title="${escHtml(r['Institution'])}">${escHtml(r['Institution'] || '—')}${isTier1 ? ' <span class="tag" style="background:#fef9e7;color:#7d6608;font-size:10px">T1</span>' : ''}</td>
      <td>${escHtml(r['Country'] || '—')}</td>
      <td class="truncate" style="max-width:160px" title="${escHtml(r['Type'] || r['Mandate type'] || '')}">${escHtml(r['Type'] || r['Mandate type'] || '—')}</td>
      <td class="num">${fmtAUM(r['AUM (USD m, approx)'])}</td>
      <td>${escHtml(r['As-of year'] || '—')}</td>
    </tr>`;
  }).join('');
}

function initInstitutions() {
  // Populate country filter
  const countries = uniq([...D.pensions(), ...D.swfs()].map(r => r['Country']).filter(c => c && c !== 'nan'));
  const cf = document.getElementById('inst-country-filter');
  countries.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; cf.appendChild(o); });

  ['inst-search','inst-type-filter','inst-country-filter'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', renderInstitutions);
    document.getElementById(id)?.addEventListener('change', renderInstitutions);
  });
  document.getElementById('inst-tier1')?.addEventListener('change', renderInstitutions);
  document.getElementById('inst-clear')?.addEventListener('click', () => {
    document.getElementById('inst-search').value = '';
    document.getElementById('inst-type-filter').value = '';
    document.getElementById('inst-country-filter').value = '';
    document.getElementById('inst-tier1').checked = false;
    renderInstitutions();
  });

  // Sortable columns
  document.querySelectorAll('#inst-table th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (instSort.col === col) instSort.dir *= -1;
      else { instSort.col = col; instSort.dir = -1; }
      document.querySelectorAll('#inst-table th .sort-arrow').forEach(a => a.textContent = '');
      th.querySelector('.sort-arrow').textContent = instSort.dir > 0 ? '↑' : '↓';
      renderInstitutions();
    });
  });
  renderInstitutions();
}

// ─── COMMITMENTS TAB ────────────────────────────────────────────────
let commSort = { col: 'Vintage / Year', dir: -1 };

function renderCommitments() {
  let rows = D.commitments();

  const q    = document.getElementById('comm-search')?.value || '';
  const asst = document.getElementById('comm-asset-filter')?.value || '';
  const geo  = document.getElementById('comm-geo-filter')?.value || '';
  const conf = document.getElementById('comm-conf-filter')?.value || '';
  const yr   = document.getElementById('comm-year-filter')?.value || '';

  rows = rows.filter(r => {
    if (!rowMatchesSearch(r, ['Allocator (institution)','Fund / Vehicle / Deal name','GP or counterparty','Allocator country'], q)) return false;
    if (asst && assetClass(r['Asset class']) !== asst) return false;
    if (geo && !String(r['Geographic focus']||'').toLowerCase().includes(geo.toLowerCase())) return false;
    if (conf && String(r['Confidence']||'').charAt(0).toUpperCase() !== conf) return false;
    if (yr) {
      const vy = String(r['Vintage / Year']||'');
      if (!vy.includes(yr)) return false;
    }
    return true;
  });

  rows.sort((a, b) => {
    const col = commSort.col;
    let av = a[col], bv = b[col];
    if (col === 'Vintage / Year') {
      av = parseInt(String(av||'0')) || 0;
      bv = parseInt(String(bv||'0')) || 0;
    } else {
      av = String(av||'').toLowerCase();
      bv = String(bv||'').toLowerCase();
    }
    if (av < bv) return -commSort.dir;
    if (av > bv) return commSort.dir;
    return 0;
  });

  document.getElementById('comm-result-count').textContent = `${rows.length} commitments`;

  const tbody = document.getElementById('comm-tbody');
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="icon">🔍</div>No commitments match.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r => `<tr>
    <td class="truncate" style="max-width:160px;font-weight:500" title="${escHtml(r['Allocator (institution)'])}">${escHtml(r['Allocator (institution)']||'—')}</td>
    <td>${escHtml(r['Allocator country']||'—')}</td>
    <td class="truncate" style="max-width:180px" title="${escHtml(r['Fund / Vehicle / Deal name'])}">${escHtml(r['Fund / Vehicle / Deal name']||'—')}</td>
    <td>${escHtml(r['GP or counterparty']||'—')}</td>
    <td>${assetTag(r['Asset class'])}</td>
    <td>${escHtml(r['Geographic focus']||'—')}</td>
    <td class="num">${escHtml(r['Vintage / Year']||'—')}</td>
    <td>${confBadge(r['Confidence'])}</td>
  </tr>`).join('');
}

function renderFunds() {
  let rows = D.funds();
  const q    = document.getElementById('fund-search')?.value || '';
  const asst = document.getElementById('fund-asset-filter')?.value || '';
  const geo  = document.getElementById('fund-geo-filter')?.value || '';

  rows = rows.filter(r => {
    if (!rowMatchesSearch(r, ['Fund / Vehicle','Manager / GP','Named African PF/SWF LPs','Named DFI LPs'], q)) return false;
    if (asst && assetClass(r['Asset class']) !== asst) return false;
    if (geo && !String(r['Geographic focus']||'').toLowerCase().includes(geo.toLowerCase())) return false;
    return true;
  });

  document.getElementById('fund-result-count').textContent = `${rows.length} vehicles`;

  const container = document.getElementById('funds-list');
  if (!rows.length) {
    container.innerHTML = `<div class="empty-state"><div class="icon">🔍</div>No fund vehicles match.</div>`;
    return;
  }
  const ac = r => assetClass(r['Asset class']);
  container.innerHTML = rows.map(r => {
    const lps = parseSemicolon(r['Named African PF/SWF LPs']);
    const dfis = parseSemicolon(r['Named DFI LPs']);
    return `<div class="fund-card asset-${ac(r)}">
      <div class="fund-name">${escHtml(r['Fund / Vehicle']||'—')}</div>
      <div class="fund-meta">
        ${assetTag(r['Asset class'])} &nbsp;
        ${escHtml(r['Manager / GP']||'—')} &nbsp;·&nbsp;
        ${escHtml(r['Vintage']||'—')} &nbsp;·&nbsp;
        ${escHtml(r['Geographic focus']||'—')} &nbsp;·&nbsp;
        <strong>${fmtAUM(r['Fund size (USD m)'])}</strong>
      </div>
      ${lps.length ? `<div class="fund-lps"><strong>African LPs:</strong> ${lps.map(l => `<span class="pill">${escHtml(l)}</span>`).join(' ')}</div>` : ''}
      ${dfis.length ? `<div class="fund-lps"><strong>DFI LPs:</strong> ${dfis.map(d => `<span class="pill" style="background:#fef3c7;color:#78350f">${escHtml(d)}</span>`).join(' ')}</div>` : ''}
    </div>`;
  }).join('');
}

function initCommitments() {
  const assetOpts = ['PE','VC','Infra','Credit','Direct','FundOfFunds','Mixed','Other'];
  ['comm-asset-filter','fund-asset-filter'].forEach(id => {
    const el = document.getElementById(id);
    assetOpts.forEach(a => { const o = document.createElement('option'); o.value = a; o.textContent = assetLabel(a); el.appendChild(o); });
  });

  ['comm-search','comm-asset-filter','comm-geo-filter','comm-conf-filter','comm-year-filter'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', renderCommitments);
    document.getElementById(id)?.addEventListener('change', renderCommitments);
  });
  document.getElementById('comm-clear')?.addEventListener('click', () => {
    ['comm-search','comm-asset-filter','comm-geo-filter','comm-conf-filter','comm-year-filter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    renderCommitments();
  });

  ['fund-search','fund-asset-filter','fund-geo-filter'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', renderFunds);
    document.getElementById(id)?.addEventListener('change', renderFunds);
  });
  document.getElementById('fund-clear')?.addEventListener('click', () => {
    ['fund-search','fund-asset-filter','fund-geo-filter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    renderFunds();
  });

  // Sortable columns
  document.querySelectorAll('#comm-table th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (commSort.col === col) commSort.dir *= -1;
      else { commSort.col = col; commSort.dir = -1; }
      document.querySelectorAll('#comm-table th .sort-arrow').forEach(a => a.textContent = '');
      th.querySelector('.sort-arrow').textContent = commSort.dir > 0 ? '↑' : '↓';
      renderCommitments();
    });
  });
  renderCommitments();
  renderFunds();
}

// ─── PIPELINE & MANDATES TAB ────────────────────────────────────────
let pipeSort = { col: 'Status category', dir: 1 };

function statusTag(status) {
  const s = String(status || '').toLowerCase();
  let cls = 'tag-pipeline';
  if (s.includes('member')) cls = 'tag-member';
  else if (s.includes('planned')) cls = 'tag-planned';
  else if (s.includes('expected')) cls = 'tag-expected';
  else if (s.includes('target')) cls = 'tag-targeted';
  else if (s.includes('mou')) cls = 'tag-mou';
  return `<span class="tag ${cls}">${escHtml(status || 'Pipeline')}</span>`;
}

function renderPipelineStats(rows) {
  const all = D.pipeline();
  const forward = all.filter(r => {
    const s = String(r['Status category'] || '').toLowerCase();
    return s.includes('target') || s.includes('expected') || s.includes('planned') || s.includes('mou');
  }).length;
  const member = all.filter(r => String(r['Status category'] || '').toLowerCase().includes('member')).length;
  document.getElementById('pipe-total').textContent = all.length;
  document.getElementById('pipe-forward').textContent = forward;
  document.getElementById('pipe-member').textContent = member;
  document.getElementById('pipe-countries').textContent = uniq(all.map(r => r['Allocator country'])).length;
}

function renderPipeline() {
  let rows = D.pipeline();
  const q = document.getElementById('pipe-search')?.value || '';
  const status = document.getElementById('pipe-status-filter')?.value || '';
  const country = document.getElementById('pipe-country-filter')?.value || '';
  const asset = document.getElementById('pipe-asset-filter')?.value || '';
  const conf = document.getElementById('pipe-conf-filter')?.value || '';

  rows = rows.filter(r => {
    if (!rowMatchesSearch(r, [
      'Entity / prospective allocator',
      'Fund / Vehicle / Deal name',
      'GP or counterparty',
      'Reason not in Commitments Database',
      'Source (short)'
    ], q)) return false;
    if (status && r['Status category'] !== status) return false;
    if (country && r['Allocator country'] !== country) return false;
    if (asset && assetClass(r['Asset class']) !== asset) return false;
    if (conf && String(r['Pipeline confidence'] || '').charAt(0).toUpperCase() !== conf) return false;
    return true;
  });

  rows.sort((a, b) => {
    const col = pipeSort.col;
    let av = String(a[col] || '').toLowerCase();
    let bv = String(b[col] || '').toLowerCase();
    if (av < bv) return -pipeSort.dir;
    if (av > bv) return pipeSort.dir;
    return 0;
  });

  renderPipelineStats(rows);
  document.getElementById('pipe-result-count').textContent = `${rows.length} rows`;

  const tbody = document.getElementById('pipe-tbody');
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="icon">🔍</div>No pipeline rows match.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    const url = r['Source URL'];
    const source = url ? `<a href="${escHtml(url)}" target="_blank" rel="noopener">source</a>` : escHtml(r['Source (short)'] || '—');
    return `<tr>
      <td class="truncate" style="max-width:190px;font-weight:500" title="${escHtml(r['Entity / prospective allocator'])}">${escHtml(r['Entity / prospective allocator'] || '—')}</td>
      <td>${statusTag(r['Status category'])}</td>
      <td>${escHtml(r['Allocator country'] || '—')}</td>
      <td class="truncate" style="max-width:210px" title="${escHtml(r['Fund / Vehicle / Deal name'])}">${escHtml(r['Fund / Vehicle / Deal name'] || '—')}</td>
      <td class="truncate" style="max-width:150px" title="${escHtml(r['GP or counterparty'])}">${escHtml(r['GP or counterparty'] || '—')}</td>
      <td>${assetTag(r['Asset class'])}</td>
      <td class="truncate" style="max-width:160px" title="${escHtml(r['Potential size / target'])}">${escHtml(r['Potential size / target'] || '—')}</td>
      <td>${confBadge(r['Pipeline confidence'])}</td>
      <td style="min-width:260px">${escHtml(r['Reason not in Commitments Database'] || '')}<div class="source-link">${source}</div></td>
    </tr>`;
  }).join('');
}

function initPipeline() {
  const rows = D.pipeline();
  const statusFilter = document.getElementById('pipe-status-filter');
  uniq(rows.map(r => r['Status category'])).forEach(v => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = v;
    statusFilter.appendChild(o);
  });

  const countryFilter = document.getElementById('pipe-country-filter');
  uniq(rows.map(r => r['Allocator country'])).forEach(v => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = v;
    countryFilter.appendChild(o);
  });

  const assetFilter = document.getElementById('pipe-asset-filter');
  uniq(rows.map(r => assetClass(r['Asset class']))).forEach(v => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = assetLabel(v);
    assetFilter.appendChild(o);
  });

  ['pipe-search','pipe-status-filter','pipe-country-filter','pipe-asset-filter','pipe-conf-filter'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', renderPipeline);
    document.getElementById(id)?.addEventListener('change', renderPipeline);
  });
  document.getElementById('pipe-clear')?.addEventListener('click', () => {
    ['pipe-search','pipe-status-filter','pipe-country-filter','pipe-asset-filter','pipe-conf-filter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    renderPipeline();
  });

  document.querySelectorAll('#pipe-table th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (pipeSort.col === col) pipeSort.dir *= -1;
      else { pipeSort.col = col; pipeSort.dir = 1; }
      document.querySelectorAll('#pipe-table th .sort-arrow').forEach(a => a.textContent = '');
      th.querySelector('.sort-arrow').textContent = pipeSort.dir > 0 ? '↑' : '↓';
      renderPipeline();
    });
  });

  renderPipeline();
}

// ─── CHARTS TAB ────────────────────────────────────────────────────
let chartsInitialized = false;
const chartInstances = {};

function renderCharts() {
  if (chartsInitialized) return;
  chartsInitialized = true;

  renderDFIChart();
}

function renderDFIChart() {
  const dfis = D.dfis()
    .filter(r => r['DFI / Catalytic capital provider'] && r['Co-investments in funds with African PF/SWF LP'])
    .sort((a, b) => (b['Co-investments in funds with African PF/SWF LP'] || 0) - (a['Co-investments in funds with African PF/SWF LP'] || 0))
    .slice(0, 20);

  const labels = dfis.map(r => String(r['DFI / Catalytic capital provider']).replace(' (Norway)','').replace(' (Netherlands)','').replace(' (UK)','').replace(' (France)','').replace(' (Germany)','').replace(' (US)',''));
  const vals   = dfis.map(r => r['Co-investments in funds with African PF/SWF LP']);
  const tiers  = dfis.map(r => String(r['Frequency tier'] || ''));

  const colors = dfis.map(r => {
    const t = String(r['Frequency tier'] || '');
    if (t.includes('1')) return '#1e7b5e';
    if (t.includes('2')) return '#2563eb';
    if (t.includes('3')) return '#7c3aed';
    return '#6b7280';
  });

  const ctx = document.getElementById('chart-dfi').getContext('2d');
  chartInstances.dfi = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: vals, backgroundColor: colors, borderRadius: 4, borderSkipped: false }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const r = dfis[ctx.dataIndex];
              return [`Count: ${ctx.parsed.x}`, `Tier: ${r['Frequency tier']}`, `Role: ${String(r['Strategic role']||'').slice(0,60)}...`];
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Funds with African PF/SWF LP co-invested' }, beginAtZero: true, ticks: { stepSize: 1 } },
        y: { ticks: { font: { size: 11 } } }
      },
      maintainAspectRatio: false
    }
  });
}

// ─── INIT ──────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderOverview();
  initInstitutions();
  initCommitments();
  initPipeline();
  // Network init deferred to first click
});
