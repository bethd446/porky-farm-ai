/**
 * DatePicker Component - VERSION SIMPLIFIÉE
 * ==========================================
 * Sélecteur de date sans animations complexes
 * Utilise des couleurs string directes
 */

import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'

interface DatePickerProps {
  label?: string
  value?: Date | string | null
  onChange: (date: Date) => void
  placeholder?: string
  error?: string
  helperText?: string
  maximumDate?: Date
  minimumDate?: Date
  disabled?: boolean
  required?: boolean
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Sélectionner une date',
  error,
  helperText,
  maximumDate,
  minimumDate,
  disabled = false,
  required = false,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false)

  // Convertir la valeur en Date si c'est une string
  const dateValue = value
    ? (typeof value === 'string' ? new Date(value) : value)
    : new Date()

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
    }
    if (selectedDate) {
      onChange(selectedDate)
    }
  }

  const handleConfirm = () => {
    setShowPicker(false)
    onChange(dateValue)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const displayValue = value ? formatDate(dateValue) : placeholder

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.input,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        onPress={() => !disabled && setShowPicker(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Ionicons name="calendar-outline" size={20} color="#6B7280" />
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {displayValue}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}

      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalCancel}>Annuler</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label || 'Choisir une date'}</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.modalDone}>OK</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateValue}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale="fr-FR"
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android Picker */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
})

export default DatePicker
