import type { CVData } from './types'
import { uid } from './lib/id'

export const sampleCv: CVData = {
  name: 'Ana Clara Mendes',
  headline: 'Product Designer · Sistemas de design · Experiência digital',
  summary:
    'Designer de produto com 8 anos criando interfaces claras para produtos B2B e fintech. Une pesquisa, prototipagem e handoff próximo de engenharia. Foco em reduzir fricção e deixar o essencial evidente.',
  objective: 'Atuar como lead de product design em times de produto digital.',
  nationality: 'Brasileira',
  workAuth: '',
  photo: '',
  contact: {
    email: 'ana.mendes@email.com',
    phone: '+55 11 98888-1122',
    location: 'São Paulo, Brasil',
    website: 'anamendes.design',
    linkedin: 'linkedin.com/in/anaclara',
  },
  experience: [
    {
      id: uid(),
      company: 'Nimbus Pay',
      title: 'Lead Product Designer',
      location: 'São Paulo',
      startDate: 'Mar 2022',
      endDate: 'Atual',
      bullets: [
        'Lidero o design system usado por 4 squads e 18 produtos internos.',
        'Redesenhei o fluxo de onboarding e cortei o tempo até o primeiro pagamento em 37%.',
        'Instalei pesquisa contínua com 40 clientes e um ritual quinzenal com produto e engenharia.',
      ],
    },
    {
      id: uid(),
      company: 'Nimbus Pay',
      title: 'Product Designer',
      location: 'São Paulo',
      startDate: 'Jan 2020',
      endDate: 'Fev 2022',
      bullets: [
        'Desenhei o fluxo de cobrança recorrente e a área logada do cliente.',
        'Documentei componentes e ritmos de handoff com engenharia.',
      ],
    },
    {
      id: uid(),
      company: 'Atlas Saúde',
      title: 'Product Designer',
      location: 'Remoto',
      startDate: 'Jan 2019',
      endDate: 'Dez 2019',
      bullets: [
        'Desenhei o app de agendamento usado por 120 mil pacientes mensais.',
        'Padronizei componentes e documentação, reduzindo retrabalho de UI em 25%.',
        'Conduzi testes de usabilidade e priorizei o backlog junto ao PM.',
      ],
    },
    {
      id: uid(),
      company: 'Estúdio Norte',
      title: 'UI Designer',
      location: 'Campinas',
      startDate: 'Ago 2016',
      endDate: 'Dez 2018',
      bullets: [
        'Criei sites e identidades digitais para marcas de varejo e educação.',
        'Entreguei prototipagem de alta fidelidade e especificações para desenvolvimento.',
      ],
    },
  ],
  education: [
    {
      id: uid(),
      school: 'FAU-USP',
      degree: 'Bacharelado',
      field: 'Design',
      startDate: '2012',
      endDate: '2016',
      details: 'TCC em sistemas de informação para serviços públicos.',
    },
  ],
  skills: [
    { id: uid(), name: 'Product design' },
    { id: uid(), name: 'Design systems' },
    { id: uid(), name: 'Figma' },
    { id: uid(), name: 'Pesquisa com usuários' },
    { id: uid(), name: 'Prototipagem' },
    { id: uid(), name: 'Design tokens' },
    { id: uid(), name: 'Acessibilidade' },
    { id: uid(), name: 'Facilitação' },
  ],
  languages: [
    { id: uid(), name: 'Português', level: 'Nativo' },
    { id: uid(), name: 'Inglês', level: 'Fluente' },
    { id: uid(), name: 'Espanhol', level: 'Intermediário' },
  ],
  certifications: [
    {
      id: uid(),
      name: 'NN/g UX Certification',
      issuer: 'Nielsen Norman Group',
      date: '2023',
    },
  ],
}
