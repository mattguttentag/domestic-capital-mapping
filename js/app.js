/* African PF/SWF Capital Mapping — Main App */

// ─── Data accessors ────────────────────────────────────────────────
const D = {
  commitments: () => DATASET['Commitments_Database'] || [],
  pipeline:    () => DATASET['Pipeline_and_Mandates'] || [],
  funds:       () => DATASET['Funds_and_LP_Co-Investors'] || [],
  dfis:        () => DATASET['DFI_Co-Investor_Patterns'] || [],
  sources:     () => DATASET['Source_Library'] || [],
  swfs:        () => DATASET['Sovereign_Wealth_Funds'] || [],
  pensions:    () => DATASET['Pension_Funds'] || [],
  tier1:       () => DATASET['Tier_1_Candidates'] || [],
  country:     () => DATASET['Country_Summary'] || [],
  regulatory:  () => DATASET['Regulatory_vs_Behaviour'] || [],
  absentees:   () => DATASET['Absentees_Investigation'] || [],
};

// ─── Helpers ───────────────────────────────────────────────────────
const TRUE_DFI_NAMES = new Set([
  'AfDB',
  'BII',
  'BIO',
  'CDP Group',
  'DEG',
  'Dutch Good Growth Fund',
  'EBID',
  'EIB',
  'FinDev Canada',
  'FMO',
  'IFC',
  'IFU',
  'KfW',
  'Norfund',
  'OeEB',
  'Proparco',
  'SIFEM',
  'Swedfund',
  'US DFC',
]);

function isTrueDfiRow(row) {
  return TRUE_DFI_NAMES.has(String(row['DFI / Catalytic capital provider'] || '').trim());
}

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

function sourceTokens(text) {
  return searchText(text).split(' ').filter(t => t.length >= 4 && ![
    'fund','funds','with','from','and','the','for','investment','investments','capital','source','press','release','report'
  ].includes(t));
}

