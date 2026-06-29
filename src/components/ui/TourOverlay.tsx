'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, X, Sparkles } from 'lucide-react'

interface TourStep {
  title: string
  description: string
  highlightSelector?: string
  position: 'center' | 'bottom' | 'sidebar' | 'terminal' | 'wire'
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Your Amigo',
    description: 'Let\'s take a quick 1-minute guided tour to show you how to decompose and validate any startup concept using our autonomous agent fleet.',
    position: 'center',
  },
  {
    title: 'The Dashboard Hub',
    description: 'This is your central control center. Stat cards here monitor your active missions, completed intelligence reports, API wire requests, and crawler memory signals.',
    position: 'center', // fallback to highlight metrics
  },
  {
    title: 'Sidebar Navigation',
    description: 'Assign new missions in the "Missions" tab, browse raw scraped facts in the "Memory" tab, review transcripts in the "Voice" tab, or adjust configurations in the "Settings" tab.',
    position: 'sidebar',
  },
  {
    title: 'Anakin Wire Credentials',
    description: 'Go to the "Wire" page to enter your Anakin API Key. This provides the crawlers with live search access. New visitors get 2 free trial runs automatically!',
    position: 'wire',
  },
  {
    title: 'Real-Time Telemetry Terminal',
    description: 'Click the terminal header at the bottom of the page to expand the console. It streams live crawler logs, agent reasoning steps, and network requests.',
    position: 'terminal',
  },
  {
    title: 'Command Palette',
    description: 'Hit Ctrl+K (or Cmd+K) anywhere on the platform to search, execute actions, or jump between modules in milliseconds. You\'re ready to build!',
    position: 'center',
  },
]

export default function TourOverlay() {
  const { isTourActive, tourStep, setTourActive, setTourStep } = useStore()
  const router = useRouter()

  if (!isTourActive) return null

  const currentStep = TOUR_STEPS[tourStep]

  const handleNext = () => {
    if (tourStep === 2) {
      router.push('/wire')
    } else if (tourStep === 3) {
      router.push('/dashboard')
    }
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(tourStep + 1)
    } else {
      setTourActive(false)
    }
  }

  const handleBack = () => {
    if (tourStep > 0) {
      if (tourStep === 3) {
        router.push('/dashboard')
      }
      setTourStep(tourStep - 1)
    }
  }

  const handleClose = () => {
    setTourActive(false)
  }

  const getPositionStyles = () => {
    switch (currentStep.position) {
      case 'sidebar':
        return {
          left: '260px',
          top: '30%',
          transform: 'translateY(-50%)',
        }
      case 'wire':
        return {
          left: '280px',
          top: '150px',
        }
      case 'terminal':
        return {
          left: '50%',
          bottom: '100px',
          transform: 'translateX(-50%)',
        }
      case 'center':
      default:
        return {
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }
    }
  }

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.08)',
          zIndex: 99999,
          pointerEvents: 'auto',
        }}
      >
        {/* Pulsing Target Highlight Indicator (if not center) */}
        {currentStep.position !== 'center' && (
          <div
            style={{
              position: 'absolute',
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'rgb(245, 158, 11)',
              boxShadow: '0 0 0 8px rgba(245, 158, 11, 0.3)',
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              ...(() => {
                if (currentStep.position === 'sidebar') return { left: '20px', top: '150px' }
                if (currentStep.position === 'wire') return { left: '20px', top: '350px' }
                if (currentStep.position === 'terminal') return { left: '50%', bottom: '30px', transform: 'translateX(-50%)' }
                return {}
              })(),
            }}
          />
        )}

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            width: '100%',
            maxWidth: 380,
            background: 'rgba(25, 25, 25, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            ...getPositionStyles(),
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} style={{ color: 'rgb(245, 158, 11)' }} />
              <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                {currentStep.title}
              </h3>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-3)',
                cursor: 'pointer',
                padding: 4,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5, margin: 0, fontFamily: 'Inter, sans-serif' }}>
            {currentStep.description}
          </p>

          {/* Footer & Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
              Step {tourStep + 1} of {TOUR_STEPS.length}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {tourStep > 0 && (
                <button
                  onClick={handleBack}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: 'var(--text-2)',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.2s',
                  }}
                >
                  <ArrowLeft size={12} /> Back
                </button>
              )}

              <button
                onClick={handleNext}
                style={{
                  background: 'rgb(245, 158, 11)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  color: '#000',
                  fontSize: 11.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.2s',
                }}
              >
                {tourStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
