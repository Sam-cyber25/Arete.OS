export const QUOTES = [
  { text: "Impossible is a word found only in the dictionary of fools.",                                                               author: "Napoleon Bonaparte" },
  { text: "The battlefield is a scene of constant chaos. The winner will be the one who controls that chaos.",                         author: "Napoleon Bonaparte" },
  { text: "Victory belongs to the most persevering.",                                                                                  author: "Napoleon Bonaparte" },
  { text: "There is nothing impossible to him who will try.",                                                                          author: "Alexander the Great" },
  { text: "I am not afraid of an army of lions led by a sheep; I am afraid of an army of sheep led by a lion.",                       author: "Alexander the Great" },
  { text: "The secret of change is to focus all of your energy not on fighting the old, but on building the new.",                    author: "Socrates" },
  { text: "Know thyself.",                                                                                                             author: "Socrates" },
  { text: "An unexamined life is not worth living.",                                                                                   author: "Socrates" },
  { text: "There's no talent here, this is hard work. This is an obsession.",                                                         author: "Conor McGregor" },
  { text: "We're not here to take part. We're here to take over.",                                                                    author: "Conor McGregor" },
  { text: "I don't have time for people who doubt me.",                                                                               author: "Khabib Nurmagomedov" },
  { text: "It doesn't matter how many times you get knocked down. What matters is how many times you get up.",                         author: "Khabib Nurmagomedov" },
  { text: "God's time is perfect.",                                                                                                    author: "Charles Oliveira" },
  { text: "I've been through hard times. But I never stopped believing.",                                                             author: "Charles Oliveira" },
  { text: "Waste no more time arguing about what a good man should be. Be one.",                                                      author: "Marcus Aurelius" },
  { text: "You have power over your mind, not outside events. Realize this, and you will find strength.",                             author: "Marcus Aurelius" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.",                                        author: "Marcus Aurelius" },
  { text: "Difficulties strengthen the mind, as labor does the body.",                                                               author: "Seneca" },
  { text: "Power is my mistress. I have worked too hard at her conquest to allow anyone to take her from me.",                         author: "Napoleon Bonaparte" },
  { text: "Do not pray for an easy life. Pray for the strength to endure a difficult one.",                                           author: "Bruce Lee" },
]

export function getDailyQuote() {
  const today = new Date()
  const seed  = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  return QUOTES[seed % QUOTES.length]
}
