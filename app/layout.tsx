import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tía Sarita — Sistema de Gestión',
  description: 'Sistema de compra y venta para restaurante Tía Sarita. Sabor que une familias.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const isLight = localStorage.getItem('theme') === 'light' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: light)').matches);
                if (isLight) {
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
