import type { Colaborador, Dossie, KpiCiclo } from './types'

// Dados de exemplo — usados quando o Supabase não está configurado, e também
// como base de fallback para campos ausentes ao ler do banco.
export const MOCK_DOSSIE: Dossie = {
  colaborador: {
    id: 'carlos-eduardo-menezes',
    nome: 'Carlos Eduardo Menezes',
    cargo: 'Coordenador de Projetos Jurídicos',
    area: 'Diretoria de Demandas',
    matricula: '0042318',
    iniciais: 'CM',
    acessoRestrito: true,
    ssoMfa: true,
  },
  kpis: [
    { key: 'engajamento', label: 'Engajamento', value: 87, status: 'good', sub: 'Alto · +5pp vs ciclo anterior' },
    { key: 'pco', label: 'PCO', value: 73, status: 'warn', sub: 'Moderado · Meta: 80%' },
    { key: 'entregas', label: 'Entregas', value: 94, status: 'good', sub: 'Excelente · 17/18 on-time' },
    { key: 'presenca', label: 'Presença', value: 96, status: 'good', sub: 'Pontualidade: 98%' },
  ],
  recomendacoes: [
    {
      id: 'r2',
      tipo: 'warn',
      titulo: 'Fortalecer PCO com trilha de liderança',
      descricao: 'PCO 7pp abaixo da meta. Recomendar módulo "Gestão de Stakeholders" — disponível na trilha interna.',
    },
    {
      id: 'r3',
      tipo: 'info',
      titulo: 'Incluir em programa de mentoria reversa',
      descricao: 'PDAA acima de 90% — perfil adequado para compartilhamento de boas práticas com novos membros.',
    },
    {
      id: 'r4',
      tipo: 'good',
      titulo: 'Desenvolver negociação em cenários ambíguos',
      descricao: 'Ponto levantado em feedback de pares. Sugerir participação em rodadas de simulação com clientes.',
    },
  ],
  timeline: [
    { id: 't1', tipo: 'good', tipoEvento: 'cargo', titulo: 'Promoção para Coordenador de Projetos', meta: 'Diretoria de Demandas · Primeira coordenação de squad (5 membros)', data: 'Mar 2024', ordem: 7 },
    { id: 't2', tipo: 'info', tipoEvento: 'treinamento', titulo: 'Conclusão: Liderança Ágil (96h)', meta: 'Nota final: 9,2 · Certificado emitido · PDI cumprido', data: 'Nov 2023', ordem: 6 },
    { id: 't3', tipo: 'good', tipoEvento: 'avaliacao', titulo: 'Avaliação de desempenho — destaque', meta: 'Score: 4,7/5 · Reconhecimento público na diretoria', data: 'Set 2023', ordem: 5 },
    { id: 't4', tipo: 'warn', tipoEvento: 'feedback_formal', titulo: 'Feedback formal — gestão de prazo', meta: 'Atraso em entrega estratégica · Plano de ação elaborado · Resolvido', data: 'Jun 2023', ordem: 4 },
    { id: 't5', tipo: 'info', tipoEvento: 'treinamento', titulo: 'Treinamento: Análise de Dados Aplicada', meta: '40h · Concluído · Aplicado em projeto de BI interno', data: 'Fev 2023', ordem: 3 },
    { id: 't6', tipo: 'good', tipoEvento: 'cargo', titulo: 'Transição para Diretoria de Gente & Gestão', meta: 'Liderança de processo seletivo · Onboarding de 12 membros', data: 'Jan 2023', ordem: 2 },
    { id: 't7', tipo: 'info', tipoEvento: 'ingresso', titulo: 'Entrada na CONSEJ', meta: 'Diretoria Comercial · Trainee de prospecção', data: 'Mar 2022', ordem: 1 },
  ],
  kpisPorCiclo: [
    { ano: 2024, ciclo: 'C1', engajamento: 78, pco: 66, pdaa: 80, entregas: 82 },
    { ano: 2024, ciclo: 'C2', engajamento: 81, pco: 69, pdaa: 83, entregas: 85 },
    { ano: 2024, ciclo: 'C3', engajamento: 84, pco: 71, pdaa: 87, entregas: 88 },
    { ano: 2024, ciclo: 'C4', engajamento: 86, pco: 72, pdaa: 89, entregas: 90 },
    { ano: 2025, ciclo: 'C1', engajamento: 85, pco: 70, pdaa: 88, entregas: 89 },
    { ano: 2025, ciclo: 'C2', engajamento: 86, pco: 72, pdaa: 90, entregas: 91 },
    { ano: 2025, ciclo: 'C3', engajamento: 88, pco: 73, pdaa: 90, entregas: 93 },
    { ano: 2025, ciclo: 'C4', engajamento: 89, pco: 75, pdaa: 92, entregas: 94 },
    { ano: 2026, ciclo: 'C1', engajamento: 87, pco: 73, pdaa: 91, entregas: 94 },
    { ano: 2026, ciclo: 'C2', engajamento: 90, pco: 76, pdaa: 93, entregas: 95 },
  ],
  // Radar estilo Qulture.Rocks — competências comportamentais.
  competencias: [
    { eixo: 'Comunicação', valor: 78 },
    { eixo: 'Liderança', valor: 85 },
    { eixo: 'Colaboração', valor: 88 },
    { eixo: 'Proatividade', valor: 90 },
    { eixo: 'Execução', valor: 94 },
    { eixo: 'Adaptabilidade', valor: 81 },
  ],
  tendenciaScore: [
    { trimestre: 'Q1 24', score: 78 },
    { trimestre: 'Q2 24', score: 81 },
    { trimestre: 'Q3 24', score: 84 },
    { trimestre: 'Q4 24', score: 86 },
    { trimestre: 'Q1 25', score: 85 },
    { trimestre: 'Q2 25', score: 87 },
    { trimestre: 'Q3 25', score: 89 },
    { trimestre: 'Q4 25', score: 91 },
  ],
  perfil: {
    dataEntrada: 'Mar 2022',
    nascimento: '14/07/2002',
    celular: '(84) 99812-3045',
    email: 'carlos.menezes@consej.com.br',
    diretoriaAtual: 'Diretoria de Demandas',
    coordenadoriaAtual: 'Coordenadoria de Projetos Jurídicos',
    diretoriasAnteriores: [
      { diretoria: 'Diretoria Comercial', periodo: 'Mar 2022 – Dez 2022' },
      { diretoria: 'Diretoria de Gente & Gestão', periodo: 'Jan 2023 – Fev 2024' },
    ],
    curso: 'Direito · UFRN',
    periodoCurso: '8º período',
    perfilComportamental: 'Executor · DISC: D/C',
    arquetipo: 'O Realizador',
    interesses: ['Direito empresarial', 'Gestão de projetos', 'Mentoria', 'Dados & BI'],
  },
  pdi: [
    {
      id: 'p1',
      objetivo: 'Desenvolver liderança situacional',
      descricao: 'Preparar Carlos para assumir squads maiores, adaptando o estilo de liderança ao nível de maturidade do time.',
      prazo: '2026-06-30',
      registradoPor: 'Coordenadoria de Desempenho',
      atualizadoEm: '2026-05-10',
      metas: [
        { id: 'p1-m1', titulo: 'Concluir curso de liderança situacional', concluida: true },
        { id: 'p1-m2', titulo: 'Liderar 1 squad em rodízio', concluida: true },
        { id: 'p1-m3', titulo: 'Receber feedback 360 dos liderados', concluida: false },
      ],
    },
    {
      id: 'p2',
      objetivo: 'Melhorar gestão de stakeholders',
      prazo: '2026-08-31',
      registradoPor: 'Coordenadoria de Desempenho',
      atualizadoEm: '2026-04-02',
      metas: [
        { id: 'p2-m1', titulo: 'Mapear stakeholders-chave dos projetos ativos', concluida: true },
        { id: 'p2-m2', titulo: 'Reunião mensal de alinhamento com diretoria', concluida: false },
      ],
    },
    {
      id: 'p3',
      objetivo: 'Aprimorar comunicação executiva',
      prazo: '2026-07-15',
      registradoPor: 'Coordenadoria de Desempenho',
      atualizadoEm: '2026-05-01',
      metas: [
        { id: 'p3-m1', titulo: 'Apresentar 1 relatório trimestral à diretoria', concluida: true },
        { id: 'p3-m2', titulo: 'Workshop de comunicação assertiva', concluida: false },
      ],
    },
  ],
  feedbacks: [
    {
      id: 'f1',
      autor: 'Ana Paula Saraiva',
      papel: 'Gestora direta',
      data: 'Out 2024',
      ciclo: 'C4',
      ano: 2024,
      texto:
        'Carlos demonstra alta capacidade de mobilizar a equipe em momentos de pressão. Entregou o projeto X3 com 2 dias de antecedência e qualidade reconhecida pela diretoria. Como próximo passo, ganharia muito desenvolvendo assertividade na defesa de prazos com stakeholders externos.',
      categorias: ['positivo', 'gestor'],
      tags: [
        { label: 'Entrega', tone: 'good' },
        { label: 'Liderança', tone: 'info' },
      ],
    },
    {
      id: 'f2',
      autor: 'Rafael Drummond',
      papel: 'Diretor de Demandas',
      data: 'Abr 2025',
      ciclo: 'C1',
      ano: 2025,
      texto:
        'Demonstrou excelente organização no ciclo. Precisa evoluir na comunicação proativa — algumas situações de risco não foram escaladas a tempo. Ponto positivo: participação constante nas reuniões de diretoria.',
      categorias: ['desenvolvimento', 'gestor'],
      tags: [
        { label: 'Comunicação', tone: 'warn' },
        { label: 'Organização', tone: 'good' },
      ],
    },
  ],
  avaliacaoDesenvolvimento: {
    pontosDesenvolvimento: [
      'Desenvolver habilidades de negociação com stakeholders externos',
      'Aprofundar conhecimentos em análise de dados para projetos jurídicos',
      'Aprimorar comunicação executiva em apresentações para diretoria',
    ],
    percepcaoGestores: [
      'Precisa escalar riscos com mais antecedência',
      'Fortalecer PCO — atualmente 7pp abaixo da meta do time',
    ],
    pontosFortes: [
      'Alta capacidade de mobilização da equipe',
      'Comprometimento com prazos de entrega',
      'Proatividade em situações de pressão',
    ],
    pontosFracos: [
      'Tendência a centralizar decisões operacionais',
      'Comunicação assíncrona pode ser aprimorada',
    ],
  },
  auditoria: [
    { id: 'a1', quando: '04/06/2025 09:12', acao: 'Visualização do dossiê completo', ator: 'Ana P. Saraiva', tone: 'info' },
    { id: 'a2', quando: '01/06/2025 14:37', acao: 'Exportação de relatório parcial', ator: 'Gente & Gestão', tone: 'good' },
    { id: 'a3', quando: '28/05/2025 10:05', acao: 'Atualização de PDI — ciclo 2024', ator: 'Ana P. Saraiva', tone: 'info' },
    { id: 'a4', quando: '20/05/2025 16:22', acao: 'Tentativa de exportação bloqueada', ator: 'Acesso negado', tone: 'bad' },
    { id: 'a5', quando: '15/05/2025 08:50', acao: 'Registro de feedback — ciclo Q2', ator: 'Gente & Gestão', tone: 'good' },
  ],
  perfisAcesso: [
    { id: 'pa1', nome: 'Ana Paula Saraiva', permissao: 'Gestora direta · Leitura + Edição PDI', tone: 'info' },
    { id: 'pa2', nome: 'Diretoria de Gente & Gestão', permissao: 'Leitura completa + Exportação', tone: 'good' },
    { id: 'pa3', nome: 'Diretoria de Demandas', permissao: 'Leitura — KPIs e recomendações', tone: 'info' },
    { id: 'pa4', nome: 'Conselho', permissao: 'Somente log de auditoria', tone: 'warn' },
    { id: 'pa5', nome: 'Carlos E. Menezes (titular)', permissao: 'Visualização parcial — sem histórico disciplinar', tone: 'warn' },
  ],
  pdaa: {
    cicloAtual: { ano: 2026, ciclo: 'C2' },
    pontuacaoPorCiclo: [
      { ano: 2024, ciclo: 'C1', pontos: 4 },
      { ano: 2024, ciclo: 'C2', pontos: 6 },
      { ano: 2024, ciclo: 'C3', pontos: 9 },
      { ano: 2024, ciclo: 'C4', pontos: 5 },
      { ano: 2025, ciclo: 'C1', pontos: 3 },
      { ano: 2025, ciclo: 'C2', pontos: 7 },
      { ano: 2025, ciclo: 'C3', pontos: 5 },
      { ano: 2025, ciclo: 'C4', pontos: 2 },
      { ano: 2026, ciclo: 'C1', pontos: 6 },
      { ano: 2026, ciclo: 'C2', pontos: 8 },
    ],
    abonosPorCiclo: [
      { ano: 2024, ciclo: 'C1', usados: 1, registros: [{ id: 'ua1', tipo: 'Ação beneficente / voluntariado', data: 'Mar 2024', pontosAbonados: 1 }] },
      { ano: 2024, ciclo: 'C2', usados: 2, registros: [{ id: 'ua2', tipo: 'Destaque em entrega de projeto', data: 'Jun 2024', pontosAbonados: 2 }] },
      { ano: 2024, ciclo: 'C3', usados: 1, registros: [{ id: 'ua3', tipo: 'Contribuição em treinamento interno', data: 'Set 2024', pontosAbonados: 1 }] },
      { ano: 2024, ciclo: 'C4', usados: 0 },
      { ano: 2025, ciclo: 'C1', usados: 2, registros: [{ id: 'ua4', tipo: 'Indicação de novo membro aprovado', data: 'Jan 2025', pontosAbonados: 2 }] },
      { ano: 2025, ciclo: 'C2', usados: 1, registros: [{ id: 'ua5', tipo: 'Representação externa da CONSEJ', data: 'Mai 2025', pontosAbonados: 1 }] },
      { ano: 2025, ciclo: 'C3', usados: 3, registros: [{ id: 'ua6', tipo: 'Destaque em entrega de projeto', data: 'Ago 2025', pontosAbonados: 2 }, { id: 'ua7', tipo: 'Ação beneficente / voluntariado', data: 'Set 2025', pontosAbonados: 1 }] },
      { ano: 2025, ciclo: 'C4', usados: 1, registros: [{ id: 'ua8', tipo: 'Destaque em processo seletivo', data: 'Nov 2025', pontosAbonados: 1 }] },
      { ano: 2026, ciclo: 'C1', usados: 1, registros: [{ id: 'ua9', tipo: 'Contribuição em treinamento interno', data: 'Fev 2026', pontosAbonados: 1 }] },
      { ano: 2026, ciclo: 'C2', usados: 2, registros: [{ id: 'ua10', tipo: 'Representação externa da CONSEJ', data: 'Mai 2026', pontosAbonados: 2 }] },
    ],
    abonosDisponiveis: 5,
    estagioProbatorioUsado: false,
    condutasRegistradas: [
      { id: 'rc1', condutaId: 'm1', categoria: 'moderada', pontos: 2, descricao: 'Faltar (sem justificativa idônea) a RG, RT, 1:1 ou momento CONSEJ' },
      { id: 'rc2', condutaId: 'm5', categoria: 'moderada', pontos: 2, descricao: 'Passar mais de 2 dias sem interagir em GT ativo' },
      { id: 'rc3', condutaId: 'a5', categoria: 'alerta', pontos: 3, descricao: 'Atrasar envio de follow-up (conteúdos de valor)' },
      { id: 'rc4', condutaId: 'l2', categoria: 'leve', pontos: 1, descricao: 'Atrasar ou deixar de responder formulários de pesquisas internas no prazo' },
    ],
    condutasPorCiclo: [
      {
        ano: 2025, ciclo: 'C4',
        registros: [
          { id: 'h1', condutaId: 'l2', categoria: 'leve', pontos: 1, descricao: 'Atrasar ou deixar de responder formulários de pesquisas internas no prazo' },
          { id: 'h2', condutaId: 'm1', categoria: 'moderada', pontos: 1, descricao: 'Faltar (sem justificativa idônea) a RG, RT, 1:1 ou momento CONSEJ' },
        ],
      },
      {
        ano: 2025, ciclo: 'C3',
        registros: [
          { id: 'h3', condutaId: 'm1', categoria: 'moderada', pontos: 2, descricao: 'Faltar (sem justificativa idônea) a RG, RT, 1:1 ou momento CONSEJ' },
          { id: 'h4', condutaId: 'm3', categoria: 'moderada', pontos: 2, descricao: 'Não enviar o repasse de Grupo de Trabalho (GT) no prazo' },
          { id: 'h5', condutaId: 'l1', categoria: 'leve', pontos: 1, descricao: 'Atrasar (sem justificativa idônea) a RG, RT, 1:1 ou momento CONSEJ' },
        ],
      },
      {
        ano: 2025, ciclo: 'C2',
        registros: [
          { id: 'h6', condutaId: 'm5', categoria: 'moderada', pontos: 2, descricao: 'Passar mais de 2 dias sem interagir em GT ativo' },
          { id: 'h7', condutaId: 'a5', categoria: 'alerta', pontos: 3, descricao: 'Atrasar envio de follow-up (conteúdos de valor)' },
          { id: 'h8', condutaId: 'l2', categoria: 'leve', pontos: 1, descricao: 'Atrasar ou deixar de responder formulários de pesquisas internas no prazo' },
          { id: 'h9', condutaId: 'm1', categoria: 'moderada', pontos: 1, descricao: 'Faltar (sem justificativa idônea) a RG, RT, 1:1 ou momento CONSEJ' },
        ],
      },
    ],
  },
  gruposTrabalho: [
    {
      id: 'gt1', nome: 'GT Comercial', diretoria: 'Diretoria de Demandas', ciclo: 'C2', ano: 2026,
      entregas: [
        { id: 'e1', descricao: 'Mapeamento de leads — setor tech', prazo: '20/04/2026', status: 'no_prazo' },
        { id: 'e2', descricao: 'Proposta comercial para Cliente A', prazo: '05/05/2026', status: 'fora_prazo' },
        { id: 'e3', descricao: 'Follow-up pós-reunião de prospecção', prazo: '12/05/2026', status: 'pendente' },
      ],
    },
    {
      id: 'gt2', nome: 'GT Jurídico', diretoria: 'Diretoria de Demandas', ciclo: 'C2', ano: 2026,
      entregas: [
        { id: 'e4', descricao: 'Revisão de contrato — Cliente B', prazo: '10/04/2026', status: 'no_prazo' },
        { id: 'e5', descricao: 'Parecer sobre cláusula de confidencialidade', prazo: '28/04/2026', status: 'no_prazo' },
      ],
    },
    {
      id: 'gt3', nome: 'GT Comercial', diretoria: 'Diretoria de Demandas', ciclo: 'C1', ano: 2026,
      entregas: [
        { id: 'e6', descricao: 'Relatório de prospecção Q1', prazo: '15/01/2026', status: 'no_prazo' },
        { id: 'e7', descricao: 'Apresentação de resultados para diretoria', prazo: '28/01/2026', status: 'fora_prazo' },
      ],
    },
  ],
  participacaoGTs: [
    { ciclo: 'C2', ano: 2026, gts: ['GT Comercial', 'GT Jurídico'] },
    { ciclo: 'C1', ano: 2026, gts: ['GT Comercial'] },
    { ciclo: 'C4', ano: 2025, gts: ['GT Jurídico', 'GT Gente & Gestão'] },
    { ciclo: 'C3', ano: 2025, gts: ['GT Jurídico'] },
    { ciclo: 'C2', ano: 2025, gts: ['GT Comercial', 'GT Jurídico'] },
    { ciclo: 'C1', ano: 2025, gts: ['GT Comercial'] },
  ],
}

