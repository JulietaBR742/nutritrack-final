import React, { useState } from 'react';
import { historialService } from '../services/api';
import { useApi, useForm } from '../hooks/useApi';

const tab = { padding:'9px 20px', borderRadius:20, fontSize:13, fontWeight:600, border:'none', cursor:'pointer' };

export default function Historial() {
  const [vista, setVista] = useState('peso');

  const hoy = new Date().toISOString().split('T')[0];

  const { data: pesajes, loading: lPeso, error: ePeso, recargar: rPeso } = useApi(() => historialService.obtenerPeso());
  const { data: aguaData, loading: lAgua, error: eAgua, recargar: rAgua } = useApi(() => historialService.obtenerAgua(hoy));

  const formPeso = useForm({ peso_kg:'', nota:'' });
  const formAgua = useForm({ cantidad_ml: 250 });

  const guardarPeso = () => formPeso.handleSubmit(
    async (f) => {
      await historialService.registrarPeso({ peso_kg: parseFloat(f.peso_kg), nota: f.nota });
      formPeso.reset();
      rPeso();
    },
    'Peso registrado'
  );

  const guardarAgua = () => formAgua.handleSubmit(
    async (f) => {
      await historialService.registrarAgua({ cantidad_ml: parseFloat(f.cantidad_ml) });
      rAgua();
    },
    'Agua registrada'
  );

  const input = { width:'100%', padding:'10px 14px', border:'2px solid var(--cream-dark)', borderRadius:10, fontSize:14, background:'var(--cream)', outline:'none', fontFamily:"'DM Sans',sans-serif", marginBottom:12 };
  const card = { background:'white', borderRadius:'var(--radius)', padding:24, boxShadow:'var(--shadow-sm)', marginBottom:20 };

  return (
    <div style={{ background:'var(--cream)', minHeight:'calc(100vh - var(--nav-height))' }}>
      <div style={{ background:'white', padding:'22px 36px 16px', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:'var(--green-dark)' }}>Historial</h2>
        <div style={{ display:'flex', gap:8, marginTop:14 }}>
          {[['peso','Peso'],['agua','Agua']].map(([k,l]) => (
            <button
              key={k}
              onClick={() => setVista(k)}
              style={{
                ...tab,
                background: vista===k ? 'var(--green-light)' : 'var(--cream-dark)',
                color: vista===k ? 'white' : 'var(--text-mid)',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'28px 36px' }}>
        {vista === 'peso' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:20, alignItems:'start' }}>
            <div style={card}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:'var(--green-dark)', marginBottom:16 }}>Registrar peso</h3>
              {formPeso.success && <div style={{ background:'#e8f5ee', borderRadius:8, padding:'10px 14px', marginBottom:12, color:'var(--green-mid)', fontSize:13, fontWeight:600 }}>{formPeso.success}</div>}
              {formPeso.error && <div style={{ background:'#fff3e0', borderRadius:8, padding:'10px 14px', marginBottom:12, color:'#e07a3a', fontSize:13 }}>{formPeso.error}</div>}
              <input name="peso_kg" type="number" placeholder="Peso (kg)" value={formPeso.form.peso_kg} onChange={formPeso.handleChange} style={input} />
              <input name="nota" type="text" placeholder="Nota opcional" value={formPeso.form.nota} onChange={formPeso.handleChange} style={input} />
              <button onClick={guardarPeso} disabled={formPeso.loading} style={{ width:'100%', padding:12, background:'linear-gradient(135deg,#52b788,#40916c)', color:'white', border:'none', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer' }}>
                {formPeso.loading ? 'Guardando...' : '+ Registrar'}
              </button>
            </div>

            <div style={card}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:'var(--green-dark)', marginBottom:16 }}>Evolucion de peso</h3>
              {lPeso ? <p style={{ color:'var(--text-light)' }}>Cargando...</p>
              : ePeso ? <p style={{ color:'#e07a3a' }}>{ePeso}</p>
              : pesajes?.length === 0 ? <p style={{ color:'var(--text-light)', fontSize:13 }}>Sin registros aun</p>
              : (
                <>
                  {(() => {
                    const datos = [...(pesajes || [])].reverse().slice(0, 10);
                    const max = Math.max(...datos.map(d => d.peso_kg));
                    const min = Math.min(...datos.map(d => d.peso_kg));
                    const rng = max - min || 1;
                    return (
                      <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80, marginBottom:16 }}>
                        {datos.map((d, i) => {
                          const h = 20 + ((d.peso_kg - min) / rng) * 60;
                          return (
                            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                              <div style={{ width:'100%', height:h, borderRadius:'4px 4px 0 0', background:'#52b788' }} title={`${d.peso_kg} kg`} />
                              <span style={{ fontSize:10, color:'var(--text-light)' }}>{new Date(d.fecha).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit'})}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {pesajes.slice(0, 6).map(p => (
                      <div key={p.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'var(--cream)', borderRadius:10 }}>
                        <span style={{ fontSize:13, color:'var(--text-mid)' }}>{new Date(p.fecha).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'})}</span>
                        <span style={{ fontWeight:700, color:'var(--green-mid)', fontSize:14 }}>{p.peso_kg} kg</span>
                        {p.nota && <span style={{ fontSize:12, color:'var(--text-light)' }}>{p.nota}</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {vista === 'agua' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:20, alignItems:'start' }}>
            <div style={card}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:'var(--green-dark)', marginBottom:16 }}>Registrar agua</h3>
              {formAgua.success && <div style={{ background:'#e8f5ee', borderRadius:8, padding:'10px 14px', marginBottom:12, color:'var(--green-mid)', fontSize:13, fontWeight:600 }}>{formAgua.success}</div>}
              <p style={{ fontSize:12, color:'var(--text-light)', marginBottom:10 }}>Cantidad en ml</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                {[150, 250, 350, 500].map(ml => (
                  <button
                    key={ml}
                    onClick={() => formAgua.setForm(f => ({ ...f, cantidad_ml: ml }))}
                    style={{
                      padding:'6px 14px',
                      borderRadius:20,
                      fontSize:13,
                      border:'none',
                      cursor:'pointer',
                      fontWeight:600,
                      background: formAgua.form.cantidad_ml == ml ? 'var(--green-light)' : 'var(--cream-dark)',
                      color: formAgua.form.cantidad_ml == ml ? 'white' : 'var(--text-mid)',
                    }}
                  >
                    {ml} ml
                  </button>
                ))}
              </div>
              <input name="cantidad_ml" type="number" placeholder="Otro monto" value={formAgua.form.cantidad_ml} onChange={formAgua.handleChange} style={input} />
              <button onClick={guardarAgua} disabled={formAgua.loading} style={{ width:'100%', padding:12, background:'linear-gradient(135deg,#52b788,#40916c)', color:'white', border:'none', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer' }}>
                {formAgua.loading ? 'Guardando...' : 'Registrar'}
              </button>
            </div>

            <div style={card}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:'var(--green-dark)', marginBottom:16 }}>Consumo de hoy</h3>
              {lAgua ? <p style={{ color:'var(--text-light)' }}>Cargando...</p>
              : eAgua ? <p style={{ color:'#e07a3a' }}>{eAgua}</p>
              : (
                <>
                  <div style={{ textAlign:'center', marginBottom:20 }}>
                    <p style={{ fontSize:40, fontWeight:700, color:'var(--green-mid)' }}>{((aguaData?.total_ml || 0)/1000).toFixed(2)} L</p>
                    <p style={{ fontSize:13, color:'var(--text-light)' }}>de 2.5 L recomendados</p>
                    <div style={{ background:'var(--cream-dark)', borderRadius:20, height:10, marginTop:12, overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:20, background:'linear-gradient(90deg,#52b788,#95d5b2)', width:`${Math.min((aguaData?.total_ml||0)/2500*100,100)}%`, transition:'width .4s' }} />
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {(aguaData?.registros || []).map(r => (
                      <div key={r.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'var(--cream)', borderRadius:10 }}>
                        <span style={{ fontSize:13, color:'var(--text-mid)' }}>{r.hora?.slice(0,5) || '--:--'}</span>
                        <span style={{ fontWeight:700, color:'#3b82f6', fontSize:14 }}>{r.cantidad_ml} ml</span>
                      </div>
                    ))}
                    {(aguaData?.registros || []).length === 0 && <p style={{ fontSize:13, color:'var(--text-light)' }}>Sin registros hoy</p>}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
