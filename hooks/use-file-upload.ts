import { useCallback, useRef, useState } from 'react'

export interface FileWithPreview {
  id: string
  file: File
  preview: string
}

interface UseFileUploadOptions {
  maxFiles?: number
  maxSize?: number
  accept?: string
  multiple?: boolean
  onFilesChange?: (files: FileWithPreview[]) => void
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function useFileUpload({
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024,
  accept = 'image/*',
  multiple = false,
  onFilesChange,
}: UseFileUploadOptions = {}) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const validate = (incoming: File[]): { valid: File[]; errs: string[] } => {
    const errs: string[] = []
    const valid: File[] = []

    for (const file of incoming) {
      if (file.size > maxSize) {
        errs.push(`"${file.name}" exceeds ${formatBytes(maxSize)}.`)
        continue
      }
      valid.push(file)
    }

    if (files.length + valid.length > maxFiles) {
      errs.push(`You can only upload up to ${maxFiles} file${maxFiles > 1 ? 's' : ''}.`)
      return { valid: valid.slice(0, maxFiles - files.length), errs }
    }

    return { valid, errs }
  }

  const addFiles = useCallback(
    (incoming: File[]) => {
      const { valid, errs } = validate(incoming)
      setErrors(errs)
      if (!valid.length) return

      const newFiles: FileWithPreview[] = valid.map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }))

      setFiles(prev => {
        const next = multiple ? [...prev, ...newFiles] : newFiles
        onFilesChange?.(next)
        return next
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files.length, maxFiles, maxSize, multiple, onFilesChange],
  )

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const target = prev.find(f => f.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      const next = prev.filter(f => f.id !== id)
      onFilesChange?.(next)
      return next
    })
  }, [onFilesChange])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(true)
  }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
  }, [])
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }, [addFiles])

  const openFileDialog = useCallback(() => inputRef.current?.click(), [])

  const getInputProps = useCallback(() => ({
    ref: inputRef,
    type: 'file' as const,
    accept,
    multiple,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(Array.from(e.target.files))
      e.target.value = ''
    },
  }), [accept, multiple, addFiles])

  return [
    { files, isDragging, errors },
    { removeFile, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps },
  ] as const
}
