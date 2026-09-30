import { whatsappDigits, whatsappHref } from '../src/lib/whatsapp.ts'
import { githubHref, linkedinHref, webHref } from '../src/lib/contactLinks.ts'

if (whatsappDigits('+55 11 98888-1122') !== '5511988881122') {
  console.error('plus 55 failed', whatsappDigits('+55 11 98888-1122'))
  process.exit(1)
}
if (whatsappDigits('(61) 99999-1234') !== '5561999991234') {
  console.error('local mobile failed', whatsappDigits('(61) 99999-1234'))
  process.exit(1)
}
if (whatsappHref('+55 11 98888-1122') !== 'https://wa.me/5511988881122') {
  console.error('href failed', whatsappHref('+55 11 98888-1122'))
  process.exit(1)
}
if (whatsappDigits('123') !== '') {
  console.error('short number should be empty')
  process.exit(1)
}
console.log('whatsapp ok', whatsappHref('+55 11 98888-1122'))

if (linkedinHref('linkedin.com/in/anaclara') !== 'https://linkedin.com/in/anaclara') {
  console.error('linkedin url failed', linkedinHref('linkedin.com/in/anaclara'))
  process.exit(1)
}
if (linkedinHref('anaclara') !== 'https://www.linkedin.com/in/anaclara') {
  console.error('linkedin slug failed', linkedinHref('anaclara'))
  process.exit(1)
}
if (githubHref('github.com/octocat') !== 'https://github.com/octocat') {
  console.error('github url failed', githubHref('github.com/octocat'))
  process.exit(1)
}
if (githubHref('octocat') !== 'https://github.com/octocat') {
  console.error('github handle failed', githubHref('octocat'))
  process.exit(1)
}
if (webHref('anamendes.design') !== 'https://anamendes.design') {
  console.error('website failed', webHref('anamendes.design'))
  process.exit(1)
}
console.log('profile links ok', linkedinHref('anaclara'), githubHref('octocat'))
