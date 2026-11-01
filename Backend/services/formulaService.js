const Formula = require('../models/Formula');
const Guild = require('../models/Gremio');
const User = require('../models/Usuario');
const {
  ESTADOS_FORMULA,
  CATEGORIAS,
  NOMBRES_CATEGORIAS,
} = require('../utils/constants');

// ---------- helpers ----------

function esAdmin(usuario) {
  return usuario.role === 'admin';
}

function rolEnGremio(gremio, usuarioId) {
  const miembro = gremio.members.find(
    (m) => m.user.toString() === usuarioId.toString(),
  );

  return miembro ? miembro.role : null;
}

async function buscarGremio(id) {
  const gremio = await Guild.findById(id);

  if (!gremio) {
    throw { status: 404, message: 'Gremio no encontrado' };
  }

  return gremio;
}

// Las fórmulas de un gremio privado solo las ven sus miembros (y los admin)
function verificarAcceso(gremio, usuario) {
  if (gremio.type === 'Public' || esAdmin(usuario)) return;

  if (!rolEnGremio(gremio, usuario._id)) {
    throw {
      status: 403,
      message: 'No tienes acceso a las fórmulas de este gremio privado',
    };
  }
}

async function buscarFormula(id) {
  const formula = await Formula.findById(id);

  if (!formula) {
    throw { status: 404, message: 'Fórmula no encontrada' };
  }

  return formula;
}

async function poblar(formula) {
  await formula.populate('guild', 'name emblem type');
  await formula.populate('createdBy', 'nombre specialty avatar');
  await formula.populate('stateHistory.changedBy', 'nombre');
  await formula.populate('vetoDetails.by', 'nombre');

  return formula;
}

// ---------- operaciones ----------

async function getAllFormulas({ guildId, state }, usuario) {
  const filtro = {};

  if (state) filtro.state = state;

  if (guildId) {
    const gremio = await buscarGremio(guildId);
    verificarAcceso(gremio, usuario);
    filtro.guild = guildId;
  } else if (!esAdmin(usuario)) {
    // Excluir fórmulas de gremios privados a los que no pertenece
    const ocultos = await Guild.find({
      type: 'Private',
      'members.user': { $ne: usuario._id },
    }).select('_id');

    if (ocultos.length > 0) {
      filtro.guild = { $nin: ocultos.map((g) => g._id) };
    }
  }

  const formulas = await Formula.find(filtro)
    .populate('guild', 'name emblem type')
    .populate('createdBy', 'nombre specialty avatar')
    .sort({ createdAt: -1 });

  await Promise.all(formulas.map((f) => cerrarSiVencida(f)));

  return formulas;
}

async function getFormulaById(id, usuario) {
  const formula = await buscarFormula(id);
  const gremio = await buscarGremio(formula.guild);

  verificarAcceso(gremio, usuario);

  await cerrarSiVencida(formula);

  return await poblar(formula);
}

async function createFormula(datos, usuario) {
  const gremio = await buscarGremio(datos.guild);

  if (!esAdmin(usuario) && !rolEnGremio(gremio, usuario._id)) {
    throw {
      status: 403,
      message: 'Debes ser miembro del gremio para proponer una fórmula',
    };
  }

  const formula = new Formula({
    guild: gremio._id,
    name: datos.name,
    effect: datos.effect,
    difficulty: datos.difficulty,
    endDate: datos.endDate,
    createdBy: usuario._id,
    state: 'Proposal',
    stateHistory: [{ state: 'Proposal', changedBy: usuario._id }],
  });

  await formula.save();

  return await poblar(formula);
}

async function updateFormula(id, datos, usuario) {
  const formula = await buscarFormula(id);
  const gremio = await buscarGremio(formula.guild);

  const esCreador = formula.createdBy.toString() === usuario._id.toString();
  const esGM = rolEnGremio(gremio, usuario._id) === 'Grandmaster';

  if (!esAdmin(usuario) && !esCreador && !esGM) {
    throw {
      status: 403,
      message: 'Solo el creador, el Grandmaster o un admin pueden editar la fórmula',
    };
  }

  if (formula.state !== 'Proposal') {
    throw {
      status: 400,
      message: 'Solo se puede editar una fórmula en estado Proposal',
    };
  }

  ['name', 'effect', 'difficulty', 'endDate'].forEach((campo) => {
    if (datos[campo] !== undefined) {
      formula[campo] = datos[campo];
    }
  });

  await formula.save();

  return await poblar(formula);
}

