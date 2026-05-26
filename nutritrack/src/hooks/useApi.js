import { useState, useEffect, useCallback } from 'react';

export function useApi(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const ejecutar = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await fetchFn()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, deps);

  useEffect(() => { ejecutar(); }, [ejecutar]);
  return { data, loading, error, recargar: ejecutar };
}

export function useForm(initialState) {
  const [form,    setForm]    = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (submitFn, successMsg = 'Guardado correctamente') => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const result = await submitFn(form);
      setSuccess(successMsg);
      setTimeout(() => setSuccess(''), 3000);
      return result;
    } catch (err) { setError(err.message); return null; }
    finally { setLoading(false); }
  };

  return { form, setForm, handleChange, handleSubmit, loading, error, success, reset: () => setForm(initialState) };
}
