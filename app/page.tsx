"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle, LogOut } from "lucide-react"
import { useSocket } from "@/hooks/useSocket"
import { ChatMessage } from "@/components/chat-message"

export default function ChatApp() {
  const [inputMessage, setInputMessage] = useState("")
  const [username, setUsername] = useState("")
  const [isUsernameSet, setIsUsernameSet] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const { messages, isConnected, typingUsers, joinChat, sendMessage, startTyping, stopTyping, disconnect } = useSocket()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (inputMessage.trim() && username.trim()) {
      sendMessage(inputMessage.trim(), username)
      setInputMessage("")
      handleStopTyping()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value)
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
      startTyping(username)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 1000)
  }

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false)
      stopTyping(username)
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!isUsernameSet) {
        handleUsernameSubmit()
      } else {
        handleSendMessage()
      }
    }
  }

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setIsUsernameSet(true)
      joinChat(username.trim())
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsUsernameSet(false)
    setUsername("")
    setInputMessage("")
  }

  if (!isUsernameSet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-6">
            <MessageCircle className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Chat</h1>
            <p className="text-gray-600 mt-2">Enter your username to start chatting</p>
          </div>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
            <Button 
              onClick={handleUsernameSubmit}
              className="w-full"
              disabled={!username.trim()}
            >
              Join Chat
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Chat App</h1>
              <p className="text-sm text-gray-500">Welcome, {username}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-hidden max-w-4xl mx-auto w-full p-4">
        <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No messages yet. Start the conversation!</p>
                  <p className="text-sm mt-2">Open this page in another browser tab to chat with yourself!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    text={message.text}
                    user={message.user}
                    timestamp={message.timestamp}
                    isCurrentUser={message.user === username}
                    type={message.type}
                  />
                ))
              )}
              
              {/* Typing indicators */}
              {typingUsers.filter(user => user !== username).length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 rounded-lg p-3 max-w-[70%]">
                    <p className="text-sm text-gray-600">
                      {typingUsers.filter(user => user !== username).join(', ')} 
                      {typingUsers.filter(user => user !== username).length === 1 ? ' is' : ' are'} typing...
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="flex-shrink-0 max-w-4xl mx-auto w-full p-4">
        <div className="bg-white rounded-lg shadow-sm border-t">
          <div className="p-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={!isConnected}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !isConnected}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
