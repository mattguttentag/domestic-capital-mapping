/* D3 Force-Directed Network Graph — DFI / Allocator / Fund */

let networkInitialized = false;

function initNetworkIfNeeded() {
  if (networkInitialized) return;
  networkInitialized = true;
  buildNetwork();
}

function buildNetwork() {
  // ── Build node/link sets ──────────────────────────────────────
  const nodes = new Map();   // id → node obj
  const links = [];

  const DFI_ALIASES = [
    { name: 'BII', patterns: ['BII', 'CDC Group', 'CDC'] },
    { name: 'FMO', patterns: ['FMO'] },
    { name: 'Norfund', patterns: ['Norfund'] },
    { name: 'IFC', patterns: ['IFC'] },
    { name: 'Proparco', patterns: ['Proparco', 'FISEA'] },
    { name: 'EIB', patterns: ['EIB Global', 'EIB'] },
    { name: 'DEG', patterns: ['DEG'] },
    { name: 'Swedfund', patterns: ['Swedfund'] },
    { name: 'SIFEM', patterns: ['SIFEM'] },
    { name: 'BIO', patterns: ['BIO'] },
    { name: 'OeEB', patterns: ['OeEB', 'OeB'] },
    { name: 'AfDB', patterns: ['AfDB', 'African Development Bank', 'Africa Development Bank'] },
    { name: 'KfW', patterns: ['KfW'] },
    { name: 'GuarantCo / PIDG', patterns: ['GuarantCo', 'PIDG', 'Private Infrastructure Development Group'] },
    { name: 'InfraCo Africa', patterns: ['InfraCo Africa', 'Infraco Africa'] },
    { name: 'FCDO / Mobilist', patterns: ['FCDO', 'Mobilist'] },
    { name: 'IFU', patterns: ['IFU'] },
    { name: 'US DFC', patterns: ['US DFC', 'DFC'] },
    { name: 'FinDev Canada', patterns: ['FinDev Canada', 'Findev Canada'] },
    { name: 'Bpifrance', patterns: ['Bpifrance', 'BPI France'] },
    { name: 'Finnfund', patterns: ['Finnfund'] },
    { name: 'FSD Africa Investments', patterns: ['FSDAi', 'FSD Africa Investments', 'FSD Africa'] },
    { name: 'Dutch Good Growth Fund', patterns: ['Dutch Good Growth Fund', 'DGGF'] },
    { name: 'Soros Economic Development Fund', patterns: ['Soros Economic Development Fund', 'Soros Economic Dev Fund', 'OSF'] },
    { name: 'FCA Investments', patterns: ['FCA Investments'] },
    { name: 'CDP Group', patterns: ['CDP Group'] },
    { name: 'Bank Al-Maghrib', patterns: ['Bank Al-Maghrib'] },
    { name: 'BCEAO', patterns: ['BCEAO'] },
    { name: 'European Union / IFAD', patterns: ['EU', 'IFAD'] },
    { name: 'Small Foundation', patterns: ['Small Foundation'] },
    { name: 'ADQ', patterns: ['ADQ'] },
    { name: 'Africa Finance Corporation', patterns: ['Africa Finance Corporation', 'AFC'] },
    { name: 'SDG Frontier Fund', patterns: ['SDG Frontier Fund'] },
    { name: 'PTA Zep-Re', patterns: ['PTA Zep-Re'] },
    { name: 'Blue Earth Capital', patterns: ['Blue Earth Capital'] },
    { name: 'Casey Family Programs', patterns: ['Casey Family Programs'] },
    { name: 'South Suez Capital', patterns: ['South Suez Capital'] },
    { name: 'Attijariwafa Bank', patterns: ['Attijariwafa Bank'] },
    { name: 'Arab Bank for Economic Development in Africa', patterns: ['Arab Bank for Economic Development in Africa', 'BADEA'] },
    { name: 'EBID', patterns: ['EBID', 'Ecowas Bank for Investment & Development', 'ECOWAS Bank for Investment and Development'] },
    { name: 'Kuramo Capital Management', patterns: ['Kuramo Capital Management', 'Kuramo'] },
    { name: 'QIA (Qatar)', patterns: ['Qatar Investment Authority', 'QIA'] },
    { name: 'BOAD', patterns: ['BOAD', 'Banque Ouest Africaine de Développement', 'West African Development Bank'] },
  ];

  const ALLOCATOR_ALIASES = new Map([
    ['PIC SA', 'GEPF / PIC (South Africa)'],
    ['PIC South Africa', 'GEPF / PIC (South Africa)'],
    ['PIC (South Africa)', 'GEPF / PIC (South Africa)'],
    ['PIC (mgr for GEPF)', 'GEPF / PIC (South Africa)'],
    ['PIC on behalf of GEPF (South Africa)', 'GEPF / PIC (South Africa)'],
    ['GEPF / PIC (South Africa)', 'GEPF / PIC (South Africa)'],
    ['GEPF (via PIC)', 'GEPF / PIC (South Africa)'],
    ['GEPF', 'GEPF / PIC (South Africa)'],
    ['PIC South Africa (historical)', 'GEPF / PIC (South Africa)'],
    ['NSIA', 'NSIA Nigeria'],
    ['Nigeria Sovereign Investment Authority (NSIA)', 'NSIA Nigeria'],
    ['Rwanda Social Security Board (RSSB)', 'RSSB'],
    ['Axis Pensions', 'Axis Pension Trust'],
    ['Axis Pension Trustees', 'Axis Pension Trust'],
    ['Enterprise Trustees Limited', 'Enterprise Trustees'],
    ['Petra Trust Company', 'Petra Trust'],
    ['Petra Trust Company (Ghana)', 'Petra Trust'],
    ['Venture Capital Trust Fund (VCTF)', 'VCTF Ghana'],
    ['Venture Capital Trust Fund (VCTF) Ghana', 'VCTF Ghana'],
    ['Venture Capital Trust Fund of Ghana', 'VCTF Ghana'],
    ['Venture Capital Trust Fund Ghana', 'VCTF Ghana'],
    ['VCTF', 'VCTF Ghana'],
    ['CDG Invest (Morocco)', 'CDG Invest Morocco'],
    ['Access ARM Pensions', 'ARM Pension Managers (Access ARM Pensions)'],
    ['ARM Pension', 'ARM Pension Managers'],
    ['Mauritius NPF + NSF', 'Mauritius NPF + NSF'],
    ['Côte d\'Ivoire', 'Government of Côte d\'Ivoire'],
    ['Egypt (2024)', 'Government of Egypt'],
    ['Sierra Leone', 'Government of Sierra Leone'],
    ['CDC Gabon', 'CDC Gabon (State pension fund of Gabon)'],
  ]);

  const VEHICLE_ALIASES = new Map([
    ['Ci-Gaba Fund of Funds', 'Ci Gaba Fund of Funds'],
    ['Growth Investment Partners (GIP) Ghana', 'Growth Investment Partners Ghana'],
    ['Growth Investment Partners (GIP) Zambia', 'Growth Investment Partners Zambia'],
    ['Growth Investment Partners Zambia (GIP Zambia)', 'Growth Investment Partners Zambia'],
    ['AfricInvest FIVE (Financial Inclusion Vehicle, evergreen)', 'AfricInvest FIVE (Financial Inclusion Vehicle)'],
    ['Fund for Agricultural Finance in Nigeria (FAFIN)', 'Sahel Capital Fund for Agricultural Finance in Nigeria (FAFIN)'],
    ['CAPE I-IV (Capital Alliance Private Equity)', 'Capital Alliance Private Equity I-IV (CAPE)'],
    ['Capital Alliance Private Equity (CAPE) funds', 'Capital Alliance Private Equity I-IV (CAPE)'],
    ['Vantage Capital Mezzanine funds', 'Vantage Mezzanine IV (Pan-African sub-fund)'],
    ['Mediterrania Capital II/III (historical)', 'Mediterrania Capital II / III / IV'],
    ['Nigeria Infrastructure Fund (NIF) direct deals', 'Nigeria Infrastructure Fund (NIF, NSIA sub-fund)'],
    ['Africa50 (general)', 'Africa50'],
    ['Africa50 (shareholder stake)', 'Africa50'],
    ['Africa50 (indirect via PIC)', 'Africa50'],
    ['Africa Finance Corporation (AFC) — equity shareholders', 'Africa Finance Corporation (AFC)'],
    ['Africa Finance Corporation (AFC) - equity shareholders', 'Africa Finance Corporation (AFC)'],
    ['AFC equity stake', 'Africa Finance Corporation (AFC)'],
    ['Helios Investors II / III / IV (historical)', 'Helios Investors II/III/IV (historical)'],
  ]);

  function normalizeText(v) {
    return String(v || '')
      .replace(/[–—]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function typedId(type, name) {
    return `${type}:${normalizeText(name).toLowerCase()}`;
  }

  function displayName(name) {
    return normalizeText(name).replace(/\s+\((?:USD|EUR|GBP|NGN|KES|GHS|BWP|MAD|RWF|XOF|NAD|ZAR)[^)]+\)/gi, '');
  }

  function canonicalDfiName(name) {
    const raw = normalizeText(name);
    const bare = raw.replace(/\s+\([^)]*\)/g, '').trim();
    for (const dfi of DFI_ALIASES) {
      if (dfi.patterns.some(p => new RegExp(`(^|[^A-Za-z])${escapeRegExp(p)}([^A-Za-z]|$)`, 'i').test(raw))) {
        return dfi.name;
      }
    }
    return bare;
  }

  function canonicalAllocatorName(name) {
    let n = displayName(name)
      .replace(/\s+x\d+.*$/i, '')
      .replace(/\s+since\s+.*$/i, '')
      .replace(/\s+anchor$/i, '')
      .replace(/\s+founding$/i, '')
      .trim();
    if (/^(PIC SA|PIC South Africa|PIC \(South Africa\)|PIC \(mgr for GEPF\)|GEPF \(via PIC\)|GEPF)(\s|\(|$)/i.test(n)) {
      return 'GEPF / PIC (South Africa)';
    }
    if (/^RSSB(\s|\(|$)/i.test(n)) {
      return 'RSSB';
    }
    return ALLOCATOR_ALIASES.get(n) || n;
  }

  function canonicalVehicleName(name) {
    let n = displayName(name)
      .replace(/\s+\((?:indirect via PIC|shareholder stake)\)$/i, '')
      .trim();
    return VEHICLE_ALIASES.get(n) || n;
  }

  function isConfirmedNetworkCommitment(r) {
    const fields = [
      r['Commitment type'],
      r['Fund / Vehicle / Deal name'],
      r['GP or counterparty'],
      r['Allocator type']
    ].map(v => String(v || '').toLowerCase()).join(' | ');
    if (fields.includes('pooled mandate')) return false;
    if (fields.includes('mandates allocated')) return false;
    if (fields.includes('member-only')) return false;
    if (fields.includes('mou')) return false;
    if (fields.includes('expected') || fields.includes('planned') || fields.includes('targeted')) return false;
    if (fields.includes('kepfic') || fields.includes('aofsa')) return false;
    if (fields.includes('mandate') && !fields.includes('direct-deal mandate')) return false;
    return true;
  }

  function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function splitTopLevelList(str) {
    const text = normalizeText(str);
    if (!text || text === '-' || text.toLowerCase() === 'nan') return [];
    const parts = [];
    let buf = '';
    let depth = 0;
    for (const ch of text) {
      if (ch === '(') depth++;
      if (ch === ')') depth = Math.max(0, depth - 1);
      if ((ch === ',' || ch === ';' || ch === '\n') && depth === 0) {
        if (buf.trim()) parts.push(buf.trim());
        buf = '';
      } else {
        buf += ch;
      }
    }
    if (buf.trim()) parts.push(buf.trim());
    return parts.map(p => p.trim()).filter(Boolean);
  }

  function extractDfis(str) {
    const text = normalizeText(str);
    if (!text || /^[-0]$/.test(text) || /^(various|others?)(\s|$)/i.test(text)) return [];
    const found = new Map();
    DFI_ALIASES.forEach(dfi => {
      if (dfi.patterns.some(p => new RegExp(`(^|[^A-Za-z])${escapeRegExp(p)}([^A-Za-z]|$)`, 'i').test(text))) {
        found.set(dfi.name, dfi.name);
      }
    });
    if (found.size) return [...found.values()];
    return splitTopLevelList(text).map(canonicalDfiName).filter(n => n && !/^(various|others?)/i.test(n));
  }

  function extractOtherLps(str) {
    const text = normalizeText(str);
    if (!text || /^[-0]$/.test(text) || /^(various|others?)(\s|$)/i.test(text)) return [];
    const found = new Map();
    DFI_ALIASES.forEach(lp => {
      if (lp.patterns.some(p => new RegExp(`(^|[^A-Za-z])${escapeRegExp(p)}([^A-Za-z]|$)`, 'i').test(text))) {
        found.set(lp.name, lp.name);
      }
    });
    return [...found.values()];
  }

  function extractAllocators(str) {
    return splitTopLevelList(str)
      .map(canonicalAllocatorName)
      .filter(n => n && !/^[-0]$/.test(n) && !/^(other|multiple|specific names|not individually|not publicly|plus\s+|[0-9]+\+|named\b)/i.test(n));
  }

  function getOrAdd(name, type, extra = {}) {
    const label = displayName(name);
    const id = typedId(type, label);
    if (!label || label === 'nan') return null;
    if (!nodes.has(id)) {
      nodes.set(id, { id, label, type, ...extra, linkCount: 0 });
    } else {
      // Merge extra info if provided
      const n = nodes.get(id);
      Object.assign(n, Object.fromEntries(Object.entries(extra).filter(([, v]) => v !== undefined && v !== null && v !== '')));
    }
    return nodes.get(id);
  }

  function addLink(srcId, tgtId, linkType) {
    if (!srcId || !tgtId || srcId === tgtId) return;
    if (!nodes.has(srcId) || !nodes.has(tgtId)) return;
    links.push({ source: srcId, target: tgtId, type: linkType });
    nodes.get(srcId).linkCount++;
    nodes.get(tgtId).linkCount++;
  }

  // Country → region mapping for color
  const regionMap = {
    'South Africa': 'Southern Africa', 'Namibia': 'Southern Africa', 'Botswana': 'Southern Africa',
    'Zambia': 'Southern Africa', 'Zimbabwe': 'Southern Africa', 'Mozambique': 'Southern Africa',
    'Kenya': 'East Africa', 'Tanzania': 'East Africa', 'Uganda': 'East Africa',
    'Rwanda': 'East Africa', 'Ethiopia': 'East Africa',
    'Nigeria': 'West Africa', 'Ghana': 'West Africa', 'Senegal': 'West Africa',
    'Côte d\'Ivoire': 'West Africa', "Cote d'Ivoire": 'West Africa', 'Cameroon': 'West Africa',
    'Egypt': 'North Africa', 'Morocco': 'North Africa', 'Tunisia': 'North Africa', 'Algeria': 'North Africa', 'Libya': 'North Africa',
    'Angola': 'Southern Africa', 'Congo': 'Central Africa', 'Gabon': 'Central Africa',
    'Multiple': 'Multiple',
  };

  const regionColor = {
    'Southern Africa': '#1e7b5e',
    'East Africa':     '#2563eb',
    'West Africa':     '#d97706',
    'North Africa':    '#7c3aed',
    'Central Africa':  '#0891b2',
    'Multiple':        '#6b7280',
    'Unknown':         '#9ca3af',
  };

  function allocColor(country) {
    const region = regionMap[country] || 'Unknown';
    return regionColor[region] || '#9ca3af';
  }

  // ── DFI metadata (nodes are created only when linked to confirmed vehicles) ──
  const dfiMeta = new Map();
  D.dfis().forEach(r => {
    const name = canonicalDfiName(r['DFI / Catalytic capital provider']);
    const count = r['Co-investments in funds with African PF/SWF LP'] || 0;
    const tier = String(r['Frequency tier'] || '');
    if (name && name !== 'nan') {
      dfiMeta.set(name, {
        dfiCount: count,
        tier,
        role: r['Strategic role'],
        notable: r['Notable vehicles']
      });
    }
  });

  const confirmedCommitments = D.commitments().filter(isConfirmedNetworkCommitment);
  const confirmedVehicles = new Map();
  confirmedCommitments.forEach(r => {
    const vehicle = canonicalVehicleName(r['Fund / Vehicle / Deal name']);
    if (vehicle) confirmedVehicles.set(vehicle, r);
  });

  // ── Fund nodes + DFI-Fund links (from Funds tab, confirmed vehicles only) ──
  D.funds().forEach(r => {
    const fname = canonicalVehicleName(r['Fund / Vehicle']);
    const ac = assetClass(r['Asset class normalized'] || r['Asset class']);
    if (!fname || fname === 'nan') return;
    if (!confirmedVehicles.has(fname)) return;

    getOrAdd(fname, 'fund', {
      gp: r['Manager / GP'],
      assetClass: ac,
      geo: r['Geographic focus'],
      vintage: r['Vintage'],
      size: r['Fund size (USD m)'],
    });
    const fundId = typedId('fund', fname);

    // DFI → Fund links
    extractDfis(r['Named DFI LPs']).forEach(dfi => {
      const dfiNode = getOrAdd(dfi, 'dfi', { dfiCount: 0, tier: '', ...(dfiMeta.get(dfi) || {}) });
      if (dfiNode) addLink(dfiNode.id, fundId, 'dfi-fund');
    });
    extractOtherLps(r['Other named LPs']).forEach(lp => {
      const lpNode = getOrAdd(lp, 'dfi', { dfiCount: 0, tier: 'Other LP', role: 'Other named LP or foundation co-investor.' });
      if (lpNode) addLink(lpNode.id, fundId, 'dfi-fund');
    });

    // African PF/SWF LP → Fund links (from Funds tab named LPs)
    extractAllocators(r['Named African PF/SWF LPs']).forEach(lp => {
      if (!lp || lp === 'nan') return;
      const allocNode = getOrAdd(lp, 'allocator', { country: 'Unknown', color: '#9ca3af' });
      if (allocNode) addLink(allocNode.id, fundId, 'pf-fund');
    });
  });

  // ── Allocator nodes + links (from Commitments tab) ────────────
  confirmedCommitments.forEach(r => {
    const allocName = canonicalAllocatorName(r['Allocator (institution)']);
    const fundName  = canonicalVehicleName(r['Fund / Vehicle / Deal name']);
    const country   = r['Allocator country'] || 'Unknown';
    if (!allocName || allocName === 'nan') return;

    getOrAdd(allocName, 'allocator', {
      country,
      allocType: r['Allocator type'],
      color: allocColor(country),
    });

    if (fundName && fundName !== 'nan') {
      getOrAdd(fundName, 'fund', { assetClass: assetClass(r['Asset class normalized'] || r['Asset class']), geo: r['Geographic focus'] });
      addLink(typedId('allocator', allocName), typedId('fund', fundName), 'pf-fund');
    }
  });

  // Build arrays
  const nodeArr = [...nodes.values()];
  // Remove duplicate links
  const linkSet = new Set();
  const linkArr = links.filter(l => {
    const key = `${l.source}||${l.target}||${l.type}`;
    if (linkSet.has(key)) return false;
    linkSet.add(key);
    return true;
  });

  nodes.forEach(n => {
    if (n.type === 'dfi') {
      n.dfiCount = linkArr.filter(l => l.type === 'dfi-fund' && (l.source === n.id || l.target === n.id)).length;
    }
  });

  renderNetworkGraph(nodeArr, linkArr, regionColor, allocColor);
}

function renderNetworkGraph(nodeArr, linkArr, regionColor, allocColor) {
  const wrap  = document.getElementById('network-svg-wrap');
  let W = wrap.clientWidth  || 900;
  let H = wrap.clientHeight || 700;

  const svg = d3.select('#network-svg')
    .attr('width', W)
    .attr('height', H);

  const nodeById = new Map(nodeArr.map(d => [d.id, d]));

  // Zoom container
  const g = svg.append('g').attr('class', 'zoom-layer');
  const zoomBehavior = d3.zoom().scaleExtent([0.15, 4]).on('zoom', e => g.attr('transform', e.transform));
  svg.call(zoomBehavior);

  // ── Simulation ────────────────────────────────────────────────
  const sim = d3.forceSimulation(nodeArr)
    .force('link',    d3.forceLink(linkArr).id(d => d.id).distance(d => d.type === 'dfi-fund' ? 90 : 70).strength(0.4))
    .force('charge',  d3.forceManyBody().strength(d => d.type === 'fund' ? -120 : -80))
    .force('center',  d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(d => nodeRadius(d) + 6))
    .alphaDecay(0.02);

  // ── Links ─────────────────────────────────────────────────────
  const link = g.append('g').attr('class', 'links')
    .selectAll('line')
    .data(linkArr)
    .join('line')
    .attr('stroke', d => d.type === 'dfi-fund' ? '#f59e0b' : '#94a3b8')
    .attr('stroke-width', d => d.type === 'dfi-fund' ? 1.5 : 1)
    .attr('stroke-opacity', 0.5);

  // ── Nodes ─────────────────────────────────────────────────────
  const node = g.append('g').attr('class', 'nodes')
    .selectAll('g')
    .data(nodeArr)
    .join('g')
    .attr('class', 'node-g')
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
    );

  function nodeRadius(d) {
    if (d.type === 'dfi') return 6 + Math.min(d.dfiCount || 1, 9) * 1.2;
    if (d.type === 'fund') return 8 + Math.min(d.linkCount || 1, 10) * 0.8;
    return 7;
  }

  function nodeColor(d) {
    if (d.type === 'dfi')       return '#c8891a';
    if (d.type === 'fund') {
      const ac = d.assetClass || assetClass(d.label);
      const colors = {
        PE: '#2563eb',
        VC: '#7c3aed',
        RealAssets: '#059669',
        Credit: '#d97706',
        Direct: '#dc2626',
        FundOfFunds: '#0891b2',
        Guarantee: '#ea580c',
        Platform: '#4f46e5',
        Mixed: '#6b7280',
        Other: '#6b7280'
      };
      return colors[ac] || '#6b7280';
    }
    return d.color || allocColor(d.country || 'Unknown');
  }

  // Draw shapes
  node.each(function(d) {
    const el = d3.select(this);
    const r = nodeRadius(d);
    if (d.type === 'dfi') {
      el.append('rect')
        .attr('width', r * 1.6).attr('height', r * 1.6)
        .attr('x', -r * 0.8).attr('y', -r * 0.8)
        .attr('transform', 'rotate(45)')
        .attr('fill', nodeColor(d))
        .attr('stroke', 'white').attr('stroke-width', 1.5);
    } else if (d.type === 'fund') {
      el.append('rect')
        .attr('width', r * 1.8).attr('height', r * 1.8)
        .attr('x', -r * 0.9).attr('y', -r * 0.9)
        .attr('rx', 3).attr('ry', 3)
        .attr('fill', nodeColor(d))
        .attr('stroke', 'white').attr('stroke-width', 1.5)
        .attr('fill-opacity', 0.85);
    } else {
      el.append('circle')
        .attr('r', r)
        .attr('fill', nodeColor(d))
        .attr('stroke', 'white').attr('stroke-width', 1.5)
        .attr('fill-opacity', d.type === 'allocator' ? 0.9 : 0.85);
    }
  });

  function shortNodeLabel(d, force = false) {
    const label = String(d.label || '');
    if (!force && d.type !== 'dfi' && d.linkCount <= 3) return '';
    const max = force ? (d.type === 'fund' ? 34 : 28) : 22;
    return label.split('(')[0].trim().slice(0, max);
  }

  function labelFontSize(d, force = false) {
    if (force) return d.type === 'fund' ? 9 : 10;
    return d.type === 'dfi' ? 10 : (d.linkCount > 3 ? 9 : 0);
  }

  // Labels for high-linkage nodes; focused views reveal all visible node names.
  node.append('text')
    .attr('dy', d => nodeRadius(d) + 11)
    .attr('text-anchor', 'middle')
    .attr('font-size', d => labelFontSize(d))
    .attr('fill', '#374151')
    .attr('pointer-events', 'none')
    .text(d => shortNodeLabel(d));

  // ── Tooltip ───────────────────────────────────────────────────
  const tooltip = document.getElementById('network-tooltip');

  node.on('mouseover', (e, d) => {
    let html = `<strong>${escHtml(d.label)}</strong><br>`;
    if (d.type === 'dfi')       html += `DFI / Other LP · Count: ${d.dfiCount || 0} · ${escHtml(d.tier || '')}`;
    if (d.type === 'allocator') html += `Allocator · ${escHtml(d.country || '')} · ${escHtml(d.allocType || '')}`;
    if (d.type === 'fund')      html += `Fund · ${escHtml(d.assetClass || '')} · ${escHtml(d.geo || '')} · ${escHtml(d.gp || '')}`;
    html += `<br><em style="color:#94a3b8">Connections: ${d.linkCount}</em>`;
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
  })
  .on('mousemove', e => {
    const rect = wrap.getBoundingClientRect();
    let x = e.clientX - rect.left + 14;
    let y = e.clientY - rect.top  - 14;
    if (x + 270 > rect.width) x = e.clientX - rect.left - 274;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
  })
  .on('mouseout', () => { tooltip.style.display = 'none'; });

  // ── Click → highlight ─────────────────────────────────────────
  let selected = null;
  const infoEl = document.getElementById('network-selected-info');
  const adjacency = new Map();
  linkArr.forEach(l => {
    const s = typeof l.source === 'object' ? l.source.id : l.source;
    const t = typeof l.target === 'object' ? l.target.id : l.target;
    if (!adjacency.has(s)) adjacency.set(s, new Set());
    if (!adjacency.has(t)) adjacency.set(t, new Set());
    adjacency.get(s).add(t);
    adjacency.get(t).add(s);
  });

  svg.on('click', (e) => {
    if (e.target !== svg.node()) return;
    clearSelection();
  });

  node.on('click', (e, d) => {
    e.stopPropagation();
    selectNode(d, { toggle: true, center: false });
  });

  function selectNode(d, opts = {}) {
    if (!d) return;
    if (selected === d.id) {
      if (opts.toggle) clearSelection();
      else if (opts.center) centerOnNode(d);
      return;
    }
    selected = d.id;
    const distanceById = focusedContextForNode(d);
    const connectedIds = new Set(distanceById.keys());

    node.selectAll('circle, rect')
      .attr('opacity', nd => {
        const distance = distanceById.get(nd.id);
        if (distance === 0 || distance === 1) return 1;
        if (distance === 2) return 0.72;
        return 0.08;
      });
    link.attr('stroke-opacity', l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      if (!connectedIds.has(s) || !connectedIds.has(t)) return 0.03;
      if (s === d.id || t === d.id) return 0.9;
      return 0.45;
    });
    node.selectAll('text')
      .text(nd => shortNodeLabel(nd, connectedIds.has(nd.id)))
      .attr('font-size', nd => labelFontSize(nd, connectedIds.has(nd.id)))
      .attr('opacity', nd => connectedIds.has(nd.id) ? 1 : 0.08);

    // Info panel
    let html = `<strong>${escHtml(d.label)}</strong>`;
    if (d.type === 'dfi') html += `<br>Type: DFI / Other LP<br>Tier: ${escHtml(d.tier||'—')}<br>Count: ${d.dfiCount||0}`;
    if (d.type === 'allocator') html += `<br>Type: ${escHtml(d.allocType||'Allocator')}<br>Country: ${escHtml(d.country||'—')}`;
    if (d.type === 'fund') {
      const displayAsset = typeof assetLabel === 'function' ? assetLabel(d.assetClass) : (d.assetClass || '—');
      html += `<br>Type: Fund<br>GP: ${escHtml(d.gp||'—')}<br>Asset: ${escHtml(displayAsset)}<br>Geo: ${escHtml(d.geo||'—')}`;
    }
    const directCount = [...distanceById.values()].filter(v => v === 1).length;
    const contextCount = [...distanceById.values()].filter(v => v === 2).length;
    const contextLabel = d.type === 'dfi'
      ? 'PF/SWF co-investor context'
      : (d.type === 'allocator' ? 'DFI/other-LP context' : 'Investor context');
    html += `<br>Direct connections: <strong>${directCount}</strong><br>${contextLabel}: <strong>${contextCount}</strong>`;
    infoEl.innerHTML = html;
    if (opts.center) centerOnNode(d);
  }

  function focusedContextForNode(startNode) {
    const distances = new Map([[startNode.id, 0]]);
    const firstHop = [...(adjacency.get(startNode.id) || [])];
    firstHop.forEach(id => distances.set(id, 1));

    let secondHopType = null;
    if (startNode.type === 'dfi') secondHopType = 'allocator';
    if (startNode.type === 'allocator') secondHopType = 'dfi';

    if (!secondHopType) return distances;

    firstHop.forEach(id => {
      const viaNode = nodeById.get(id);
      if (viaNode?.type !== 'fund') return;
      (adjacency.get(id) || []).forEach(nextId => {
        const nextNode = nodeById.get(nextId);
        if (nextNode?.type === secondHopType && !distances.has(nextId)) {
          distances.set(nextId, 2);
        }
      });
    });

    return distances;
  }

  function clearSelection() {
    selected = null;
    resetHighlight();
    infoEl.innerHTML = '<em style="color:var(--muted)">Click a node to inspect it.</em>';
  }

  function centerOnNode(d) {
    if (!Number.isFinite(d.x) || !Number.isFinite(d.y)) return;
    const scale = 1.35;
    const transform = d3.zoomIdentity.translate(W / 2 - d.x * scale, H / 2 - d.y * scale).scale(scale);
    svg.transition().duration(450).call(zoomBehavior.transform, transform);
  }

  function resetHighlight() {
    node.selectAll('circle, rect').attr('opacity', 1);
    link.attr('stroke-opacity', l => l.type === 'dfi-fund' ? 0.6 : 0.4);
    node.selectAll('text')
      .text(d => shortNodeLabel(d))
      .attr('font-size', d => labelFontSize(d))
      .attr('opacity', 1);
  }

  // ── Tick ─────────────────────────────────────────────────────
  sim.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  // ── Filter controls ───────────────────────────────────────────
  const resizeObserver = new ResizeObserver(entries => {
    const rect = entries[0]?.contentRect;
    if (!rect || rect.width < 10 || rect.height < 10) return;
    W = rect.width;
    H = rect.height;
    svg.attr('width', W).attr('height', H);
    sim.force('center', d3.forceCenter(W / 2, H / 2));
    sim.alpha(0.25).restart();
  });
  resizeObserver.observe(wrap);

  const searchInput = document.getElementById('network-search');
  const searchResultsEl = document.getElementById('network-search-results');

  function normalizeSearch(v) {
    return String(v || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function nodeSearchText(d) {
    return normalizeSearch([d.label, d.type, d.country, d.allocType, d.gp, d.assetClass, d.geo, d.tier].filter(Boolean).join(' '));
  }

  function typeLabel(d) {
    if (d.type === 'dfi') return 'DFI / Other LP';
    if (d.type === 'fund') return 'Vehicle / Instrument';
    return 'Allocator';
  }

  function currentMatches() {
    const q = normalizeSearch(searchInput?.value || '');
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return nodeArr
      .filter(d => terms.every(term => nodeSearchText(d).includes(term)))
      .sort((a, b) => {
        const aStarts = normalizeSearch(a.label).startsWith(q) ? 0 : 1;
        const bStarts = normalizeSearch(b.label).startsWith(q) ? 0 : 1;
        return aStarts - bStarts || (b.linkCount || 0) - (a.linkCount || 0) || a.label.localeCompare(b.label);
      });
  }

  function renderSearchResults(matches) {
    if (!searchResultsEl) return;
    if (!normalizeSearch(searchInput?.value || '')) {
      searchResultsEl.classList.remove('is-visible');
      searchResultsEl.innerHTML = '';
      return;
    }
    if (!matches.length) {
      searchResultsEl.classList.add('is-visible');
      searchResultsEl.innerHTML = '<div class="network-search-empty">No matching nodes.</div>';
      return;
    }
    searchResultsEl.classList.add('is-visible');
    searchResultsEl.innerHTML = matches.slice(0, 8).map(d => `
      <button type="button" class="network-search-result" data-node-id="${encodeURIComponent(d.id)}">
        <strong>${escHtml(d.label)}</strong>
        <span>${escHtml(typeLabel(d))} - ${d.linkCount || 0} connections</span>
      </button>
    `).join('');
  }

  function applyFilters() {
    const showAlloc = document.getElementById('net-show-allocators')?.checked ?? true;
    const showFund  = document.getElementById('net-show-funds')?.checked ?? true;
    const showDFI   = document.getElementById('net-show-dfis')?.checked ?? true;
    const matches = currentMatches();
    const matchIds = new Set(matches.map(d => d.id));
    const q = normalizeSearch(searchInput?.value || '');
    const searchVisible = new Set();
    if (q) {
      matches.forEach(d => searchVisible.add(d.id));
      linkArr.forEach(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        if (searchVisible.has(s)) searchVisible.add(t);
        if (searchVisible.has(t)) searchVisible.add(s);
      });
    }

    function passesTypeFilters(d) {
      if (d.type === 'allocator' && !showAlloc) return false;
      if (d.type === 'fund'      && !showFund)  return false;
      if (d.type === 'dfi'       && !showDFI)   return false;
      return true;
    }

    function isVisibleNode(d) {
      return passesTypeFilters(d) && (!q || searchVisible.has(d.id));
    }

    node.style('display', d => {
      return isVisibleNode(d) ? '' : 'none';
    });
    node.selectAll('circle, rect')
      .attr('stroke', d => q && matchIds.has(d.id) ? '#111827' : 'white')
      .attr('stroke-width', d => q && matchIds.has(d.id) ? 3 : 1.5);
    link.style('display', l => {
      const sNode = typeof l.source === 'object' ? l.source : nodeById.get(l.source);
      const tNode = typeof l.target === 'object' ? l.target : nodeById.get(l.target);
      if (!sNode || !tNode) return 'none';
      return (isVisibleNode(sNode) && isVisibleNode(tNode)) ? '' : 'none';
    });
    renderSearchResults(matches);
  }

  ['net-show-allocators','net-show-funds','net-show-dfis'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });
  searchInput?.addEventListener('input', () => {
    clearSelection();
    applyFilters();
  });
  searchInput?.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const first = currentMatches()[0];
    if (!first) return;
    e.preventDefault();
    selectNode(first, { center: true });
  });
  searchResultsEl?.addEventListener('click', e => {
    const btn = e.target.closest('.network-search-result');
    if (!btn) return;
    const d = nodeById.get(decodeURIComponent(btn.dataset.nodeId || ''));
    if (d) selectNode(d, { center: true });
  });

  // ── Node count info ───────────────────────────────────────────
  const dfisCount  = nodeArr.filter(n => n.type === 'dfi').length;
  const allocsCount = nodeArr.filter(n => n.type === 'allocator').length;
  const fundsCount = nodeArr.filter(n => n.type === 'fund').length;
  document.getElementById('network-info').textContent =
    `${nodeArr.length} nodes (${allocsCount} allocators · ${fundsCount} funds · ${dfisCount} DFI/other LPs) · ${linkArr.length} connections`;
}