function sourceFallbackLinks(row) {
  const hay = searchText(`${row['Source (short)'] || ''} ${row['Fund / Vehicle / Deal name'] || ''} ${row['Fund / Vehicle'] || ''} ${row['Allocator (institution)'] || ''} ${row['Named African PF/SWF LPs'] || ''}`);
  const rules = [
    { test: /pembani remgro/, url: 'https://www.africaglobalfunds.com/news/private-equity/fundraising/pembani-remgro-infrastructure-fund-hits-first-close-at-245m/', title: 'Africa Global Funds - Pembani Remgro Infrastructure Fund first close' },
    { test: /convergence partners communications|convergence partners communication/, url: 'https://www.convergencepartners.com/2015-07-27-convergencepartnerspanafricanictinfrastructurefundtodriveafricanbroadbandpenetration', title: 'Convergence Partners - Communication Infrastructure Fund final close' },
    { test: /pencom multi fund|stanbic ibtc pension managers multiple funds/, url: 'https://www.stanbicibtcpension.com/nigeriapensionmanagers/pension-managers/help-desk/frequently-asked-questions/general-faqs/faq', title: 'Stanbic IBTC Pension Managers - Multi-Fund Structure FAQ' },
    { test: /helios investors ii iii iv|helios historical/, url: 'https://www.heliosinvestment.com/our-firm', title: 'Helios Investment Partners - firm and fund history' },
    { test: /ascent rift valley fund i arvf i|arvf i/, url: 'https://www.africaglobalfunds.com/news/private-equity/fundraising/arvf-hits-final-close-at-80m/', title: 'Africa Global Funds - Ascent Rift Valley Fund final close' },
    { test: /nigeria infrastructure fund|nif nsia sub fund/, url: 'https://nsia.com.ng/download/84/investment-policy/11782/nigeria-infrastructure-fund-investment-policy-statement-2021.pdf', title: 'NSIA - Nigeria Infrastructure Fund investment policy statement' },
    { test: /ez international|el ezaby|tsfe healthcare/, url: 'https://tsfe.com/press.html', title: 'The Sovereign Fund of Egypt - press and portfolio releases' },
    { test: /capmezzanine|inframaroc|cdg capital materials/, url: 'https://www.cdg.ma/en/investment-0', title: 'CDG - Investment / CDG Invest Growth' },
    { test: /mohammed vi fund for investment|sectoral co investment funds/, url: 'https://www.fm6i.ma/en/capital-investissement-fonds-thematiques-et-sectoriels', title: 'FM6I - Capital-investissement: fonds thematiques et sectoriels' },
    { test: /stimulus investments|eos capital|housing financing programme|gipf disclosures/, url: 'https://www.gipf.com.na/unlisted-investments/', title: 'GIPF - Unlisted Investments portfolio overview' },
    { test: /bpopf disclosures|botswana public officers pension fund various/, url: 'https://guardiansun.co.bw/News/bpopf-seeks-sweet-spot-in-alternative-investments', title: 'Guardian Sun - BPOPF alternative investments' },
    { test: /afc announcement of pic|pic south africa afc equity stake/, url: 'https://www.africaglobalfunds.com/news/investors/pic-to-invest-100m-in-afc/', title: 'Africa Global Funds - PIC to invest US$100m in AFC' },
    { test: /business in cameroon|cnps cameroon/, url: 'https://www.businessincameroon.com/finance/2906-13233-cameroons-national-social-security-fund-cnps-joins-africa-finance-corporation-afc-as-shareholder', title: 'Business in Cameroon - CNPS joins AFC as shareholder' },
    { test: /cote d ivoire|mauritius shareholders|national pension fund npf mauritius|national savings fund nsf mauritius/, url: 'https://www.africafc.org/news-and-insights/news/africa-finance-corporation-diversifies-shareholders-with-equity-from-c%C3%B4te-divoire-mauritius-and-africare', title: 'AFC - Shareholder equity from Cote d Ivoire and Mauritius' },
    { test: /ghana sierra leone seychelles|seychelles pension fund|government of sierra leone|ghana infrastructure investment fund|indian ocean shareholders/, url: 'https://www.africafc.org/news-and-insights/news/africa-finance-corporation-attracts-new-equity-from-ghana-sierra-leone-and-seychelles', title: 'AFC - Equity from Ghana, Sierra Leone and Seychelles' },
    { test: /egypt becomes first north african|government of egypt afc equity stake/, url: 'https://www.africafc.org/news-and-insights/news/egypt-becomes-first-north-african-shareholder-in-africa-finance-corporation', title: 'AFC - Egypt becomes first North African shareholder' },
    { test: /afc equity shareholder list|cdc gabon/, url: 'https://www.africafc.org/our-investors/equity', title: 'AFC - Our Investors' },
    { test: /catalyst fund ii|avca fund close coverage/, url: 'https://africaglobalfunds.com/news/private-equity/fundraising/catalyst-fund-ii-reaches-155m-final-close/', title: 'Africa Global Funds - Catalyst Fund II final close' },
    { test: /agaciro|agdf/, url: 'https://ifswf.org/sites/default/files/annual-reports/Agaciro%202021%20Annual%20Report.pdf', title: 'Agaciro Development Fund - 2021 annual report' },
    { test: /rssb disclosures|bk group|rwandair|strategic stakes/, url: 'https://rssb.rw/investment', title: 'Rwanda Social Security Board - Investment' },
    { test: /ssnit disclosures|direct stakes in ghanaian/, url: 'https://www.ssnit.org.gh/annual-reports/', title: 'SSNIT - Annual reports' },
    { test: /fsd djibouti|fsd disclosures|domestic strategic partnerships/, url: 'https://www.fsd.dj/who-we-are/', title: 'Fonds Souverain de Djibouti - mandate and investment role' }
  ];
  return rules.filter(r => r.test.test(hay)).map(r => ({
    url: r.url,
    label: 'source',
    title: r.title
  }));
}

