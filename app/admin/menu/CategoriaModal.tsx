'use client'

import { useState, useEffect } from 'react'
import { X, Save, Box } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast' // To be added to project if not there, or we can use custom logic

interface Categoria {
  id?: string
  nombre: string
  icono: string
  orden: number
  activa: boolean
}

interface Props {
  isOpen: boolean
  onClose: () => void
  categoriaToEdit: Categoria | null
  onSuccess: () => void
}

export default function CategoriaModal({ isOpen, onClose, categoriaToEdit, onSuccess }: Props) {
  const [formData, setFormData] = useState<Categoria>({ nombre: '', icono: '🍗', orden: 1, activa: true })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (categoriaToEdit) setFormData(categoriaToEdit)
    else setFormData({ nombre: '', icono: '🍗', orden: 1, activa: true })
  }, [categoriaToEdit, isOpen])

  if (!isOpen) return null

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (categoriaToEdit?.id) {
        // Editar
        const { error } = await supabase.from('categorias')
          .update({
            nombre: formData.nombre,
            icono: formData.icono,
            orden: formData.orden,
            activa: formData.activa
          })
          .eq('id', categoriaToEdit.id)

        if (error) throw error
        toast.success('Categoría actualizada')
      } else {
        // Crear
        const { error } = await supabase.from('categorias')
          .insert({
            nombre: formData.nombre,
            icono: formData.icono,
            orden: formData.orden,
            activa: formData.activa
          })

        if (error) throw error
        toast.success('Categoría creada correctamente')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Ocurrió un error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in-scale" style={{ maxWidth: '500px' }}>
        
        <div className="modal-header">
          <h2 className="modal-title flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box size={20} className="text-red" style={{ color: 'var(--red)' }} /> 
            {categoriaToEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button onClick={onClose} className="btn-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Nombre de Categoría</label>
            <input 
              type="text" 
              required 
              className="input-field w-full" 
              style={{ width: '100%' }}
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Combos Familiares"
            />
          </div>

          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Ícono (Emoji)</label>
              <input 
                type="text" 
                className="input-field w-full" 
                style={{ width: '100%' }}
                value={formData.icono}
                onChange={e => setFormData({ ...formData, icono: e.target.value })}
                placeholder="Ej: 🍗"
                maxLength={5}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Orden de Vista</label>
              <input 
                type="number" 
                required 
                className="input-field w-full" 
                style={{ width: '100%' }}
                value={formData.orden}
                onChange={e => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>¿Visible en el Menú?</label>
            <input 
              type="checkbox" 
              checked={formData.activa} 
              onChange={e => setFormData({ ...formData, activa: e.target.checked })}
              style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={18} /> {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>

      </div>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 9999;
          padding: 20px;
        }
        .modal-content {
          background: var(--bg-900); border: 1px solid var(--border); border-radius: var(--radius-xl);
          width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .modal-header {
          padding: 20px 24px; border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
        }
        .modal-title { font-size: 1.25rem; font-weight: 800; color: var(--text-100); }
        .btn-close {
          background: transparent; color: var(--text-500); border: none; cursor: pointer;
          border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
        }
        .btn-close:hover { background: var(--bg-800); color: var(--text-200); }
        .modal-body { padding: 24px; }
        .form-label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-400); margin-bottom: 8px; }
      `}</style>
    </div>
  )
}
