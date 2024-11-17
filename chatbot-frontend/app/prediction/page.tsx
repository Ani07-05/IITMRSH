'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PredictionData {
  prediction: number
  explanation: string
  strengths: string[]
  areasForImprovement: string[]
  factorsConsidered: string[]
  confidenceLevel: string
}

export default function PredictionPage() {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPrediction = async () => {
      const quizData = localStorage.getItem('quizData')
      if (!quizData) {
        setError('No quiz data found. Please take a quiz first.')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('http://localhost:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quiz_content: quizData })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }

        setPredictionData(data)
      } catch (error) {
        console.error('Error fetching prediction:', error)
        setError(`Failed to fetch prediction: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrediction()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <Card className="w-full max-w-md bg-[#111111] border-[#2D2D2D]">
          <CardContent className="pt-6">
            <p className="text-center mb-6">{error}</p>
            <div className="flex justify-center">
              <Button onClick={() => router.push('/')} className="bg-white text-black hover:bg-gray-200 font-semibold">
                Return to Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      <Card className="w-full max-w-3xl bg-[#111111] border-[#2D2D2D]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Performance Prediction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-green-500 mb-2">
              {predictionData?.prediction !== undefined ? `${predictionData.prediction.toFixed(2)}%` : 'N/A'}
            </p>
            <p className="text-lg">Predicted performance on future quizzes</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Explanation</h3>
            <p className="text-sm">{predictionData?.explanation}</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Key Strengths</h3>
            <ul className="list-disc list-inside text-sm">
              {predictionData?.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Areas for Improvement</h3>
            <ul className="list-disc list-inside text-sm">
              {predictionData?.areasForImprovement.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Factors Considered</h3>
            <ul className="list-disc list-inside text-sm">
              {predictionData?.factorsConsidered.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Confidence Level</h3>
            <p className="text-sm">{predictionData?.confidenceLevel}</p>
          </div>

          <div className="flex justify-center space-x-4 pt-4">
            <Button onClick={() => router.push('/')} className="bg-white text-black hover:bg-gray-200 font-semibold">
              Take Another Quiz
            </Button>
            <Button onClick={() => router.push('/feedback')} className="bg-white text-black hover:bg-gray-200 font-semibold">
              Review Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}