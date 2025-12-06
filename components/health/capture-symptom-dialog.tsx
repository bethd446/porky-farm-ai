"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Upload, X } from "lucide-react"
import { toast } from "sonner"

interface CaptureSymptomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CaptureSymptomDialog({ open, onOpenChange }: CaptureSymptomDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [animalId, setAnimalId] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      toast.error("Impossible d'accéder à la caméra")
      console.error(error)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        setCapturedImage(canvas.toDataURL("image/jpeg"))
        // Stop camera
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!animalId || !capturedImage) {
      toast.error("Veuillez sélectionner un animal et capturer une photo")
      return
    }

    setIsLoading(true)
    try {
      // Ici, vous pouvez uploader l'image vers Supabase Storage
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      toast.success("Photo capturée et enregistrée avec succès")
      onOpenChange(false)
      setCapturedImage(null)
      setAnimalId("")
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Capturer un symptôme</DialogTitle>
          <DialogDescription>
            Prenez une photo pour documenter un symptôme ou une anomalie
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="animalId">Animal concerné *</Label>
            <Select value={animalId} onValueChange={setAnimalId} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un animal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pig-45">Truie #45</SelectItem>
                <SelectItem value="pig-32">Truie #32</SelectItem>
                <SelectItem value="pig-a12-3">Porcelet #A12-3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Photo *</Label>
            {!capturedImage ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCapture}
                    className="flex-1 gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Utiliser la caméra
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload fichier
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {videoRef.current && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full rounded-lg"
                      autoPlay
                      playsInline
                    />
                    <Button
                      type="button"
                      onClick={capturePhoto}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white"
                    >
                      Capturer
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => setCapturedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setCapturedImage(null)
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach((track) => track.stop())
                }
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !capturedImage} className="bg-primary text-white">
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

