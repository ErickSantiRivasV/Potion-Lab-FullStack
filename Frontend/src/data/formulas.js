const categoriasBase = {
  ingredient: {
    name: "Ingrediente base",
    options: ["Raíz de Mandrágora", "Polvo de Estrellas"],
  },
  method: {
    name: "Método de calentamiento",
    options: ["Llama Azul", "Baño de Agua Arcana"],
  },
  flask: {
    name: "Tipo de frasco",
    options: ["Cristal Lunar", "Cráneo de Plata"],
  },
};

const formulas = [
  // ---------- GREMIO 1: Alquimistas EIA ----------
  {
    id: 1,
    guildId: 1,
    name: "Poción del Conocimiento",
    effect: "Aumentar temporalmente la capacidad de aprendizaje.",
    difficulty: 2,
    state: "Proposal",
    endDate: "2026-09-03",
    createdBy: 2,
    createdByName: "Ana López",
    stateHistory: [
      { state: "Proposal", changedAt: "2026-08-28T09:00:00.000Z", changedBy: "Ana López" },
    ],
    votes: { ingredient: {}, method: {}, flask: {} },
    categories: categoriasBase,
  },

  {
    id: 2,
    guildId: 1,
    name: "Elixir de Fuerza",
    effect: "Aumentar temporalmente la fuerza física.",
    difficulty: 3,
    state: "VotingOpen",
    endDate: "2026-09-01",
    createdBy: 1,
    createdByName: "Erick Rivas",
    stateHistory: [
      { state: "Proposal", changedAt: "2026-08-20T09:00:00.000Z", changedBy: "Erick Rivas" },
      { state: "VotingOpen", changedAt: "2026-08-27T09:00:00.000Z", changedBy: "Erick Rivas" },
    ],
    votes: {
      ingredient: { 3: "Raíz de Mandrágora", 9: "Polvo de Estrellas" },
      method: { 1: "Llama Azul" },
      flask: { 2: "Cristal Lunar" },
    },
    categories: categoriasBase,
  },

  {
    id: 3,
    guildId: 1,
    name: "Bruma del Sigilo",
    effect: "Vuelve al bebedor casi invisible por unos minutos.",
    difficulty: 1,
    state: "VotingOpen",
    endDate: "2026-09-02",
    createdBy: 9,
    createdByName: "Julián Castro",
    stateHistory: [
      { state: "Proposal", changedAt: "2026-08-21T09:00:00.000Z", changedBy: "Julián Castro" },
      { state: "VotingOpen", changedAt: "2026-08-27T15:00:00.000Z", changedBy: "Julián Castro" },
    ],
    votes: {
      ingredient: { 7: "Polvo de Estrellas" },
      method: { 11: "Baño de Agua Arcana" },
      flask: { 3: "Cráneo de Plata" },
    },
    categories: categoriasBase,
  },

  {
    id: 4,
    guildId: 1,
    name: "Tónico de Clarividencia",
    effect: "Permite anticipar el próximo movimiento de un rival.",
    difficulty: 4,
    state: "Closed",
    endDate: "2026-08-20",
    createdBy: 2,
    createdByName: "Ana López",
    stateHistory: [
      { state: "Proposal", changedAt: "2026-08-10T09:00:00.000Z", changedBy: "Ana López" },
      { state: "VotingOpen", changedAt: "2026-08-11T09:00:00.000Z", changedBy: "Ana López" },
      { state: "Closed", changedAt: "2026-08-20T09:00:00.000Z", changedBy: "Erick Rivas" },
    ],
    // Empate a propósito: Erick (Grandmaster, peso 1.2 por Brewmaster) vs
    // Ana (Senior, peso 1.2 por Herbalist+ingrediente) -> 1.2 a 1.2.
    // Al destilar, el desempate lo decide el Grandmaster (Erick), que ya
    // había votado por "Raíz de Mandrágora".
    votes: {
      ingredient: { 1: "Raíz de Mandrágora", 2: "Polvo de Estrellas" },
      method: { 7: "Llama Azul", 11: "Baño de Agua Arcana" },
      flask: { 11: "Cristal Lunar", 9: "Cráneo de Plata" },
    },
    categories: categoriasBase,
  },

  {
    id: 5,
    guildId: 1,
    name: "Esencia de Resistencia",
    effect: "Reduce el cansancio durante esfuerzos prolongados.",
    difficulty: 3,
    state: "Distilled",
    endDate: "2026-08-15",
    createdBy: 1,
    createdByName: "Erick Rivas",
    stateHistory: [
      { state: "Proposal", changedAt: "2026-08-01T09:00:00.000Z", changedBy: "Erick Rivas" },
      { state: "VotingOpen", changedAt: "2026-08-02T09:00:00.000Z", changedBy: "Erick Rivas" },
      { state: "Closed", changedAt: "2026-08-14T09:00:00.000Z", changedBy: "Erick Rivas" },
      { state: "Distilled", changedAt: "2026-08-15T09:00:00.000Z", changedBy: "Erick Rivas" },
    ],
    votes: {
      ingredient: { 1: "Raíz de Mandrágora", 2: "Raíz de Mandrágora", 7: "Polvo de Estrellas" },
      method: { 1: "Llama Azul", 9: "Baño de Agua Arcana", 11: "Baño de Agua Arcana" },
      flask: { 2: "Cristal Lunar", 11: "Cristal Lunar", 3: "Cráneo de Plata" },
    },
    finalPotion: {
      finalName: "Raíz de Mandrágora + Baño de Agua Arcana en Cristal Lunar",
      realDifficulty: 8.6,
      rarity: 99.6,
      winners: {
        ingredient: "Raíz de Mandrágora",
        method: "Baño de Agua Arcana",
        flask: "Cristal Lunar",
      },
    },
    categories: categoriasBase,
  },

  // ---------- GREMIO 2: Maestros de la Pócima ----------
  {
    id: 6,
    guildId: 2,
    name: "Poción de Curación Menor",
    effect: "Cierra heridas superficiales en segundos.",
    difficulty: 1,
    state: "Proposal",
    endDate: "2026-09-04",
    createdBy: 5,
    createdByName: "Daniel Ruiz",
    stateHistory: [
      { state: "Proposal", changedAt: "2026-08-28T10:00:00.000Z", changedBy: "Daniel Ruiz" },
    ],
    votes: { ingredient: {}, method: {}, flask: {} },
    categories: categoriasBase,
  },

  {
    id: 7,
    guildId: 2,
    name: "Filtro de Elocuencia",
    effect: "Vuelve más persuasivas las palabras del bebedor.",
    difficulty: 2,
    state: "VotingOpen",
    endDate: "2026-08-31",
    createdBy: 4,
    createdByName: "Laura Gómez",
    stateHistory: [
      { state: "Proposal", changedAt: "2026-08-24T09:00:00.000Z", changedBy: "Laura Gómez" },
      { state: "VotingOpen", changedAt: "2026-08-27T11:00:00.000Z", changedBy: "Laura Gómez" },
    ],
    votes: {
      ingredient: { 8: "Raíz de Mandrágora" },
      method: { 10: "Llama Azul" },
      flask: { 4: "Cristal Lunar" },
    },
    categories: categoriasBase,
  },

  {
    id: 8,
    guildId: 2,
    name: "Poción de Visión Lunar",
    effect: "Permite ver claramente durante la noche.",
    difficulty: 2,
    state: "Distilled",
    endDate: "2026-08-10",
    createdBy: 4,
    createdByName: "Laura Gómez",
    stateHistory: [
      { state: "Proposal", changedAt: "2026-07-28T09:00:00.000Z", changedBy: "Laura Gómez" },
      { state: "VotingOpen", changedAt: "2026-07-29T09:00:00.000Z", changedBy: "Laura Gómez" },
      { state: "Closed", changedAt: "2026-08-09T09:00:00.000Z", changedBy: "Laura Gómez" },
      { state: "Distilled", changedAt: "2026-08-10T09:00:00.000Z", changedBy: "Laura Gómez" },
    ],
    votes: {
      ingredient: { 8: "Raíz de Mandrágora", 5: "Polvo de Estrellas", 10: "Polvo de Estrellas" },
      method: { 10: "Llama Azul", 4: "Baño de Agua Arcana", 5: "Llama Azul" },
      flask: { 4: "Cristal Lunar", 8: "Cráneo de Plata" },
    },
    finalPotion: {
      finalName: "Polvo de Estrellas + Llama Azul en Cristal Lunar",
      realDifficulty: 6.6,
      rarity: 77.4,
      winners: {
        ingredient: "Polvo de Estrellas",
        method: "Llama Azul",
        flask: "Cristal Lunar",
      },
    },
    categories: categoriasBase,
  },

  // ---------- GREMIO 3: Orden de la Luna ----------
  {
    id: 9,
    guildId: 3,
    name: "Brebaje del Silencio",
    effect: "Anula cualquier sonido alrededor del bebedor por un minuto.",
    difficulty: 3,
    state: "Closed",
    endDate: "2026-08-22",
    createdBy: 6,
    createdByName: "Sofía Martínez",
    stateHistory: [
      { state: "Proposal", changedAt: "2026-08-12T09:00:00.000Z", changedBy: "Sofía Martínez" },
      { state: "VotingOpen", changedAt: "2026-08-13T09:00:00.000Z", changedBy: "Sofía Martínez" },
      { state: "Closed", changedAt: "2026-08-22T09:00:00.000Z", changedBy: "Sofía Martínez" },
    ],
    // Otro empate real: en "método", Sofía e Isabella tienen el mismo peso
    // (1.0 cada una, ninguna tiene bono en esa categoría). Como este gremio
    // no tiene Taster Oficial, el desempate lo decide la Grandmaster
    // (Sofía), que votó "Llama Azul".
    votes: {
      ingredient: { 6: "Raíz de Mandrágora", 12: "Polvo de Estrellas" },
      method: { 6: "Llama Azul", 12: "Baño de Agua Arcana" },
      flask: { 6: "Cristal Lunar", 12: "Cráneo de Plata" },
    },
    categories: categoriasBase,
  },

  {
    id: 10,
    guildId: 3,
    name: "Elixir de las Sombras",
    effect: "Permite fundirse brevemente con la oscuridad.",
    difficulty: 1,
    state: "Distilled",
    endDate: "2026-08-05",
    createdBy: 6,
    createdByName: "Sofía Martínez",
    stateHistory: [
      { state: "Proposal", changedAt: "2026-07-25T09:00:00.000Z", changedBy: "Sofía Martínez" },
      { state: "VotingOpen", changedAt: "2026-07-26T09:00:00.000Z", changedBy: "Sofía Martínez" },
      { state: "Closed", changedAt: "2026-08-04T09:00:00.000Z", changedBy: "Sofía Martínez" },
      { state: "Distilled", changedAt: "2026-08-05T09:00:00.000Z", changedBy: "Sofía Martínez" },
    ],
    votes: {
      ingredient: { 6: "Raíz de Mandrágora", 12: "Polvo de Estrellas" },
      method: { 6: "Llama Azul", 12: "Llama Azul" },
      flask: { 6: "Cristal Lunar", 12: "Cráneo de Plata" },
    },
    finalPotion: {
      finalName: "Raíz de Mandrágora + Llama Azul en Cráneo de Plata",
      realDifficulty: 4.2,
      rarity: 49.6,
      winners: {
        ingredient: "Raíz de Mandrágora",
        method: "Llama Azul",
        flask: "Cráneo de Plata",
      },
    },
    categories: categoriasBase,
  },
];

export default formulas;