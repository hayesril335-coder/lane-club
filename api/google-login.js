export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).send('Method not allowed')
    return
  }

  const credential = request.body?.credential
  if (typeof credential !== 'string' || credential.split('.').length !== 3) {
    response.status(400).send('Google did not return a valid credential.')
    return
  }

  const token = JSON.stringify(credential).replaceAll('<', '\\u003c')
  response.setHeader('Content-Type', 'text/html; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.status(200).send(`<!doctype html><html><head><meta name="referrer" content="no-referrer"><title>Signing in to Lane Club</title></head><body><p>Signing in to Lane Club…</p><script>sessionStorage.setItem('lane-club-google-id-token',${token});location.replace('/');</script></body></html>`)
}
