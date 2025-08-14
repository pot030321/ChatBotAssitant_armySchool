import { useCallback, useEffect, useState } from 'react'

const API_BASE = 'http://localhost:8000'

export default function LeadershipDashboard() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchThreads = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/leadership/threads`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setThreads(data.threads || [])
    } catch (e) {
      console.error('Fetch threads failed', e)
      setError('Không tải được danh sách đơn phiếu.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  return (
    <div className="leadership-dashboard">
      <h2>Danh sách đơn phiếu</h2>
      {loading && <div>Đang tải...</div>}
      {error && <div className="error" role="alert">{error}</div>}
      <ul>
        {threads.map((thread) => (
          <li key={thread.id}>
            <div><strong>{thread.title}</strong></div>
            <div>Loại: {thread.issue_type || 'Không xác định'}</div>
            <div>Trạng thái: {thread.status}</div>
            <div>Giao cho: {thread.assigned_to || 'Chưa giao'}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
