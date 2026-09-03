/**
 * Click-to-chat URL for WhatsApp.
 *
 * wa.me wants the number in international format with every non-digit
 * stripped: no plus, spaces, or dashes. The display string in content
 * stays human-readable; only the href gets flattened.
 */
export function whatsappHref(number: string, text?: string): string {
  const digits = number.replace(/\D/g, '')
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${digits}${query}`
}