// Factory — cria um dossiê vazio com defaults sensatos para novos membros.
export function criarDossieBase(colaborador: Colaborador): Dossie {
  return {
    colaborador,
    kpis: [
      { key: 'engajamento', label: 'Engajamento', value: 0, status: 'warn', sub: 'Sem dados ainda' },
      { key: 'pco', label: 'PCO', value: 0, status: 'warn', sub: 'Sem dados ainda' },
      { key: 'entregas', label: 'Entregas', value: 0, status: 'warn', sub: 'Sem dados ainda' },
      { key: 'presenca', label: 'Presença', value: 0, status: 'warn', sub: 'Sem dados ainda' },
    ],
    recomendacoes: [],
    timeline: [],
    kpisPorCiclo: [],
    competencias: [],
    tendenciaScore: [],
    perfil: {
      dataEntrada: '',
      nascimento: '',
      celular: '',
      email: colaborador.email ?? '',
      diretoriaAtual: colaborador.area,
      coordenadoriaAtual: '',
      diretoriasAnteriores: [],
      curso: '',
      periodoCurso: '',
      perfilComportamental: '',
      arquetipo: '',
      interesses: [],
    },
    pdi: [],
    feedbacks: [],
    avaliacaoDesenvolvimento: {
      pontosDesenvolvimento: [],
      percepcaoGestores: [],
      pontosFortes: [],
      pontosFracos: [],
    },
    auditoria: [],
    perfisAcesso: [],
    pdaa: {
      cicloAtual: { ano: 2026, ciclo: 'C2' },
      pontuacaoPorCiclo: [],
      abonosPorCiclo: [],
      abonosDisponiveis: 3,
      estagioProbatorioUsado: false,
      condutasRegistradas: [],
    },
    gruposTrabalho: [],
    participacaoGTs: [],
  }
}

