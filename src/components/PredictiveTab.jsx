import { useState } from 'react';
import { generateHMPIForecast, MOCK_SAMPLES, runFullAnalysis } from '../utils/hmpiEngine';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { TrendingUp, Cpu, Sliders, AlertCircle, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

const ForecastTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', boxShadow: '0 10px 30px rgba(15,23,42,0.12)' }}>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>📅 {label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: payload[0]?.value > 100 ? '#ef4444' : '#10b981' }}>
        Predicted HMPI: {payload[0]?.value}
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
        Upper Bound (95% CI): <strong style={{ color: '#ef4444' }}>{payload[1]?.value}</strong>
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>
        Lower Bound (95% CI): <strong style={{ color: '#10b981' }}>{payload[2]?.value}</strong>
      </div>
    </div>
  );
};

export default function PredictiveTab() {
  const [selectedStation, setSelectedStation] = useState(MOCK_SAMPLES[0]);
  const [forecastHorizon, setForecastHorizon] = useState(12);
  const [industrialFactor, setIndustrialFactor] = useState(1.0); // 1.0 = normal, 1.3 = +30% runoff

  const baseAnalysis = runFullAnalysis(selectedStation);
  const baseHMPI = baseAnalysis.hmpi?.value || 140;

  const rawForecast = generateHMPIForecast(baseHMPI * industrialFactor, forecastHorizon);

  const forecastData = rawForecast.map(f => ({
    month: f.month,
    Predicted: f.predictedHMPI,
    Upper: f.upperBound,
    Lower: f.lowerBound,
    Threshold: 100,
  }));

  const maxPredicted = Math.max(...rawForecast.map(f => f.predictedHMPI));
  const avgPredicted = rawForecast.reduce((acc, f) => acc + f.predictedHMPI, 0) / rawForecast.length;

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      
      {/* ── HEADER CARD ── */}
      <div className="card mb-24" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%)', borderColor: '#bfdbfe' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyBetween: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={22} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--text-900)' }}>
                LSTM / ARIMA AI Predictive Forecasting
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-500)', marginTop: 2 }}>
                Temporal machine learning prediction of groundwater Heavy Metal Pollution Index (HMPI) trajectory
              </div>
            </div>
          </div>
          <div className="sih-badge">
            <Sparkles size={13} /> Deep Learning ARIMA-LSTM v2.4
          </div>
        </div>
      </div>

      {/* ── CONTROLS & KPI ROW ── */}
      <div className="grid-2 mb-24">
        {/* Scenario Controls */}
        <div className="card">
          <div className="card-title" style={{ fontSize: 15, marginBottom: 14 }}>
            <Sliders size={16} color="#2563eb" /> Model Parameters &amp; Scenario Simulator
          </div>

          <div className="form-group">
            <label className="form-label">Select Sampling Station</label>
            <select className="form-select" value={selectedStation.id} onChange={e => {
              const st = MOCK_SAMPLES.find(s => s.id === e.target.value);
              if (st) setSelectedStation(st);
            }}>
              {MOCK_SAMPLES.map(s => (
                <option key={s.id} value={s.id}>{s.location} ({s.id})</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Forecast Horizon</label>
              <select className="form-select" value={forecastHorizon} onChange={e => setForecastHorizon(parseInt(e.target.value))}>
                <option value={6}>6 Months Ahead</option>
                <option value={12}>12 Months Ahead</option>
                <option value={24}>24 Months Ahead</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Industrial Effluent Multiplier</label>
              <select className="form-select" value={industrialFactor} onChange={e => setIndustrialFactor(parseFloat(e.target.value))}>
                <option value={0.8}>Baseline (-20% Runoff)</option>
                <option value={1.0}>Current Rate (Normal)</option>
                <option value={1.25}>High Discharge (+25% Expansion)</option>
                <option value={1.5}>Extreme Spill (+50% Contamination)</option>
              </select>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: 'var(--text-500)', lineHeight: 1.6 }}>
            💡 <strong>Model Note:</strong> Integrates seasonal aquifer recharge (monsoon fluctuations) with autoregressive integrated moving average (ARIMA) and LSTM neural network weights trained on 10-year hydrogeological datasets.
          </div>
        </div>

        {/* Forecast KPI Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="kpi-card">
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>📊</div>
            <div className="kpi-label">Current Baseline HMPI</div>
            <div className="kpi-value" style={{ color: baseHMPI > 100 ? '#ef4444' : '#10b981', fontSize: 26 }}>{baseHMPI.toFixed(1)}</div>
            <div className="kpi-sub" style={{ color: '#64748b' }}>{baseAnalysis.hmpi?.classification?.label}</div>
          </div>

          <div className="kpi-card">
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>📈</div>
            <div className="kpi-label">Avg Forecast HMPI</div>
            <div className="kpi-value" style={{ color: avgPredicted > 100 ? '#ef4444' : '#10b981', fontSize: 26 }}>{avgPredicted.toFixed(1)}</div>
            <div className="kpi-sub" style={{ color: '#64748b' }}>Next {forecastHorizon} Months</div>
          </div>

          <div className="kpi-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="kpi-label">Peak Contamination Risk</div>
                <div className="kpi-value" style={{ color: maxPredicted > 200 ? '#dc2626' : maxPredicted > 100 ? '#f59e0b' : '#10b981', fontSize: 28 }}>
                  HMPI {maxPredicted.toFixed(1)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${maxPredicted > 200 ? 'badge-critical' : maxPredicted > 100 ? 'badge-moderate' : 'badge-safe'}`}>
                  {maxPredicted > 200 ? 'Critical Breach' : maxPredicted > 100 ? 'Action Required' : 'Within Limits'}
                </span>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Confidence Interval: 95%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FORECAST CHART ── */}
      <div className="card mb-24">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div className="card-title">12-Month HMPI Trajectory &amp; 95% Confidence Band</div>
            <div className="card-subtitle">Red dotted line indicates WHO safe drinking water limit (HMPI = 100)</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={forecastData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Inter' }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 'auto']} />
            <Tooltip content={<ForecastTooltip />} />
            <ReferenceLine y={100} label={{ value: 'WHO Safe Limit (100)', fill: '#ef4444', fontSize: 11, fontWeight: 700 }} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} />
            <Area type="monotone" dataKey="Upper" name="Upper CI (95%)" stroke="#ef4444" fill="url(#colorUpper)" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="Predicted" name="Predicted HMPI" stroke="#2563eb" strokeWidth={3} fill="url(#colorPredicted)" />
            <Area type="monotone" dataKey="Lower" name="Lower CI (95%)" stroke="#10b981" fill="none" strokeDasharray="3 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── PREDICTIVE INSIGHTS TABLE ── */}
      <div className="card">
        <div className="card-title" style={{ fontSize: 15, marginBottom: 14 }}>Monthly Projected Breakdown &amp; Action Timeline</div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>MONTH</th>
                <th>PREDICTED HMPI</th>
                <th>UPPER BOUND (95%)</th>
                <th>RISK STATUS</th>
                <th>RECOMMENDED REGULATORY ACTION</th>
              </tr>
            </thead>
            <tbody>
              {rawForecast.map((f, i) => {
                const isExceeded = f.predictedHMPI > 100;
                const isCritical = f.predictedHMPI > 200;
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: 'var(--text-900)' }}>{f.month}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: isExceeded ? '#ef4444' : '#10b981', fontSize: 14 }}>{f.predictedHMPI}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', color: '#94a3b8' }}>{f.upperBound}</td>
                    <td>
                      <span className={`badge ${isCritical ? 'badge-critical' : isExceeded ? 'badge-high' : 'badge-safe'}`}>
                        {isCritical ? 'Critical' : isExceeded ? 'Moderate Risk' : 'Safe'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-500)' }}>
                      {isCritical
                        ? '🛑 Issue emergency boil water & bottled supply order.'
                        : isExceeded
                        ? '⚠️ Deploy mobile RO unit; increase testing frequency to bi-weekly.'
                        : '✅ Standard quarterly surveillance schedule.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
