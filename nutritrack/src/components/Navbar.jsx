import React, { useState, useEffect } from 'react';
import { notificacionesService } from '../services/api';

const navItems = [
  { key:'dashboard', label:'Dashboard'  },
  { key:'registro',  label:'Registro'   },
  { key:'catalogo',  label:'Catálogo'   },
  { key:'historial', label:'Historial'  },
  { key:'recetas',   label:'Recetas'    },
  { key:'perfil',    label:'Perfil'     },
];

export default function Navbar({ page, navigate, user, onLogout }) {
  const [notifs, setNotifs]     = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    notificacionesService.listar()
      .then(setNotifs)
      .catch(() => {});
  }, [page]);

  const sinLeer = notifs.filter(n => !n.leida).length;

  const marcarTodas = async () => {
    try {
      await notificacionesService.marcarTodas();
      setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
    } catch (_) {}
  };

  const initials = user?.nombre
    ? user.nombre.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : '?';

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:100,
      height:'var(--nav-height)',
      background:'var(--green-dark)',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 36px',
      boxShadow:'0 4px 20px rgba(0,0,0,0.25)',
    }}>
      <span style={{ fontFamily:"'Playfair Display',serif", color:'var(--green-soft)', fontSize:20, fontWeight:700 }}>
        🌿 NutriTrack
      </span>

      <div style={{ display:'flex', gap:28 }}>
        {navItems.map(item => (
          <button key={item.key} onClick={() => navigate(item.key)} style={{
            background:'none', border:'none', padding:'6px 2px',
            color: page === item.key ? 'white' : 'rgba(255,255,255,0.5)',
            fontSize:14, fontWeight: page === item.key ? 700 : 500,
            fontFamily:"'DM Sans',sans-serif",
            borderBottom: page === item.key ? '2px solid var(--green-light)' : '2px solid transparent',
            cursor:'pointer', transition:'all 0.2s',
          }}>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:14, position:'relative' }}>
        {/* Campana de notificaciones */}
        <div style={{ position:'relative', cursor:'pointer' }} onClick={() => setShowNotifs(s => !s)}>
          <span style={{ fontSize:20 }}>🔔</span>
          {sinLeer > 0 && (
            <span style={{
              position:'absolute', top:-4, right:-4,
              background:'#e07a3a', color:'white',
              borderRadius:'50%', width:16, height:16,
              fontSize:10, fontWeight:700,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>{sinLeer}</span>
          )}
          {showNotifs && (
            <div style={{
              position:'absolute', top:36, right:0, width:300,
              background:'white', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
              zIndex:200, overflow:'hidden',
            }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--cream-dark)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:700, fontSize:14, color:'var(--green-dark)' }}>Notificaciones</span>
                {sinLeer > 0 && <span onClick={marcarTodas} style={{ fontSize:11, color:'var(--green-mid)', cursor:'pointer', fontWeight:600 }}>Marcar todas leídas</span>}
              </div>
              {notifs.length === 0
                ? <p style={{ padding:16, fontSize:13, color:'var(--text-light)', textAlign:'center' }}>Sin notificaciones</p>
                : notifs.slice(0,5).map(n => (
                  <div key={n.id} style={{
                    padding:'10px 16px', borderBottom:'1px solid var(--cream-dark)',
                    background: n.leida ? 'white' : '#f0faf5',
                  }}>
                    <p style={{ fontSize:13, fontWeight: n.leida ? 400 : 700, color:'var(--text-dark)' }}>{n.titulo}</p>
                    <p style={{ fontSize:11, color:'var(--text-light)', marginTop:2 }}>{n.mensaje}</p>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        <div style={{
          width:36, height:36, borderRadius:'50%',
          background:'linear-gradient(135deg, var(--green-light), var(--orange))',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:700, fontSize:13, color:'white', cursor:'pointer',
        }} onClick={() => navigate('perfil')}>
          {initials}
        </div>
        <span style={{ color:'rgba(255,255,255,0.8)', fontSize:13, fontWeight:600 }}>
          {user?.nombre?.split(' ')[0] || ''}
        </span>
        <button onClick={onLogout} style={{
          background:'none', border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:8, padding:'5px 10px', color:'rgba(255,255,255,0.6)',
          fontSize:12, cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
        }}>Salir</button>
      </div>
    </nav>
  );
}
