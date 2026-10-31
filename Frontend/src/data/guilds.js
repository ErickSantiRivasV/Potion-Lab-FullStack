const guilds = [
  {
    id: 1,
    name: "Alquimistas EIA",
    motto: "El conocimiento es nuestra mejor fórmula.",
    type: "Public",
    emblem: "🧪",
    inviteCode: null,
    members: [
      { id: 1, name: "Erick Rivas", specialty: "Brewmaster", role: "Grandmaster", joinDate: "2026-07-01" },
      { id: 2, name: "Ana López", specialty: "Herbalist", role: "Senior Alchemist", joinDate: "2026-07-03" },
      { id: 3, name: "Carlos Pérez", specialty: "Runist", role: "Apprentice", joinDate: "2026-07-05" },
      { id: 7, name: "Mateo Torres", specialty: "Herbalist", role: "Apprentice", joinDate: "2026-07-10" },
      { id: 9, name: "Julián Castro", specialty: "Runist", role: "Senior Alchemist", joinDate: "2026-07-08" },
      { id: 11, name: "Andrés Vélez", specialty: "Taster", role: "Taster", joinDate: "2026-07-12" },
    ],
  },

  {
    id: 2,
    name: "Maestros de la Pócima",
    motto: "Experimentar hasta encontrar la fórmula perfecta.",
    type: "Public",
    emblem: "⚗️",
    inviteCode: null,
    members: [
      { id: 4, name: "Laura Gómez", specialty: "Taster", role: "Grandmaster", joinDate: "2026-07-02" },
      { id: 5, name: "Daniel Ruiz", specialty: "Brewmaster", role: "Senior Alchemist", joinDate: "2026-07-04" },
      { id: 8, name: "Valentina Ríos", specialty: "Herbalist", role: "Apprentice", joinDate: "2026-07-09" },
      { id: 10, name: "Camila Ortiz", specialty: "Runist", role: "Apprentice", joinDate: "2026-07-11" },
    ],
  },

  {
    id: 3,
    name: "Orden de la Luna",
    motto: "Los secretos deben permanecer ocultos.",
    type: "Private",
    emblem: "🌙",
    inviteCode: "LUNA23",
    members: [
      { id: 6, name: "Sofía Martínez", specialty: "Herbalist", role: "Grandmaster", joinDate: "2026-07-01" },
      { id: 12, name: "Isabella Marín", specialty: "Taster", role: "Apprentice", joinDate: "2026-07-06" },
    ],
  },
];

export default guilds;