import { useState } from 'react';
import CalculatorTab from './components/CalculatorTab';
import MapTab from './components/MapTab';
import ReportsTab from './components/ReportsTab';
import ReferenceTab from './components/ReferenceTab';
import PredictiveTab from './components/PredictiveTab';
import BlockchainTab from './components/BlockchainTab';
import RemediationTab from './components/RemediationTab';
import { NotificationStack, useNotifications } from './components/SharedComponents';
import { Calculator, Map, BarChart2, BookOpen, Droplets, Cpu, ShieldCheck, Wrench, Sparkles } from 'lucide-react';

const TABS = [
  { id: 'calculator',  label: 'HMPI Calculator',      icon: <Calculator size={14} /> },
  { id: 'map',         label: 'GIS Heatmap',          icon: <Map size={14} /> },
  { id: 'predictive',  label: 'Predictive AI',        icon: <Cpu size={14} /> },
  { id: 'blockchain',  label: 'Security Assessment',  icon: <ShieldCheck size={14} /> },
  { id: 'remediation', label: 'Remediation & Alerts', icon: <Wrench size={14} /> },
  { id: 'reports',     label: 'Reports & Data',       icon: <BarChart2 size={14} /> },
  { id: 'reference',   label: 'Reference Methods',    icon: <BookOpen size={14} /> },
];

const HERO_PILLS = [
  { icon: '🧪', label: '12 Heavy Metals', iconBg: '#dbeafe' },
  { icon: '📐', label: '5 Pollution Indices', iconBg: '#ccfbf1' },
  { icon: '🤖', label: 'LSTM / ARIMA Predictive AI', iconBg: '#f3e8ff' },
  { icon: '🛡️', label: 'Security Assessment & SHA-256 Audit', iconBg: '#dcfce7' },
  { icon: '🚨', label: 'Automated SMS / Email Alerts', iconBg: '#fee2e2' },
  { icon: '🗺️', label: 'GIS Hotspot Heatmap', iconBg: '#ffedd5' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [extraResults, setExtraResults] = useState([]);
  const { notifs, addNotif, removeNotif } = useNotifications();

  const handleAddResult = (result) => {
    setExtraResults(prev => [...prev, result]);
    const cls = result.hmpi?.classification;
    addNotif(
      `Analysis complete — ${result.location || result.sample_id} · HMPI: ${result.hmpi?.value?.toFixed(2)} (${cls?.label})`,
      cls?.class === 'safe' ? 'success' : 'error'
    );
  };

  return (
    <>
      {/* Decorative BG */}
      <div className="bg-grid" />
      <div className="bg-dots" />
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <div className="app-wrapper">
        {/* ── NAVIGATION ── */}
        <nav className="nav">
          <div className="nav-inner">
            {/* Logo */}
            <div className="nav-logo">
              <div className="nav-logo-icon">
                <Droplets size={20} color="white" />
              </div>
              <div className="nav-logo-text">
                <span className="nav-logo-title">HMPI Analyzer</span>
                <span className="nav-logo-sub">Groundwater AI Platform</span>
              </div>
            </div>

            <div className="nav-divider" />

            {/* Tabs */}
            <div className="nav-tabs">
              {TABS.map(tab => (
                <button key={tab.id} className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Right badges */}
            <div className="nav-right">
              <div className="nav-who-badge">
                <div className="nav-who-dot" />
                WHO 2017 Standards
              </div>
            </div>
          </div>
        </nav>

        {/* ── HERO (only on calculator tab) ── */}
        {activeTab === 'calculator' && (
          <div className="hero">
            {/* Eyebrow */}
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-dot" />
              Automated CGWB &amp; WHO Compliant Platform
            </div>

            {/* Title */}
            <h1 className="hero-title">
              Heavy Metal Pollution<br />
              <span className="grad-text">Index</span>{' '}
              <span className="grad-text-teal">Computation Engine</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-sub">
              Automates HMPI, HEI, Contamination Factor, Degree of Contamination &amp; Human Health Risk Assessment
              with <strong>Blockchain SHA-256 Data Integrity, LSTM Predictive Forecasting &amp; GIS Heatmaps</strong>.
            </p>

            {/* Feature pills */}
            <div className="hero-pills">
              {HERO_PILLS.map((p, i) => (
                <div key={i} className="hero-pill" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="hero-pill-icon" style={{ background: p.iconBg }}>{p.icon}</div>
                  {p.label}
                </div>
              ))}
            </div>

            {/* Stats strip */}
            <div className="hero-stats-row">
              {[
                { val: '12', lbl: 'Heavy Metals' },
                { val: '5',  lbl: 'Pollution Indices' },
                { val: 'LSTM / ARIMA', lbl: 'AI Forecast' },
                { val: 'SHA-256', lbl: 'Blockchain Audit' },
                { val: 'GIS Heatmap', lbl: 'Hotspot Mapping' },
              ].map((s, i) => (
                <div key={i} className="hero-stat">
                  <div className="hero-stat-val">{s.val}</div>
                  <div className="hero-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        <main className="main">
          {activeTab === 'calculator'  && <CalculatorTab onAddResult={handleAddResult} />}
          {activeTab === 'map'         && <MapTab extraResults={extraResults} />}
          {activeTab === 'predictive'  && <PredictiveTab />}
          {activeTab === 'blockchain'  && <BlockchainTab />}
          {activeTab === 'remediation' && <RemediationTab />}
          {activeTab === 'reports'     && <ReportsTab extraResults={extraResults} />}
          {activeTab === 'reference'   && <ReferenceTab />}
        </main>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div style={{ fontSize: 12, color: 'var(--text-400)', maxWidth: 800, margin: '0 auto', lineHeight: 1.9 }}>
            <span style={{ color: 'var(--text-700)', fontWeight: 700 }}>HMPI Analyzer</span> —
            Automated Heavy Metal Pollution Index Computation for Groundwater Quality Assessment.{' '}
            Implements <strong>WHO (2017)</strong> &amp; <strong>BIS IS:10500:2012</strong> standards.
            <span style={{ color: 'var(--text-300)', marginLeft: 8 }}>
              Ref: Prasad &amp; Bose (2001) · Hakanson (1980) · US-EPA RAGS (2004)
            </span>
          </div>
        </footer>
      </div>

      <NotificationStack notifs={notifs} onRemove={removeNotif} />
    </>
  );
}
