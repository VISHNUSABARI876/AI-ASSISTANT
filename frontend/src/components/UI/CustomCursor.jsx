import { useEffect, useState, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [ripples, setRipples] = useState([])
  const [isHovered, setIsHovered] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let animFrameId

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`
      }

      // Check if hovering interactive element
      const target = e.target
      const isInteractive = target.closest('a, button, input, textarea, [role="button"], select, .card-hover, .glass-card-interactive')
      setIsHovered(!!isInteractive)
    }

    const onMouseDown = (e) => {
      setIsClicking(true)
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY }
      setRipples((prev) => [...prev.slice(-4), newRipple])
    }

    const onMouseUp = () => setIsClicking(false)

    // Smooth Ring Animation (Lerp)
    const render = () => {
      ringX += (mouseX - ringX) * 0.18
      ringY += (mouseY - ringY) * 0.18

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      }

      animFrameId = requestAnimationFrame(render)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    render()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      cancelAnimationFrame(animFrameId)
    }
  }, [])

  // Hide ripples after animation duration
  useEffect(() => {
    if (ripples.length === 0) return
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1))
    }, 600)
    return () => clearTimeout(timer)
  }, [ripples])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Neon Cursor Center Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75 ${
          isClicking ? 'w-2 h-2 bg-accent-400 shadow-glow-lg' : isHovered ? 'w-3 h-3 bg-secondary-400 shadow-glow-cyan' : 'w-2.5 h-2.5 bg-primary-400 shadow-glow'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Trailing Aura Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-400/40 backdrop-blur-[1px] transition-all duration-200 ${
          isHovered
            ? 'w-10 h-10 border-accent-400/70 bg-accent-500/10 shadow-glow'
            : isClicking
            ? 'w-6 h-6 border-secondary-400 bg-secondary-500/20'
            : 'w-8 h-8 bg-primary-500/5'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Click Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary-400/80 bg-secondary-400/20 animate-ping"
          style={{
            left: r.x,
            top: r.y,
            width: '28px',
            height: '28px',
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  )
}
