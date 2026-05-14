export function parseVoiceCommand(transcript, { tasks, addTask, addNote, navigate, speak }) {
  const text = transcript.toLowerCase().trim()

  if (text.startsWith('add task ')) {
    const taskText = transcript.slice(9).trim()
    if (taskText) {
      addTask({ title: taskText, priority: 'medium', source: 'voice' })
      speak(`Task added: ${taskText}`)
      return { type: 'task', message: `Task added: "${taskText}"` }
    }
  }

  if (text.startsWith('add note ')) {
    const noteText = transcript.slice(9).trim()
    if (noteText) {
      addNote({ title: '', content: noteText, tags: ['voice'], source: 'voice' })
      speak('Noted.')
      return { type: 'note', message: `Saved to memory.` }
    }
  }

  if (text.includes("what's my schedule") || text.includes('show schedule') || text.includes('open schedule')) {
    navigate('schedule')
    speak('Opening your schedule.')
    return { type: 'navigate', message: 'Navigating to Schedule.' }
  }

  if (text.includes('show analytics') || text.includes('open analytics')) {
    navigate('analytics')
    speak('Opening analytics.')
    return { type: 'navigate', message: 'Navigating to Analytics.' }
  }

  if (text.includes('show goals') || text.includes('open goals')) {
    navigate('goals')
    speak('Opening goals.')
    return { type: 'navigate', message: 'Navigating to Goals.' }
  }

  if (text.includes('open journal') || text.includes('show journal')) {
    navigate('journal')
    speak('Opening your journal.')
    return { type: 'navigate', message: 'Navigating to Journal.' }
  }

  if (text.includes('how many tasks') || text.includes('task count')) {
    const pending = tasks.filter((t) => !t.completed).length
    const msg     = `You have ${pending} pending task${pending !== 1 ? 's' : ''}.`
    speak(msg)
    return { type: 'info', message: msg }
  }

  if (text.includes('good morning') || text.includes('hello') || text.includes('salve')) {
    const responses = [
      'Systems ready. What is the mission?',
      'Present. What shall we conquer today?',
      'Arête is active. Proceed.',
    ]
    const msg = responses[Math.floor(Math.random() * responses.length)]
    speak(msg)
    return { type: 'greeting', message: msg }
  }

  if (text.includes('go home') || text.includes('dashboard')) {
    navigate('dashboard')
    speak('Returning to overview.')
    return { type: 'navigate', message: 'Navigating to Overview.' }
  }

  // Default: log to memory
  addNote({ title: 'Voice Log', content: transcript, tags: ['voice'], source: 'voice' })
  speak('Logged.')
  return { type: 'log', message: 'Logged to memory.' }
}
