import React, { useState, useEffect } from 'react';
import { perfilService } from '../services/api';

export default function Perfil({ navigate, user }) {
  const [datos, setDatos]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');
  const [editing, setEditing]   = useState(null);

  useEffect(() => {
    perfilService.obtener()
      .then(d => { setDatos(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const handleGuardar = async () => {
    setSaving(true); setError('');
    try {
      await perfilService.actualizar(datos);
      setSaved(true);
      setEditing(null);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding:36, color:'var(--text-mid)' }}>Cargando perfil...</div>;
  if (!datos)  return <div style={{ padding:36, color:'#e07a3a' }}>Error: {error}</div>;

  const imc = datos.peso_kg && datos.altura_cm
    ? (datos.peso_kg / ((datos.altura_cm / 100) ** 2)).toFixed(1)
    : '—';

  const inputStyle = { width:'100%', padding:'10px 14px', border:'2px solid var(--cream-dark)', borderRadius:10, fontSize:14, background:'var(--cream)', outline:'none', fontFamily:"'DM Sans',sans-serif" };
  const labelStyle = { display:'block', fontSize:11, fontWeight:700, color:'var(--text-mid)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.4px' };

  const menuItems = [
    { ico:'👤', bg:'#e8f5ee', label:'Datos personales',  key:0 },
    { ico:'🎯', bg:'#fef3ea', label:'Meta calórica',     key:1 },
  ];

  return (
    <div style={{ background:'var(--cream)', minHeight:'calc(100vh - var(--nav-height))' }}>
      <div style={{ background:'linear-gradient(160deg,var(--green-dark) 0%,#2d6a4f 100%)', padding:'40px 36px 60px', color:'white', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-40, width:300, height:300, borderRadius:'50%', background:'rgba(82,183,136,0.1)' }} />
        <div style={{ display:'flex', alignItems:'center', gap:24, position:'relative', zIndex:1 }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#52b788,#e07a3a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, border:'3px solid rgba(255,255,255,0.3)', color:'white' }}>
            {datos.nombre?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24 }}>{datos.nombre}</h2>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:4 }}>{datos.email}</p>
          </div>
        </div>
      </div>

      <div style={{ padding:'28px 36px' }}>
        {saved && <div style={{ background:'#e8f5ee', border:'1px solid var(--green-light)', borderRadius:10, padding:'12px 16px', marginBottom:20, color:'var(--green-mid)', fontWeight:600 }}>✅ Perfil actualizado</div>}

        <div style={{ background:'white', borderRadius:'var(--radius)', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:20, boxShadow:'var(--shadow)', marginBottom:24 }}>
          {[['Peso actual', datos.peso_kg ? `${datos.peso_kg} kg` : '—'], ['Altura', datos.altura_cm ? `${datos.altura_cm} cm` : '—'], ['IMC', imc]].map(([lbl, val], i) => (
            <div key={lbl} style={{ textAlign:'center', borderRight: i < 2 ? '1px solid var(--cream-dark)' : 'none' }}>
              <p style={{ fontSize:22, fontWeight:700, color:'var(--green-mid)' }}>{val}</p>
              <p style={{ fontSize:11, color:'var(--text-light)', marginTop:3 }}>{lbl}</p>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>
          <div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:'var(--green-dark)', marginBottom:14 }}>⚙️ Mi cuenta</h3>
            <div style={{ background:'white', borderRadius:'var(--radius)', boxShadow:'var(--shadow-sm)', overflow:'hidden', marginBottom:16 }}>
              {menuItems.map((m, i) => (
                <div key={m.key} onClick={() => setEditing(editing === m.key ? null : m.key)}
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom: i < menuItems.length-1 ? '1px solid var(--cream-dark)' : 'none', cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:m.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{m.ico}</div>
                    <p style={{ fontSize:14, fontWeight:600 }}>{m.label}</p>
                  </div>
                  <span style={{ color:'var(--text-light)', fontSize:18 }}>{editing === m.key ? '∨' : '›'}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('login')} style={{ width:'100%', padding:14, background:'none', border:'2px solid #fce4ec', borderRadius:10, color:'#e57373', fontSize:14, fontWeight:700 }}>
              🚪 Cerrar Sesión
            </button>
          </div>

          <div>
            {editing === 0 && (
              <div style={{ background:'white', borderRadius:'var(--radius)', padding:24, boxShadow:'var(--shadow-sm)' }}>
                <h4 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:'var(--green-dark)', marginBottom:18 }}>Editar datos personales</h4>
                {[['nombre','Nombre completo','text'],['altura_cm','Altura (cm)','number'],['peso_kg','Peso actual (kg)','number']].map(([k, lbl, type]) => (
                  <div key={k} style={{ marginBottom:14 }}>
                    <label style={labelStyle}>{lbl}</label>
                    <input type={type} value={datos[k] || ''} onChange={e => setDatos({ ...datos, [k]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={handleGuardar} disabled={saving} style={{ background:'linear-gradient(135deg,#52b788,#40916c)', color:'white', border:'none', borderRadius:10, padding:'10px 22px', fontSize:14, fontWeight:700 }}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            )}
            {editing === 1 && (
              <div style={{ background:'white', borderRadius:'var(--radius)', padding:24, boxShadow:'var(--shadow-sm)' }}>
                <h4 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:'var(--green-dark)', marginBottom:18 }}>Meta calórica diaria</h4>
                {[['meta_calorias','Calorías por día (kcal)'],['meta_proteina_g','Proteína (g)'],['meta_carbs_g','Carbohidratos (g)'],['meta_grasas_g','Grasas (g)']].map(([k,lbl]) => (
                  <div key={k} style={{ marginBottom:14 }}>
                    <label style={labelStyle}>{lbl}</label>
                    <input type="number" value={datos[k] || ''} onChange={e => setDatos({ ...datos, [k]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={handleGuardar} disabled={saving} style={{ background:'linear-gradient(135deg,#52b788,#40916c)', color:'white', border:'none', borderRadius:10, padding:'10px 22px', fontSize:14, fontWeight:700 }}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            )}
            {editing === null && (
              <div style={{ background:'white', borderRadius:'var(--radius)', padding:24, boxShadow:'var(--shadow-sm)', textAlign:'center', color:'var(--text-light)' }}>
                <p style={{ fontSize:32, marginBottom:10 }}>👈</p>
                <p style={{ fontSize:14 }}>Selecciona una opción del menú</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
