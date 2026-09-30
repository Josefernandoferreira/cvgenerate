import type { CvLang } from '../types'

type Row = [pt: string, en: string, es: string]

const PHRASES: Row[] = [
  ['interfaces de usuário', 'user interfaces', 'interfaces de usuario'],
  ['interface de usuário', 'user interface', 'interfaz de usuario'],
  ['experiências de usuário', 'user experiences', 'experiencias de usuario'],
  ['experiência de usuário', 'user experience', 'experiencia de usuario'],
  ['experiência moderna', 'modern experience', 'experiencia moderna'],
  ['experiências de usuário eficientes', 'efficient user experiences', 'experiencias de usuario eficientes'],
  ['formação acadêmica', 'academic education', 'formación académica'],
  ['licenças e certificações', 'licenses and certifications', 'licencias y certificaciones'],
  ['desenvolvimento de software', 'software development', 'desarrollo de software'],
  ['desenvolvedor full stack', 'full stack developer', 'desarrollador full stack'],
  ['desenvolvedor fullstack', 'full stack developer', 'desarrollador fullstack'],
  ['engenheiro de software', 'software engineer', 'ingeniero de software'],
  ['ciência da computação', 'computer science', 'ciencias de la computación'],
  ['análise e desenvolvimento de sistemas', 'systems analysis and development', 'análisis y desarrollo de sistemas'],
  ['análise de desenvolvimento de sistemas', 'systems analysis and development', 'análisis de desarrollo de sistemas'],
  ['criação de', 'creating', 'creación de'],
  ['garantindo uma', 'ensuring a', 'garantizando una'],
  ['garantindo um', 'ensuring a', 'garantizando un'],
  ['responsável por', 'responsible for', 'responsable de'],
  ['atuação em', 'work in', 'actuación en'],
  ['trabalhando principalmente', 'working mainly', 'trabajando principalmente'],
  ['carga horária', 'workload', 'carga horaria'],
  ['curso de', 'course in', 'curso de'],
  ['escola de programação', 'programming school', 'escuela de programación'],
  ['sistemas distribuídos', 'distributed systems', 'sistemas distribuidos'],
  ['pagamentos digitais', 'digital payments', 'pagos digitales'],
  ['requisitos de conformidade', 'compliance requirements', 'requisitos de cumplimiento'],
  ['integridade de dados', 'data integrity', 'integridad de datos'],
  ['ambiente containerizado', 'containerized environment', 'entorno contenerizado'],
  ['ambientes containerizados', 'containerized environments', 'entornos contenerizados'],
  ['pipelines de ci/cd', 'CI/CD pipelines', 'pipelines de CI/CD'],
  ['apis restful', 'RESTful APIs', 'APIs REST'],
  ['apis rest', 'REST APIs', 'APIs REST'],
  ['banco de dados', 'database', 'base de datos'],
  ['bancos de dados', 'databases', 'bases de datos'],
  ['testes automatizados', 'automated testing', 'pruebas automatizadas'],
  ['desenvolvimento ágil', 'agile development', 'desarrollo ágil'],
  ['gestão de tarefas', 'task management', 'gestión de tareas'],
  ['disponível para', 'available for', 'disponible para'],
  ['mudanças ou viagens', 'relocation or travel', 'mudanzas o viajes'],
]

