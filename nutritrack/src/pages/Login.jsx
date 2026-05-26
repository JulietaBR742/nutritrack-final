import React, { useState } from 'react';
import { authService } from '../services/api';

export default function Login({ navigate, onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: 'white', fontSize: 14,
    outline: 'none', marginBottom: 16,
    fontFamily: "'DM Sans', sans-serif",
  };

  const handleLogin = async () => {
    if (!email || !password) return setError('Completa todos los campos');
    setLoading(true); setError('');
    try {
      const data = await authService.login(email, password);
      onLogin(data.token, data.usuario);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleRegistro = async () => {
    if (!email || !password) return setError('Completa todos los campos');
    setLoading(true); setError('');
    try {
      const data = await authService.registro({ nombre: email.split('@')[0], email, password });
      onLogin(data.token, data.usuario);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a3a2a 0%, #0f2d1f 60%, #1a3a2a 100%)',
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', top:-120, right:-120, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(82,183,136,.12) 0%, transparent 70%)' }} />
      <div style={{ position:'absolute', bottom:-100, left:-100, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(224,122,58,.08) 0%, transparent 70%)' }} />
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, padding: '52px 52px', width: 460,
        position: 'relative', zIndex: 1, boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,#52b788,#95d5b2)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:30, marginBottom:12 }}>🌿</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", color:'white', fontSize:28 }}>NutriTrack</h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, marginTop:5 }}>Tu compañero de alimentación saludable</p>
        </div>
        {error && (
          <div style={{ background:'rgba(224,122,58,0.15)', border:'1px solid rgba(224,122,58,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:16, color:'#e07a3a', fontSize:13 }}>
            {error}
          </div>
        )}
        <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, marginBottom:6, letterSpacing:'.5px', textTransform:'uppercase' }}>Correo Electrónico</label>
        <input style={inputStyle} type="email" placeholder="usuario@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, marginBottom:6, letterSpacing:'.5px', textTransform:'uppercase' }}>Contraseña</label>
        <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <button onClick={handleLogin} disabled={loading} style={{
          width:'100%', padding:14,
          background: loading ? 'rgba(82,183,136,0.5)' : 'linear-gradient(135deg,#52b788,#40916c)',
          border:'none', borderRadius:10, color:'white', fontSize:15, fontWeight:700,
          cursor: loading ? 'not-allowed' : 'pointer', marginTop:4, fontFamily:"'DM Sans',sans-serif",
        }}>
          {loading ? 'Entrando...' : 'Iniciar Sesión →'}
        </button>
        <div style={{ textAlign:'center', marginTop:20 }}>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>
            ¿No tienes cuenta?{' '}
            <span onClick={handleRegistro} style={{ color:'#95d5b2', fontWeight:700, cursor:'pointer' }}>Regístrate gratis</span>
          </p>
        </div>
      </div>
    </div>
  );
}
