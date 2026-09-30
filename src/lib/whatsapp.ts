export function whatsappDigits(phone: string): string {
  let digits = phone.replace(/\D/g, '').replace(/^00/, '')
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`
  if (digits.length < 12 || digits.length > 15) return ''
  return digits
}

export function whatsappHref(phone: string, message?: string): string {
  const digits = whatsappDigits(phone)
  if (!digits) return ''
  const url = `https://wa.me/${digits}`
  return message ? `${url}?text=${encodeURIComponent(message)}` : url
}
