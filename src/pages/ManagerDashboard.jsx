import { useCallback, useEffect, useState } from 'react'

const API_BASE = 'http://localhost:8000'

export default function ManagerDashboard() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [selectedThread, setSelectedThread] = useState(null)
  const [assignment, setAssignment] = useState('')

  const fetchThreads = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/manager/threads`, {
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

  const assignThread = useCallback(async () => {
    if (!selectedThread || !assignment.trim()) return
    setAssigning(true)
    try {
      const res = await fetch(`${API_BASE}/threads/${selectedThread.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ assigned_to: assignment }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      await fetchThreads()
      setSelectedThread(null)
      setAssignment('')
    } catch (e) {
      console.error('Assign thread failed', e)
      setError('Không thể giao đơn phiếu.')
    } finally {
      setAssigning(false)
    }
  }, [selectedThread, assignment, fetchThreads])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  return (
    <div className="manager-dashboard">
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
            <button onClick={() => setSelectedThread(thread)}>Giao đơn phiếu</button>
          </li>
        ))}
      </ul>
      {selectedThread && (
        <div className="assignment-form">
          <h3>Giao đơn phiếu: {selectedThread.title}</h3>
          <input
            placeholder="Phòng/Khoa/Ban"
            value={assignment}
            onChange={(e) => setAssignment(e.target.value)}
          />
          <button onClick={assignThread} disabled={assigning}>
            {assigning ? 'Đang giao...' : 'Giao đơn phiếu'}
          </button>
        </div>
      )}
    </div>
  )
}
