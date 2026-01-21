import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext'
import { apiClient } from '../../lib/apiClient'
import { colors, spacing, typography, radius } from '../../lib/designTokens'
import { ScreenHeader, TextField, PrimaryButton } from '../../components/ui'
import { EmptyState } from '../../components/EmptyState'
import { Brain, Send } from 'lucide-react-native'
import { Wording } from '../../lib/constants/wording'
import { logger } from '../../lib/logger'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AiAssistantScreen() {
  const { user } = useAuthContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const requestBody = {
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      }

      const response = await apiClient.post<{ content: string; quotaExceeded?: boolean; usage?: any }>(
        '/api/chat',
        requestBody,
      )

      if (response.error) {
        // Gérer les erreurs spécifiques
        if (response.error.code === 'OFFLINE') {
          Alert.alert(
            'Hors ligne',
            'Vous n\'êtes pas connecté à Internet. Vérifiez votre connexion et réessayez.',
          )
          setMessages(messages) // Retirer le message utilisateur
          setLoading(false)
          return
        }

        Alert.alert('Erreur', response.error.message || 'Erreur lors de l\'envoi du message')
        setMessages(messages) // Retirer le message utilisateur
        setLoading(false)
        return
      }

      if (response.data) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.content || 'Réponse vide',
        }
        setMessages([...newMessages, assistantMessage])
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Une erreur est survenue')
      setMessages(messages) // Retirer le message utilisateur
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={Wording.tabs.assistant} subtitle="Posez vos questions sur la gestion de votre élevage" />

      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 ? (
          <EmptyState
            icon="bulb-outline"
            title="Assistant IA"
            description="Posez vos questions sur la gestion de votre élevage porcin. Exemples : 'Comment prévenir les maladies ?', 'Quand vacciner mes porcs ?'"
          />
        ) : (
          messages.map((msg, index) => (
            <View
              key={index}
              style={[styles.message, msg.role === 'user' ? styles.userMessage : styles.assistantMessage]}
            >
              <Text style={styles.messageText}>{msg.content}</Text>
            </View>
          ))
        )}
        {loading && (
          <View style={[styles.message, styles.assistantMessage]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextField
          value={input}
          onChangeText={setInput}
          placeholder="Posez votre question..."
          multiline
          editable={!loading}
          containerStyle={styles.inputWrapper}
        />
        <PrimaryButton
          title="Envoyer"
          onPress={handleSend}
          disabled={loading || !input.trim()}
          loading={loading}
          fullWidth={false}
          style={styles.sendButton}
          icon={<Send size={18} color="#ffffff" />}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inputWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  message: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: typography.fontSize.body,
    color: colors.foreground,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  sendButton: {
    minWidth: 100,
  },
})
