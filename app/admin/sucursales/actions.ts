'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSucursalDashboard(sucursalId: string) {
  const supabase = await createClient()

  // 1. Obtener Perfiles (Empleados) de esta sucursal
  const { data: empleados } = await supabase
    .from('perfiles')
    .select('id, nombre, apellido, rol, activo')
    .eq('sucursal_id', sucursalId)
    .order('rol', { ascending: true })

  const empleadosAsignados = empleados || []
  
  const encargado = empleadosAsignados.find(e => e.rol === 'supervisor') || 
                    empleadosAsignados.find(e => e.rol === 'admin')

  // 3. Obtener Total de Ventas Completadas
  const { data: ventas } = await supabase
    .from('ventas')
    .select('total')
    .eq('sucursal_id', sucursalId)
    .eq('estado', 'completada')

  const totalVentas = (ventas || []).reduce((acc, v) => acc + (v.total || 0), 0)

  // 4. Obtener Total de Compras (Egresos de Insumos)
  const { data: compras } = await supabase
    .from('compras')
    .select('total')
    .eq('sucursal_id', sucursalId)

  const totalCompras = (compras || []).reduce((acc, c) => acc + (c.total || 0), 0)

  // 5. Cálculos 
  const gananciaNeta = totalVentas - totalCompras
  const esGanancia = gananciaNeta >= 0

  return {
    empleados: empleadosAsignados,
    encargado,
    totalVentas,
    totalCompras,
    gananciaNeta,
    esGanancia
  }
}
