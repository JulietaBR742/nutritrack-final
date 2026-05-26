import React, { useState, useEffect } from 'react';
import { alimentosService, registrosService } from '../services/api';

const meals = [
  { key:'desayuno', label:'🌅 Desayuno' },
  { key:'almuerzo', label:'☀️ Almuerzo' },
  { key:'cena',     label:'🌙 Cena'     },
  { key:'colacion', label:'🍎 Colación' },
];

const initialForm = { alimento_id:'', cantidad_g:'', tiempo_comida:'desayuno' };
const labelStyle  = { display:'block', fontSize:11, fontWeight:700, color:'var(--text-mid)', marginBottom:6, letterSpacing:'.4px', textTransform:'uppercase' };
const inputStyle  = { width:'100%', padding:'11px 14px', border:'2px solid var(--cream-dark)', borderRadius:10, fontSize:14, color:'var(--text-dark)', background:'var(--cream)', outline:'none', fontFamily:"'DM Sans',sans-serif" };

export default function Registro() {
  const [alimentos, setAlimentos] = useState([]);
  const [form, setForm]           = useState(initialForm);
  const [buscar, setBuscar]       = useState('');
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    alimentosService.listar('todos', buscar).then(setAlimentos).catch(() => {});
  }, [buscar]);

  const alimentoSeleccionado = alimentos.find(a => a.id == form.alimento_id);

  const handleSave = async () => {
    if (!form.alimento_id || !form.cantidad_g) return setError('Selecciona un alimento y cantidad');
    setLoading(true); setError('');
    try {
      await registrosService.crear({
        alimento_id:  parseInt(form.alimento_id),
        tiempo_comida: form.tiempo_comida,
        cantidad_g:   parseFloat(form.cantidad_g),
      });
      setSaved(true);
      setForm(initialForm);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background:'var(--cream)', minHeight:'calc(100vh - var(--nav-height))' }}>
      <div style={{ background:'white', padding:'22px 36px 16px', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:'var(--green-dark)' }}>📝 Nuevo Registro</h2>
        <p style={{ fontSize:13, color:'var(--text-light)', marginTop:4 }}>Agrega lo que consumiste hoy</p>
      </div>
      <div style={{ padding:'28px 36px' }}>
        <div style={{ background:'white', borderRadius:'var(--radius)', padding:28, boxShadow:'var(--shadow-sm)', maxWidth:720 }}>
          {saved && <div style={{ background:'#e8f5ee', border:'1px solid var(--green-light)', borderRadius:10, padding:'12px 16px', marginBottom:20, color:'var(--green-mid)', fontWeight:600, fontSize:14 }}>✅ Alimento guardado correctamente</div>}
          {error && <div style={{ background:'#fff3e0', border:'1px solid #e07a3a', borderRadius:10, padding:'12px 16px', marginBottom:20, color:'#e07a3a', fontSize:14 }}>{error}</div>}

          <p style={{ fontWeight:700, fontSize:15, color:'var(--green-dark)', marginBottom:14 }}>¿En qué tiempo de comida?</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
            {meals.map(m => (
              <button key={m.key} onClick={() => setForm({ ...form, tiempo_comida: m.key })} style={{
                padding:'7px 16px', borderRadius:20, fontSize:13, fontWeight:600, border:'none', cursor:'pointer',
                background: form.tiempo_comida === m.key ? 'var(--green-light)' : 'var(--cream-dark)',
                color: form.tiempo_comida === m.key ? 'white' : 'var(--text-mid)',
              }}>{m.label}</button>
            ))}
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={labelStyle}>Buscar alimento</label>
            <input style={inputStyle} placeholder="Escribe para buscar..." value={buscar} onChange={e => setBuscar(e.target.value)} />
          </div>

          {alimentos.length > 0 && !form.alimento_id && (
            <div style={{ marginBottom:16, maxHeight:200, overflowY:'auto', border:'2px solid var(--cream-dark)', borderRadius:10 }}>
              {alimentos.slice(0, 10).map(a => (
                <div key={a.id} onClick={() => { setForm({ ...form, alimento_id: a.id }); setBuscar(a.nombre); }}
                  style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid var(--cream-dark)', fontSize:13, display:'flex', justifyContent:'space-between' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--cream)'}
                  onMouseLeave={e => e.currentTarget.style.background='white'}>
                  <span>{a.nombre}</span>
                  <span style={{ color:'var(--green-mid)', fontWeight:700 }}>{a.calorias_por_100g} kcal/100g</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom:16 }}>
            <label style={labelStyle}>Cantidad (gramos)</label>
            <input style={inputStyle} type="number" placeholder="Ej. 150" value={form.cantidad_g}
              onChange={e => setForm({ ...form, cantidad_g: e.target.value })} />
          </div>

          {alimentoSeleccionado && form.cantidad_g && (
            <div style={{ background:'#e8f5ee', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13 }}>
              <b style={{ color:'var(--green-mid)' }}>Estimado:</b>{' '}
              {Math.round(alimentoSeleccionado.calorias_por_100g * form.cantidad_g / 100)} kcal · {' '}
              P: {Math.round(alimentoSeleccionado.proteina_g * form.cantidad_g / 100)}g · {' '}
              C: {Math.round(alimentoSeleccionado.carbs_g * form.cantidad_g / 100)}g · {' '}
              G: {Math.round(alimentoSeleccionado.grasas_g * form.cantidad_g / 100)}g
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:24 }}>
            <button onClick={() => { setForm(initialForm); setBuscar(''); }} style={{ background:'var(--cream-dark)', border:'none', borderRadius:10, padding:'11px 22px', fontSize:14 }}>Limpiar</button>
            <button onClick={handleSave} disabled={loading} style={{ background: loading ? 'rgba(82,183,136,0.5)' : 'linear-gradient(135deg,#52b788,#40916c)', color:'white', border:'none', borderRadius:10, padding:'11px 26px', fontSize:14, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Guardando...' : '✅ Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
