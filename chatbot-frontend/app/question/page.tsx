'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { MessageSquare, Send, Loader2 } from 'lucide-react'

interface Question {
  question: string
  correct_answer: string
}

interface Message {
  text: string
  sender: 'user' | 'ai'
  id: number
  isQuestion?: boolean
}

export default function QuestionPage() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! What topic would you like to be questioned on?", sender: 'ai', id: Date.now() }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://iitmrsh-2.onrender.com"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchQuestions = async (topic: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate_questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`)
      }

      const data = await response.json()
      return data.questions_and_answers || []
    } catch (error) {
      console.error('Error fetching questions:', error)
      throw new Error('Unable to fetch questions. Please try again later.')
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { text: input, sender: 'user', id: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    try {
      if (!quizStarted) {
        setQuizStarted(true)
        setTopic(input)

        const fetchedQuestions = await fetchQuestions(input)
        if (fetchedQuestions.length === 0) {
          setMessages(prev => [
            ...prev,
            { text: "Sorry, I couldn't generate questions for this topic.", sender: 'ai', id: Date.now() }
          ])
          setIsThinking(false)
          return
        }

        setQuestions(fetchedQuestions)
        setMessages(prev => [
          ...prev,
          { text: `Great! I'll ask you 10 questions about ${input}. Let's begin!`, sender: 'ai', id: Date.now() },
          { text: fetchedQuestions[0].question, sender: 'ai', id: Date.now(), isQuestion: true }
        ])
        setCurrentQuestion(1)
      } else {
        const updatedUserAnswers = [...userAnswers, input]
        setUserAnswers(updatedUserAnswers)

        if (currentQuestion < 10) {
          setMessages(prev => [
            ...prev,
            {
              text: questions[currentQuestion].question,
              sender: 'ai',
              id: Date.now(),
              isQuestion: true
            }
          ])
          setCurrentQuestion(prev => prev + 1)
        } else {
          const quizData = {
            topic,
            questions: questions.map(q => q.question),
            userAnswers: updatedUserAnswers,
            correctAnswers: questions.map(q => q.correct_answer),
            messages: [...messages, userMessage]
          }

          localStorage.setItem('quizData', JSON.stringify(quizData))
          setMessages(prev => [
            ...prev,
            { text: "Great job! You've completed all 10 questions. Let's check your feedback.", sender: 'ai', id: Date.now() }
          ])
          setTimeout(() => router.push('/feedback'), 2000)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [
        ...prev,
        { text: 'Sorry, there was an error processing your request.', sender: 'ai', id: Date.now() }
      ])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  className={`
                    max-w-[85%] px-4 py-2 rounded-2xl
                    ${message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-transparent text-white border border-gray-700'
                    }
                    ${message.isQuestion ? 'font-semibold text-lg' : ''}
                  `}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-800 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-gray-900 text-white border-gray-700 focus:border-blue-500 rounded-full px-4 py-2"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isThinking} 
            className="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-2"
          >
            {isThinking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