const WORDS: Row[] = [
  ['desenvolvedor', 'developer', 'desarrollador'],
  ['desenvolvimento', 'development', 'desarrollo'],
  ['desenvolvi', 'developed', 'desarrollé'],
  ['criação', 'creation', 'creación'],
  ['criei', 'created', 'creé'],
  ['criando', 'creating', 'creando'],
  ['interfaces', 'interfaces', 'interfaces'],
  ['interface', 'interface', 'interfaz'],
  ['usuário', 'user', 'usuario'],
  ['usuários', 'users', 'usuarios'],
  ['experiência', 'experience', 'experiencia'],
  ['experiências', 'experiences', 'experiencias'],
  ['garantindo', 'ensuring', 'garantizando'],
  ['moderna', 'modern', 'moderna'],
  ['moderno', 'modern', 'moderno'],
  ['eficientes', 'efficient', 'eficientes'],
  ['eficiente', 'efficient', 'eficiente'],
  ['formação', 'training', 'formación'],
  ['certificações', 'certifications', 'certificaciones'],
  ['certificação', 'certification', 'certificación'],
  ['certificado', 'certificate', 'certificado'],
  ['programação', 'programming', 'programación'],
  ['concluído', 'completed', 'completado'],
  ['conclusão', 'completion', 'conclusión'],
  ['emissão', 'issued', 'emisión'],
  ['expedição', 'issued', 'expedición'],
  ['horas', 'hours', 'horas'],
  ['curso', 'course', 'curso'],
  ['escola', 'school', 'escuela'],
  ['instituto', 'institute', 'instituto'],
  ['fundação', 'foundation', 'fundación'],
  ['universidade', 'university', 'universidad'],
  ['projetos', 'projects', 'proyectos'],
  ['projeto', 'project', 'proyecto'],
  ['sistemas', 'systems', 'sistemas'],
  ['sistema', 'system', 'sistema'],
  ['segurança', 'security', 'seguridad'],
  ['conformidade', 'compliance', 'cumplimiento'],
  ['requisitos', 'requirements', 'requisitos'],
  ['aplicações', 'applications', 'aplicaciones'],
  ['aplicação', 'application', 'aplicación'],
  ['backend', 'backend', 'backend'],
  ['frontend', 'frontend', 'frontend'],
  ['front-end', 'front-end', 'front-end'],
  ['back-end', 'back-end', 'back-end'],
  ['relacionais', 'relational', 'relacionales'],
  ['relacional', 'relational', 'relacional'],
  ['gerenciamento', 'management', 'gestión'],
  ['gestão', 'management', 'gestión'],
  ['equipe', 'team', 'equipo'],
  ['equipes', 'teams', 'equipos'],
  ['lidero', 'I lead', 'lidero'],
  ['liderei', 'led', 'lideré'],
  ['atuo', 'I work', 'actúo'],
  ['atuação', 'work', 'actuación'],
  ['trabalho', 'work', 'trabajo'],
  ['trabalhando', 'working', 'trabajando'],
  ['principalmente', 'mainly', 'principalmente'],
  ['usando', 'using', 'usando'],
  ['utilizando', 'using', 'utilizando'],
  ['foco', 'focus', 'enfoque'],
  ['focado', 'focused', 'enfocado'],
  ['focada', 'focused', 'enfocada'],
  ['resumo', 'summary', 'resumen'],
  ['objetivo', 'objective', 'objetivo'],
  ['habilidades', 'skills', 'habilidades'],
  ['competências', 'skills', 'competencias'],
  ['idiomas', 'languages', 'idiomas'],
  ['nativo', 'native', 'nativo'],
  ['fluente', 'fluent', 'fluido'],
  ['avançado', 'advanced', 'avanzado'],
  ['intermediário', 'intermediate', 'intermedio'],
  ['básico', 'basic', 'básico'],
  ['atual', 'present', 'actual'],
  ['atualmente', 'currently', 'actualmente'],
  ['remoto', 'remote', 'remoto'],
  ['disponível', 'available', 'disponible'],
  ['mudanças', 'relocation', 'mudanzas'],
  ['viagens', 'travel', 'viajes'],
  ['grande', 'great', 'gran'],
  ['responsabilidade', 'responsibility', 'responsabilidad'],
  ['ciente', 'aware', 'consciente'],
  ['aplicando', 'applying', 'aplicando'],
  ['aplico', 'I apply', 'aplico'],
  ['reduzindo', 'reducing', 'reduciendo'],
  ['reduzi', 'reduced', 'reduje'],
  ['cortei', 'cut', 'recorté'],
  ['implementei', 'implemented', 'implementé'],
  ['implementação', 'implementation', 'implementación'],
  ['desenhei', 'designed', 'diseñé'],
  ['desenhando', 'designing', 'diseñando'],
  ['documentei', 'documented', 'documenté'],
  ['documentação', 'documentation', 'documentación'],
  ['entreguei', 'delivered', 'entregué'],
  ['conduzi', 'conducted', 'conduje'],
  ['padronizei', 'standardized', 'estandaricé'],
  ['redesenhei', 'redesigned', 'rediseñé'],
  ['instalei', 'set up', 'instalé'],
  ['automatizei', 'automated', 'automaticé'],
  ['integrei', 'integrated', 'integré'],
  ['integração', 'integration', 'integración'],
  ['melhoria', 'improvement', 'mejora'],
  ['melhorias', 'improvements', 'mejoras'],
  ['desempenho', 'performance', 'rendimiento'],
  ['alta', 'high', 'alta'],
  ['dados', 'data', 'datos'],
  ['integridade', 'integrity', 'integridad'],
  ['testes', 'tests', 'pruebas'],
  ['teste', 'test', 'prueba'],
  ['automatizados', 'automated', 'automatizadas'],
  ['pipelines', 'pipelines', 'pipelines'],
  ['ambientes', 'environments', 'entornos'],
  ['ambiente', 'environment', 'entorno'],
  ['containerizados', 'containerized', 'contenerizados'],
  ['ágil', 'agile', 'ágil'],
  ['tarefas', 'tasks', 'tareas'],
  ['tarefa', 'task', 'tarea'],
  ['produtos', 'products', 'productos'],
  ['produto', 'product', 'producto'],
  ['digitais', 'digital', 'digitales'],
  ['digital', 'digital', 'digital'],
  ['pagamentos', 'payments', 'pagos'],
  ['pagamento', 'payment', 'pago'],
  ['distribuídos', 'distributed', 'distribuidos'],
  ['governo', 'government', 'gobierno'],
  ['governamentais', 'government', 'gubernamentales'],
  ['estratégicos', 'strategic', 'estratégicos'],
  ['estratégico', 'strategic', 'estratégico'],
  ['empresariais', 'enterprise', 'empresariales'],
  ['empresarial', 'enterprise', 'empresarial'],
  ['tribunal', 'court', 'tribunal'],
  ['federal', 'federal', 'federal'],
  ['regional', 'regional', 'regional'],
  ['lidando', 'dealing', 'lidiando'],
  ['com', 'with', 'con'],
  ['para', 'for', 'para'],
  ['uma', 'a', 'una'],
  ['um', 'a', 'un'],
  ['nas', 'in the', 'en las'],
  ['nos', 'in the', 'en los'],
  ['na', 'in the', 'en la'],
  ['no', 'in the', 'en el'],
  ['das', 'of the', 'de las'],
  ['dos', 'of the', 'de los'],
  ['da', 'of', 'de'],
  ['do', 'of', 'de'],
  ['de', 'of', 'de'],
  ['em', 'in', 'en'],
  ['por', 'by', 'por'],
  ['e', 'and', 'y'],
  ['ou', 'or', 'o'],
  ['como', 'as', 'como'],
  ['também', 'also', 'también'],
  ['mais', 'more', 'más'],
  ['anos', 'years', 'años'],
  ['ano', 'year', 'año'],
  ['meses', 'months', 'meses'],
  ['mês', 'month', 'mes'],
  ['brasileira', 'Brazilian', 'brasileña'],
  ['brasileiro', 'Brazilian', 'brasileño'],
  ['bacharelado', 'bachelor', 'licenciatura'],
  ['tecnólogo', 'technologist degree', 'tecnólogo'],
  ['mestrado', 'master', 'máster'],
  ['doutorado', 'phd', 'doctorado'],
  ['ênfase', 'emphasis', 'énfasis'],
  ['apresentação', 'introduction', 'presentación'],
  ['claro', 'clear', 'claro'],
  ['claras', 'clear', 'claras'],
  ['pesquisa', 'research', 'investigación'],
  ['prototipagem', 'prototyping', 'prototipado'],
  ['engenharia', 'engineering', 'ingeniería'],
  ['reduzir', 'reduce', 'reducir'],
  ['deixar', 'leave', 'dejar'],
  ['essencial', 'essential', 'esencial'],
  ['evidente', 'evident', 'evidente'],
  ['atuar', 'work', 'actuar'],
  ['lead', 'lead', 'lead'],
  ['times', 'teams', 'equipos'],
]

