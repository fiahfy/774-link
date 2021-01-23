import React from 'react'

export const useNow = (interval: number): Date => {
  const [now, setNow] = React.useState(new Date())
  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, interval)
    return () => {
      clearInterval(timer)
    }
  }, [interval, now, setNow])
  return now
}
