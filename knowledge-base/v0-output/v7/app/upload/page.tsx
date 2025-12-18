"use client"

import type React from "react"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [topic, setTopic] = useState<string>("")

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
      if (validTypes.includes(file.type)) {
        setSelectedFile(file)
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleProcess = () => {
    if (selectedFile) {
      console.log("[v0] Processing file:", selectedFile.name, "Topic:", topic || "auto-detect")
      // Add processing logic here
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
          <label htmlFor="topic-select" className="block text-sm font-medium text-foreground mb-2">
            Pre-select topic (optional)
          </label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger id="topic-select" className="w-full">
              <SelectValue placeholder="Auto-detect" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bankruptcy">Bankruptcy</SelectItem>
              <SelectItem value="probate">Probate</SelectItem>
              <SelectItem value="trusts">Trusts</SelectItem>
              <SelectItem value="auto-detect">Auto-detect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Process Button */}
        <Button onClick={handleProcess} disabled={!selectedFile} className="w-full h-12 text-base font-semibold">
          Process Document
        </Button>
      </div>
    </div>
  )
}