function membro(
  id: string,
  nome: string,
  cargo: string,
  area: string,
  iniciais: string,
  dataEntrada: string,
  kpisPorCiclo: KpiCiclo[] = [],
  cargoDuplo?: { cargoSecundario: string; areaSecundaria: string },
  email?: string,
): Dossie {
  const base = criarDossieBase({
    id, nome, cargo, area, matricula: '', iniciais, acessoRestrito: false, ssoMfa: false,
    ...cargoDuplo,
    ...(email ? { email } : {}),
  })
  base.perfil.dataEntrada = dataEntrada
  base.kpisPorCiclo = kpisPorCiclo
  base.timeline = [
    { id: `${id}-t1`, tipo: 'info', tipoEvento: 'ingresso', titulo: 'Ingresso na CONSEJ', meta: `${area} · ${cargo}`, data: dataEntrada, ordem: 1 },
  ]
  return base
}

// Todos os membros disponíveis no modo mock.
// Carlos (MOCK_DOSSIE) tem dados completos; os demais têm KPIs dos ciclos recentes.
export const MOCK_MEMBROS: Dossie[] = [
  MOCK_DOSSIE,
  membro('ana-lima', 'Ana Lima', 'Diretora de Pesquisas e Pessoas', 'Diretoria de Pesquisas e Pessoas', 'AL', 'Ago 2024', [
    { ano: 2025, ciclo: 'C1', engajamento: 82, pco: 70, pdaa: 0, entregas: 85 },
    { ano: 2025, ciclo: 'C2', engajamento: 85, pco: 73, pdaa: 0, entregas: 88 },
    { ano: 2025, ciclo: 'C3', engajamento: 83, pco: 71, pdaa: 0, entregas: 86 },
    { ano: 2025, ciclo: 'C4', engajamento: 86, pco: 74, pdaa: 0, entregas: 89 },
    { ano: 2026, ciclo: 'C1', engajamento: 84, pco: 72, pdaa: 0, entregas: 87 },
    { ano: 2026, ciclo: 'C2', engajamento: 88, pco: 75, pdaa: 0, entregas: 91 },
  ]),
  membro('rafael-drum', 'Rafael Drummond', 'Gerente de Negócios', 'Diretoria de Negócios', 'RD', 'Mar 2025', [
    { ano: 2025, ciclo: 'C2', engajamento: 75, pco: 63, pdaa: 0, entregas: 78 },
    { ano: 2025, ciclo: 'C3', engajamento: 78, pco: 65, pdaa: 0, entregas: 80 },
    { ano: 2025, ciclo: 'C4', engajamento: 80, pco: 67, pdaa: 0, entregas: 83 },
    { ano: 2026, ciclo: 'C1', engajamento: 79, pco: 66, pdaa: 0, entregas: 82 },
    { ano: 2026, ciclo: 'C2', engajamento: 81, pco: 68, pdaa: 0, entregas: 85 },
  ]),
  membro('mariana-costa', 'Mariana Costa', 'Gerente de Demandas', 'Diretoria de Demandas', 'MC', 'Jan 2025', [
    { ano: 2025, ciclo: 'C1', engajamento: 79, pco: 68, pdaa: 0, entregas: 83 },
    { ano: 2025, ciclo: 'C2', engajamento: 82, pco: 70, pdaa: 0, entregas: 85 },
    { ano: 2025, ciclo: 'C3', engajamento: 80, pco: 69, pdaa: 0, entregas: 84 },
    { ano: 2025, ciclo: 'C4', engajamento: 83, pco: 71, pdaa: 0, entregas: 87 },
    { ano: 2026, ciclo: 'C1', engajamento: 82, pco: 70, pdaa: 0, entregas: 86 },
    { ano: 2026, ciclo: 'C2', engajamento: 85, pco: 72, pdaa: 0, entregas: 89 },
  ]),
  membro('pedro-alves', 'Pedro Alves', 'Presidente Executivo', 'Diretoria de Presidência', 'PA', 'Fev 2024', [
    { ano: 2024, ciclo: 'C1', engajamento: 88, pco: 78, pdaa: 0, entregas: 90 },
    { ano: 2024, ciclo: 'C2', engajamento: 90, pco: 80, pdaa: 0, entregas: 92 },
    { ano: 2024, ciclo: 'C3', engajamento: 91, pco: 81, pdaa: 0, entregas: 93 },
    { ano: 2024, ciclo: 'C4', engajamento: 92, pco: 82, pdaa: 0, entregas: 94 },
    { ano: 2025, ciclo: 'C1', engajamento: 90, pco: 80, pdaa: 0, entregas: 93 },
    { ano: 2025, ciclo: 'C2', engajamento: 92, pco: 82, pdaa: 0, entregas: 95 },
    { ano: 2025, ciclo: 'C3', engajamento: 91, pco: 81, pdaa: 0, entregas: 94 },
    { ano: 2025, ciclo: 'C4', engajamento: 93, pco: 83, pdaa: 0, entregas: 96 },
    { ano: 2026, ciclo: 'C1', engajamento: 92, pco: 82, pdaa: 0, entregas: 95 },
    { ano: 2026, ciclo: 'C2', engajamento: 94, pco: 84, pdaa: 0, entregas: 97 },
  ]),
  membro('julia-santos', 'Julia Santos', 'Vice Presidente', 'Diretoria de Vice-Presidência', 'JS', 'Set 2024', [
    { ano: 2024, ciclo: 'C4', engajamento: 77, pco: 65, pdaa: 0, entregas: 80 },
    { ano: 2025, ciclo: 'C1', engajamento: 79, pco: 67, pdaa: 0, entregas: 82 },
    { ano: 2025, ciclo: 'C2', engajamento: 81, pco: 69, pdaa: 0, entregas: 84 },
    { ano: 2025, ciclo: 'C3', engajamento: 80, pco: 68, pdaa: 0, entregas: 83 },
    { ano: 2025, ciclo: 'C4', engajamento: 82, pco: 70, pdaa: 0, entregas: 85 },
    { ano: 2026, ciclo: 'C1', engajamento: 83, pco: 71, pdaa: 0, entregas: 86 },
    { ano: 2026, ciclo: 'C2', engajamento: 85, pco: 73, pdaa: 0, entregas: 88 },
  ]),
  membro('lucas-mendes', 'Lucas Mendes', 'Gerente de Marketing', 'Diretoria de Marketing', 'LM', 'Nov 2024', [
    { ano: 2024, ciclo: 'C4', engajamento: 72, pco: 60, pdaa: 0, entregas: 75 },
    { ano: 2025, ciclo: 'C1', engajamento: 74, pco: 62, pdaa: 0, entregas: 77 },
    { ano: 2025, ciclo: 'C2', engajamento: 76, pco: 64, pdaa: 0, entregas: 79 },
    { ano: 2025, ciclo: 'C3', engajamento: 75, pco: 63, pdaa: 0, entregas: 78 },
    { ano: 2025, ciclo: 'C4', engajamento: 78, pco: 66, pdaa: 0, entregas: 81 },
    { ano: 2026, ciclo: 'C1', engajamento: 77, pco: 65, pdaa: 0, entregas: 80 },
    { ano: 2026, ciclo: 'C2', engajamento: 80, pco: 67, pdaa: 0, entregas: 83 },
  ]),

  // ---- Quadro completo importado do organograma — sem dados de desempenho ainda ----

  // Diretoria executiva
  membro('ana-luiza-medeiros', 'Ana Luiza Cortez de Medeiros', 'Diretora de Demandas', 'Diretoria de Demandas', 'AL', '', [],
    { cargoSecundario: 'Presidente Executiva', areaSecundaria: 'Diretoria de Presidência' }),
  membro('gabi-domingues', 'Gabi Domingues', 'Diretora de Pesquisas e Pessoas', 'Diretoria de Pesquisas e Pessoas', 'GD', '', [],
    { cargoSecundario: 'Vice-Presidente', areaSecundaria: 'Diretoria de Vice-Presidência' }),
  membro('luna-cavalcanti', 'Luna Cavalcanti Ferreira de Melo', 'Diretora de Negócios', 'Diretoria de Negócios', 'LC', '', [],
    { cargoSecundario: 'Diretora de Marketing', areaSecundaria: 'Diretoria de Marketing' }, 'luna.melo@consej.com.br'),

  // Gerência
  membro('camila-pereira', 'Camila Silveira de Medeiros Pereira', 'Gerente de Marketing', 'Diretoria de Marketing', 'CS', '', [], undefined, 'camila.silveira@consej.com.br'),
  membro('davi-costa', 'Davi Gonçalves da Costa', 'Gerente de Pesquisas e Pessoas', 'Diretoria de Pesquisas e Pessoas', 'DG', '', [], undefined, 'davi.goncalves@consej.com.br'),
  membro('isabela-barros', 'Isabela Fasanaro Barros', 'Gerente de Pesquisas e Pessoas', 'Diretoria de Pesquisas e Pessoas', 'IF', '', [], undefined, 'isabela.fasanaro@consej.com.br'),
  membro('jose-arthur-paiva', 'José Arthur Nunes Amaral de Paiva', 'Gerente de Demandas', 'Diretoria de Demandas', 'JA', '', [], undefined, 'jose.arthur@consej.com.br'),
  membro('maria-fernanda-silva', 'Maria Fernanda Lima Souza e Silva', 'Gerente de Demandas', 'Diretoria de Demandas', 'MF', '', [], undefined, 'maria.fernanda@consej.com.br'),
  membro('maria-isabel-dorini', 'Maria Isabel Miranda Bertoncini Dorini', 'Gerente de Demandas', 'Diretoria de Demandas', 'MI', '', [], undefined, 'maria.isabel@consej.com.br'),
  membro('maria-julia-dantas', 'Maria Julia Dantas', 'Gerente de Negócios', 'Diretoria de Negócios', 'MJ', '', [], undefined, 'maria.dantas@consej.com.br'),
  membro('matheus-cunha', 'Matheus Fonseca da Cunha', 'Gerente de Presidência', 'Diretoria de Presidência', 'MF', '', [], undefined, 'matheus.fonseca@consej.com.br'),
  membro('ruan-moura', 'Ruan Hagno de Assis Moura', 'Gerente de Pesquisas e Pessoas', 'Diretoria de Pesquisas e Pessoas', 'RH', '', [], undefined, 'ruan.hagno@consej.com.br'),

  // Coordenadoria de Demandas
  membro('andre-mendonca', 'André Mendonça', 'Coordenadoria de Clientes', 'Diretoria de Demandas', 'AM', ''),
  membro('arthur-nunes', 'Arthur Maia Nunes', 'Coordenadoria de Procedimentos Internos', 'Diretoria de Demandas', 'AM', '', [], undefined, 'arthur.maia@consej.com.br'),
  membro('gustavo-henrique', 'Gustavo Henrique', 'Coordenadoria de Procedimentos Internos', 'Diretoria de Demandas', 'GH', '', [], undefined, 'gustavo.henrique@consej.com.br'),

  // Coordenadoria de Marketing
  membro('ana-carolina-oliveira', 'Ana Carolina Azevedo Oliveira', 'Coordenadoria de Social Media', 'Diretoria de Marketing', 'AC', ''),
  membro('fernanda-amorim', 'Fernanda Sâmara Rodrigues Amorim', 'Coordenadoria de Inbound Marketing', 'Diretoria de Marketing', 'FS', '', [], undefined, 'fernanda.samara@consej.com.br'),
  membro('valentina-vicioli', 'Valentina Vanzato Vicioli', 'Coordenadoria de Social Media', 'Diretoria de Marketing', 'VV', '', [], undefined, 'valentina.vicioli@consej.com.br'),

  // Coordenadoria de Negócios
  membro('hebert-rego', 'Hebert Vinícius Santos Rêgo', 'Growth', 'Diretoria de Negócios', 'HV', '', [], undefined, 'hebert.vinicius@consej.com.br'),
  membro('joao-felipe-sa', 'João Felipe rosas de Sá', 'Closer', 'Diretoria de Negócios', 'JF', '', [], undefined, 'joao.felipe@consej.com.br'),
  membro('larissa-vale', 'Larissa da Fonte Porto Carreiro de Lima Vale', 'Closer', 'Diretoria de Negócios', 'LD', '', [], undefined, 'larissa.fonte@consej.com.br'),
  membro('millena-moncores', 'Millena Corrêa Monçores', 'Growth', 'Diretoria de Negócios', 'MC', '', [], undefined, 'millena.moncores@consej.com.br'),

  // Coordenadoria de Pesquisas e Pessoas
  membro('guilherme-chaves-silva', 'Guilherme Chaves Lopes de Lima e Silva', 'Coordenadoria de Experiência do Time', 'Diretoria de Pesquisas e Pessoas', 'GC', '', [], undefined, 'guilherme.chaves@consej.com.br'),
  membro('lara-barros', 'Lara Gomes Pereira Barros', 'Coordenadoria de Experiência do Time', 'Diretoria de Pesquisas e Pessoas', 'LG', ''),

  // Coordenadoria de Presidência
  membro('joao-vitor-silva', 'João Vitor Pessoa Silva', 'Coordenadoria de Parcerias', 'Diretoria de Presidência', 'JV', '', [], undefined, 'joao.pessoa@consej.com.br'),
  membro('julia-monte', 'Júlia Silva do Monte', 'Coordenadoria de Parcerias', 'Diretoria de Presidência', 'JS', '', [], undefined, 'julia.monte@consej.com.br'),
  membro('kelvin-watson', 'Kelvin Watson', 'Coordenadoria de Operações', 'Diretoria de Presidência', 'KW', '', [], undefined, 'kelvin.watson@consej.com.br'),
  membro('lucas-holanda-souza', 'Lucas Holanda Campelo Martins de Souza', 'Coordenadoria de Operações', 'Diretoria de Presidência', 'LH', '', [], undefined, 'lucas.holanda@consej.com.br'),

  // Coordenadoria de Vice-Presidência
  membro('gabriel-araujo', 'Gabriel Araujo', 'Coordenadoria de Finanças', 'Diretoria de Vice-Presidência', 'GA', '', [], undefined, 'gabriel.lima@consej.com.br'),
  membro('ivyson-melo', 'Ivyson Henrique Oliveira Melo', 'Coordenadoria de Estratégia', 'Diretoria de Vice-Presidência', 'IH', '', [], undefined, 'ivyson.henrique@consej.com.br'),
  membro('leticia-caldas', 'Leticia Gomes Maia Caldas', 'Coordenadoria de Estratégia', 'Diretoria de Vice-Presidência', 'LG', '', [], undefined, 'leticia.caldas@consej.com.br'),
  membro('mateus-almeida', 'Mateus Oliveira de Almeida', 'Coordenadoria de Inovação', 'Diretoria de Vice-Presidência', 'MO', ''),
]

// Computa a média real de KPIs do time a partir de todos os dossiês.
// Usado tanto no TeamDashboard quanto no comparativo individual — garante que os números coincidam.
export function computeMediaTime(allDossies: Dossie[]): KpiCiclo[] {
  const map = new Map<string, { ano: number; ciclo: string; eng: number[]; pco: number[]; ent: number[] }>()
  for (const d of allDossies) {
    for (const k of d.kpisPorCiclo) {
      const key = `${k.ano}-${k.ciclo}`
      if (!map.has(key)) map.set(key, { ano: k.ano, ciclo: k.ciclo, eng: [], pco: [], ent: [] })
      const e = map.get(key)!
      e.eng.push(k.engajamento)
      e.pco.push(k.pco)
      e.ent.push(k.entregas)
    }
  }
  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((s, n) => s + n, 0) / arr.length) : 0
  return [...map.values()]
    .sort((a, b) => a.ano !== b.ano ? a.ano - b.ano : a.ciclo.localeCompare(b.ciclo))
    .map((e) => ({ ano: e.ano, ciclo: e.ciclo, engajamento: avg(e.eng), pco: avg(e.pco), entregas: avg(e.ent), pdaa: 0 }))
}
