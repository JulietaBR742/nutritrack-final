import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';

export default function Dashboard({ navigate, user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.resumen()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - var(--nav-height))', color:'var(--text-mid)' }}>
        Cargando dashboard...
      </div>
    );
  }

  if (error) {
    return <div style={{ padding:36, color:'#e07a3a' }}>Error: {error}</div>;
  }

  const consumed = Math.round(data?.consumido?.calorias || 0);
  const goal = Math.round(data?.metas?.meta_calorias || 2000);
  const circumference = 2 * Math.PI * 44;
  const dash = Math.min((consumed / goal) * circumference, circumference);

  const semana = data?.semana || [];
  const maxCal = Math.max(...semana.map(d => d.calorias), 1);

  const stats = [
    { label:'Agua hoy', value: `${((data?.agua_ml || 0)/1000).toFixed(1)} L`, sub:'meta: 2.5 L', icon:'💧', accent:'#e07a3a' },
    { label:'Peso actual', value: data?.peso_actual ? `${data.peso_actual.peso_kg} kg` : '-- kg', sub: data?.peso_actual ? `Reg. ${data.peso_actual.fecha}` : 'Sin registro', icon:'⚖️', accent:'#52b788' },
    { label:'Dias con datos', value: `${semana.length}`, sub:'en la ultima semana', icon:'📅', accent:'#52b788' },
    { label:'Restantes', value: `${Math.max(goal - consumed, 0)} kcal`, sub:'para tu meta', icon:'📋', accent:'#e07a3a' },
  ];

  return (
    <div style={{ background:'var(--cream)', minHeight:'calc(100vh - var(--nav-height))' }}>
      <div style={{ background:'var(--green-dark)', padding:'28px 36px 48px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-40, right:60, width:220, height:220, borderRadius:'50%', background:'rgba(82,183,136,0.1)' }} />
        <div style={{ display:'flex', alignItems:'center', gap:40 }}>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:4 }}>Buenos dias</p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", color:'white', fontSize:24, marginBottom:16 }}>{user?.nombre || 'Usuario'}</h2>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {[['🥩','Prot',`${Math.round(data?.consumido?.proteina || 0)}g`],['🌾','Carb',`${Math.round(data?.consumido?.carbs || 0)}g`],['🥑','Gras',`${Math.round(data?.consumido?.grasas || 0)}g`]].map(([ico, lbl, val]) => (
                <div key={lbl} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:20, padding:'6px 14px', fontSize:12, color:'white' }}>
                  {ico} {lbl}: <b style={{ color:'#95d5b2' }}>{val}</b>
                </div>
              ))}
            </div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:10 }}>{Math.max(goal - consumed, 0)} kcal restantes para tu meta</p>
          </div>
          <div style={{ position:'relative', width:110, height:110, flexShrink:0 }}>
            <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform:'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="11"/>
              <circle cx="55" cy="55" r="44" fill="none" stroke="#52b788" strokeWidth="11" strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"/>
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:20, fontWeight:700, color:'white', lineHeight:1 }}>{consumed.toLocaleString()}</span>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>/ {goal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'28px 36px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background:'white', borderRadius:'var(--radius)', padding:20, boxShadow:'var(--shadow-sm)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:s.accent }} />
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'.5px' }}>{s.label}</p>
              <p style={{ fontSize:22, fontWeight:700, margin:'6px 0 4px' }}>{s.value}</p>
              <p style={{ fontSize:12, color:'var(--text-light)' }}>{s.sub}</p>
              <span style={{ position:'absolute', bottom:14, right:16, fontSize:28, opacity:.15 }}>{s.icon}</span>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20 }}>
          <div style={{ background:'white', borderRadius:'var(--radius)', padding:22, boxShadow:'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:'var(--green-dark)', marginBottom:16 }}>Calorias - ultimos 7 dias</h3>
            {semana.length === 0 ? (
              <p style={{ color:'var(--text-light)', fontSize:13 }}>Sin datos esta semana</p>
            ) : (
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:100 }}>
                {semana.map((d, i) => {
                  const h = Math.round((d.calorias / maxCal) * 100);
                  const dia = new Date(d.fecha).toLocaleDateString('es-MX', { weekday:'short' });
                  return (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <div style={{ width:'100%', height: h || 4, borderRadius:'6px 6px 0 0', background: d.calorias > goal ? '#e07a3a' : '#52b788' }} />
                      <span style={{ fontSize:11, color:'var(--text-light)', fontWeight:600 }}>{dia}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ background:'white', borderRadius:'var(--radius)', padding:22, boxShadow:'var(--shadow-sm)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:'var(--green-dark)' }}>Accesos rapidos</h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { emoji:'📝', label:'Registrar comida', page:'registro' },
                { emoji:'📚', label:'Ver catalogo', page:'catalogo' },
                { emoji:'👤', label:'Mi perfil y metas', page:'perfil' },
              ].map(item => (
                <div key={item.page} onClick={() => navigate(item.page)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--cream)', borderRadius:'var(--radius-sm)', cursor:'pointer' }}>
                  <span style={{ fontSize:22 }}>{item.emoji}</span>
                  <p style={{ fontWeight:600, fontSize:13 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
