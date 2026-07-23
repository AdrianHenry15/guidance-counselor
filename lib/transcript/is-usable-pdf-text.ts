export function isUsablePdfText(text: string): boolean {
  const normalizedText = text.replace(/\s+/g, " ").trim()

  if (normalizedText.length < 100) {
    return false
  }

  const words = normalizedText.split(" ")

  return words.length >= 20
}
