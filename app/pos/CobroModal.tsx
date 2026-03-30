'use client'

import { useState } from 'react'
import { X, Banknote, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react'

export type MetodoPago = 'efectivo' | 'tarjeta' | 'qr'
export type TipoVenta  = 'para_llevar' | 'comer_aqui'

interface Props {
  isOpen: boolean
  onClose: () => void
  total: number
  onConfirmar: (metodo: MetodoPago, tipoVenta: TipoVenta, montoRecibido: number) => void
  cargando: boolean
}

export default function CobroModal({ isOpen, onClose, total, onConfirmar, cargando }: Props) {
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [tipo, setTipo] = useState<TipoVenta>('para_llevar')
  const [montoIngresado, setMontoIngresado] = useState<string>('')

  if (!isOpen) return null

  const montoNum = parseFloat(montoIngresado || '0')
  const vuelto = montoNum - total

  const fmt = (n: number) => new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2 }).format(n)

  // Teclado numérico
  const handleKey = (key: string) => {
    if (key === 'C') { setMontoIngresado(''); return }
    if (key === '⌫') { setMontoIngresado(prev => prev.slice(0, -1)); return }
    if (key === 'EXACTO') { setMontoIngresado(total.toString()); return }
    if (key === '+10') { setMontoIngresado((montoNum + 10).toString()); return }
    if (key === '+50') { setMontoIngresado((montoNum + 50).toString()); return }
    if (key === '+100') { setMontoIngresado((montoNum + 100).toString()); return }
    if (key === '.' && montoIngresado.includes('.')) return

    setMontoIngresado(prev => prev === '0' && key !== '.' ? key : prev + key)
  }

  const handleCobrar = () => {
    if (metodo === 'efectivo' && montoNum < total) {
      alert('El monto recibido no puede ser menor al total.'); return
    }
    onConfirmar(metodo, tipo, metodo === 'efectivo' ? montoNum : total)
  }

  return (
    <div className="cobro-overlay">
      <div className="cobro-modal animate-fade-in-scale">
        
        {/* Header */}
        <div className="cobro-header">
          <h2 className="cobro-title">Cobrar Pedido</h2>
          <button onClick={onClose} className="btn-close" disabled={cargando}>
            <X size={20} />
          </button>
        </div>

        <div className="cobro-body">
          
          {/* Lado Izquierdo: Configuración */}
          <div className="cobro-left">
            
            {/* Tipo de Consumo */}
            <div className="cobro-section">
              <label className="cobro-label">Tipo de Pedido</label>
              <div className="cobro-options">
                <button 
                  className={`cobro-opt-btn ${tipo === 'para_llevar' ? 'active' : ''}`}
                  onClick={() => setTipo('para_llevar')}
                >
                  <span className="text-xl">🛍️</span> Para Llevar
                </button>
                <button 
                  className={`cobro-opt-btn ${tipo === 'comer_aqui' ? 'active' : ''}`}
                  onClick={() => setTipo('comer_aqui')}
                >
                  <span className="text-xl">🍽️</span> Comer Aquí
                </button>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="cobro-section">
              <label className="cobro-label">Método de Pago</label>
              <div className="cobro-options vertical">
                <button 
                  className={`cobro-pay-btn ${metodo === 'efectivo' ? 'active' : ''}`}
                  onClick={() => { setMetodo('efectivo'); setMontoIngresado('') }}
                >
                  <Banknote size={24} className="text-green" /> Efectivo
                </button>
                <button 
                  className={`cobro-pay-btn ${metodo === 'tarjeta' ? 'active' : ''}`}
                  onClick={() => setMetodo('tarjeta')}
                >
                  <CreditCard size={24} className="text-blue" /> Tarjeta de Crédito / Débito
                </button>
                <button 
                  className={`cobro-pay-btn ${metodo === 'qr' ? 'active' : ''}`}
                  onClick={() => setMetodo('qr')}
                >
                  <Smartphone size={24} className="text-yellow" /> QR / Billetera Móvil
                </button>
              </div>
            </div>

          </div>

          {/* Lado Derecho: Calculadora + Montos */}
          <div className="cobro-right">
            
            {/* Display Monto */}
            <div className="cobro-display">
              <div className="cobro-display-row">
                <span className="c-label">TOTAL A COBRAR:</span>
                <span className="c-val-total">Bs. {fmt(total)}</span>
              </div>
              
              {metodo === 'efectivo' && (
                <>
                  <div className="cobro-display-row mt">
                    <span className="c-label">RECIBIDO:</span>
                    <span className={`c-val-input ${montoNum < total ? 'text-danger' : ''}`}>
                      Bs. {montoIngresado ? fmt(montoNum) : '0.00'}
                    </span>
                  </div>
                  <div className="cobro-display-row highlight">
                    <span className="c-label">VUELTO:</span>
                    <span className="c-val-vuelto cursor-blink">
                      Bs. {vuelto > 0 ? fmt(vuelto) : '0.00'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Teclado - solo para efectivo */}
            {metodo === 'efectivo' ? (
              <div className="cobro-keypad">
                {['1','2','3','+10','4','5','6','+50','7','8','9','+100','C','0','.','⌫'].map(k => (
                  <button key={k} className={`keypad-btn ${k === 'C' || k === '⌫' || k.startsWith('+') ? 'action' : ''}`} onClick={() => handleKey(k)}>
                    {k}
                  </button>
                ))}
                <button className="keypad-btn action" style={{ gridColumn: 'span 4' }} onClick={() => handleKey('EXACTO')}>
                  Pago Exacto
                </button>
              </div>
            ) : (
              <div className="cobro-no-keypad">
                <div className="icon-wrap">
                  {metodo === 'tarjeta' ? <CreditCard size={48} className="text-blue" /> : <Smartphone size={48} className="text-yellow" />}
                </div>
                <p>El cobro se procesará externamente por <strong>{metodo.toUpperCase()}</strong>.</p>
                <p className="text-sm">Asegúrate de confirmar la recepción del dinero antes de emitir el ticket.</p>
              </div>
            )}

            <button 
              className="btn btn-primary btn-lg w-full mt-auto cobro-confirm-btn"
              disabled={cargando || (metodo === 'efectivo' && montoNum < total)}
              onClick={handleCobrar}
            >
              {cargando ? 'Procesando Venta...' : (
                <>
                  <CheckCircle2 size={24} /> Emitir Ticket
                </>
              )}
            </button>

          </div>
        </div>

      </div>

      <style>{`
        .cobro-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .cobro-modal {
          background: var(--bg-800);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 900px;
          max-height: 95vh; /* Evita que crezca más alto que la pantalla */
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.8);
        }

        .cobro-header {
          padding: 12px 20px;
          border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          flex-shrink: 0;
        }
        .cobro-title { font-size: 1.2rem; font-weight: 800; color: var(--text-100); }
        .btn-close {
          background: var(--bg-700); color: var(--text-400); border-radius: 50%;
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          transition: var(--transition);
        }
        .btn-close:hover { background: rgba(211,47,47,0.1); color: var(--red); }

        .cobro-body {
          display: flex;
          flex: 1;
          overflow-y: auto;
        }

        .cobro-left {
          flex: 0 0 280px;
          padding: 16px;
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 16px;
          background: var(--bg-900);
        }

        .cobro-section { display: flex; flex-direction: column; gap: 8px; }
        .cobro-label { font-size: 0.75rem; font-weight: 700; color: var(--text-500); text-transform: uppercase; letter-spacing: 0.05em; }

        .cobro-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cobro-options.vertical { grid-template-columns: 1fr; }

        .cobro-opt-btn {
          background: var(--bg-800); border: 2px solid var(--border);
          padding: 10px; border-radius: var(--radius-lg);
          color: var(--text-300); font-weight: 600; font-size: 0.85rem;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          transition: var(--transition);
        }
        .cobro-opt-btn.active {
          border-color: var(--yellow); background: rgba(253,216,53,0.1); color: var(--text-100); box-shadow: var(--shadow-yellow);
        }

        .cobro-pay-btn {
          background: var(--bg-800); border: 2px solid var(--border);
          padding: 12px 14px; border-radius: var(--radius-lg);
          color: var(--text-300); font-weight: 600; font-size: 0.85rem;
          display: flex; align-items: center; gap: 10px;
          transition: var(--transition); text-align: left;
        }
        .cobro-pay-btn.active { border-color: var(--red); background: rgba(211,47,47,0.1); color: white; box-shadow: var(--shadow-red); }

        .text-green { color: #4CAF50; }
        .text-blue { color: #42A5F5; }
        .text-yellow { color: var(--yellow); }
        .text-danger { color: var(--red-light); }

        /* Lado Derecho */
        .cobro-right {
          flex: 1; padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
        }

        .cobro-display {
          background: var(--bg-900);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 12px 20px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .cobro-display-row { display: flex; justify-content: space-between; align-items: baseline; }
        .cobro-display-row.highlight { padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); margin-top: 4px; }
        
        .c-label { color: var(--text-500); font-weight: 700; font-size: 0.75rem; }
        .c-val-total { color: var(--text-100); font-size: 1.4rem; font-weight: 900; }
        .c-val-input { color: var(--yellow); font-size: 1.3rem; font-weight: 800; font-family: monospace; }
        .c-val-vuelto { color: #4CAF50; font-size: 1.4rem; font-weight: 900; font-family: monospace; }
        
        .cursor-blink::after {
          content: '_'; animation: blink 1s step-end infinite; opacity: 0.5; margin-left: 2px;
        }
        @keyframes blink { 50% { opacity: 0; } }

        .cobro-keypad {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; flex: 1;
        }
        .keypad-btn {
          background: var(--bg-700); border: 1px solid var(--border);
          border-radius: var(--radius-md); font-size: 1.1rem; font-weight: 700;
          color: var(--text-100); display: flex; align-items: center; justify-content: center;
          transition: var(--transition); box-shadow: var(--shadow-sm); height: 100%; min-height: 40px;
        }
        .keypad-btn:active { transform: scale(0.95); background: var(--bg-600); }
        .keypad-btn.action { font-size: 0.85rem; color: var(--yellow); background: rgba(253,216,53,0.05); }
        .keypad-btn.action:hover { background: rgba(253,216,53,0.15); }

        .cobro-no-keypad {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; color: var(--text-400); gap: 8px; padding: 0 40px;
          background: rgba(255,255,255,0.02); border-radius: var(--radius-xl); border: 1px dashed rgba(255,255,255,0.1);
        }
        .icon-wrap { width: 50px; height: 50px; border-radius: 50%; background: var(--bg-700); display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }

        .cobro-confirm-btn {
          height: 45px; font-size: 1.1rem; border-radius: var(--radius-lg); margin-top: auto;
        }

        @media (max-width: 768px) {
          .cobro-body {
            flex-direction: column;
            height: auto;
            max-height: 75vh;
            overflow-y: auto;
          }
          .cobro-left {
            flex: auto;
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding: 20px;
          }
          .cobro-right {
            padding: 20px;
          }
          .cobro-keypad {
            min-height: 250px;
          }
          .keypad-btn {
            min-height: 50px;
          }
          .cobro-confirm-btn {
            margin-top: 15px;
          }
        }
      `}</style>
    </div>
  )
}
