import { useCallback, useEffect, useRef, useState } from 'react'

const API_BASE = 'http://localhost:8000'

export default function Chat() {
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', department: '', topic: '', issue: '' })
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const pollRef = useRef(null)

  useEffect(() => {
    const u = localStorage.getItem('auth_user')
    if (u) {
      try { setUser(JSON.parse(u)) } catch {}
    }
  }, [])

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [])

  const fetchThreads = useCallback(async () => {
    const res = await fetch(`${API_BASE}/threads`, { headers: { ...authHeaders() } })
    const data = await res.json()
    setThreads(data.threads || [])
  }, [authHeaders])

  const createThread = useCallback(async () => {
    setError('')
    if (!form.issue.trim()) {
      setError('Vui lòng nhập "Vấn đề cần hỗ trợ".')
      return
    }
    setCreating(true)
    try {
      const res = await fetch(`${API_BASE}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          student_name: form.name || undefined,
          department: form.department || undefined,
          topic: form.topic || undefined,
          issue: form.issue || undefined,
        })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setActiveThread(data.id)
      await fetchThreads()
      setForm({ name: '', department: '', topic: '', issue: '' })
    } catch (e) {
      console.error('Create thread failed', e)
      setError('Không tạo được cuộc trò chuyện. Vui lòng thử lại.')
    } finally {
      setCreating(false)
    }
  }, [fetchThreads, form, authHeaders])

  const fetchMessages = useCallback(async (threadId) => {
    if (!threadId) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/threads/${threadId}/messages`, { headers: { ...authHeaders() } })
      const data = await res.json()
      setMessages(data.messages || [])
    } finally {
      setLoading(false)
    }
  }, [authHeaders])

  const startPolling = useCallback((threadId) => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => fetchMessages(threadId), 1000)
  }, [fetchMessages])

  useEffect(() => { fetchThreads() }, [fetchThreads])

  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread)
      startPolling(activeThread)
      return () => { if (pollRef.current) clearInterval(pollRef.current) }
    }
  }, [activeThread, fetchMessages, startPolling])

  const sendMessage = useCallback(async () => {
    if (!activeThread || !input.trim()) return
    const text = input.trim()
    setInput('')
    await fetch(`${API_BASE}/threads/${activeThread}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ text, sender: 'student' })
    })
    await fetchMessages(activeThread)
  }, [activeThread, input, fetchMessages, authHeaders])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    window.location.href = '/login'
  }, [])

  return (
    <div className="chat-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Phòng QLSV</h2>
          <button onClick={createThread} disabled={creating}>{creating ? 'Đang tạo...' : 'Bắt đầu'}</button>
        </div>
        <div className="login">
          {user ? (
            <div className="userbox">
              <div>Đăng nhập: <strong>{user.full_name}</strong></div>
              <div>Vai trò: <code>{user.role}</code>{user.department ? ` · ${user.department}` : ''}</div>
              <button onClick={logout}>Đăng xuất</button>
            </div>
          ) : null}
        </div>
        <div className="prechat">
          <input placeholder="Họ tên sinh viên" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
          <input placeholder="Khoa/Phòng" value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))} />
          <input placeholder="Chủ đề" value={form.topic} onChange={e=>setForm(p=>({...p,topic:e.target.value}))} />
          <textarea placeholder="Vấn đề cần hỗ trợ" value={form.issue} onChange={e=>setForm(p=>({...p,issue:e.target.value}))} rows={3} />
          {error && <div className="error" role="alert">{error}</div>}
        </div>
        <ul className="thread-list">
          {threads.map(t => (
            <li key={t.id} className={activeThread === t.id ? 'active' : ''} onClick={() => setActiveThread(t.id)}>
              <div className="thread-title">{t.title}</div>
              <div className="thread-meta">{new Date(t.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </aside>
      <main className="chat">
        {activeThread ? (
          <>
            <div className="messages">
              {messages.map(m => (
                <div key={m.id} className={`msg msg-${m.sender}`}>
                  <div className="meta">
                    <span className="sender">{m.sender}</span>
                    <span className="time">{new Date(m.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="bubble">{m.text}</div>
                </div>
              ))}
              {loading && <div className="loading">Đang tải...</div>}
            </div>
            <div className="composer">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập ý kiến của bạn..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Gửi</button>
            </div>
          </>
        ) : (
          <div className="empty">
            Hãy tạo cuộc trò chuyện mới để bắt đầu trao đổi với quản lý sinh viên.
          </div>
        )}
      </main>
    </div>
  )
}
