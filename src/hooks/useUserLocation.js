import { useEffect, useState } from 'react'
import { locationErrorMessage } from '../utils/location'

export function useUserLocation(enabled) {
  const [location, setLocation] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      setError('')
      return undefined
    }
    if (!navigator.geolocation) {
      setStatus('error')
      setError(locationErrorMessage())
      return undefined
    }
    setStatus('locating')
    setError('')
    const watchId = navigator.geolocation.watchPosition(position => {
      setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, updatedAt: position.timestamp })
      setStatus('tracking')
      setError('')
    }, geolocationError => {
      setStatus('error')
      setError(locationErrorMessage(geolocationError))
    }, { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 })
    return () => navigator.geolocation.clearWatch(watchId)
  }, [enabled])

  return { location, status, error }
}
