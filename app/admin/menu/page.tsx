import { createClient } from '@/lib/supabase/server'
import MenuClient from './MenuClient'

export default async function MenuPage() {
  const supabase = await createClient()

  // Obtener categorías
  const { data: categorias, error: catError } = await supabase
    .from('categorias')
    .select('*')
    .order('orden', { ascending: true })

  if (catError) console.error("Error cargando categorías:", catError)

  // Obtener productos
  const { data: productos, error: prodError } = await supabase
    .from('productos')
    .select(`
      *,
      categorias (nombre)
    `)
    .order('orden', { ascending: true })

  if (prodError) console.error("Error cargando productos:", prodError)

  return (
    <div className="admin-page animate-fade-in text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Carta y Menú</h1>
        <p className="text-gray-400">Gestiona las categorías y productos que se mostrarán en el Punto de Venta.</p>
      </div>

      <MenuClient 
        categoriasIniciales={categorias || []} 
        productosIniciales={productos || []} 
      />
    </div>
  )
}
