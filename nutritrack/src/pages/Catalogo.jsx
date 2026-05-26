import React, { useState, useEffect } from 'react';
import { alimentosService } from '../services/api';

const categories = [
  { key:'todos',    label:'Todos'        },
  { key:'verduras', label:'🥦 Verduras'  },
  { key:'proteinas',label:'🍗 Proteínas' },
  { key:'cereales', label:'🌾 Cereales'  },
  { key:'frutas',   label:'🍎 Frutas'    },
  { key:'grasas',   label:'🥑 Grasas'    },
  { key:'lacteos',  label:'🥛 Lácteos'   },
];

const gradients = [
  'linear-gradient(135deg,#d8f3dc,#95d5b2)',
  'linear-gradient(135deg,#fff3e0,#ffcc80)',
  'linear-gradient(135deg,#fce4ec,#f48fb1)',
  'linear-gradient(135deg,#e3f2fd,#90caf9)',
];

const emojiPorCategoria = { verduras:'🥦', frutas:'🍎', cereales:'🌾', proteinas:'🍗', lacteos:'🥛', grasas:'🥑', bebidas:'🥤', otro:'🍽️' };

export default function Catalogo() {
  const [alimentos, setAlimentos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [cat, setCat]             = useState('todos');

  useEffect(() => {
    setLoading(true);
    alimentosService.listar(cat, search)
      .then(setAlimentos)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [cat, search]);

  return (
    <div style={{ background:'var(--cream)', minHeight:'calc(100vh - var(--nav-height))' }}>
      <div style={{ background:'white', padding:'16px 36px', display:'flex', alignItems:'center', gap:16, boxShadow:'0 2px 10px rgba(0,0,0,.05)', flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'var(--green-dark)' }}>📚 Catálogo Nutricional</h2>
        <input type="text" placeholder="🔍 Buscar alimento..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex:1, maxWidth:360, padding:'10px 16px', border:'2px solid var(--cream-dark)', borderRadius:10, fontSize:14, background:'var(--cream)', outline:'none', fontFamily:"'DM Sans',sans-serif" }} />
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {categories.map(c => (
            <button key={c.key} onClick={() => setCat(c.key)} style={{
              padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600, border:'none', cursor:'pointer',
              background: cat === c.key ? 'var(--green-light)' : 'var(--cream-dark)',
              color: cat === c.key ? 'white' : 'var(--text-mid)',
            }}>{c.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:'24px 36px' }}>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:'var(--green-dark)', marginBottom:16 }}>Alimentos</h3>
        {loading ? (
          <p style={{ color:'var(--text-light)', fontSize:14 }}>Cargando...</p>
        ) : error ? (
          <p style={{ color:'#e07a3a', fontSize:14 }}>Error: {error}</p>
        ) : alimentos.length === 0 ? (
          <p style={{ color:'var(--text-light)', fontSize:14, marginBottom:28 }}>No se encontraron alimentos.</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:32 }}>
            {alimentos.map((f, i) => (
              <div key={f.id} style={{ background:'white', borderRadius:'var(--radius)', overflow:'hidden', boxShadow:'var(--shadow-sm)', cursor:'pointer', transition:'transform .2s' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ height:90, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, background:gradients[i % gradients.length] }}>
                  {emojiPorCategoria[f.categoria] || '🍽️'}
                </div>
                <div style={{ padding:12 }}>
                  <p style={{ fontSize:13, fontWeight:700 }}>{f.nombre}</p>
                  <p style={{ fontSize:11, color:'var(--text-light)', marginTop:2, textTransform:'capitalize' }}>{f.categoria}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--green-mid)' }}>{f.calorias_por_100g} kcal</span>
                    <span style={{ background:'#e8f5ee', color:'var(--green-mid)', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:700 }}>/ 100g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
