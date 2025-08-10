import { useState, useEffect } from 'react'

interface BreakpointConfig {
  mobile: number
  tablet: number
  desktop: number
  wide: number
}

const defaultBreakpoints: BreakpointConfig = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440
}

export function useResponsive(breakpoints: BreakpointConfig = defaultBreakpoints) {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = screenSize.width < breakpoints.tablet
  const isTablet = screenSize.width >= breakpoints.tablet && screenSize.width < breakpoints.desktop
  const isDesktop = screenSize.width >= breakpoints.desktop && screenSize.width < breakpoints.wide
  const isWide = screenSize.width >= breakpoints.wide

  const currentBreakpoint = isMobile ? 'mobile' : isTablet ? 'tablet' : isDesktop ? 'desktop' : 'wide'

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    currentBreakpoint,
    isTouch: typeof window !== 'undefined' && 'ontouchstart' in window
  }
}