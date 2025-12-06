"use client"

import { useState } from "react"
import { HealthOverview } from "@/components/health/health-overview"
import { HealthCases } from "@/components/health/health-cases"
import { HealthVaccinations } from "@/components/health/health-vaccinations"
import { ReportCaseDialog } from "@/components/health/report-case-dialog"
import { CaptureSymptomDialog } from "@/components/health/capture-symptom-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Camera } from "lucide-react"

export default function HealthPage() {
  const [reportCaseOpen, setReportCaseOpen] = useState(false)
  const [captureSymptomOpen, setCaptureSymptomOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Santé & Vétérinaire</h1>
          <p className="text-muted-foreground">Suivi sanitaire complet de votre élevage</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent"
            onClick={() => setCaptureSymptomOpen(true)}
          >
            <Camera className="h-4 w-4" />
            Capturer symptôme
          </Button>
          <Button 
            className="gap-2 bg-primary text-white hover:bg-primary-dark"
            onClick={() => setReportCaseOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Signaler un cas
          </Button>
        </div>
      </div>

      <HealthOverview />

      <div className="grid gap-6 lg:grid-cols-2">
        <HealthCases />
        <HealthVaccinations />
      </div>

      <ReportCaseDialog open={reportCaseOpen} onOpenChange={setReportCaseOpen} />
      <CaptureSymptomDialog open={captureSymptomOpen} onOpenChange={setCaptureSymptomOpen} />
    </div>
  )
}
