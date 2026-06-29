'use client'

import { motion } from 'framer-motion'

export default function AmigoOrb({ size = 120 }: { size?: number }) {
  const dots = []
  const count = 24
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const x = parseFloat((Math.cos(angle) * 32).toFixed(4))
    const y = parseFloat((Math.sin(angle) * 32).toFixed(4))
    dots.push({ x, y, delay: (i % 6) * 0.2 })
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Outer rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: 0,
          border: '1px dashed var(--accent)',
          borderRadius: '50%',
          opacity: 0.2,
        }}
      />
      
      {/* Inner morphing orb */}
      <svg
        viewBox="0 0 100 100"
        style={{
          width: '80%',
          height: '80%',
          overflow: 'visible',
        }}
      >
        <g transform="translate(50, 50)">
          {dots.map((d, i) => (
            <motion.circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={2}
              fill="var(--text)"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
                x: [d.x, d.x * 1.12, d.x],
                y: [d.y, d.y * 1.12, d.y],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: d.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
          {/* Core glow dot */}
          <motion.circle
            r={5}
            fill="var(--accent)"
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </g>
      </svg>
    </div>
  )
}