function sourceLinksFor(row, kind) {
  if (row['Source URL']) {
    return [{ url: row['Source URL'], label: row['Source (short)'] || 'source' }];
  }
  const vehicleName = row['Fund / Vehicle / Deal name'] || row['Fund / Vehicle'] || '';
  const fallbackLinks = sourceFallbackLinks(row);
  if (fallbackLinks.length) return fallbackLinks;
  const sourceRows = D.sources().filter(s => s.URL);
  const short = searchText(row['Source (short)']);
  const shortTokens = searchText(row['Source (short)']).split(' ').filter(t => t.length >= 3 && ![
    'the','and','for','with','source','press','release','report','fund','funds'
  ].includes(t));
  const vehicle = vehicleName;
  const allocator = row['Allocator (institution)'] || row['Named African PF/SWF LPs'] || '';
  const manager = row['GP or counterparty'] || row['Manager / GP'] || '';
  const vehicleTokens = sourceTokens(vehicle);
  const allocatorTokens = sourceTokens(allocator);
  const managerTokens = sourceTokens(manager);
  const scored = sourceRows.map(s => {
    const hay = searchText(`${s.Allocator || ''} ${s['Title / publication'] || ''} ${s['Used for'] || ''}`);
    let score = 0;
    if (short && hay.includes(short)) score += 120;
    shortTokens.slice(0, 6).forEach(t => { if (hay.includes(t)) score += 20; });
    vehicleTokens.forEach(t => { if (hay.includes(t)) score += 18; });
    allocatorTokens.slice(0, 5).forEach(t => { if (hay.includes(t)) score += 8; });
    managerTokens.slice(0, 4).forEach(t => { if (hay.includes(t)) score += 6; });
    if (kind === 'fund' && vehicleTokens.length && score >= 18) score += 10;
    return { source: s, score };
  }).filter(x => x.score >= 28)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => ({
      url: x.source.URL,
      label: x.source['Source type'] || x.source.Allocator || 'source',
      title: x.source['Title / publication'] || x.source.URL
    }));
  const seen = new Set();
  return scored.filter(s => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}

function sourceLinksHtml(row, kind) {
  const links = sourceLinksFor(row, kind);
  if (!links.length) return '<span class="map-muted">No source link matched</span>';
  return links.map((s, i) => `<a href="${escHtml(s.url)}" target="_blank" rel="noopener" title="${escHtml(s.title || s.url)}">${escHtml(i === 0 ? 'source' : `source ${i + 1}`)}</a>`).join(' ');
}

function assetTag(ac) {
  const key = assetClass(ac);
  return `<span class="asset-tag asset-${key}">${assetLabel(key)}</span>`;
}

