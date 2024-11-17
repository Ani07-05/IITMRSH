'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Question {
  question: string;
  correct_answer: string;
}

interface Message {
  text: string;
  sender: 'user' | 'ai';
  id: number;
  isQuestion?: boolean;
}

export default function QuestionPage() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! What topic would you like to be questioned on?", sender: 'ai', id: Date.now() + Math.random() }
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { text: input, sender: 'user' as const, id: Date.now() + Math.random() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    try {
      if (!quizStarted) {
        setQuizStarted(true)
        setTopic(input)
        const response = await fetch('http://localhost:5000/generate_questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: input })
        })
        const data = await response.json()

        if (!data.questions_and_answers || data.questions_and_answers.length === 0) {
          setMessages(prev => [
            ...prev,
            { text: "Sorry, I couldn't generate questions for this topic.", sender: 'ai', id: Date.now() + Math.random() }
          ])
          setIsThinking(false)
          return
        }

        setQuestions(data.questions_and_answers)
        setMessages(prev => [
          ...prev,
          { text: `Great! I'll ask you 10 questions about ${input}. Let's begin!`, sender: 'ai', id: Date.now() + Math.random() },
          { text: data.questions_and_answers[0].question, sender: 'ai', id: Date.now() + Math.random(), isQuestion: true }
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
              id: Date.now() + Math.random(),
              isQuestion: true 
            }
          ])
          setCurrentQuestion(prev => prev + 1)
        } else {
          // Prepare quiz data for feedback page
          const quizData = {
            topic,
            questions: questions.map(q => q.question),
            userAnswers: updatedUserAnswers,
            correctAnswers: questions.map(q => q.correct_answer),
            messages: [...messages, userMessage]
          }
          localStorage.setItem('quizData', JSON.stringify(quizData))
          
          // Add a final message before redirecting
          setMessages(prev => [
            ...prev,
            { text: "Great job! You've completed all 10 questions. Let's check your feedback.", sender: 'ai', id: Date.now() + Math.random() }
          ])
          
          // Delay the redirect to allow the user to see the final message
          setTimeout(() => {
            router.push('/feedback')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [
        ...prev,
        { text: 'Sorry, there was an error processing your request.', sender: 'ai', id: Date.now() + Math.random() }
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
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[85%] px-4 py-2 rounded-lg
                    ${message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.isQuestion 
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-800 text-gray-300'
                    }
                  `}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
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
            className="flex-1 bg-gray-800 text-white border-gray-700 focus:border-blue-500"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isThinking} 
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isThinking ? (
              <motion.div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                />
              </motion.div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}