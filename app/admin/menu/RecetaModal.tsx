'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Plus, Trash2, ChefHat, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  productoId: string | null
  productoNombre: string | null
}

export default function RecetaModal({ isOpen, onClose, productoId, productoNombre }: Props) {
  const supabase = createClient()
  const [insumos, setInsumos] = useState<any[]>([])
  const [receta, setReceta] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form para nuevo item
  const [selectedInsumo, setSelectedInsumo] = useState('')
  const [cantidad, setCantidad] = useState('')

  useEffect(() => {
    if (isOpen && productoId) {
      cargarDatos()
    } else {
      setReceta([])
      setSelectedInsumo('')
      setCantidad('')
    }
  }, [isOpen, productoId])

  const cargarDatos = async () => {
    setLoading(true)
    
    // Cargar todos los insumos disponibles
    const { data: listInsumos } = await supabase
      .from('insumos')
      .select('id, nombre, unidad')
      .eq('activo', true)
      .order('nombre')
    
    setInsumos(listInsumos || [])

    // Cargar la receta actual
    const { data: resReceta } = await supabase
      .from('producto_insumos')
      .select('id, insumo_id, cantidad, insumos(nombre, unidad)')
      .eq('producto_id', productoId)
    
    setReceta(resReceta || [])
    setLoading(false)
  }

  const handleAgregar = async () => {
    if (!selectedInsumo || !cantidad) return
    const num = Number(cantidad)
    if (num <= 0) return toast.error('La cantidad debe ser mayor a 0')

    const existe = receta.find(r => r.insumo_id === selectedInsumo)
    if (existe) return toast.error('Este insumo ya está en la receta')

    setSaving(true)
    const { error } = await supabase.from('producto_insumos').insert({
      producto_id: productoId,
      insumo_id: selectedInsumo,
      cantidad: num
    })

    if (error) {
      toast.error('Error al agregar: ' + error.message)
    } else {
      toast.success('Agregado a la receta')
      setSelectedInsumo('')
      setCantidad('')
      cargarDatos()
    }
    setSaving(false)
  }

  const handleEliminar = async (id: string) => {
    setSaving(true)
    const { error } = await supabase.from('producto_insumos').delete().eq('id', id)
    if (error) {
      toast.error('Error al quitar de receta')
    } else {
      toast.success('Insumo removido')
      cargarDatos()
    }
    setSaving(false)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in-scale" style={{ maxWidth: '600px' }}>
        
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ChefHat className="text-yellow" size={24} /> 
            Receta: {productoNombre}
          </h2>
          <button onClick={onClose} className="btn-close" disabled={saving || loading}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div style={{ background: 'var(--bg-800)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="input-label">Insumo</label>
              <select 
                className="input-field" 
                value={selectedInsumo}
                onChange={e => setSelectedInsumo(e.target.value)}
                disabled={loading || saving}
              >
                <option value="">-- Seleccionar --</option>
                {insumos.map(i => (
                  <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>
                ))}
              </select>
            </div>
            <div style={{ width: '120px' }}>
              <label className="input-label">Cantidad</label>
              <input 
                type="number" 
                step="0.01"
                className="input-field" 
                placeholder="Ej. 0.25"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                disabled={loading || saving}
              />
            </div>
            <button 
              className="btn btn-primary" 
              style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={handleAgregar}
              disabled={loading || saving}
            >
              <Plus size={18} /> Agregar
            </button>
          </div>

          <div style={{ background: 'var(--bg-900)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-500)' }}>Cargando receta...</div>
            ) : receta.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-500)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={32} style={{ opacity: 0.3 }} />
                Este producto no descuenta insumos.
              </div>
            ) : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-800)', borderBottom: '1px solid var(--border)', color: 'var(--text-400)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Insumo</th>
                    <th style={{ padding: '12px 16px' }}>Cantidad Fija a Descontar</th>
                    <th style={{ padding: '12px 16px', width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {receta.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-200)' }}>
                        {r.insumos?.nombre}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--yellow)', fontWeight: 700 }}>
                        {r.cantidad} <span style={{ color: 'var(--text-500)', fontSize: '0.8rem', fontWeight: 400 }}>{r.insumos?.unidad}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleEliminar(r.id)}
                          className="btn btn-icon-only hover-danger"
                          disabled={saving}
                          title="Remover"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
