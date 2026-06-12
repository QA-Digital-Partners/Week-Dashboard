import './globals.css'

export const metadata = {
  title: 'QA Digital — Project Tracker',
  description: 'Dashboard de seguimiento de proyectos QA Digital Ads',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}