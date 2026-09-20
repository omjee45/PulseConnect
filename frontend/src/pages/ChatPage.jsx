import { useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import { conversationsApi } from '@/services/conversations.api'
import useAuthStore from '@/store/authStore'
import { toast } from 'sonner'
import { Send, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8800'

let globalSocket = null

// useChatSocket: singleton socket to prevent React 18 Strict Mode double-connection warnings
function useChatSocket({ onMessage, onOnlineUsers, onTyping, onStopTyping }) {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      })

      globalSocket.on('connect', () => console.log('✅ Socket connected'))
      globalSocket.on('connect_error', (err) => {
        console.error('Socket auth error:', err.message)
        toast.error('Real-time connection failed. Try refreshing.')
      })
    }

    const socket = globalSocket
    socketRef.current = socket

    socket.on('receiveMessage', onMessage)
    socket.on('onlineUsers', onOnlineUsers)
    socket.on('userTyping', onTyping)
    socket.on('userStopTyping', onStopTyping)

    return () => {
      socket.off('receiveMessage', onMessage)
      socket.off('onlineUsers', onOnlineUsers)
      socket.off('userTyping', onTyping)
      socket.off('userStopTyping', onStopTyping)
      // Note: We intentionally do NOT call socket.disconnect() here.
      // This allows the socket to survive React 18 Strict Mode's unmount/remount cycle
      // without throwing WebSocket closure warnings.
    }
  }, [onMessage, onOnlineUsers, onTyping, onStopTyping])

  const sendMessage = useCallback((data) => {
    socketRef.current?.emit('sendMessage', data)
  }, [])

  const emitTyping = useCallback((data) => {
    socketRef.current?.emit('typing', data)
  }, [])

  const emitStopTyping = useCallback((data) => {
    socketRef.current?.emit('stopTyping', data)
  }, [])

  return { sendMessage, emitTyping, emitStopTyping }
}

export default function ChatPage() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [typingUser, setTypingUser] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const typingTimeout = useRef(null)
  const bottomRef = useRef(null)

  const handleReceiveMessage = useCallback((msg) => {
    setMessages(prev => {
      if (prev.find(m => m._id === msg._id)) return prev
      return [...prev, msg]
    })
    setConversations(prev => prev.map(c =>
      c._id === msg.conversationId ? { ...c, lastMessage: msg.text } : c
    ))
  }, [])

  const { sendMessage, emitTyping, emitStopTyping } = useChatSocket({
    onMessage: handleReceiveMessage,
    onOnlineUsers: setOnlineUsers,
    onTyping: ({ conversationId, userId }) => {
      if (selectedConv?._id === conversationId) setTypingUser(userId)
    },
    onStopTyping: () => setTypingUser(null),
  })

  // Load conversations
  useEffect(() => {
    conversationsApi.getAll()
      .then(r => setConversations(r.data.conversations))
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoadingConvs(false))
  }, [])

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConv) return
    setLoadingMsgs(true)
    conversationsApi.getMessages(selectedConv._id)
      .then(r => setMessages(r.data.messages))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoadingMsgs(false))
  }, [selectedConv])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const otherParticipant = (conv) => conv.participants.find(p => p._id !== user?.id)

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim() || !selectedConv) return
    const receiverId = otherParticipant(selectedConv)?._id
    sendMessage({ conversationId: selectedConv._id, text: text.trim(), receiverId })
    setText('')
    emitStopTyping({ conversationId: selectedConv._id, receiverId })
  }

  const handleTyping = (e) => {
    setText(e.target.value)
    if (!selectedConv) return
    const receiverId = otherParticipant(selectedConv)?._id
    emitTyping({ conversationId: selectedConv._id, receiverId })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      emitStopTyping({ conversationId: selectedConv._id, receiverId })
    }, 1500)
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-white">
      {/* Sidebar */}
      <aside className="w-full sm:w-80 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-500" />
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = otherParticipant(conv)
              const isOnline = onlineUsers.includes(other?._id)
              return (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConv(conv)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left',
                    selectedConv?._id === conv._id && 'bg-primary-50 border-r-2 border-primary-500'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-600 text-sm">{other?.fullName?.charAt(0)}</span>
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-sm truncate">{other?.fullName}</div>
                    <div className="text-xs text-slate-500 truncate">{conv.lastMessage || 'No messages yet'}</div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* Chat area */}
      <main className="hidden sm:flex flex-1 flex-col">
        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-medium">Select a conversation</p>
            <p className="text-sm mt-1 opacity-70">to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">
                  {otherParticipant(selectedConv)?.fullName?.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  {otherParticipant(selectedConv)?.fullName}
                </div>
                <div className="text-xs text-slate-500">
                  {onlineUsers.includes(otherParticipant(selectedConv)?._id)
                    ? <span className="text-green-500">● Online</span>
                    : 'Offline'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
              {loadingMsgs ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-3/4" />)}
                </div>
              ) : messages.map(msg => {
                const isMe = msg.sender._id === user?.id || msg.sender === user?.id
                return (
                  <div key={msg._id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm shadow-sm',
                      isMe
                        ? 'bg-primary-500 text-white rounded-tr-sm'
                        : 'bg-white text-slate-900 rounded-tl-sm border border-slate-200'
                    )}>
                      {msg.text}
                    </div>
                  </div>
                )
              })}
              {typingUser && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs text-slate-400 italic shadow-sm">
                    typing...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex gap-3">
              <Input
                value={text}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1"
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={!text.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
