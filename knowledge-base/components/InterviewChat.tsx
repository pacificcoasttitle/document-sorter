"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Sparkles, Bot, User } from "lucide-react"
import { interviewQuestions } from "@/lib/sop-questions"

interface InterviewChatProps {
  answers: Record<string, string>
  onAnswerChange: (questionId: string, answer: string) => void
  onComplete: () => void
  onBack: () => void
  isGenerating: boolean
}

export function InterviewChat({
  answers,
  onAnswerChange,
  onComplete,
  onBack,
  isGenerating
}: InterviewChatProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const question = interviewQuestions[currentQuestion]
  const isLastQuestion = currentQuestion === interviewQuestions.length - 1
  const isFirstQuestion = currentQuestion === 0

  const canProceed = answers[question.id]?.trim().length > 0 || 
    (question.id === 'exceptions' || question.id === 'related_policies') // Optional questions

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete()
    } else {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (isFirstQuestion) {
      onBack()
    } else {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  // Build conversation history
  const conversationHistory = interviewQuestions.slice(0, currentQuestion).map((q, index) => ({
    question: q.question,
    answer: answers[q.id] || ''
  }))

  return (
    <div className="flex flex-col h-full">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentQuestion + 1} of {interviewQuestions.length}</span>
          <span>{Math.round(((currentQuestion + 1) / interviewQuestions.length) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / interviewQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Chat history */}
      <div className="flex-1 space-y-4 mb-6 max-h-[300px] overflow-y-auto">
      {conversationHistory.map((item, idx) => (
        <div key={idx} className="space-y-2">
            {/* AI Question */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="bg-muted rounded-lg rounded-tl-none px-4 py-2 max-w-[80%]">
                <p className="text-sm text-foreground">{item.question}</p>
              </div>
            </div>
            {/* User Answer */}
            <div className="flex gap-3 justify-end">
              <div className="bg-emerald-100 rounded-lg rounded-tr-none px-4 py-2 max-w-[80%]">
                <p className="text-sm text-emerald-900">{item.answer}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current question */}
      <div className="space-y-4">
        {/* AI Question bubble */}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="bg-muted rounded-lg rounded-tl-none px-4 py-3 flex-1">
            <p className="text-foreground font-medium">{question.question}</p>
          </div>
        </div>

        {/* Answer input */}
        <div className="pl-12">
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="min-h-[120px] resize-none"
            disabled={isGenerating}
          />
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isGenerating}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {isFirstQuestion ? 'Back to Basics' : 'Previous'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={(!canProceed && !isLastQuestion) || isGenerating}
          className={`gap-2 ${isLastQuestion ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              Generating SOP...
            </>
          ) : isLastQuestion ? (
            <>
              <Sparkles className="w-4 h-4" />
              Generate SOP
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

