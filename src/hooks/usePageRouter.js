import { useState } from 'react'

export function usePageRouter(initialPage = 'home') {
  const [page, navigate] = useState(initialPage)
  return { page, navigate }
}