export function looksPortuguese(text: string) {
  const n = fold(text)
  const marks = (text.match(/[ãõçÃÕÇ]/g) || []).length
  const words =
    n.match(
      /\b(desenvolvedor|desenvolvimento|formacao|experiencia|criacao|usuario|garantindo|interfaces|atuacao|universidade|certificacoes|resumo|nao|voce|curriculo|tecnologo|enfase|projetos|habilidades|competencias|idiomas|atuo|criei|desenhei|lidero|usando|para|uma|como|sobre)\b/g,
    )?.length ?? 0
  return marks >= 1 || words >= 3
}

export function looksSpanish(text: string) {
  const n = fold(text)
  return (
    /[ñ¿¡]/i.test(text) ||
    /\b(desarrollador|usted|trayectoria|resumen|tambien|formacion academica|experiencia laboral)\b/.test(n)
  )
}

export function looksEnglish(text: string) {
  const n = fold(text)
  const hits =
    n.match(/\b(the|with|from|this|that|which|developed|responsible|summary|built|using|experience|software engineer)\b/g)
      ?.length ?? 0
  return hits >= 3 && !looksPortuguese(text)
}

export function translateOffline(text: string, from: CvLang, to: CvLang): string {
  if (!text?.trim() || from === to) return text
  const protectedTokens: string[] = []
  let work = text.replace(/\b(?:Next\.js|Node\.js|React|Vue(?:\.js)?|Angular|Laravel|TypeScript|JavaScript|PostgreSQL|MySQL|MongoDB|Docker|Kubernetes|AWS|Azure|GCP|GitHub|GitLab|CI\/CD|RESTful|GraphQL|PHPUnit|Jasmine|Redmine|Oracle|Python|Java|Kotlin|Swift|Go|Ruby|PHP|HTML|CSS|SASS|Scrum|Kanban)\b/gi, (token) => {
    const key = `⟦${protectedTokens.length}⟧`
    protectedTokens.push(token)
    return key
  })

  work = applyRows(work, PHRASES, from, to)
  work = applyRows(work, WORDS, from, to)
  work = work.replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()
  if (to === 'en') work = fixEnglishOrder(work)
  protectedTokens.forEach((token, i) => {
    work = work.replace(`⟦${i}⟧`, token)
  })
  return work
}

function applyRows(text: string, rows: Row[], from: CvLang, to: CvLang) {
  const idx = { pt: 0, en: 1, es: 2 } as const
  const fromAt = idx[from]
  const toAt = idx[to]
  const pairs = rows
    .map((row) => [row[fromAt], row[toAt]] as const)
    .filter(([src, dst]) => src && dst && fold(src) !== fold(dst))
    .sort((a, b) => b[0].length - a[0].length)

  let out = text
  for (const [src, dst] of pairs) {
    out = out.replace(wordRe(src), (match) => preserveCase(match, dst))
  }
  return out
}

function fixEnglishOrder(text: string) {
  return text.replace(
    /\b(experience|experiences|interfaces|systems|solutions|applications|environments|tests|products)\s+(modern|efficient|advanced|scalable|digital|clear|high|automated|relational|distributed|strategic|containerized)\b/gi,
    '$2 $1',
  )
}

function wordRe(phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'giu')
}

function preserveCase(source: string, replacement: string): string {
  if (source.toUpperCase() === source) return replacement.toUpperCase()
  if (source[0] === source[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1)
  }
  return replacement
}

function fold(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
