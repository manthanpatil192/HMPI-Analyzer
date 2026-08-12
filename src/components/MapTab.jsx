import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LeafletTooltip, Circle } from 'react-leaflet';
import { MOCK_SAMPLES, runFullAnalysis } from '../utils/hmpiEngine';
import { HMPIGauge } from './SharedComponents';
import { Map, Layers, Flame, Filter } from 'lucide-react';

const CLASS_COLORS = { safe: '#10b981', moderate: '#f59e0b', high: '#f97316', critical: '#dc2626' };

export default function MapTab({ extraResults = [] }) {
  const [allSamples, setAllSamples] = useState([]);
  const [selected, setSelected] = useState(null);
  const [colorBy, setColorBy] = useState('hmpi');
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const analysed = MOCK_SAMPLES.map(s => ({ ...runFullAnalysis(s), sample_info: s }));
    setAllSamples([...analysed, ...extraResults]);
    setLoaded(true);
  }, [extraResults]);

  const getColor = (result) => {
    if (colorBy === 'hmpi') return CLASS_COLORS[result.hmpi?.classification?.class] || '#2563eb';
    if (colorBy === 'hei') return CLASS_COLORS[result.hei?.classification?.class] || '#2563eb';
    if (colorBy === 'cd') return CLASS_COLORS[result.cd?.classification?.class] || '#2563eb';
    return '#2563eb';
  };

  const getRadius = (result) => {
    const v = result.hmpi?.value || 50;
    return Math.max(10, Math.min(32, v / 8));
  };

  if (!loaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 500, color: 'var(--text-400)' }}>
      <div className="spinner" style={{ marginRight: 12 }} /> Loading GIS map parameters...
    </div>
  );

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      
      {/* Header controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div className="section-title">
            <div className="section-line" /> Geo-Spatial HMPI Distribution &amp; GIS Hotspot Map
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-400)', marginTop: 4 }}>
            {allSamples.length} groundwater monitoring stations across India
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setIsHeatmapMode(!isHeatmapMode)} className={`btn btn-sm ${isHeatmapMode ? 'btn-danger' : 'btn-secondary'}`}>
            <Flame size={14} /> {isHeatmapMode ? 'Disable Heatmap' : 'Enable GIS Heatmap Mode'}
          </button>

          <span style={{ fontSize: 13, color: 'var(--text-400)', marginLeft: 8 }}>Color by:</span>
          {['hmpi', 'hei', 'cd'].map(opt => (
            <button key={opt} onClick={() => setColorBy(opt)} className={`btn btn-sm ${colorBy === opt ? 'btn-primary' : 'btn-ghost'}`}
              style={{ textTransform: 'uppercase', fontSize: 11 }}>{opt}</button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Leaflet Map container */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-md)', height: 540 }}>
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {allSamples.map((result, i) => {
              const lat = result.coordinates?.lat || result.sample_info?.coordinates?.lat;
              const lng = result.coordinates?.lng || result.sample_info?.coordinates?.lng;
              if (!lat || !lng) return null;
              const color = getColor(result);
              const radius = getRadius(result);
              const isCritical = result.hmpi?.value > 200;

              return (
                <g key={i}>
                  {/* GIS Heatmap Hotspot Radial Glow */}
                  {isHeatmapMode && (
                    <Circle center={[lat, lng]} radius={radius * 3500}
                      pathOptions={{
                        color: isCritical ? '#dc2626' : color,
                        fillColor: isCritical ? '#ef4444' : color,
                        fillOpacity: isCritical ? 0.35 : 0.2,
                        weight: 0,
                      }} />
                  )}

                  <CircleMarker center={[lat, lng]} radius={radius}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2.5, opacity: 1 }}
                    eventHandlers={{ click: () => setSelected(result) }}>
                    <LeafletTooltip>
                      <strong style={{ color: '#0f172a' }}>{result.location || result.sample_info?.location}</strong><br />
                      HMPI: <span style={{ color, fontWeight: 700 }}>{result.hmpi?.value?.toFixed(2)}</span> ({result.hmpi?.classification?.label})
                    </LeafletTooltip>
                    <Popup>
                      <div style={{ minWidth: 210 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{result.location || result.sample_info?.location}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Sample ID: <code>{result.sample_id}</code></div>
                        <div className="divider" style={{ margin: '8px 0' }} />
                        <div style={{ fontSize: 13 }}>HMPI Score: <b style={{ color: getColor(result) }}>{result.hmpi?.value?.toFixed(2)}</b></div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Status: <b>{result.hmpi?.classification?.label}</b></div>
                      </div>
                    </Popup>
                  </CircleMarker>
                </g>
              );
            })}
          </MapContainer>
        </div>

        {/* Sidebar station details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* GIS Legend */}
          <div className="card">
            <div className="card-title" style={{ fontSize: 15, marginBottom: 12 }}>
              <Layers size={16} color="#2563eb" /> Map Classification &amp; GIS Intensity
            </div>
            {[
              { label: 'Safe (HMPI < 100)', color: '#10b981' },
              { label: 'Moderate Risk (100–200)', color: '#f59e0b' },
              { label: 'High Risk (200–300)', color: '#f97316' },
              { label: 'Critical Breach (> 300)', color: '#dc2626' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: l.color }} />
                <span style={{ fontSize: 13, color: 'var(--text-700)', fontWeight: 500 }}>{l.label}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#eff6ff', borderRadius: 8, fontSize: 12, color: '#1e40af', border: '1px solid #bfdbfe' }}>
              💡 Marker radius scales with HMPI pollution load. Enable GIS Heatmap mode to visualize regional contamination plume dispersion.
            </div>
          </div>

          {/* All Stations Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--border)', background: '#f8faff' }}>
              <div className="card-title" style={{ fontSize: 14 }}>Groundwater Stations ({allSamples.length})</div>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 270 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>STATION</th>
                    <th style={{ textAlign: 'right' }}>HMPI</th>
                    <th style={{ textAlign: 'center' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {allSamples.map((r, i) => {
                    const color = getColor(r);
                    const cls = r.hmpi?.classification;
                    return (
                      <tr key={i} onClick={() => setSelected(r)}
                        style={{ cursor: 'pointer', background: selected?.sample_id === r.sample_id ? '#eff6ff' : 'transparent', transition: 'background 0.2s' }}>
                        <td>
                          <div style={{ fontSize: 13, color: 'var(--text-900)', fontWeight: 600 }}>{r.location || r.sample_info?.location}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-400)', fontFamily: 'JetBrains Mono' }}>{r.sample_id}</div>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 800, color }}>
                          {r.hmpi?.value?.toFixed(1)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${cls?.class === 'safe' ? 'badge-safe' : 'badge-high'}`}>{cls?.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Station Card */}
          {selected && (
            <div className="card" style={{ animation: 'fadeUp 0.3s ease', border: '1.5px solid #2563eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div className="card-title" style={{ fontSize: 15 }}>📍 {selected.location || selected.sample_info?.location}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <HMPIGauge value={selected.hmpi?.value} size={120} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
