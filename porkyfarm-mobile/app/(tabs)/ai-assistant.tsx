import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabase/client'

// URL API backend - utiliser 127.0.0.1 pour iOS simulator, localhost pour Android/Web
const getApiUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL
  if (envUrl) {
    // Si l'URL contient localhost et qu'on est sur iOS, remplacer par 127.0.0.1
    if (envUrl.includes('localhost') && Platform.OS === 'ios') {
      return envUrl.replace('localhost', '127.0.0.1')
    }
    return envUrl
  }
  // Fallback : utiliser 127.0.0.1 pour iOS, localhost pour le reste
  return Platform.OS === 'ios' ? 'http://127.0.0.1:3000' : 'http://localhost:3000'
}

const API_URL = getApiUrl()

export default function AIAssistantScreen() {
  const { user } = useAuthContext()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!question.trim()) {
      Alert.alert('Erreur', 'Veuillez poser une question')
      return
    }

    setLoading(true)
    const userMessage = question.trim()
    setQuestion('')

    // Ajouter le message utilisateur à l'historique
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(newMessages)

    try {
      // Récupérer le token de session Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        Alert.alert('Erreur', 'Vous devez être connecté')
        setLoading(false)
        return
      }

      // Format de la requête aligné avec le backend web
      const requestBody = {
        messages: newMessages,
        livestockContext: '', // Optionnel : contexte de l'élevage
        hasImage: false,
      }

      console.log('Calling AI API:', `${API_URL}/api/chat`)

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('AI API error:', res.status, errorText)
        throw new Error(`Erreur HTTP: ${res.status} - ${errorText}`)
      }

      const data = await res.json()
      const assistantResponse = data.content || data.message || 'Aucune réponse reçue'

      // Ajouter la réponse de l'assistant à l'historique
      setMessages([...newMessages, { role: 'assistant' as const, content: assistantResponse }])
    } catch (err) {
      console.error('Error calling AI:', err)
      const errorMessage = err instanceof Error ? err.message : 'Impossible de contacter l\'assistant IA'
      Alert.alert('Erreur', errorMessage)
      // Retirer le message utilisateur en cas d'erreur
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assistant IA</Text>
        <Text style={styles.subtitle}>Posez vos questions sur l'élevage</Text>
      </View>

      <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              👋 Bonjour ! Je suis PorkyAssistant, votre assistant IA pour l'élevage porcin.
            </Text>
            <Text style={styles.emptyText}>
              Posez-moi vos questions sur la santé, l'alimentation, la reproduction, etc.
            </Text>
          </View>
        ) : (
          messages.map((msg, index) => (
            <View
              key={index}
              style={[styles.messageCard, msg.role === 'user' ? styles.userMessage : styles.assistantMessage]}
            >
              <Text style={msg.role === 'user' ? styles.userMessageText : styles.assistantMessageText}>
                {msg.content}
              </Text>
            </View>
          ))
        )}
        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#2d6a4f" />
            <Text style={styles.loadingText}>Réflexion en cours...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="Posez votre question..."
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (loading || !question.trim()) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={loading || !question.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Envoyer</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  chatContainer: {
    flex: 1,
    padding: 20,
  },
  chatContent: {
    flexGrow: 1,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  messageCard: {
    padding: 16,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: '#2d6a4f',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignSelf: 'flex-start',
  },
  userMessageText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  assistantMessageText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2d6a4f',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
