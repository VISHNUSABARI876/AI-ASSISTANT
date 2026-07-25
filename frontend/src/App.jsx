import { useState, useEffect } from 'react'
import Sidebar from './components/Layout/Sidebar'
import Navbar from './components/Layout/Navbar'
import GlobalBackground from './components/UI/GlobalBackground'

import CommandPalette from './components/UI/CommandPalette'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 flex relative overflow-hidden">
      {/* Global Background Particles & Aurora Mesh */}
      <GlobalBackground />

      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <main className="flex-1 overflow-auto animate-fade-in p-4 sm:p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}