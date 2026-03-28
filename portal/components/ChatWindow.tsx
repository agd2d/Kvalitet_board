'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Message } from '@/lib/types'

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'I dag'
  if (d.toDateString() === yesterday.toDateString()) return 'I går'
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'long' })
}

interface ChatWindowProps {
  taskId: string
  userId: string
  taskTitle: string
}

export default function ChatWindow({ taskId, userId, taskTitle }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    // Load initial messages
    supabase
      .from('messages')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[])
        setTimeout(scrollToBottom, 50)
      })

    // Subscribe to realtime
    const channel = supabase
      .channel(`chat:${taskId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `task_id=eq.${taskId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
          setTimeout(scrollToBottom, 50)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [taskId, supabase, scrollToBottom])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const content = newMessage.trim()
    if (!content || sending) return

    setSending(true)
    setNewMessage('')

    await supabase.from('messages').insert({
      task_id: taskId,
      sender_id: userId,
      sender_type: 'customer',
      content,
    })

    setSending(false)
  }

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = []
  messages.forEach(msg => {
    const date = formatDate(msg.created_at)
    const last = groupedMessages[groupedMessages.length - 1]
    if (last && last.date === date) {
      last.msgs.push(msg)
    } else {
      groupedMessages.push({ date, msgs: [msg] })
    }
  })

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="font-semibold text-gray-800 text-sm">💬 {taskTitle}</p>
        <p className="text-xs text-gray-500">Hvidbjerg Service</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            <p>Ingen beskeder endnu.</p>
            <p className="mt-1">Start samtalen herunder.</p>
          </div>
        )}

        {groupedMessages.map(group => (
          <div key={group.date}>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 whitespace-nowrap">{group.date}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-2">
              {group.msgs.map(msg => {
                const isOwn = msg.sender_id === userId
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs sm:max-w-sm lg:max-w-md`}>
                      {!isOwn && (
                        <p className="text-xs text-gray-500 mb-0.5 ml-1">Hvidbjerg Service</p>
                      )}
                      <div className={`px-3.5 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <p className={`text-xs text-gray-400 mt-0.5 ${isOwn ? 'text-right' : 'text-left'} mx-1`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Skriv en besked..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}
