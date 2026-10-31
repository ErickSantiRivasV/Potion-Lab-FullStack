export const CATEGORIAS = {
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

const ESPECIALIDAD_A_FRONTEND = {
  Botany: "Herbalist",
  Runes: "Runist",
  Alchemy: "Taster",
  Brewing: "Brewmaster",
  Enchanting: "Enchanting",
};

const ESPECIALIDAD_A_BACKEND = {
  Herbalist: "Botany",
  Runist: "Runes",
  Taster: "Alchemy",
  Brewmaster: "Brewing",
  Enchanting: "Enchanting",
};

export function especialidadAFrontend(valor) {
  return ESPECIALIDAD_A_FRONTEND[valor] || valor;
}

export function especialidadABackend(valor) {
  return ESPECIALIDAD_A_BACKEND[valor] || valor;
}

function idDe(referencia) {
  if (referencia && typeof referencia === "object") {
    return referencia._id || referencia.id;
  }

  return referencia;
}

function soloFecha(valor) {
  return valor ? String(valor).slice(0, 10) : "";
}

export function mapearMiembro(miembro) {
  const poblado = miembro.user && typeof miembro.user === "object";
  const usuario = poblado ? miembro.user : {};

  return {
    id: idDe(miembro.user),
    name: usuario.nombre || "",
    specialty: especialidadAFrontend(usuario.specialty),
    avatar: usuario.avatar || "",
    role: miembro.role,
    joinDate: soloFecha(miembro.joinDate),
  };
}

export function mapearGremio(gremio) {
  return {
    id: gremio._id,
    name: gremio.name,
    motto: gremio.motto || "",
    type: gremio.type,
    emblem: gremio.emblem || "🧪",
    inviteCode: gremio.inviteCode || null,
    createdBy: idDe(gremio.createdBy),
    members: (gremio.members || []).map(mapearMiembro),
  };
}

export function mapearVotos(votos) {
  const resultado = { ingredient: {}, method: {}, flask: {} };

  (votos || []).forEach((voto) => {
    if (!resultado[voto.category]) return;

    resultado[voto.category][idDe(voto.user)] = voto.option;
  });

  return resultado;
}

export function mapearFormula(formula) {
  const gremioPoblado = formula.guild && typeof formula.guild === "object";
  const creadorPoblado =
    formula.createdBy && typeof formula.createdBy === "object";

  return {
    id: formula._id,
    guildId: idDe(formula.guild),
    guildName: gremioPoblado ? formula.guild.name : "",
    name: formula.name,
    effect: formula.effect,
    difficulty: formula.difficulty,
    state: formula.state,
    endDate: soloFecha(formula.endDate),
    createdBy: idDe(formula.createdBy),
    createdByName: creadorPoblado ? formula.createdBy.nombre : "",
    stateHistory: formula.stateHistory || [],
    votes: mapearVotos(formula.votes),
    categories: CATEGORIAS,
    vetoUsed: Boolean(formula.vetoUsed),
    vetoDetails: formula.vetoDetails || null,
    finalPotion:
      formula.finalPotion && formula.finalPotion.finalName
        ? formula.finalPotion
        : null,
  };
}

export function aCuerpoGremio(datos) {
  const cuerpo = {};

  if (datos.name !== undefined) cuerpo.name = datos.name.trim();
  if (datos.motto !== undefined) cuerpo.motto = datos.motto.trim();
  if (datos.type !== undefined) cuerpo.type = datos.type;
  if (datos.emblem !== undefined) cuerpo.emblem = datos.emblem.trim() || "🧪";

  if (datos.type === "Private" && datos.inviteCode) {
    cuerpo.inviteCode = String(datos.inviteCode).trim();
  }

  return cuerpo;
}

export function aCuerpoFormula(datos) {
  const cuerpo = {};

  if (datos.guildId !== undefined) cuerpo.guild = datos.guildId;
  if (datos.name !== undefined) cuerpo.name = datos.name.trim();
  if (datos.effect !== undefined) cuerpo.effect = datos.effect.trim();
  if (datos.difficulty !== undefined) {
    cuerpo.difficulty = Number(datos.difficulty);
  }
  if (datos.endDate !== undefined) cuerpo.endDate = datos.endDate;

  return cuerpo;
}
