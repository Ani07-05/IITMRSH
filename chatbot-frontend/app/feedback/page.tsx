'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts'
// import { Loader2 } from 'lucide-react'

interface QuizData {
  topic: string
  questions: string[]
  userAnswers: string[]
  correctAnswers: string[]
  messages: { text: string; sender: 'user' | 'ai'; id: number; isQuestion?: boolean }[]
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
          const response = await fetch('http://localhost:5000/generate_feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quiz_content: JSON.stringify({
                topic: quizData.topic,
                questions: quizData.questions,
                user_answers: quizData.userAnswers,
                correct_answers: quizData.correctAnswers
              })
            })
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        {/* <Loader2 className="w-8 h-8 animate-spin text-white" /> */}
      </div>
    )
  }

  if (!feedback || !quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="text-xl">No quiz data available. Please take a quiz first.</p>
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
              <ChartContainer
                config={{
                  score: {
                    label: "Score",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={feedback.performanceByTopic}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis 
                      dataKey="subtopic" 
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Bar
                      dataKey="score"
                      radius={[4, 4, 0, 0]}
                      fill="hsl(var(--primary))"
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0] as {
                            name: string;
                            value: number;
                          };
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Score
                                  </span>
                                  <span className="font-bold text-muted-foreground">
                                    {data.value}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
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
              <ChartContainer
                config={{
                  value: {
                    label: "Score",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0] as {
                            name: string;
                            value: number;
                          };
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    {data.name}
                                  </span>
                                  <span className="font-bold text-muted-foreground">
                                    {data.value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
