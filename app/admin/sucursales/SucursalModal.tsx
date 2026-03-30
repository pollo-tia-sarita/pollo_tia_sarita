'use client'

import { useState, useEffect } from 'react'
import { X, Save, Edit2, Plus, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface Sucursal {
  id: string
  nombre: string
  direccion: string | null
  telefono: string | null
  ciudad: string | null
  activa: boolean
  perfiles: [{ count: number }] | { count: number }[]
}

interface Props {
  isOpen: boolean
  onClose: () => void
  sucursalToEdit: Sucursal | null
  onSuccess: () => void
}

export default function SucursalModal({ isOpen, onClose, sucursalToEdit, onSuccess }: Props) {
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [activa, setActiva] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const isEditing = !!sucursalToEdit

  useEffect(() => {
    if (isOpen) {
      setNombre(sucursalToEdit?.nombre || '')
      setDireccion(sucursalToEdit?.direccion || '')
      setTelefono(sucursalToEdit?.telefono || '')
      setCiudad(sucursalToEdit?.ciudad || '')
      setActiva(sucursalToEdit ? sucursalToEdit.activa : true)
    }
  }, [isOpen, sucursalToEdit])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)

    const supabase = createClient()

    try {
      if (isEditing) {
        // Actualizar
        const { error } = await supabase
          .from('sucursales')
          .update({ nombre, direccion, telefono, ciudad, activa })
          .eq('id', sucursalToEdit.id)

        if (error) throw error
        toast.success('Sucursal actualizada correctamente')
      } else {
        // Crear
        const { error } = await supabase
          .from('sucursales')
          .insert({ nombre, direccion, telefono, ciudad, activa })

        if (error) throw error
        toast.success('Nueva sucursal creada con éxito')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error al guardar la sucursal')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in-scale">
        <div className="modal-header">
          <h2 className="modal-title flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={20} className="text-yellow" style={{ color: 'var(--yellow)' }} />
            {isEditing ? 'Editar Franquicia / Local' : 'Registrar Nueva Sucursal'}
          </h2>
          <button onClick={onClose} className="btn-close"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" style={{ padding: '24px' }}>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-300)', marginBottom: '8px' }}>
              Nombre de la Sucursal <span className="text-red" style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input 
              type="text" 
              className="form-input" 
              required
              placeholder="Ej: Tía Sarita Centro"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-900)', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-lg)', color: '#fff', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-300)', marginBottom: '8px' }}>
                Ciudad
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ej: Santa Cruz"
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-900)', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-lg)', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-300)', marginBottom: '8px' }}>
                Teléfono de Contacto
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ej: +591 76543210"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-900)', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-lg)', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-300)', marginBottom: '8px' }}>
              Dirección Física
            </label>
            <textarea 
              className="form-input" 
              rows={2}
              placeholder="Ej: Calle Principal Esq. Avenida Central"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-900)', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-lg)', color: '#fff', fontSize: '0.95rem', resize: 'none' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
              <input 
                type="checkbox" 
                checked={activa}
                onChange={e => setActiva(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#4CAF50' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-100)' }}>Sucursal Operativa</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-500)' }}>Si desmarcas esto, la sucursal dejará de recibir operaciones temporales.</span>
              </div>
            </label>
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={onClose} disabled={guardando} className="btn btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {guardando ? 'Guardando...' : isEditing ? <><Save size={18} /> Actualizar</> : <><Plus size={18} /> Registrar Sucursal</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
