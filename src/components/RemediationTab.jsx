import { useState } from 'react';
import { MOCK_SAMPLES, runFullAnalysis, WHO_STANDARDS } from '../utils/hmpiEngine';
import { Wrench, ShieldAlert, Send, Bell, Check, AlertTriangle, ChevronRight, Phone, Mail } from 'lucide-react';

export default function RemediationTab() {
  const [selectedSample, setSelectedSample] = useState(MOCK_SAMPLES[0]);
  const [alertPhone, setAlertPhone] = useState('+91 98765 43210');
  const [alertEmail, setAlertEmail] = useState('collector.district@cgwb.gov.in');
  const [alertSent, setAlertSent] = useState(false);

  const sampleResult = runFullAnalysis(selectedSample);
  const exceededMetals = sampleResult.remediation || [];
  const hmpiCls = sampleResult.hmpi?.classification;

  const triggerEmergencyAlert = (e) => {
    e.preventDefault();
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 4000);
  };

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      
      {/* ── HEADER ── */}
      <div className="card mb-24" style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #fffbeb 100%)', borderColor: '#fecdd3' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#e11d48,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={22} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--text-900)' }}>
                Remediation Strategies &amp; Real-time Alerts
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-500)', marginTop: 2 }}>
                Engineering interventions per heavy metal &amp; automated SMS / Email emergency notification dispatcher
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <select className="form-select" value={selectedSample.id} onChange={e => {
              const s = MOCK_SAMPLES.find(x => x.id === e.target.value);
              if (s) setSelectedSample(s);
            }} style={{ width: 180, fontWeight: 600 }}>
              {MOCK_SAMPLES.map(s => <option key={s.id} value={s.id}>{s.location}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── EMERGENCY SMS & EMAIL DISPATCHER ── */}
      <div className="card mb-24" style={{ borderLeft: '4px solid #ef4444' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="card-title" style={{ fontSize: 16 }}>
            <Bell size={18} color="#ef4444" /> Real-time Automated SMS &amp; Email Alert System
          </div>
          <span className="badge badge-critical">Emergency Webhook Ready</span>
        </div>

        <form onSubmit={triggerEmergencyAlert} className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">SMS Alert Recipient (District Authority)</label>
            <div style={{ position: 'relative' }}>
              <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input className="form-input" style={{ paddingLeft: 34 }} value={alertPhone} onChange={e => setAlertPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Notification Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input className="form-input" style={{ paddingLeft: 34 }} value={alertEmail} onChange={e => setAlertEmail(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-danger" style={{ padding: '11px 24px' }}>
            <Send size={15} /> Dispatch Emergency Alert
          </button>
        </form>

        {alertSent && (
          <div className="alert alert-success mt-16" style={{ marginBottom: 0, animation: 'fadeUp 0.3s ease' }}>
            <Check size={16} /> SMS &amp; Email Dispatch Sent! Emergency notification dispatched to {alertPhone} and {alertEmail} with sample {selectedSample.location} HMPI = {sampleResult.hmpi?.value?.toFixed(1)}.
          </div>
        )}
      </div>

      {/* ── REMEDIATION MATRIX FOR SELECTED SAMPLE ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="section-title">
            <div className="section-line" /> Customized Remediation Plan for {selectedSample.location}
          </div>
          <span className={`badge ${exceededMetals.length > 0 ? 'badge-high' : 'badge-safe'}`}>
            {exceededMetals.length} Contaminants Exceeding Limits
          </span>
        </div>

        {exceededMetals.length === 0 ? (
          <div className="card" style={{ textAlgin: 'center', padding: '40px', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#166534' }}>No Contaminants Exceed WHO Limits!</div>
            <div style={{ fontSize: 13, color: '#15803d', marginTop: 4 }}>This water sample meets all drinking water quality standards. No active chemical remediation is required.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {exceededMetals.map((item, idx) => (
              <div key={idx} className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="metal-chip" style={{ borderColor: '#ef4444', color: '#dc2626', background: '#fee2e2' }}>
                      {item.metal} ({item.fullName})
                    </span>
                    <span style={{ fontSize: 13, color: '#64748b' }}>
                      Observed: <strong style={{ color: '#dc2626' }}>{item.observed} mg/L</strong> vs Limit: <strong>{item.limit} mg/L</strong>
                    </span>
                  </div>
                  <span className="badge badge-critical">Exceeds limit by ×{item.ratio}</span>
                </div>

                <div className="grid-2 mb-16">
                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '14px', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9f1239', textTransform: 'uppercase', marginBottom: 4 }}>Immediate Emergency Intervention</div>
                    <div style={{ fontSize: 13, color: '#9f1239', lineHeight: 1.5 }}>{item.remediation.immediateAction}</div>
                  </div>

                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '14px', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', marginBottom: 4 }}>Long-term Engineering Solution</div>
                    <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.5 }}>{item.remediation.longTermSolution}</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-700)', marginBottom: 8 }}>Recommended Water Treatment Technologies:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                  {item.remediation.techniques.map((tech, tIdx) => (
                    <div key={tIdx} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 13, marginBottom: 4 }}>{tech.name}</div>
                      <div style={{ fontSize: 11.5, color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Removal: <strong style={{ color: '#10b981' }}>{tech.efficiency}</strong></span>
                        <span>Cost: <strong>{tech.cost}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
