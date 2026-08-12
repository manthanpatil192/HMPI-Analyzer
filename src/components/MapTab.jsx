import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LeafletTooltip } from 'react-leaflet';
import { MOCK_SAMPLES, runFullAnalysis, WHO_STANDARDS } from '../utils/hmpiEngine';
import { HMPIGauge } from './SharedComponents';
import { Map, Layers, RefreshCw } from 'lucide-react';

const CLASS_COLORS = { safe: '#10b981', moderate: '#f59e0b', high: '#f97316', critical: '#dc2626' };
const CLASS_BADGES = { safe: 'badge-safe', moderate: 'badge-moderate', high: 'badge-high', critical: 'badge-critical' };

export default function MapTab({ extraResults = [] }) {
  const [allSamples, setAllSamples] = useState([]);
  const [selected, setSelected] = useState(null);
  const [colorBy, setColorBy] = useState('hmpi');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const analysed = MOCK_SAMPLES.map(s => ({ ...runFullAnalysis(s), sample_info: s }));
    setAllSamples([...analysed, ...extraResults]);
    setLoaded(true);
  }, [extraResults]);

  const getColor = (result) => {
    if (colorBy === 'hmpi') return CLASS_COLORS[result.hmpi?.classification?.class] || '#00d4ff';
    if (colorBy === 'hei') return CLASS_COLORS[result.hei?.classification?.class] || '#00d4ff';
    if (colorBy === 'cd') return CLASS_COLORS[result.cd?.classification?.class] || '#00d4ff';
    return '#00d4ff';
  };

  const getRadius = (result) => {
    const v = result.hmpi?.value || 50;
    return Math.max(8, Math.min(30, v / 10));
  };

  if (!loaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 500, color: '#4a6680' }}>
      <div className="spinner" style={{ marginRight: 12 }} /> Loading map data...
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="section-title"><Map size={20} /> Geo-Spatial HMPI Distribution Map</div>
          <div style={{ fontSize: 13, color: '#4a6680', marginTop: 4 }}>{allSamples.length} groundwater sampling points plotted across India</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#8fafc8' }}>Color by:</span>
          {['hmpi', 'hei', 'cd'].map(opt => (
            <button key={opt} onClick={() => setColorBy(opt)} className={`btn btn-sm ${colorBy === opt ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'uppercase', fontSize: 11, padding: '6px 12px' }}>{opt}</button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 0 30px rgba(0,212,255,0.08)', height: 520 }}>
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
              return (
                <CircleMarker key={i} center={[lat, lng]} radius={radius}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.75, weight: 2, opacity: 0.9 }}
                  eventHandlers={{ click: () => setSelected(result) }}>
                  <LeafletTooltip>
                    <strong>{result.location || result.sample_info?.location}</strong><br />
                    HMPI: {result.hmpi?.value?.toFixed(2)} ({result.hmpi?.classification?.label})
                  </LeafletTooltip>
                  <Popup>
                    <div style={{ minWidth: 200 }}>
                      <strong>{result.location || result.sample_info?.location}</strong>
                      <div style={{ fontSize: 12, marginTop: 4 }}>Sample ID: {result.sample_id}</div>
                      <div style={{ fontSize: 12 }}>HMPI: <b style={{ color: getColor(result) }}>{result.hmpi?.value?.toFixed(2)}</b></div>
                      <div style={{ fontSize: 12 }}>Status: <b>{result.hmpi?.classification?.label}</b></div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Legend */}
          <div className="card">
            <div className="card-title" style={{ fontSize: 15, marginBottom: 12 }}><Layers size={16} /> Legend</div>
            {[
              { label: 'Safe (HMPI < 100)', color: '#00b894' },
              { label: 'Moderate (100–200)', color: '#fdcb6e' },
              { label: 'High Risk (200–300)', color: '#e17055' },
              { label: 'Critical (> 300)', color: '#d63031' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: l.color, boxShadow: `0 0 8px ${l.color}60` }} />
                <span style={{ fontSize: 13, color: '#8fafc8' }}>{l.label}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(0,212,255,0.05)', borderRadius: 8, fontSize: 12, color: '#4a6680' }}>
              💡 Marker size is proportional to HMPI severity. Click any marker for details.
            </div>
          </div>

          {/* Sample Summary Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
              <div className="card-title" style={{ fontSize: 15 }}>All Sampling Stations</div>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 350 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,212,255,0.06)' }}>
                    <th style={{ padding: '8px 12px', fontSize: 11, color: '#4a6680', textAlign: 'left', fontWeight: 600, letterSpacing: '0.5px' }}>STATION</th>
                    <th style={{ padding: '8px 12px', fontSize: 11, color: '#4a6680', textAlign: 'right', fontWeight: 600 }}>HMPI</th>
                    <th style={{ padding: '8px 12px', fontSize: 11, color: '#4a6680', textAlign: 'center', fontWeight: 600 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {allSamples.map((r, i) => {
                    const color = getColor(r);
                    const cls = r.hmpi?.classification;
                    const clsMap = { safe: 'badge-safe', moderate: 'badge-moderate', high: 'badge-high', critical: 'badge-critical' };
                    return (
                      <tr key={i} onClick={() => setSelected(r)}
                        style={{ cursor: 'pointer', background: selected?.sample_id === r.sample_id ? 'rgba(0,212,255,0.08)' : 'transparent', transition: 'background 0.2s' }}>
                        <td style={{ padding: '9px 12px', borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
                          <div style={{ fontSize: 13, color: '#e8f4fd', fontWeight: 500 }}>{r.location || r.sample_info?.location}</div>
                          <div style={{ fontSize: 11, color: '#4a6680', fontFamily: 'JetBrains Mono' }}>{r.sample_id}</div>
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 700, color, borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
                          {r.hmpi?.value?.toFixed(1)}
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
                          <span className={`badge ${clsMap[cls?.class] || 'badge-moderate'}`}>{cls?.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected sample detail */}
          {selected && (
            <div className="card" style={{ animation: 'fadeInUp 0.3s ease', borderColor: 'rgba(0,212,255,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="card-title" style={{ fontSize: 15 }}>📍 {selected.location || selected.sample_info?.location}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#4a6680', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <HMPIGauge value={selected.hmpi?.value} size={120} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                {[
                  ['HEI', selected.hei?.value?.toFixed(3), selected.hei?.classification?.color],
                  ['Cd', selected.cd?.value?.toFixed(3), selected.cd?.classification?.color],
                  ['HI Adult', selected.hhra?.adult?.HI?.toFixed(4), selected.hhra?.adult?.HI > 1 ? '#d63031' : '#00b894'],
                  ['HI Child', selected.hhra?.child?.HI?.toFixed(4), selected.hhra?.child?.HI > 1 ? '#d63031' : '#00b894'],
                ].map(([k, v, c]) => (
                  <div key={k} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 11, color: '#4a6680' }}>{k}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: c || '#00d4ff', fontFamily: "'Space Grotesk',sans-serif" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
