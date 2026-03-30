# 🗄️ Configuración de Supabase — Tía Sarita

Sigue estos pasos exactamente para crear y configurar la base de datos.

---

## PASO 1 — Crear cuenta y proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta gratis
2. Haz clic en **"New Project"**
3. Configura:
   - **Organization**: tu nombre o empresa
   - **Project name**: `tia-sarita`
   - **Database Password**: usa una contraseña fuerte (guárdala)
   - **Region**: elige la más cercana (South America si está disponible, si no `us-east-1`)
4. Espera ~2 minutos a que el proyecto se cree

---

## PASO 2 — Obtener las credenciales

1. Ve a **Settings → API** (en el sidebar izquierdo)
2. Copia estos valores:

```
Project URL:  https://xxxxxxxxxxxx.supabase.co
anon key:     eyJhbGci...
```

3. Abre el archivo `.env` en tu proyecto y pégalos:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   ← (este va en Settings → API → service_role, NUNCA exponerlo al cliente)
```

---

## PASO 3 — Ejecutar el Schema SQL

1. En el panel de Supabase, ve a **SQL Editor** (ícono de <> en sidebar)
2. Haz clic en **"New query"**
3. Abre el archivo `database/schema.sql` de tu proyecto
4. Copia **todo el contenido** y pégalo en el editor de Supabase
5. Haz clic en **"Run"** (o Ctrl+Enter)
6. Verifica que aparezca: `Success. No rows returned`

---

## PASO 4 — Crear el primer usuario Admin

1. En Supabase, ve a **Authentication → Users**
2. Haz clic en **"Add user"** → **"Create new user"**
3. Ingresa:
   - Email: `admin@tiasarita.com`
   - Password: (una contraseña segura)
4. Haz clic en **"Create User"**
5. Copia el `UUID` que aparece en la tabla de usuarios
6. Ahora ve a **SQL Editor** y ejecuta este query (reemplaza el UUID y el sucursal_id):

```sql
-- Primero obtén el ID de la sucursal principal
SELECT id FROM sucursales LIMIT 1;

-- Luego actualiza el perfil del admin (reemplaza los valores)
UPDATE perfiles SET
    nombre      = 'Admin',
    apellido    = 'General',
    rol         = 'admin',
    sucursal_id = '<UUID_sucursal_aquí>',
    activo      = TRUE
WHERE id = '<UUID_usuario_aquí>';
```

---

## PASO 5 — Verificar las tablas creadas

En Supabase ve a **Table Editor** y confirma que existen estas tablas:
- ✅ `sucursales`
- ✅ `perfiles`
- ✅ `categorias`
- ✅ `productos`
- ✅ `turnos`
- ✅ `ventas`
- ✅ `detalle_ventas`
- ✅ `proveedores`
- ✅ `insumos`
- ✅ `compras`
- ✅ `detalle_compras`
- ✅ `movimientos_caja`
- ✅ `configuracion_sistema`

---

## PASO 6 — Verificar datos semilla (SEED)

Ejecuta en SQL Editor:
```sql
SELECT * FROM sucursales;
SELECT * FROM categorias;
SELECT * FROM configuracion_sistema;
```
Deben mostrar los datos iniciales cargados automáticamente.

---

## Resumen de Seguridad Implementada (RLS)

| Tabla | Cajero | Supervisor | Admin |
|---|---|---|---|
| `perfiles` | Solo su propio | Todos (lectura) | CRUD completo |
| `ventas` | Solo sus ventas | Ver todas | Ver + anular |
| `turnos` | Solo sus turnos | Ver todos | CRUD completo |
| `compras` | ❌ Sin acceso | Ver todas | CRUD completo |
| `insumos` | Solo lectura | Ver todos | CRUD completo |
| `proveedores` | ❌ Sin acceso | Ver todos | CRUD completo |
| `configuracion_sistema` | Solo lectura | Solo lectura | CRUD completo |

