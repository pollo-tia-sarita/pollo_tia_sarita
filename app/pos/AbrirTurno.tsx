'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Wallet, ArrowRight, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Props {
  cajeroId: string
  sucursalId: string
  cajeroNombre: string
  cajeroRol: string
}

export default function AbrirTurno({ cajeroId, sucursalId, cajeroNombre, cajeroRol }: Props) {
  const [monto, setMonto] = useState<string>('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleAbrir(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)

    const montoInicial = parseFloat(monto) || 0

    try {
      const { error } = await supabase.from('turnos').insert({
        cajero_id: cajeroId,
        sucursal_id: sucursalId,
        monto_apertura: montoInicial,
        estado: 'abierto'
      })

      if (error) throw error

      // Notificación al admin: best-effort, no debe bloquear la apertura
      // del turno (que ya se creó con éxito en la línea de arriba).
      const { error: notifError } = await supabase.from('notificaciones').insert({
        usuario_origen_id: cajeroId,
        rol_origen: cajeroRol,
        tipo: 'caja',
        mensaje: `El/La Cajero(a) ${cajeroNombre} acaba de ABRIR su caja y empezar su turno con Bs. ${montoInicial.toFixed(2)}`
      })
      if (notifError) console.error('No se pudo enviar la notificación de apertura:', notifError)

      toast.success('Turno abierto correctamente')
      router.refresh() // Recargar la página para que page.tsx detecte el turno activo y muestre el POS
    } catch (err: any) {
      console.error(err)
      toast.error('Error al abrir el turno: ' + err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="abrir-turno-container animate-fade-in">
      <div className="abrir-turno-card">
        
        <div className="card-icon">
          <Wallet size={48} className="text-yellow" />
        </div>
        
        <h1 className="title">Apertura de Caja</h1>
        <p className="subtitle">Parece que no tienes un turno activo. Para empezar a vender, por favor declara el monto inicial de tu caja (sencillo).</p>
        
        <form onSubmit={handleAbrir} className="form-abrir">
          <div className="input-group">
            <label>Monto Inicial (Bs.)</label>
            <div className="input-wrapper">
              <span className="currency-symbol">Bs.</span>
              <input 
                type="number" 
                step="0.10" 
                min="0"
                required
                value={monto}
                onChange={e => setMonto(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          <div className="alert-box">
            <AlertCircle size={16} />
            <span>Este monto será sumado a las ventas en efectivo para el cuadre final.</span>
          </div>
          
          <button type="submit" disabled={cargando} className="btn-abrir">
            {cargando ? 'Abriendo Turno...' : 'Abrir Turno y Comenzar'}
            {!cargando && <ArrowRight size={20} />}
          </button>
        </form>

      </div>

      <style>{`
        .abrir-turno-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-900);
          padding: 20px;
        }

        .abrir-turno-card {
          background: var(--bg-800);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 40px;
          max-width: 450px;
          width: 100%;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }

        .card-icon {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: rgba(253, 216, 53, 0.1);
          color: var(--yellow);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }

        .title {
          font-size: 1.7rem;
          font-weight: 800;
          color: var(--text-100);
          margin-bottom: 10px;
        }

        .subtitle {
          font-size: 0.95rem;
          color: var(--text-400);
          margin-bottom: 30px;
          line-height: 1.5;
        }

        .form-abrir {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }

        .input-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-300);
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-symbol {
          position: absolute;
          left: 16px;
          color: var(--text-500);
          font-weight: 700;
        }

        .input-wrapper input {
          width: 100%;
          background: var(--bg-900);
          border: 2px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px 16px 16px 48px;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-100);
          transition: var(--transition);
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: var(--red);
          box-shadow: 0 0 0 3px rgba(211,47,47,0.2);
        }

        .alert-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          padding: 12px;
          border-radius: var(--radius-md);
          color: var(--text-500);
          font-size: 0.8rem;
          line-height: 1.4;
        }
        .alert-box svg { flex-shrink: 0; margin-top: 2px; }

        .btn-abrir {
          background: var(--red);
          color: white;
          border: none;
          padding: 16px;
          border-radius: var(--radius-lg);
          font-weight: 700;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: var(--transition);
        }

        .btn-abrir:hover:not(:disabled) {
          background: var(--red-light);
          transform: translateY(-2px);
          box-shadow: var(--shadow-red);
        }

        .btn-abrir:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
