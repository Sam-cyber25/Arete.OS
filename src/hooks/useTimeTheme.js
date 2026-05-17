const THEMES = {
  dawn: {
    name:       'dawn',
    atmosphere: 'rgba(70, 80, 100, 0.03)',
    warmth:     'rgba(150, 170, 200, 0.02)',
    greeting:   'The conquest begins',
    headline:   'Rise & Conquer',
  },
  morning: {
    name:       'morning',
    atmosphere: 'rgba(201, 168, 76, 0.02)',
    warmth:     'rgba(201, 168, 76, 0.01)',
    greeting:   'Stay sharp',
    headline:   'Stay Sharp',
  },
  afternoon: {
    name:       'afternoon',
    atmosphere: 'rgba(180, 140, 60, 0.03)',
    warmth:     'rgba(180, 140, 60, 0.02)',
    greeting:   'Push through',
    headline:   'Push Through',
  },
  evening: {
    name:       'evening',
    atmosphere: 'rgba(160, 100, 40, 0.04)',
    warmth:     'rgba(160, 100, 40, 0.03)',
    greeting:   'Finish strong',
    headline:   'Finish Strong',
  },
  night: {
    name:       'night',
    atmosphere: 'rgba(40, 40, 60, 0.04)',
    warmth:     'rgba(40, 40, 60, 0.02)',
    greeting:   'Rest is part of the conquest',
    headline:   'Rest Well, Warrior',
  },
}

export function useTimeTheme() {
  const hour = new Date().getHours()
  if (hour >= 5  && hour < 8)  return THEMES.dawn
  if (hour >= 8  && hour < 12) return THEMES.morning
  if (hour >= 12 && hour < 17) return THEMES.afternoon
  if (hour >= 17 && hour < 21) return THEMES.evening
  return THEMES.night
}
