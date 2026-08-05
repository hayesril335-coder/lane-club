const earthRadiusMiles = 3958.8

export function coordinatesForAlley(alley) {
  const latitude = Number(alley?.latitude ?? alley?.location?.latitude)
  const longitude = Number(alley?.longitude ?? alley?.location?.longitude)
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null
}

export function distanceBetweenMiles(origin, destination) {
  if (!origin || !destination) return null
  const radians = degrees => degrees * Math.PI / 180
  const latitudeDelta = radians(destination.latitude - origin.latitude)
  const longitudeDelta = radians(destination.longitude - origin.longitude)
  const originLatitude = radians(origin.latitude)
  const destinationLatitude = radians(destination.latitude)
  const haversine = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function locationErrorMessage(error) {
  if (error?.code === 1) return 'Location access is off. Allow location for Lane Club in your browser settings, then choose Near me again.'
  if (error?.code === 2) return 'Your current location could not be determined. Check your device location settings and try again.'
  if (error?.code === 3) return 'Finding your location took too long. Please choose Near me again.'
  return 'Location services are not available in this browser.'
}
