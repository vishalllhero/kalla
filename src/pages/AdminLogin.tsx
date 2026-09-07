import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.role !== 'admin') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        throw new Error('This account does not have admin access.')
      }
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-obsidian px-5">
      <form onSubmit={submit} className="w-full max-w-md border border-ivory/10 bg-elevated p-8 shadow-2xl sm:p-12">
        <div className="mb-8 flex items-center gap-3 text-gold"><ShieldCheck size={22} /><span className="text-[10px] tracking-[0.25em]">KALAA ADMIN</span></div>
        <h1 className="font-display text-4xl text-ivory">Command centre</h1>
        <p className="mt-2 text-sm text-muted">Sign in with an authorised admin account.</p>
        {error && <p className="mt-6 border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
        <label className="mt-8 block text-[10px] uppercase tracking-[0.16em] text-muted">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full border border-ivory/10 bg-obsidian px-4 py-3 text-ivory outline-none focus:border-gold" /></label>
        <label className="mt-5 block text-[10px] uppercase tracking-[0.16em] text-muted">Password<input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full border border-ivory/10 bg-obsidian px-4 py-3 text-ivory outline-none focus:border-gold" /></label>
        <button disabled={loading} className="mt-8 w-full bg-gold px-5 py-4 text-[10px] font-semibold tracking-[0.2em] text-obsidian disabled:opacity-50">{loading ? 'SIGNING IN…' : 'SIGN IN'}</button>
        <Link to="/" className="mt-6 block text-center text-xs text-muted hover:text-gold">Return to KALAA</Link>
      </form>
    </main>
  )
}
