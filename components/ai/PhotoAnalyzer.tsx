/**
 * Composant analyse photo via Vision IA
 * Pour upload et analyse d'images d'animaux, symptômes, etc.
 */

"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, ImageIcon, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PhotoAnalyzerProps {
  onAnalysisComplete?: (analysis: string) => void
}

export function PhotoAnalyzer({ onAnalysisComplete }: PhotoAnalyzerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [animalType, setAnimalType] = useState<
    "sow" | "boar" | "piglet" | "fattening" | "unknown"
  >("unknown")
  const [context, setContext] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image trop volumineuse. Taille maximale: 10MB")
      return
    }

    // Vérifier le type
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image")
      return
    }

    setSelectedFile(file)
    setError(null)

    // Créer preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPreview(result)
      setImageBase64(result)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError("Veuillez sélectionner une image")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await fetch("/api/ai/analyze-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
          animalType,
          context: context.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de l'analyse")
      }

      const data = await response.json()
      setAnalysis(data.analysis)

      if (onAnalysisComplete) {
        onAnalysisComplete(data.analysis)
      }
    } catch (err) {
      console.error("[PhotoAnalyzer] Error:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'analyse. Veuillez réessayer."
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setImageBase64(null)
    setAnimalType("unknown")
    setContext("")
    setAnalysis(null)
    setError(null)
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Analyse de Photo</h3>
      </div>

      {/* Upload */}
      <div className="space-y-2">
        <Label htmlFor="photo-upload">Sélectionner une image</Label>
        <div className="flex items-center gap-2">
          <Input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isAnalyzing}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("photo-upload")?.click()}
            disabled={isAnalyzing}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-64 object-contain rounded-lg border"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleReset}
            disabled={isAnalyzing}
          >
            Supprimer
          </Button>
        </div>
      )}

      {/* Options */}
      {preview && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="animal-type">Type d'animal (optionnel)</Label>
            <Select
              value={animalType}
              onValueChange={(value: any) => setAnimalType(value)}
              disabled={isAnalyzing}
            >
              <SelectTrigger id="animal-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">Non spécifié</SelectItem>
                <SelectItem value="sow">Truie</SelectItem>
                <SelectItem value="boar">Verrat</SelectItem>
                <SelectItem value="piglet">Porcelet</SelectItem>
                <SelectItem value="fattening">Porc d'engraissement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Contexte (optionnel)</Label>
            <Input
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Ex: L'animal tousse depuis 2 jours..."
              disabled={isAnalyzing}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !imageBase64}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              "Analyser l'image"
            )}
          </Button>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analyse */}
      {analysis && (
        <div className="space-y-2">
          <h4 className="font-semibold">Résultat de l'analyse</h4>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{analysis}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠️ Cette analyse ne remplace pas un vétérinaire. En cas de doute
            grave, consultez un professionnel.
          </p>
        </div>
      )}
    </Card>
  )
}

