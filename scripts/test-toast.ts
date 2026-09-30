import { inferToastKind } from '../src/lib/toast.tsx'

if (inferToastKind('Não foi possível ler o arquivo.') !== 'error') {
  console.error('error kind failed')
  process.exit(1)
}
if (inferToastKind('Traduzindo o currículo para inglês…') !== 'info') {
  console.error('info kind failed')
  process.exit(1)
}
if (inferToastKind('Importado: Ana. 3 experiência(s) lidas.') !== 'ok') {
  console.error('ok kind failed')
  process.exit(1)
}

console.log('toast ok')
