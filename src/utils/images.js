const approximateBytes = dataUrl => Math.ceil((dataUrl.split(',')[1]?.length || 0) * 0.75)

export async function prepareBannerImage(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Choose an image file for the banner.')
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('This image could not be opened. Try a JPG or PNG file.'))
      element.src = objectUrl
    })
    const scale = Math.min(1, 1400 / image.width, 700 / image.height)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
    let quality = 0.82
    let result = canvas.toDataURL('image/jpeg', quality)
    while (approximateBytes(result) > 240000 && quality > 0.42) {
      quality -= 0.08
      result = canvas.toDataURL('image/jpeg', quality)
    }
    if (approximateBytes(result) > 280000) throw new Error('This image is still too large. Choose a smaller banner image.')
    return result
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
