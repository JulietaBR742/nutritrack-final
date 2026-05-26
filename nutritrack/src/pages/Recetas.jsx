import React, { useState } from 'react';
import { recetasService, alimentosService } from '../services/api';
import { useApi } from '../hooks/useApi';

const gradientes = ['linear-gradient(135deg,#1a3a2a,#0f2d1f)','linear-gradient(135deg,#7b3f00,#4a2000)','linear-gradient(135deg,#2d6a4f,#1a3a2a)','linear-gradient(135deg,#1a2a3a,#0f1f2d)'];
const emojis     = { verduras:'🥦', frutas:'🍎', cereales:'🌾', proteinas:'🍗', lacteos:'🥛', grasas:'🥑', otro:'🍽️' };

export default function Recetas() {
  const [vista,    setVista]    = useState('lista');
  const [detalle,  setDetalle]  = useState(null);
  const [form,     setForm]     = useState({ nombre:'', descripcion:'', tiempo_min:'' });
  const [ingredientes, setIngredientes] = useState([]);
  const [buscarIng,    setBuscarIng]    = useState('');
  const [sugerencias,  setSugerencias]  = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  const { data: recetas, loading, error: eRecetas, recargar } = useApi(() => recetasService.listar());

  const buscarAlimento = async (texto) => {
    setBuscarIng(texto);
    if (texto.length < 2) return setSugerencias([]);
    try {
      const res = await alimentosService.listar('todos', texto);
      setSugerencias(res.slice(0, 6));
    } catch (_) {}
  };

  const agregarIngrediente = (alimento) => {
    setIngredientes(prev => [...prev, { ...alimento, cantidad_g: 100 }]);
    setBuscarIng(''); setSugerencias([]);
  };

  const quitarIngrediente = (id) => setIngredientes(prev => prev.filter(i => i.id !== id));

  const actualizarCantidad = (id, val) =>
    setIngredientes(prev => prev.map(i => i.id === id ? { ...i, cantidad_g: parseFloat(val) || 0 } : i));

  const totalCalorias = ingredientes.reduce((acc, i) => acc + (i.calorias_por_100g * i.cantidad_g / 100), 0);

  const guardarReceta = async () => {
    if (!form.nombre || ingredientes.length === 0) return setError('Nombre e ingredientes son requeridos');
    setSaving(true); setError('');
    try {
      await recetasService.crear({
        nombre: form.nombre,
        descripcion: form.descripcion,
        tiempo_min: parseInt(form.tiempo_min) || null,
        ingredientes: ingredientes.map(i => ({ alimento_id: i.id, cantidad_g: i.cantidad_g })),
      });
      setSuccess('¡Receta creada!');
      setForm({ nombre:'', descripcion:'', tiempo_min:'' });
      setIngredientes([]);
      setTimeout(() => { setSuccess(''); setVista('lista'); recargar(); }, 1500);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const verDetalle = async (id) => {
    try { setDetalle(await recetasService.obtener(id)); setVista('detalle'); }
    catch (_) {}
  };

  const input  = { width:'100%', padding:'10px 14px', border:'2px solid var(--cream-dark)', borderRadius:10, fontSize:14, background:'var(--cream)', outline:'none', fontFamily:"'DM Sans',sans-serif", marginBottom:12 };
  const card   = { background:'white', borderRadius:'var(--radius)', padding:24, boxShadow:'var(--shadow-sm)' };

  return (
    <div style={{ background:'var(--cream)', minHeight:'calc(100vh - var(--nav-height))' }}>
      <div style={{ background:'white', padding:'22px 36px 16px', boxShadow:'0 2px 10px rgba(0,0,0,.05)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:'var(--green-dark)' }}>🍽️ Recetas</h2>
          <p style={{ fontSize:13, color:'var(--text-light)', marginTop:4 }}>Recetas guardadas y personalizadas</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['lista','nueva'].map(v => (
            <button key={v} onClick={() => setVista(v)} style={{
              padding:'8px 18px', borderRadius:20, fontSize:13, fontWeight:600, border:'none', cursor:'pointer',
              background: vista===v ? 'var(--green-light)' : 'var(--cream-dark)',
              color: vista===v ? 'white' : 'var(--text-mid)',
            }}>{v === 'lista' ? '📋 Mis recetas' : '+ Nueva receta'}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:'28px 36px' }}>

        {/* ── LISTA ── */}
        {vista === 'lista' && (
          loading ? <p style={{ color:'var(--text-light)' }}>Cargando...</p>
          : eRecetas ? <p style={{ color:'#e07a3a' }}>{eRecetas}</p>
          : (recetas||[]).length === 0
            ? (
              <div style={{ textAlign:'center', padding:60 }}>
                <p style={{ fontSize:48 }}>🍳</p>
                <p style={{ fontSize:16, fontWeight:600, color:'var(--green-dark)', marginTop:12 }}>Sin recetas aún</p>
                <p style={{ fontSize:13, color:'var(--text-light)', marginTop:6, marginBottom:20 }}>Crea tu primera receta personalizada</p>
                <button onClick={() => setVista('nueva')} style={{ padding:'10px 24px', background:'linear-gradient(135deg,#52b788,#40916c)', color:'white', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer' }}>Crear receta</button>
              </div>
            )
            : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                {(recetas||[]).map((r, i) => (
                  <div key={r.id} onClick={() => verDetalle(r.id)}
                    style={{ background:gradientes[i%gradientes.length], borderRadius:'var(--radius)', padding:24, color:'white', cursor:'pointer', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', right:-15, top:-15, width:100, height:100, borderRadius:'50%', background:'rgba(82,183,136,0.12)' }} />
                    <p style={{ fontSize:36, marginBottom:8 }}>🍽️</p>
                    <h4 style={{ fontFamily:"'Playfair Display',serif", fontSize:17 }}>{r.nombre}</h4>
                    {r.descripcion && <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:6 }}>{r.descripcion}</p>}
                    <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
                      {r.tiempo_min && <span style={{ background:'rgba(255,255,255,0.1)', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>⏱️ {r.tiempo_min} min</span>}
                      <span style={{ background:'rgba(255,255,255,0.1)', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{Math.round(r.calorias_total)} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            )
        )}

        {/* ── DETALLE ── */}
        {vista === 'detalle' && detalle && (
          <div>
            <button onClick={() => setVista('lista')} style={{ background:'none', border:'none', color:'var(--green-mid)', fontWeight:600, fontSize:14, cursor:'pointer', marginBottom:16 }}>← Volver</button>
            <div style={card}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:'var(--green-dark)', marginBottom:6 }}>{detalle.nombre}</h3>
              {detalle.descripcion && <p style={{ color:'var(--text-mid)', marginBottom:12 }}>{detalle.descripcion}</p>}
              <div style={{ display:'flex', gap:12, marginBottom:20 }}>
                {detalle.tiempo_min && <span style={{ background:'#e8f5ee', color:'var(--green-mid)', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600 }}>⏱️ {detalle.tiempo_min} min</span>}
                <span style={{ background:'#fef3ea', color:'#e07a3a', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600 }}>{Math.round(detalle.calorias_total)} kcal totales</span>
              </div>
              <h4 style={{ fontWeight:700, color:'var(--green-dark)', marginBottom:12 }}>Ingredientes</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {(detalle.ingredientes||[]).map((ing, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'var(--cream)', borderRadius:10 }}>
                    <span style={{ fontSize:13, fontWeight:600 }}>{ing.nombre}</span>
                    <div style={{ display:'flex', gap:12, fontSize:12, color:'var(--text-light)' }}>
                      <span>{ing.cantidad_g}g</span>
                      <span style={{ fontWeight:700, color:'var(--green-mid)' }}>{Math.round(ing.calorias_por_100g * ing.cantidad_g / 100)} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── NUEVA ── */}
        {vista === 'nueva' && (
          <div style={{ maxWidth:720 }}>
            <div style={card}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:'var(--green-dark)', marginBottom:20 }}>Nueva receta</h3>
              {success && <div style={{ background:'#e8f5ee', borderRadius:8, padding:'10px 14px', marginBottom:12, color:'var(--green-mid)', fontWeight:600 }}>{success}</div>}
              {error   && <div style={{ background:'#fff3e0', borderRadius:8, padding:'10px 14px', marginBottom:12, color:'#e07a3a' }}>{error}</div>}

              <input name="nombre"      placeholder="Nombre de la receta *" value={form.nombre}      onChange={e => setForm(f=>({...f, nombre:e.target.value}))}      style={input} />
              <input name="descripcion" placeholder="Descripción (opcional)"value={form.descripcion} onChange={e => setForm(f=>({...f, descripcion:e.target.value}))} style={input} />
              <input name="tiempo_min"  placeholder="Tiempo (minutos)"       value={form.tiempo_min}  onChange={e => setForm(f=>({...f, tiempo_min:e.target.value}))}  style={{...input, width:'50%'}} type="number" />

              <h4 style={{ fontWeight:700, color:'var(--green-dark)', margin:'16px 0 10px' }}>Ingredientes</h4>
              <div style={{ position:'relative', marginBottom:12 }}>
                <input placeholder="🔍 Buscar ingrediente..." value={buscarIng} onChange={e => buscarAlimento(e.target.value)} style={{ ...input, marginBottom:0 }} />
                {sugerencias.length > 0 && (
                  <div style={{ border:'2px solid var(--cream-dark)', borderRadius:10, overflow:'hidden', marginTop:4 }}>
                    {sugerencias.map(a => (
                      <div key={a.id} onClick={() => agregarIngrediente(a)}
                        style={{ padding:'10px 14px', cursor:'pointer', display:'flex', justifyContent:'space-between', fontSize:13, borderBottom:'1px solid var(--cream-dark)', background:'white' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--cream)'}
                        onMouseLeave={e => e.currentTarget.style.background='white'}>
                        <span>{emojis[a.categoria] || '🍽️'} {a.nombre}</span>
                        <span style={{ color:'var(--green-mid)', fontWeight:700 }}>{a.calorias_por_100g} kcal/100g</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {ingredientes.map(ing => (
                <div key={ing.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--cream)', borderRadius:10, marginBottom:8 }}>
                  <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{ing.nombre}</span>
                  <input type="number" value={ing.cantidad_g}
                    onChange={e => actualizarCantidad(ing.id, e.target.value)}
                    style={{ width:80, padding:'6px 10px', border:'2px solid var(--cream-dark)', borderRadius:8, fontSize:13, background:'white', outline:'none' }} />
                  <span style={{ fontSize:12, color:'var(--text-light)' }}>g</span>
                  <span style={{ fontSize:12, color:'var(--green-mid)', fontWeight:700, minWidth:70 }}>
                    {Math.round(ing.calorias_por_100g * ing.cantidad_g / 100)} kcal
                  </span>
                  <button onClick={() => quitarIngrediente(ing.id)} style={{ background:'#fce4ec', border:'none', borderRadius:8, padding:'4px 8px', cursor:'pointer', color:'#e57373', fontWeight:700 }}>✕</button>
                </div>
              ))}

              {ingredientes.length > 0 && (
                <div style={{ background:'#e8f5ee', borderRadius:10, padding:'10px 16px', marginBottom:16, display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--green-dark)' }}>Total estimado</span>
                  <span style={{ fontSize:14, fontWeight:700, color:'var(--green-mid)' }}>{Math.round(totalCalorias)} kcal</span>
                </div>
              )}

              <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:20 }}>
                <button onClick={() => setVista('lista')} style={{ background:'var(--cream-dark)', border:'none', borderRadius:10, padding:'11px 22px', fontSize:14, cursor:'pointer' }}>Cancelar</button>
                <button onClick={guardarReceta} disabled={saving} style={{ background:'linear-gradient(135deg,#52b788,#40916c)', color:'white', border:'none', borderRadius:10, padding:'11px 26px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                  {saving ? 'Guardando...' : '✅ Guardar receta'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
