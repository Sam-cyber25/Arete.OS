import { useState, useRef, useCallback } from 'react'

export function useVoice({ onResult, settings }) {
  const [isListening, setIsListening]     = useState(false)
  const [isSpeaking, setIsSpeaking]       = useState(false)
  const [transcript, setTranscript]       = useState('')
  const [interimTranscript, setInterim]   = useState('')
  const recognitionRef = useRef(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const speak = useCallback(
    (text) => {
      if (!settings?.voiceEnabled) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang    = 'en-US'
      utterance.rate    = settings?.voiceRate  ?? 1
      utterance.pitch   = settings?.voicePitch ?? 1
      if (settings?.voiceName) {
        const voices = window.speechSynthesis.getVoices()
        const voice  = voices.find((v) => v.name === settings.voiceName)
        if (voice) utterance.voice = voice
      }
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend   = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [settings]
  )

  const startListening = useCallback(() => {
    if (!isSupported || isListening) return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang            = 'en-US'
    recognition.continuous      = false
    recognition.interimResults  = true

    recognition.onstart = () => { setIsListening(true); setInterim('') }

    recognition.onresult = (event) => {
      let interim = ''
      let final   = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) final   += result[0].transcript
        else                interim += result[0].transcript
      }
      setInterim(interim)
      if (final) {
        setTranscript(final)
        setInterim('')
        if (onResult) onResult(final, speak)
      }
    }

    recognition.onend   = () => { setIsListening(false); setInterim('') }
    recognition.onerror = () => { setIsListening(false) }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, isListening, onResult, speak])

  const stopListening  = useCallback(() => { recognitionRef.current?.stop(); setIsListening(false) }, [])
  const toggleListening = useCallback(() => { if (isListening) stopListening(); else startListening() }, [isListening, startListening, stopListening])

  return { isSupported, isListening, isSpeaking, transcript, interimTranscript, speak, startListening, stopListening, toggleListening }
}
