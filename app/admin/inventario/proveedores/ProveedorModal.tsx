'use client'

import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface Proveedor {
  id: string
  nombre: string
  contacto: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  nit: string | null
  activo: boolean
}

interface Props {
  isOpen: boolean
  onClose: () => void
  proveedorToEdit: Proveedor | null
  onSuccess: () => void
}

export default function ProveedorModal({ isOpen, onClose, proveedorToEdit, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    nit: '',
    activo: true,
  })

  useEffect(() => {
    if (proveedorToEdit) {
      setFormData({
        nombre: proveedorToEdit.nombre,
        contacto: proveedorToEdit.contacto || '',
        telefono: proveedorToEdit.telefono || '',
        email: proveedorToEdit.email || '',
        direccion: proveedorToEdit.direccion || '',
        nit: proveedorToEdit.nit || '',
        activo: proveedorToEdit.activo,
      })
    } else {
      setFormData({
        nombre: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        nit: '',
        activo: true,
      })
    }
  }, [proveedorToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim()) return toast.error('El nombre es obligatorio')

    setLoading(true)
    const supabase = createClient()

    try {
      if (proveedorToEdit) {
        const { error } = await supabase
          .from('proveedores')
          .update({
            nombre: formData.nombre,
            contacto: formData.contacto || null,
            telefono: formData.telefono || null,
            email: formData.email || null,
            direccion: formData.direccion || null,
            nit: formData.nit || null,
            activo: formData.activo,
            updated_at: new Date().toISOString()
          })
          .eq('id', proveedorToEdit.id)
        if (error) throw error
        toast.success('Proveedor actualizado')
      } else {
        const { error } = await supabase
          .from('proveedores')
          .insert([{
            nombre: formData.nombre,
            contacto: formData.contacto || null,
            telefono: formData.telefono || null,
            email: formData.email || null,
            direccion: formData.direccion || null,
            nit: formData.nit || null,
            activo: formData.activo
          }])
        if (error) throw error
        toast.success('Proveedor registrado')
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-panel animate-zoom-in">
        <div className="modal-header">
          <h2 className="modal-title">
            {proveedorToEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h2>
          <button className="md-close-btn" onClick={onClose} disabled={loading}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Nombre de la Empresa o Persona *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ej. Distribuidora Avícola San Juan"
              required 
              autoFocus
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Contacto (Opcional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nombre del vendedor"
                value={formData.contacto}
                onChange={e => setFormData({ ...formData, contacto: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ej. 77712345"
                value={formData.telefono}
                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">NIT (Opcional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ej. 102938475"
                value={formData.nit}
                onChange={e => setFormData({ ...formData, nit: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="correo@empresa.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dirección (Opcional)</label>
            <textarea 
              className="form-input" 
              rows={2}
              placeholder="Ej. Av. Panamericana #123"
              value={formData.direccion}
              onChange={e => setFormData({ ...formData, direccion: e.target.value })}
            />
          </div>

          {proveedorToEdit && (
            <div className="form-group">
              <label className="flex items-center gap-2 text-sm text-gray-300 font-medium" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.activo} 
                  onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--red)' }}
                />
                Proveedor Activo (puede proveer insumos)
              </label>
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={18} />
              {loading ? 'Guardando...' : 'Guardar Proveedor'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 2000;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .modal-panel {
          background: var(--bg-800);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          width: 100%; max-width: 540px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
        }
        .modal-title { font-size: 1.2rem; font-weight: 800; color: var(--text-100); }
        .md-close-btn { background: transparent; border: none; color: var(--text-400); cursor: pointer; }
        .md-close-btn:hover { color: var(--red); }
        .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 0.8rem; font-weight: 600; color: var(--text-400); text-transform: uppercase; letter-spacing: 0.05em; }
        .form-input { background: var(--bg-900); border: 1px solid var(--border); color: var(--text-100); padding: 10px 12px; border-radius: var(--radius-md); font-size: 0.95rem; }
        .form-input:focus { border-color: var(--yellow); outline: none; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 20px; }
        
        @media (max-width: 500px) {
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
