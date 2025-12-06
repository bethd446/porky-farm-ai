import { AIChat } from "@/components/ai/ai-chat"

export default function AIAssistantPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Assistant IA</h1>
        <p className="text-muted-foreground">
          Posez vos questions sur l'élevage porcin et obtenez des conseils personnalisés
        </p>
      </div>
      <AIChat />
    </div>
  )
}