async function deleteFormula(id, usuario) {
  const formula = await buscarFormula(id);
  const gremio = await buscarGremio(formula.guild);

  const esCreador = formula.createdBy.toString() === usuario._id.toString();
  const esGM = rolEnGremio(gremio, usuario._id) === 'Grandmaster';

  if (!esAdmin(usuario) && !esCreador && !esGM) {
    throw {
      status: 403,
      message: 'Solo el creador, el Grandmaster o un admin pueden eliminar la fórmula',
    };
  }

  await formula.deleteOne();

  return formula;
}

async function votar(id, { category, option }, usuario) {
  const formula = await buscarFormula(id);
  const gremio = await buscarGremio(formula.guild);

  if (!rolEnGremio(gremio, usuario._id)) {
    throw { status: 403, message: 'Solo los miembros del gremio pueden votar' };
  }

  if (formula.state !== 'VotingOpen') {
    throw {
      status: 400,
      message: 'Solo se puede votar cuando la fórmula está en VotingOpen',
    };
  }

  if (!CATEGORIAS[category].options.includes(option)) {
    throw {
      status: 400,
      message: `La opción no es válida para la categoría ${category}`,
    };
  }

  // Un voto por usuario y categoría: si ya votó, se reemplaza
  const existente = formula.votes.find(
    (v) =>
      v.user.toString() === usuario._id.toString() && v.category === category,
  );

  if (existente) {
    existente.option = option;
  } else {
    formula.votes.push({ user: usuario._id, category, option });
  }

  await formula.save();

  return await poblar(formula);
}

const MARGEN = 1e-9;

function pesoDeVoto(miembro, categoria) {
  let peso = 1;

  if (miembro.specialty === 'Brewing') {
    peso *= 1.2;
  } else if (
    (categoria === 'ingredient' && miembro.specialty === 'Botany') ||
    (categoria === 'method' && miembro.specialty === 'Runes') ||
    (categoria === 'flask' && miembro.specialty === 'Alchemy')
  ) {
    peso *= 1.2;
  }

  if (miembro.role === 'Taster') {
    peso *= 2;
  }

  return peso;
}

function redondear(valor) {
  return Number(valor.toFixed(2));
}

function resolverGanadores(formula, miembros) {
  const ganadores = {};
  const pesos = {};
  const sinVotos = [];

  NOMBRES_CATEGORIAS.forEach((categoria) => {
    const opciones = CATEGORIAS[categoria].options;
    const totales = {};
    opciones.forEach((o) => {
      totales[o] = 0;
    });

    const votos = formula.votes.filter((v) => v.category === categoria);
    let votosValidos = 0;

    votos.forEach((v) => {
      const miembro = miembros[v.user.toString()];

      if (!miembro || totales[v.option] === undefined) return;

      totales[v.option] += pesoDeVoto(miembro, categoria);
      votosValidos += 1;
    });

    const veto =
      formula.vetoUsed &&
      formula.vetoDetails &&
      formula.vetoDetails.category === categoria
        ? formula.vetoDetails.chosenOption
        : null;

    if (veto) {
      ganadores[categoria] = veto;
      pesos[categoria] = totales[veto] || 0;
      return;
    }

    if (votosValidos === 0) {
      sinVotos.push(categoria);
      return;
    }

    const [a, b] = opciones;
    let ganador;

    if (Math.abs(totales[a] - totales[b]) > MARGEN) {
      ganador = totales[a] > totales[b] ? a : b;
    } else {
      const votoDe = (rol) => {
        const entrada = Object.entries(miembros).find(
          ([, m]) => m.role === rol,
        );

        if (!entrada) return null;

        const voto = votos.find((v) => v.user.toString() === entrada[0]);

        return voto && opciones.includes(voto.option) ? voto.option : null;
      };

      ganador =
        votoDe('Taster') ||
        votoDe('Grandmaster') ||
        opciones[Math.floor(Math.random() * opciones.length)];
    }

    ganadores[categoria] = ganador;
    pesos[categoria] = totales[ganador];
  });

  return { ganadores, pesos, sinVotos };
}

