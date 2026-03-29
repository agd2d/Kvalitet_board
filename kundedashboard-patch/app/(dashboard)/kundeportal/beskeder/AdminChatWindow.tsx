'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

type Message = {
  id: string
  content: string
  sender_type: string
  sender_id: string
  created_at: string
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
}

export default function AdminChatWindow({
  taskId,
  adminSenderId,
  supabaseUrl,
  supabaseAnonKey,
}: {
  taskId: string
  adminSenderId: string
  supabaseUrl: string
  supabaseAnonKey: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    fetch(`/api/portal/messages?task_id=${taskId}`)
      .then(r => r.json())
      .then(data => {
        setMessages(data.messages ?? [])
        setTimeout(scrollToBottom, 50)
      })
  }, [taskId, scrollToBottom])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const content = newMsg.trim()
    if (!content || sending) return
    setSending(true)
    setNewMsg('')
    const res = await fetch('/api/portal/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, content, sender_id: adminSenderId, sender_type: 'admin' }),
    })
    if (res.ok) {
      const { message } = await res.json()
      setMessages(prev => [...prev, message])
      setTimeout(scrollToBottom, 50)
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="font-semibold text-gray-800 text-sm">💬 Svar til kunde</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Ingen beskeder endnu</p>
        )}
        {messages.map(msg => {
          const isAdmin = msg.sender_type === 'admin'
          return (
            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-xs sm:max-w-sm">
                {!isAdmin && <p className="text-xs text-gray-400 mb-0.5 ml-1">Kunde</p>}
                <div className={`px-3.5 py-2 rounded-2xl text-sm ${
                  isAdmin ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <p className={`text-xs text-gray-400 mt-0.5 ${isAdmin ? 'text-right' : ''} mx-1`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Skriv svar til kunde..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newMsg.trim() || sending}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}
