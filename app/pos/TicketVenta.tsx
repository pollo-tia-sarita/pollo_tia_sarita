export interface TicketData {
  sucursalNombre: string
  cajeroNombre: string
  numeroTicket: string
  tipoPedido: string
  metodoPago: string
  total: number
  recibido: number
  vuelto: number
  items: {
    nombre: string
    cantidad: number
    precio: number
    subtotal: number
  }[]
  fecha: string
}

export default function TicketVenta({ data }: { data: TicketData | null }) {
  if (!data) return null

  const fmt = (n: number) => n.toFixed(2)

  return (
    <div className="ticket-container">
      {/* Cabecera */}
      <div className="ticket-header-print">
        <h1 className="ticket-brand">TÍA SARITA</h1>
        <p className="ticket-branch">{data.sucursalNombre}</p>
        <p className="ticket-info">{data.fecha}</p>
        <p className="ticket-info">Le atendió: {data.cajeroNombre}</p>
      </div>

      <div className="ticket-divider" />

      {/* Tipo de Pedido y Número */}
      <div className="ticket-order-info">
        <h2 className="ticket-order-type">
          {data.tipoPedido === 'para_llevar' ? 'PARA LLEVAR' : 'COMER AQUÍ'}
        </h2>
        <p className="ticket-number">Ticket: #{data.numeroTicket}</p>
      </div>

      <div className="ticket-divider" />

      {/* Detalle de Productos */}
      <div className="ticket-items-list">
        <table className="ticket-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Cant</th>
              <th style={{ textAlign: 'left' }}>Prod</th>
              <th style={{ textAlign: 'right' }}>SubT</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ verticalAlign: 'top', width: '30px' }}>{item.cantidad}</td>
                <td style={{ verticalAlign: 'top' }}>
                  {item.nombre}
                  <div style={{ fontSize: '10px' }}>{item.precio.toFixed(2)} c/u</div>
                </td>
                <td style={{ verticalAlign: 'top', textAlign: 'right' }}>{fmt(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ticket-divider" />

      {/* Totales */}
      <div className="ticket-totals-print">
        <div className="t-row t-big">
          <span>TOTAL:</span>
          <span>Bs. {fmt(data.total)}</span>
        </div>
        <div className="t-row">
          <span>TIPO PAGO:</span>
          <span style={{ textTransform: 'uppercase' }}>{data.metodoPago}</span>
        </div>
        {data.metodoPago === 'efectivo' && (
          <>
            <div className="t-row">
              <span>RECIBIDO:</span>
              <span>Bs. {fmt(data.recibido)}</span>
            </div>
            <div className="t-row">
              <span>CAMBIO:</span>
              <span>Bs. {fmt(data.vuelto)}</span>
            </div>
          </>
        )}
      </div>

      <div className="ticket-divider" />

      <div className="ticket-footer-print">
        <p>¡Gracias por su compra!</p>
        <p>Pollo a la Leña Tía Sarita</p>
      </div>

      <style>{`
        /* ESTILOS EXCLUSIVOS DE IMPRESIÓN (BLANCO Y NEGRO PURO) */
        .ticket-container {
          width: 80mm; /* Estándar térmico 80mm */
          margin: 0;
          padding: 5mm;
          background: #fff;
          color: #000;
          font-family: 'Courier New', Courier, monospace;
          line-height: 1.4;
          font-size: 12px;
        }

        .ticket-header-print {
          text-align: center;
          margin-bottom: 5px;
        }
        .ticket-brand {
          font-size: 24px;
          margin: 0 0 5px;
          font-weight: 900;
          letter-spacing: 1px;
        }
        .ticket-branch, .ticket-info {
          margin: 0;
          font-size: 12px;
        }

        .ticket-divider {
          border-bottom: 1px dashed #000;
          margin: 8px 0;
        }

        .ticket-order-info {
          text-align: center;
          margin: 10px 0;
        }
        .ticket-order-type {
          font-size: 18px;
          margin: 0;
          font-weight: bold;
        }
        .ticket-number {
          font-size: 14px;
          margin: 5px 0 0;
        }

        .ticket-table {
          width: 100%;
          border-collapse: collapse;
        }
        .ticket-table th {
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          margin-bottom: 2px;
        }
        .ticket-table td {
          padding-top: 4px;
        }

        .ticket-totals-print {
          margin: 10px 0;
        }
        .t-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .t-big {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .ticket-footer-print {
          text-align: center;
          margin-top: 15px;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
