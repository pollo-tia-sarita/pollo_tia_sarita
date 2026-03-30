'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { User, Lock, Save, ShieldAlert, CheckCircle } from 'lucide-react'

export default function PerfilClient({ user, perfil }: { user: any, perfil: any }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  
  const [nombre, setNombre] = useState(perfil.nombre || '')
  const [apellido, setApellido] = useState(perfil.apellido || '')
  const [telefono, setTelefono] = useState(perfil.telefono || '')
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleUpdateDatos = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('perfiles')
      .update({ nombre, apellido, telefono })
      .eq('id', user.id)

    if (error) {
      toast.error('Error al actualizar: ' + error.message)
    } else {
      toast.success('Datos personales actualizados')
    }
    setLoading(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) return toast.error('Mínimo 6 caracteres')
    if (newPassword !== confirmPassword) return toast.error('Las contraseñas no coinciden')

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) {
      toast.error('Error al cambiar contraseña: ' + error.message)
    } else {
      toast.success('Contraseña cambiada exitosamente')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="admin-page animate-fade-in text-white" style={{ maxWidth: '800px' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <User size={36} style={{ color: 'var(--yellow)' }} />
          Mi Perfil
        </h1>
        <p style={{ color: 'var(--text-400)', fontSize: '1rem', marginTop: '6px' }}>
          Configura tus datos personales y credenciales de acceso.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Info Pública */}
        <div style={{ background: 'var(--bg-800)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--yellow)" /> 
            Datos Personales
          </h2>
          <form onSubmit={handleUpdateDatos} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-400)', marginBottom: '8px', fontWeight: 600 }}>Nombre</label>
                <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-900)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-400)', marginBottom: '8px', fontWeight: 600 }}>Apellido</label>
                <input required type="text" value={apellido} onChange={e => setApellido(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-900)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-400)', marginBottom: '8px', fontWeight: 600 }}>Teléfono</label>
              <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-900)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }} />
            </div>
            
            <div style={{ marginTop: '8px', padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-900)', border: '1px solid var(--border)' }}>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-400)', marginBottom: '4px' }}>Nivel de Acceso</div>
               <div style={{ fontWeight: 800, color: 'var(--yellow)', textTransform: 'uppercase' }}>{perfil.rol}</div>
            </div>

            <button disabled={loading} type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, cursor: 'pointer', marginTop: '10px' }}>
              <Save size={18} /> {loading ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Seguridad */}
        <div style={{ background: 'var(--bg-800)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={20} color="#ffb74d" /> 
            Cuenta y Seguridad
          </h2>
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-400)', marginBottom: '8px', fontWeight: 600 }}>Correo Electrónico de Acceso</label>
              <input disabled type="email" value={user.email} style={{ width: '100%', padding: '12px', background: 'var(--bg-900)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-500)', opacity: 0.7 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-400)', marginBottom: '8px', fontWeight: 600 }}>Nueva Contraseña</label>
              <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={{ width: '100%', padding: '12px', background: 'var(--bg-900)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-400)', marginBottom: '8px', fontWeight: 600 }}>Confirmar Contraseña</label>
              <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repetir nueva contraseña" style={{ width: '100%', padding: '12px', background: 'var(--bg-900)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }} />
            </div>
            <button disabled={loading} type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: 'var(--yellow)', border: 'none', borderRadius: 'var(--radius-md)', color: '#000', fontWeight: 800, cursor: 'pointer', marginTop: '10px' }}>
              <Lock size={18} /> {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
