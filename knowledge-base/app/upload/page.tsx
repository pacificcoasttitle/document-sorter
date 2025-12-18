"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useEntries } from "@/contexts/EntriesContext"
import { useToast } from "@/hooks/use-toast"
import { Topic } from "@/lib/types"

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [topic, setTopic] = useState<string>("")
  const [userName, setUserNameInput] = useState<string>("")
  const [topics, setTopics] = useState<Topic[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  const router = useRouter()
  const { setExtractedEntries, setSourceReference, setUserName } = useEntries()
  const { toast } = useToast()

  const fetchTopics = useCallback(async () => {
    try {
      const response = await fetch('/api/topics')
      const data = await response.json()
      setTopics(data.topics || [])
    } catch (error) {
      console.error('Failed to fetch topics:', error)
    }
  }, [])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ]
      if (validTypes.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
        setSelectedFile(file)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOCX, or TXT file",
          variant: "destructive",
        })
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleProcess = async () => {
    if (!selectedFile) return
    if (!userName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name before processing",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('user_name', userName.trim())
      if (topic && topic !== 'auto-detect') {
        formData.append('topic', topic)
      }

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process document')
      }

      const data = await response.json()
      
      // Store in context
      setExtractedEntries(data.entries || [])
      setSourceReference(data.source_reference || selectedFile.name)
      setUserName(userName.trim())

      toast({
        title: "Document processed",
        description: `Extracted ${data.entries?.length || 0} entries from ${selectedFile.name}`,
      })

      router.push('/review')
    } catch (error) {
      console.error('Process error:', error)
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : 'An error occurred while processing the document',
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3 text-balance">Tessa Knowledge Tool</h1>
          <p className="text-lg text-muted-foreground">Upload documents to build your knowledge base</p>
        </div>

        {/* Your Name Field */}
        <div className="mb-6">
          <Label htmlFor="user-name" className="block text-sm font-medium text-foreground mb-2">
            Your Name
          </Label>
          <Input
            id="user-name"
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserNameInput(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Upload Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-16 mb-6 
            transition-colors duration-200 cursor-pointer
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50 hover:bg-accent/30"
            }
          `}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
            disabled={isProcessing}
          />

          <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="w-10 h-10 text-primary" />
            </div>

            <div className="text-center">
              <p className="text-lg font-medium text-foreground mb-1">
                {selectedFile ? selectedFile.name : "Drag and drop a file here, or click to browse"}
              </p>
              <p className="text-sm text-muted-foreground">Accepts PDF, DOCX, TXT</p>
            </div>
          </div>
        </div>

        {/* Topic Dropdown */}
        <div className="mb-6">
          <Label htmlFor="topic-select" className="block text-sm font-medium text-foreground mb-2">
            Pre-select topic (optional)
          </Label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger id="topic-select" className="w-full">
              <SelectValue placeholder="Auto-detect" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto-detect">Auto-detect</SelectItem>
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.name.toLowerCase()}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Process Button */}
        <Button 
          onClick={handleProcess} 
          disabled={!selectedFile || isProcessing || !userName.trim()} 
          className="w-full h-12 text-base font-semibold"
        >
          {isProcessing ? (
            <>
              <Spinner className="mr-2" />
              Processing Document...
            </>
          ) : (
            'Process Document'
          )}
        </Button>

        {/* Back link */}
        <div className="mt-6 text-center">
          <button 
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Library
          </button>
        </div>
      </div>
    </div>
  )
}