const FUND_GEO_OPTIONS = [
  { value: 'Domestic', label: 'Domestic / single-country' },
  { value: 'Pan-Africa', label: 'Pan-Africa' },
  { value: 'Sub-Saharan Africa', label: 'Sub-Saharan Africa' },
  { value: 'North Africa', label: 'North Africa' },
  { value: 'Southern Africa', label: 'Southern Africa' },
  { value: 'East Africa', label: 'East Africa' },
  { value: 'West Africa', label: 'West Africa' },
  { value: 'Central Africa', label: 'Central Africa' },
  { value: 'Regional', label: 'Regional / multi-country' },
  { value: 'Botswana', label: 'Botswana' },
  { value: 'Cote dIvoire', label: "Cote d'Ivoire" },
  { value: 'DRC', label: 'DRC' },
  { value: 'Egypt', label: 'Egypt' },
  { value: 'Ethiopia', label: 'Ethiopia' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Morocco', label: 'Morocco' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Rwanda', label: 'Rwanda' },
  { value: 'Senegal', label: 'Senegal' },
  { value: 'Tanzania', label: 'Tanzania' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Zambia', label: 'Zambia' }
];

const FUND_COUNTRY_PATTERNS = [
  { tag: 'Botswana', region: 'Southern Africa', patterns: ['botswana'] },
  { tag: 'Cote dIvoire', region: 'West Africa', patterns: ['cote d ivoire', 'cote divoire', 'ivory coast'] },
  { tag: 'DRC', region: 'Central Africa', patterns: ['drc', 'democratic republic of congo'] },
  { tag: 'Egypt', region: 'North Africa', patterns: ['egypt'] },
  { tag: 'Ethiopia', region: 'East Africa', patterns: ['ethiopia'] },
  { tag: 'Ghana', region: 'West Africa', patterns: ['ghana'] },
  { tag: 'Kenya', region: 'East Africa', patterns: ['kenya'] },
  { tag: 'Morocco', region: 'North Africa', patterns: ['morocco'] },
  { tag: 'Nigeria', region: 'West Africa', patterns: ['nigeria'] },
  { tag: 'Rwanda', region: 'East Africa', patterns: ['rwanda'] },
  { tag: 'Senegal', region: 'West Africa', patterns: ['senegal'] },
  { tag: 'Tanzania', region: 'East Africa', patterns: ['tanzania'] },
  { tag: 'Uganda', region: 'East Africa', patterns: ['uganda'] },
  { tag: 'Zambia', region: 'Southern Africa', patterns: ['zambia'] }
];

function fundGeoTags(focus) {
  const raw = String(focus || '');
  const text = searchText(raw);
  const tags = new Set();
  if (!text) return tags;

  if (/\bpan africa\b|\bpan african\b|\bafrica\b/.test(text)) tags.add('Pan-Africa');
  if (text.includes('sub saharan')) tags.add('Sub-Saharan Africa');
  if (text.includes('north africa')) tags.add('North Africa');
  if (text.includes('southern africa')) tags.add('Southern Africa');
  if (text.includes('east africa')) tags.add('East Africa');
  if (text.includes('west africa')) tags.add('West Africa');
  if (text.includes('central africa')) tags.add('Central Africa');
  if (text.includes('regional')) tags.add('Regional');

  const countries = [];
  FUND_COUNTRY_PATTERNS.forEach(c => {
    if (c.patterns.some(p => text.includes(p))) {
      tags.add(c.tag);
      tags.add(c.region);
      countries.push(c.tag);
    }
  });

  const multiCountryMarkers = /[,+/]| and /.test(raw);
  if (countries.length === 1 && !multiCountryMarkers && !tags.has('Pan-Africa') && !tags.has('Sub-Saharan Africa')) {
    tags.add('Domestic');
  }
  if (countries.length > 1 || tags.has('Sub-Saharan Africa') || tags.has('North Africa') || tags.has('Southern Africa') || tags.has('East Africa') || tags.has('West Africa') || tags.has('Central Africa')) {
    if (!tags.has('Domestic')) tags.add('Regional');
  }
  return tags;
}

function populateFundGeoFilter() {
  const el = document.getElementById('fund-geo-filter');
  if (!el || el.dataset.populated === '1') return;
  const available = new Set();
  D.funds().forEach(r => fundGeoTags(r['Geographic focus']).forEach(t => available.add(t)));
  FUND_GEO_OPTIONS.forEach(opt => {
    if (!available.has(opt.value)) return;
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.label;
    el.appendChild(o);
  });
  el.dataset.populated = '1';
}

function confBadge(c) {
  const v = String(c || '').trim().charAt(0).toUpperCase();
  if (!v || v === 'N') return '';
  return `<span class="conf-${v}">${v}</span>`;
}

const COUNTRY_COORDS = {
  'Algeria': [2.6, 28.2], 'Angola': [17.9, -12.3], 'Benin': [2.3, 9.3],
  'Botswana': [24.7, -22.2], 'Burkina Faso': [-1.6, 12.3], 'Cameroon': [12.4, 5.7],
  'Côte d’Ivoire': [-5.5, 7.5], "Côte d'Ivoire": [-5.5, 7.5], 'Cote dIvoire': [-5.5, 7.5],
  'Egypt': [30.8, 26.8], 'Ethiopia': [39.6, 9.1], 'Gabon': [11.8, -0.6],
  'Ghana': [-1.0, 7.9], 'Kenya': [37.9, 0.3], 'Libya': [17.2, 26.3],
  'Mauritius': [57.6, -20.2], 'Morocco': [-6.1, 31.8], 'Mozambique': [35.5, -18.7],
  'Namibia': [17.1, -22.1], 'Nigeria': [8.7, 9.1], 'Rwanda': [29.9, -1.9],
  'Senegal': [-14.5, 14.4], 'Seychelles': [55.5, -4.7], 'Sierra Leone': [-11.8, 8.5],
  'South Africa': [24.0, -29.0], 'Tanzania': [34.9, -6.4], 'Togo': [1.0, 8.6],
  'Tunisia': [9.5, 34.0], 'Uganda': [32.3, 1.4], 'Zambia': [27.8, -13.1], 'Zimbabwe': [29.2, -19.0],
};

const AFRICA_MAP_NAMES = new Set([
  'Algeria','Angola','Benin','Botswana','Burkina Faso','Burundi','Cameroon','Central African Rep.','Chad','Congo','Dem. Rep. Congo',
  'Djibouti','Egypt','Eq. Guinea','Eritrea','Ethiopia','Gabon','Gambia','Ghana','Guinea','Guinea-Bissau','Ivory Coast','Kenya',
  'Lesotho','Liberia','Libya','Madagascar','Malawi','Mali','Mauritania','Morocco','Mozambique','Namibia','Niger','Nigeria',
  'Rwanda','S. Sudan','Senegal','Sierra Leone','Somalia','Somaliland','South Africa','Sudan','Tanzania','Togo','Tunisia',
  'Uganda','Zambia','Zimbabwe','eSwatini'
]);

let africaFeaturesPromise;

function countryCoord(country) {
  const c = String(country || '').trim();
  return COUNTRY_COORDS[c] || COUNTRY_COORDS[c.replace(/[’']/g, '')] || null;
}

function loadAfricaFeatures() {
  if (!africaFeaturesPromise) {
    africaFeaturesPromise = d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(world => topojson.feature(world, world.objects.countries).features
        .filter(f => AFRICA_MAP_NAMES.has(f.properties?.name)))
      .catch(() => []);
  }
  return africaFeaturesPromise;
}

function initViewToggles() {
  document.querySelectorAll('.view-toggle').forEach(toggle => {
    toggle.querySelectorAll('.view-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = toggle.dataset.viewGroup;
        const view = btn.dataset.view;
        toggle.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
        document.getElementById(`${group}-list-view`)?.classList.toggle('active', view === 'list');
        document.getElementById(`${group}-map-view`)?.classList.toggle('active', view === 'map');
        if (group === 'inst') renderInstitutions();
        if (group === 'comm') renderCommitments();
      });
    });
  });
}

function renderAfricaMap(containerId, countries, mode) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const rows = countries.filter(d => countryCoord(d.country));
  if (!rows.length) {
    container.innerHTML = `<div class="map-error">No countries with mappable results under the current filters.</div>`;
    return;
  }

  container.innerHTML = `<div class="map-layout">
    <div class="map-canvas"><svg aria-label="Interactive Africa map"></svg></div>
    <div class="map-panel"></div>
  </div>`;
  const canvas = container.querySelector('.map-canvas');
  const panel = container.querySelector('.map-panel');
  const svg = d3.select(container).select('svg');
  const width = Math.max(680, canvas.clientWidth || 900);
  const height = 560;
  svg.attr('viewBox', `0 0 ${width} ${height}`);

  const maxCount = d3.max(rows, d => d.count) || 1;
  const radius = d3.scaleSqrt().domain([1, maxCount]).range([8, 34]);

  function panelHtml(d) {
    if (!d) return '<h3>Map View</h3><p class="map-muted">Click a country bubble to inspect matching rows.</p>';
    const statLabel = mode === 'institutions' ? 'Institutions' : 'Commitments';
    const secondary = mode === 'institutions'
      ? `<div class="map-stat-card"><strong>${fmtAUM(d.aum || 0)}</strong><span>Approx. AUM</span></div>`
      : `<div class="map-stat-card"><strong>${d.allocators || 0}</strong><span>Allocators</span></div>`;
    const detail = d.items.slice(0, 10).map(item => mode === 'institutions'
      ? `<div class="map-list-item"><strong>${escHtml(item.name)}</strong><br><span class="map-muted">${escHtml(item.type)} · ${fmtAUM(item.aum)}</span></div>`
      : `<div class="map-list-item"><strong>${escHtml(item.vehicle)}</strong><br><span class="map-muted">${escHtml(item.allocator)} · ${escHtml(item.asset)}</span></div>`
    ).join('');
    const detailWithSources = mode === 'commitments'
      ? d.items.slice(0, 10).map(item => `<div class="map-list-item"><strong>${escHtml(item.vehicle)}</strong><br><span class="map-muted">${escHtml(item.allocator)} - ${escHtml(item.asset)}</span>${item.source ? `<div class="source-link">${item.source}</div>` : ''}</div>`).join('')
      : detail;
    return `<h3>${escHtml(d.country)}</h3>
      <p class="map-muted">${escHtml(d.caption || '')}</p>
      <div class="map-stat">
        <div class="map-stat-card"><strong>${d.count}</strong><span>${statLabel}</span></div>
        ${secondary}
      </div>
      <div class="map-list">${detailWithSources || '<div class="map-muted">No detail rows.</div>'}</div>`;
  }

  function draw(features) {
    const projection = features.length
      ? d3.geoMercator().fitExtent([[18, 18], [width - 18, height - 18]], { type: 'FeatureCollection', features })
      : d3.geoMercator().center([20, 1]).scale(width * 0.85).translate([width / 2, height / 2]);
    const path = d3.geoPath(projection);

    svg.append('g').selectAll('path')
      .data(features)
      .join('path')
      .attr('class', f => rows.some(d => d.country === f.properties?.name) ? 'map-country has-data' : 'map-country')
      .attr('d', path);

    const points = rows.map(d => ({ ...d, xy: projection(countryCoord(d.country)) })).filter(d => d.xy);
    const top = [...points].sort((a, b) => b.count - a.count)[0];
    panel.innerHTML = panelHtml(top);

    const g = svg.append('g');
    g.selectAll('circle')
      .data(points)
      .join('circle')
      .attr('class', d => d === top ? 'map-bubble active' : 'map-bubble')
      .attr('cx', d => d.xy[0])
      .attr('cy', d => d.xy[1])
      .attr('r', d => radius(d.count))
      .on('click', function(event, d) {
        g.selectAll('circle').classed('active', p => p === d);
        panel.innerHTML = panelHtml(d);
      });

    g.selectAll('text')
      .data(points.filter(d => d.count >= Math.max(2, maxCount * 0.35)))
      .join('text')
      .attr('class', 'map-label')
      .attr('x', d => d.xy[0])
      .attr('y', d => d.xy[1] - radius(d.count) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.country);
  }

  loadAfricaFeatures().then(draw);
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
  document.getElementById('stat-dfis').textContent = D.dfis().filter(isTrueDfiRow).length;

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
  renderInstitutionMap(rows);

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

function renderInstitutionMap(rows) {
  const grouped = new Map();
  rows.forEach(r => {
    const country = r['Country'];
    if (!countryCoord(country)) return;
    if (!grouped.has(country)) grouped.set(country, { country, count: 0, pf: 0, swf: 0, aum: 0, items: [] });
    const g = grouped.get(country);
    g.count += 1;
    g.pf += r._entityType === 'PF' ? 1 : 0;
    g.swf += r._entityType === 'SWF' ? 1 : 0;
    g.aum += parseFloat(r['AUM (USD m, approx)']) || 0;
    g.items.push({ name: r['Institution'] || '—', type: r._entityType, aum: r['AUM (USD m, approx)'] });
  });
  const countries = [...grouped.values()].map(d => ({
    ...d,
    caption: `${d.pf} pension funds · ${d.swf} sovereign wealth funds`,
    items: d.items.sort((a, b) => (parseFloat(b.aum) || 0) - (parseFloat(a.aum) || 0))
  })).sort((a, b) => b.count - a.count);
  renderAfricaMap('inst-map', countries, 'institutions');
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
  renderCommitmentMap(rows);

  const tbody = document.getElementById('comm-tbody');
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="icon">🔍</div>No commitments match.</div></td></tr>`;
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
    <td><div class="source-link">${sourceLinksHtml(r, 'commitment')}</div></td>
  </tr>`).join('');
}

