import { useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

export default function GlobalBackground() {
  const { isDark } = useTheme()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    let mouseX = width / 2
    let mouseY = height / 2

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    const isDarkMode = document.documentElement.classList.contains('dark')

    const PARTICLE_COUNT = 35
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1,
      color: isDarkMode
        ? Math.random() > 0.5 ? '#6366F1' : Math.random() > 0.5 ? '#8B5CF6' : '#06B6D4'
        : Math.random() > 0.5 ? '#6366F180' : Math.random() > 0.5 ? '#8B5CF680' : '#06B6D480',
      alpha: isDarkMode ? Math.random() * 0.5 + 0.15 : Math.random() * 0.15 + 0.05,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p1 = particles[i]

        p1.x += p1.vx
        p1.y += p1.vy

        if (p1.x < 0 || p1.x > width) p1.vx *= -1
        if (p1.y < 0 || p1.y > height) p1.vy *= -1

        const dxMouse = mouseX - p1.x
        const dyMouse = mouseY - p1.y
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)

        if (distMouse < 180) {
          p1.x -= (dxMouse / distMouse) * 0.3
          p1.y -= (dyMouse / distMouse) * 0.3
        }

        ctx.beginPath()
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2)
        ctx.fillStyle = p1.color
        ctx.globalAlpha = p1.alpha
        if (isDarkMode) {
          ctx.shadowBlur = 10
          ctx.shadowColor = p1.color
        }
        ctx.fill()
        ctx.shadowBlur = 0

        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 130) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = isDarkMode ? '#6366F1' : '#6366F160'
            ctx.globalAlpha = (1 - dist / 130) * (isDarkMode ? 0.15 : 0.06)
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isDark])

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${isDark ? 'bg-[#050816]' : 'bg-slate-50'}`}>
      {isDark && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-primary-600/20 via-accent-500/10 to-transparent blur-[120px] animate-aurora" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tl from-secondary-500/15 via-primary-700/10 to-transparent blur-[140px] animate-aurora [animation-delay:-5s]" />
          <div className="absolute top-[30%] left-[35%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-r from-accent-600/15 to-primary-600/10 blur-[130px] animate-pulse-slow" />
        </>
      )}

      <div className={`absolute inset-0 bg-grid-pattern ${isDark ? 'opacity-40' : 'opacity-10'}`} />

      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  )
}
