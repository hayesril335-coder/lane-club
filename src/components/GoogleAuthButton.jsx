import { useEffect, useRef } from 'react'

const clientId = '525275878646-jha0m33o4p6ter0gie1shlcgr4n8hqg5.apps.googleusercontent.com'

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-lane-club-google-auth]')
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', () => reject(new Error('Google sign-in could not load.')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.laneClubGoogleAuth = 'true'
    script.addEventListener('load', resolve, { once: true })
    script.addEventListener('error', () => reject(new Error('Google sign-in could not load.')), { once: true })
    document.head.appendChild(script)
  })
}

export default function GoogleAuthButton({ disabled = false, onCredential, onError, role = 'member' }) {
  const container = useRef(null)

  useEffect(() => {
    let active = true
    loadGoogleIdentity().then(() => {
      if (!active || !container.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: response => onCredential(response.credential),
        ux_mode: 'redirect',
        login_uri: 'https://lane-club.vercel.app/api/google-login',
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
        itp_support: true,
      })
      container.current.replaceChildren()
      localStorage.setItem('lane-club-google-role', role)
      window.google.accounts.id.renderButton(container.current, {
        type: 'standard', theme: 'outline', size: 'large', text: 'continue_with',
        shape: 'rectangular', width: Math.min(400, Math.max(240, window.innerWidth - 72)),
      })
      // The account prompt works without opening a separate window, which is
      // important on iPhone browsers and other clients that block popups.
      window.google.accounts.id.prompt()
    }).catch(onError)
    return () => { active = false }
  }, [onCredential, onError, role])

  return <div className={`google-identity-button${disabled ? ' disabled' : ''}`} ref={container} aria-disabled={disabled} />
}
