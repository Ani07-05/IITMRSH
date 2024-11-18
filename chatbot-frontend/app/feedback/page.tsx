'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts'

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
  const router = useRouter()

  useEffect(() => {
    const storedQuizData = localStorage.getItem('quizData')
    if (storedQuizData) {
      setQuizData(JSON.parse(storedQuizData))
    } else {
      router.push('/')
    }
  }, [router])

  useEffect(() => {
    const fetchFeedback = async () => {
      if (quizData) {
        try {
          setIsLoading(true)
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://iitmrsh-2.onrender.com";
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
          if (!response.ok) {
            throw new Error('Failed to fetch feedback')
          }
          const data = await response.json()
          setFeedback(data.feedback)
        } catch (error) {
          console.error('Error fetching feedback:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (quizData) {
      fetchFeedback()
    }
  }, [quizData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Loading feedback...</p>
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
              <ChartContainer config={{ score: { label: 'Score', color: '#4ade80' } }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feedback.performanceByTopic}>
                    <XAxis dataKey="subtopic" stroke="#ffffff" />
                    <YAxis stroke="#ffffff" tickFormatter={(value) => `${value}%`} />
                    <Bar dataKey="score" fill="#4ade80" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#2D2D2D]">
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieChartData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="bg-[#111111] border-[#2D2D2D]">
            <CardHeader>
              <CardTitle>Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-400">
                    {strength}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2D2D2D]">
            <CardHeader>
              <CardTitle>Weaknesses</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-red-400">
                    {weakness}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2D2D2D]">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {feedback.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-yellow-400">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
