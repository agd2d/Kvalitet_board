import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Task } from '@/lib/types'
import ChatWindow from '@/components/ChatWindow'
import Link from 'next/link'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>
}) {
  const { task: taskParam } = await searchParams
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  const allTasks = (tasks ?? []) as Pick<Task, 'id' | 'title' | 'status'>[]
  const activeTaskId = taskParam ?? allTasks[0]?.id
  const activeTask = allTasks.find(t => t.id === activeTaskId)

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Sidebar: task list */}
      <div className="w-56 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-y-auto">
        <div className="px-3 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Opgaver</p>
        </div>
        {allTasks.length === 0 ? (
          <p className="text-xs text-gray-400 p-3">Ingen opgaver endnu</p>
        ) : (
          allTasks.map(task => (
            <Link
              key={task.id}
              href={`/chat?task=${task.id}`}
              className={`block px-3 py-2.5 text-sm border-b border-gray-50 transition-colors ${
                task.id === activeTaskId
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <p className="truncate">{task.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{task.status}</p>
            </Link>
          ))
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 min-w-0">
        {activeTask ? (
          <ChatWindow
            taskId={activeTask.id}
            userId={user.id}
            taskTitle={activeTask.title}
          />
        ) : (
          <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p>Vælg en opgave for at se beskeder</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
