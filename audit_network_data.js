const fs = require('fs');
const path = require('path');
const vm = require('vm');

const cwd = process.cwd();

function loadAppContext() {
  const context = {
    console,
    window: { addEventListener() {} },
    document: {
      getElementById() { return null; },
      querySelectorAll() { return []; },
    },
    d3: {},
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(cwd, 'data/data.js'), 'utf8') + '\nthis.DATASET = DATASET;', context);
  vm.runInContext(fs.readFileSync(path.join(cwd, 'js/app.js'), 'utf8') + '\nthis.D = D; this.assetClass = assetClass; this.escHtml = escHtml;', context);
  vm.runInContext(fs.readFileSync(path.join(cwd, 'js/network.js'), 'utf8') + '\nrenderNetworkGraph = (nodes, links) => { this.__captured = { nodes, links }; }; buildNetwork();', context);
  return context;
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[&]/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(fund|funds|vehicle|stake|shareholder|shareholders|equity|lp|limited|company|co|the)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function simplified(s) {
  return norm(s)
    .replace(/\b(africa50 infrastructure acceleration iaf|africa50 infrastructure acceleration)\b/g, 'africa50 iaf')
    .replace(/\b(afc|africa finance corporation)\b/g, 'africa finance corporation')
    .replace(/\b(ci gaba|ci-gaba)\b/g, 'ci gaba')
    .replace(/\b(pic south africa|pic sa|gepf via pic|gepf pic|gepf)\b/g, 'gepf pic')
    .replace(/\b(petra trust ghana|petra trust)\b/g, 'petra trust')
    .replace(/\s+/g, ' ')
    .trim();
}

const vehicleAliases = new Map([
  ['ci gaba', 'ci gaba'],
  ['ci gaba fund of', 'ci gaba'],
  ['growth investment partners gip ghana', 'growth investment partners ghana'],
  ['growth investment partners ghana', 'growth investment partners ghana'],
  ['growth investment partners gip zambia', 'growth investment partners zambia'],
  ['growth investment partners zambia gip zambia', 'growth investment partners zambia'],
  ['growth investment partners zambia', 'growth investment partners zambia'],
  ['africinvest five financial inclusion evergreen', 'africinvest five financial inclusion'],
  ['fund for agricultural finance in nigeria fafin', 'sahel capital agricultural finance nigeria fafin'],
  ['sahel capital agricultural finance nigeria fafin', 'sahel capital agricultural finance nigeria fafin'],
  ['vantage capital mezzanine', 'vantage mezzanine iv pan african sub'],
  ['vantage mezzanine iv pan african sub', 'vantage mezzanine iv pan african sub'],
  ['mediterrania capital ii iii historical', 'mediterrania capital ii iii iv'],
  ['mediterrania capital ii iii iv', 'mediterrania capital ii iii iv'],
  ['nigeria infrastructure nif direct deals', 'nigeria infrastructure nif nsia sub'],
  ['nigeria infrastructure nif nsia sub', 'nigeria infrastructure nif nsia sub'],
  ['africa50 general', 'africa50'],
  ['africa50 shareholder', 'africa50'],
  ['africa50 indirect via pic', 'africa50'],
  ['afc', 'africa finance corporation'],
  ['africa finance corporation afc', 'africa finance corporation'],
]);

function vehicleKey(s) {
  const key = simplified(s);
  return vehicleAliases.get(key) || key;
}

function isMandateLike(text) {
  return /\b(kepfic|aofsa|mandate|mou|planned|expected|targeted|eligible|member-only|member evidence)\b/i.test(String(text || ''));
}

function findNearMatches(items) {
  const byKey = new Map();
  items.forEach(item => {
    const key = simplified(item.label);
    if (!key) return;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(item);
  });
  return [...byKey.entries()]
    .filter(([, vals]) => vals.length > 1)
    .map(([key, vals]) => ({ key, labels: vals.map(v => `${v.type}: ${v.label}`) }));
}

const context = loadAppContext();
const { D } = context;
const { nodes, links } = context.__captured;

const nodeById = new Map(nodes.map(n => [n.id, n]));
const fundNodes = nodes.filter(n => n.type === 'fund');
const allocatorNodes = nodes.filter(n => n.type === 'allocator');
const dfiNodes = nodes.filter(n => n.type === 'dfi');

const commitmentVehicles = D.commitments()
  .map(r => ({
    label: r['Fund / Vehicle / Deal name'],
    allocator: r['Allocator (institution)'],
    type: 'commitment',
    raw: r,
  }))
  .filter(r => r.label);

const fundRows = D.funds()
  .map(r => ({
    label: r['Fund / Vehicle'],
    dfi: r['Named DFI LPs'],
    africanLp: r['Named African PF/SWF LPs'],
    type: 'fund-row',
    raw: r,
  }))
  .filter(r => r.label);

const networkFundLabels = new Set(fundNodes.map(n => vehicleKey(n.label)));
const fundRowLabels = new Map(fundRows.map(r => [vehicleKey(r.label), r]));
const commitmentLabels = new Map(commitmentVehicles.map(r => [vehicleKey(r.label), r]));

