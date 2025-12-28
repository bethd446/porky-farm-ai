import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext'
import { apiClient } from '../../lib/apiClient'
import { colors, spacing, typography, radius, commonStyles } from '../../lib/designTokens'
import { Brain, Send } from 'lucide-react-native'

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
      <View style={styles.header}>
        <Brain size={24} color={colors.primary} />
        <Text style={styles.title}>Assistant IA</Text>
      </View>

      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Brain size={48} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>
              Posez vos questions sur la gestion de votre élevage porcin
            </Text>
            <Text style={styles.emptySubtext}>
              Exemples : "Comment prévenir les maladies ?", "Quand vacciner mes porcs ?"
            </Text>
          </View>
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
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Posez votre question..."
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Send size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing['2xl'],
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.body,
    color: colors.foreground,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.mutedForeground,
    textAlign: 'center',
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
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.body,
    backgroundColor: colors.background,
    color: colors.foreground,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
})
