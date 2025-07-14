import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import type { Font } from 'shared'

interface FontUploadFormProps {
  serverUrl: string
  onFontUploaded: (font: Font) => void
}

export function FontUploadForm({ serverUrl, onFontUploaded }: FontUploadFormProps) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Check if file is TTF
    if (!file.name.toLowerCase().endsWith('.ttf')) {
      setMessage('Only TTF files are allowed')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('font', file)

   

      const response = await fetch(`${serverUrl}/api/fonts/upload`, {
        method: 'POST',
        body: formData,
      })

  
      
      const data = await response.json()


      if (data.success) {
        setMessage('Font uploaded successfully!')
        onFontUploaded(data.data)
    
      } else {
        setMessage(data.message || 'Upload failed')
        console.error('Upload failed:', data.message)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage('Upload failed: ' + (error instanceof Error ? error.message : 'Network error'))
    } finally {
      setUploading(false)
    }
  }, [serverUrl, onFontUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'font/ttf': ['.ttf'],
      'application/x-font-ttf': ['.ttf'],
    },
    multiple: false,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            {isDragActive ? (
              <p className="text-blue-600">Drop the TTF file here...</p>
            ) : (
              <div>
                <p className="text-gray-600">Drag & drop a TTF file here, or click to select</p>
                <p className="text-sm text-gray-500 mt-1">Only .ttf files are supported</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {uploading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-blue-600">Uploading...</span>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-md ${
          message.includes('successfully') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}