const confirmedCommitmentWithoutFundRow = commitmentVehicles
  .filter(r => !isMandateLike([r.label, r.raw['Commitment type'], r.raw['GP or counterparty'], r.raw['Notes']].join(' ')))
  .filter(r => !fundRowLabels.has(vehicleKey(r.label)))
  .map(r => ({ vehicle: r.label, allocator: r.allocator, commitmentType: r.raw['Commitment type'] }));

const fundRowsNotInNetwork = fundRows
  .filter(r => !isMandateLike([r.label, r.raw['Co-investor pattern note']].join(' ')))
  .filter(r => commitmentLabels.has(vehicleKey(r.label)) && !networkFundLabels.has(vehicleKey(r.label)))
  .map(r => ({ vehicle: r.label, dfi: r.dfi }));

const mandateLeakage = nodes
  .filter(n => isMandateLike(n.label))
  .map(n => `${n.type}: ${n.label}`);

const duplicateLikeNodes = findNearMatches(nodes.map(n => ({ type: n.type, label: n.label })));

const dfiEdgesByFund = new Map();
links.forEach(l => {
  const s = typeof l.source === 'object' ? l.source.id : l.source;
  const t = typeof l.target === 'object' ? l.target.id : l.target;
  const sn = nodeById.get(s);
  const tn = nodeById.get(t);
  if (!sn || !tn) return;
  const fund = sn.type === 'fund' ? sn : tn.type === 'fund' ? tn : null;
  const dfi = sn.type === 'dfi' ? sn : tn.type === 'dfi' ? tn : null;
  if (!fund || !dfi) return;
  if (!dfiEdgesByFund.has(fund.label)) dfiEdgesByFund.set(fund.label, []);
  dfiEdgesByFund.get(fund.label).push(dfi.label);
});

const fundRowsWithDfiTextNoDfiEdges = fundRows
  .filter(r => !isMandateLike(r.label))
  .filter(r => r.dfi && !/^[-0—]$/.test(String(r.dfi).trim()) && !/^various/i.test(String(r.dfi)))
  .filter(r => {
    const networkFund = fundNodes.find(n => vehicleKey(n.label) === vehicleKey(r.label));
    if (!networkFund) return false;
    return !(dfiEdgesByFund.get(networkFund.label) || []).length;
  })
  .map(r => ({ vehicle: r.label, namedDfiLps: r.dfi }));

const fundRowsWithDfiTextNoConfirmedVehicle = fundRows
  .filter(r => !isMandateLike(r.label))
  .filter(r => r.dfi && !/^[-0—]$/.test(String(r.dfi).trim()) && !/^various/i.test(String(r.dfi)))
  .filter(r => !fundNodes.some(n => vehicleKey(n.label) === vehicleKey(r.label)))
  .map(r => ({ vehicle: r.label, namedDfiLps: r.dfi }));

const requiredEdges = [
  { source: 'Small Foundation', target: 'Ci Gaba Fund of Funds', sourceType: 'dfi', targetType: 'fund' },
  { source: 'FMO', target: 'Ci Gaba Fund of Funds', sourceType: 'dfi', targetType: 'fund' },
];

function hasEdge(sourceLabel, targetLabel, sourceType, targetType) {
  const source = nodes.find(n => n.type === sourceType && n.label === sourceLabel);
  const target = nodes.find(n => n.type === targetType && n.label === targetLabel);
  if (!source || !target) return false;
  return links.some(l => {
    const s = typeof l.source === 'object' ? l.source.id : l.source;
    const t = typeof l.target === 'object' ? l.target.id : l.target;
    return (s === source.id && t === target.id) || (s === target.id && t === source.id);
  });
}

const missingRequiredEdges = requiredEdges
  .filter(e => !hasEdge(e.source, e.target, e.sourceType, e.targetType))
  .map(e => `${e.source} -> ${e.target}`);

const report = {
  counts: {
    nodes: nodes.length,
    allocators: allocatorNodes.length,
    funds: fundNodes.length,
    dfis: dfiNodes.length,
    links: links.length,
  },
  mandateLeakage,
  duplicateLikeNodes,
  confirmedCommitmentWithoutFundRow,
  fundRowsNotInNetwork,
  fundRowsWithDfiTextNoDfiEdges,
  fundRowsWithDfiTextNoConfirmedVehicle,
  missingRequiredEdges,
  dfiEdgesByFund: Object.fromEntries([...dfiEdgesByFund.entries()].sort()),
};

console.log(JSON.stringify(report, null, 2));

const hasIssues = mandateLeakage.length ||
  duplicateLikeNodes.length ||
  fundRowsNotInNetwork.length ||
  fundRowsWithDfiTextNoDfiEdges.length ||
  fundRowsWithDfiTextNoConfirmedVehicle.length ||
  missingRequiredEdges.length;

process.exit(hasIssues ? 1 : 0);
