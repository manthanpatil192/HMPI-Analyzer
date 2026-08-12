import { useState } from 'react';
import CalculatorTab from './components/CalculatorTab';
import MapTab from './components/MapTab';
import ReportsTab from './components/ReportsTab';
import ReferenceTab from './components/ReferenceTab';
import { NotificationStack, useNotifications } from './components/SharedComponents';
import { Calculator, Map, BarChart2, BookOpen, Droplets, FlaskConical, Globe2, Activity, Zap } from 'lucide-react';

const TABS = [
  { id: 'calculator', label: 'HMPI Calculator',      icon: <Calculator size={15} /> },
  { id: 'map',        label: 'Geo-Map',               icon: <Map size={15} /> },
  { id: 'reports',   label: 'Reports & Data',         icon: <BarChart2 size={15} /> },
  { id: 'reference', label: 'Reference & Methods',    icon: <BookOpen size={15} /> },
];

const HERO_PILLS = [
  { icon: '🧪', label: '12 Heavy Metals', color: '#eff6ff', iconBg: '#dbeafe' },
  { icon: '📐', label: '5 Pollution Indices', color: '#f0fdfa', iconBg: '#ccfbf1' },
  { icon: '🌍', label: 'WHO / BIS 2017', color: '#fdf4ff', iconBg: '#f3e8ff' },
  { icon: '⚡', label: 'Real-time Compute', color: '#fffbeb', iconBg: '#fef9c3' },
  { icon: '🗺️', label: 'Geo-Spatial Map', color: '#fff7ed', iconBg: '#ffedd5' },
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
                <span className="nav-logo-sub">Groundwater Quality Assessment</span>
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
              Automated CGWB & WHO Compliant Platform
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
              using <strong>WHO &amp; BIS IS:10500:2012</strong> drinking water standards.
              Designed for scientists, researchers &amp; policymakers.
            </p>

            {/* Feature pills */}
            <div className="hero-pills">
              {HERO_PILLS.map((p, i) => (
                <div key={i} className="hero-pill" style={{ animationDelay: `${i * 0.06}s` }}>
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
                { val: 'WHO + BIS', lbl: 'Standards Used' },
                { val: '< 1s', lbl: 'Computation Time' },
                { val: 'PDF + CSV', lbl: 'Export Formats' },
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
          {activeTab === 'calculator' && <CalculatorTab onAddResult={handleAddResult} />}
          {activeTab === 'map'        && <MapTab extraResults={extraResults} />}
          {activeTab === 'reports'    && <ReportsTab extraResults={extraResults} />}
          {activeTab === 'reference'  && <ReferenceTab />}
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
