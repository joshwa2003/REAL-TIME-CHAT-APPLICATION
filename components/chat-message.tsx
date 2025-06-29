interface ChatMessageProps {
  text: string
  user: string
  timestamp: string
  isCurrentUser: boolean
  type?: 'message' | 'system'
}

export function ChatMessage({ text, user, timestamp, isCurrentUser, type = 'message' }: ChatMessageProps) {
  if (type === 'system') {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          <span>{text}</span>
          <span className="ml-2 text-xs opacity-75">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isCurrentUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold">{user}</span>
          <span className="text-xs opacity-50">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="mt-1">{text}</p>
      </div>
    </div>
  )
}
