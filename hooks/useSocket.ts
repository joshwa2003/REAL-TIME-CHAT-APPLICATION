"use client"

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

export interface Message {
  id: number
  text: string
  user: string
  timestamp: string
  type?: 'message' | 'system'
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  useEffect(() => {
    const socketInstance = io()

    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to server')
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    })

    socketInstance.on('previous-messages', (previousMessages: Message[]) => {
      setMessages(previousMessages)
    })

    socketInstance.on('receive-message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('user-typing', (data: { user: string }) => {
      setTypingUsers(prev => [...prev.filter(user => user !== data.user), data.user])
    })

    socketInstance.on('user-stop-typing', (data: { user: string }) => {
      setTypingUsers(prev => prev.filter(user => user !== data.user))
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const joinChat = (username: string) => {
    if (socket) {
      socket.emit('user-join', { username })
    }
  }

  const sendMessage = (text: string, user: string) => {
    if (socket) {
      socket.emit('send-message', { text, user })
    }
  }

  const startTyping = (user: string) => {
    if (socket) {
      socket.emit('typing', { user })
    }
  }

  const stopTyping = (user: string) => {
    if (socket) {
      socket.emit('stop-typing', { user })
    }
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
    }
  }

  return {
    socket,
    messages,
    isConnected,
    typingUsers,
    joinChat,
    sendMessage,
    startTyping,
    stopTyping,
    disconnect
  }
}