function renderCommitmentMap(rows) {
  const grouped = new Map();
  rows.forEach(r => {
    const country = r['Allocator country'];
    if (!countryCoord(country)) return;
    if (!grouped.has(country)) grouped.set(country, { country, count: 0, allocatorsSet: new Set(), items: [] });
    const g = grouped.get(country);
    g.count += 1;
    g.allocatorsSet.add(r['Allocator (institution)']);
    g.items.push({
      allocator: r['Allocator (institution)'] || '—',
      vehicle: r['Fund / Vehicle / Deal name'] || '—',
      asset: assetLabel(assetClass(r['Asset class'])),
      source: sourceLinksHtml(r, 'commitment')
    });
  });
  const countries = [...grouped.values()].map(d => ({
    ...d,
    allocators: d.allocatorsSet.size,
    caption: `${d.allocatorsSet.size} allocator${d.allocatorsSet.size === 1 ? '' : 's'} with confirmed rows`,
    items: d.items
  })).sort((a, b) => b.count - a.count);
  renderAfricaMap('comm-map', countries, 'commitments');
}

function renderFunds() {
  let rows = D.funds();
  const q    = document.getElementById('fund-search')?.value || '';
  const asst = document.getElementById('fund-asset-filter')?.value || '';
  const geo  = document.getElementById('fund-geo-filter')?.value || '';

  rows = rows.filter(r => {
    if (!rowMatchesSearch(r, ['Fund / Vehicle','Manager / GP','Named African PF/SWF LPs','Named DFI LPs'], q)) return false;
    if (asst && assetClass(r['Asset class']) !== asst) return false;
    if (geo && !fundGeoTags(r['Geographic focus']).has(geo)) return false;
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
    const sources = sourceLinksHtml(r, 'fund');
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
      ${dfis.length ? `<div class="fund-lps"><strong>DFIs and Other LPs:</strong> ${dfis.map(d => `<span class="pill" style="background:#fef3c7;color:#78350f">${escHtml(d)}</span>`).join(' ')}</div>` : ''}
      <div class="source-link"><strong>Sources:</strong> ${sources}</div>
    </div>`;
  }).join('');
}

function initCommitments() {
  const assetOpts = ['PE','VC','Infra','Credit','Direct','FundOfFunds','Mixed','Other'];
  ['comm-asset-filter','fund-asset-filter'].forEach(id => {
    const el = document.getElementById(id);
    assetOpts.forEach(a => { const o = document.createElement('option'); o.value = a; o.textContent = assetLabel(a); el.appendChild(o); });
  });
  populateFundGeoFilter();

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
    .filter(r => isTrueDfiRow(r) && r['Co-investments in funds with African PF/SWF LP'])
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
  initViewToggles();
  renderOverview();
  initInstitutions();
  initCommitments();
  initPipeline();
  // Network init deferred to first click
});