async function calcularGanadores(formula, gremio) {
  const usuarios = await User.find({
    _id: { $in: gremio.members.map((m) => m.user) },
  }).select('specialty');

  const especialidades = {};
  usuarios.forEach((u) => {
    especialidades[u._id.toString()] = u.specialty;
  });

  const miembros = {};
  gremio.members.forEach((m) => {
    const clave = m.user.toString();
    miembros[clave] = { role: m.role, specialty: especialidades[clave] };
  });

  const resultado = resolverGanadores(formula, miembros);

  const dificultadReal =
    formula.difficulty + resultado.pesos.ingredient + resultado.pesos.method;
  const rareza =
    dificultadReal * 10 +
    resultado.pesos.ingredient * 3 +
    resultado.pesos.method * 2;

  return {
    ...resultado,
    dificultadReal: redondear(dificultadReal),
    rareza: redondear(rareza),
  };
}

async function usarVeto(id, { category, option }, usuario) {
  const formula = await buscarFormula(id);
  const gremio = await buscarGremio(formula.guild);

  if (rolEnGremio(gremio, usuario._id) !== 'Taster') {
    throw {
      status: 403,
      message: 'Solo el Taster Oficial del gremio puede usar el veto',
    };
  }

  if (formula.state !== 'Closed') {
    throw {
      status: 400,
      message: 'El veto solo se puede usar cuando la fórmula está en Closed',
    };
  }

  if (formula.vetoUsed) {
    throw { status: 400, message: 'El veto ya fue usado en esta fórmula' };
  }

  if (!CATEGORIAS[category].options.includes(option)) {
    throw {
      status: 400,
      message: `La opción no es válida para la categoría ${category}`,
    };
  }

  formula.vetoUsed = true;
  formula.vetoDetails = {
    category,
    chosenOption: option,
    by: usuario._id,
  };

  await formula.save();

  return await poblar(formula);
}

async function cerrarSiVencida(formula) {
  if (formula.state !== 'VotingOpen') return;

  const limite = formula.endDate.getTime() + 24 * 60 * 60 * 1000;

  if (limite > Date.now()) return;

  formula.state = 'Closed';
  formula.stateHistory.push({ state: 'Closed' });

  await formula.save();
}

async function cambiarEstado(id, nuevoEstado, usuario) {
  const formula = await buscarFormula(id);
  const gremio = await buscarGremio(formula.guild);

  const rol = rolEnGremio(gremio, usuario._id);
  const esCreador = formula.createdBy.toString() === usuario._id.toString();
  const puede =
    esAdmin(usuario) ||
    esCreador ||
    rol === 'Grandmaster' ||
    rol === 'Senior Alchemist';

  if (!puede) {
    throw {
      status: 403,
      message: 'No tienes permisos para cambiar el estado de esta fórmula',
    };
  }

  const actual = ESTADOS_FORMULA.indexOf(formula.state);
  const siguiente = ESTADOS_FORMULA[actual + 1];

  if (!siguiente) {
    throw { status: 400, message: 'La fórmula ya fue destilada' };
  }

  if (nuevoEstado !== siguiente) {
    throw {
      status: 400,
      message: `Transición no permitida: de ${formula.state} solo se puede pasar a ${siguiente}`,
    };
  }

  if (nuevoEstado === 'Distilled') {
    const { ganadores, sinVotos, dificultadReal, rareza } =
      await calcularGanadores(formula, gremio);

    if (sinVotos.length > 0) {
      throw {
        status: 400,
        message: `No se puede destilar: faltan votos en ${sinVotos.join(', ')}`,
      };
    }

    formula.finalPotion = {
      finalName: `${ganadores.ingredient} + ${ganadores.method} en ${ganadores.flask}`,
      realDifficulty: dificultadReal,
      rarity: rareza,
      winners: ganadores,
    };
  }

  formula.state = nuevoEstado;
  formula.stateHistory.push({ state: nuevoEstado, changedBy: usuario._id });

  await formula.save();

  return await poblar(formula);
}

module.exports = {
  getAllFormulas,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula,
  votar,
  cambiarEstado,
  usarVeto,
  resolverGanadores,
};
