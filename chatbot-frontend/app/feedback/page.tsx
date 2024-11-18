'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, PieChart, Pie, Legend } from 'recharts'

interface QuizData {
  topic: string
  questions: string[]
  userAnswers: string[]
  correctAnswers: string[]
}

interface Feedback {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  performanceByTopic: { subtopic: string; score: number }[]
  overallScore: number
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://iitmrsh-2.onrender.com"

  useEffect(() => {
    const storedQuizData = localStorage.getItem('quizData')
    if (!storedQuizData) {
      setError('No quiz data found. Please take a quiz first.')
      setIsLoading(false)
      return
    }
    setQuizData(JSON.parse(storedQuizData))
  }, [])

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!quizData) return

      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE_URL}/generate_feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quiz_content: JSON.stringify({
              topic: quizData.topic,
              questions: quizData.questions,
              user_answers: quizData.userAnswers,
              correct_answers: quizData.correctAnswers,
            }),
          }),
        })

        if (!response.ok) throw new Error(`Failed to fetch feedback: ${response.statusText}`)

        const data = await response.json()
        setFeedback(data.feedback)
      } catch (error) {
        console.error('Error fetching feedback:', error)
        setError('Failed to fetch feedback. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    if (quizData) fetchFeedback()
  }, [quizData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>{error}</p>
      </div>
    )
  }

  if (!feedback || !quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>No quiz data available. Please take a quiz first.</p>
      </div>
    )
  }

  const correctAnswers = quizData.userAnswers.filter((answer, index) => answer === quizData.correctAnswers[index]).length
  const incorrectAnswers = quizData.questions.length - correctAnswers

  const pieChartData = [
    { name: 'Correct', value: correctAnswers },
    { name: 'Incorrect', value: incorrectAnswers },
  ]

  const COLORS = ['#4ade80', '#f87171']

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Quiz Feedback: {quizData.topic}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#111111] border-[#2D2D2D]">
            <CardHeader>
              <CardTitle>Performance by Subtopic</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={feedback.performanceByTopic}>
                  <XAxis dataKey="subtopic" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Bar dataKey="score" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#2D2D2D]">
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value">
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button
            className="bg-white text-black hover:bg-gray-200"
            onClick={() => router.push('/prediction')}
          >
            Go to Prediction
          </Button>
        </div>
      </div>
    </div>
  )
}
