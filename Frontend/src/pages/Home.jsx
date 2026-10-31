import { Link } from "react-router-dom";
import NavBar from "../components/NavBarFinal";
import Card from "../components/Card";

function Home() {
  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-app-bg">

        {/* =========================
            HERO
        ========================= */}
        <section className="max-w-5xl mx-auto px-8 py-20 text-center">

          <p className="text-purple-accent font-semibold mb-3">
            LABORATORIO COLABORATIVO
          </p>

          <h1 className="text-5xl font-bold text-app-text">
            Bienvenido a Potion Lab
          </h1>

          <p className="text-app-muted text-lg max-w-2xl mx-auto mt-6">
            Un espacio donde los alquimistas pueden crear fórmulas,
            colaborar con otros miembros y decidir mediante votaciones
            cuáles serán las pociones definitivas.
          </p>

          <div className="flex justify-center gap-3 mt-8 flex-wrap">

            <Link
              to="/gremios"
              className="px-5 py-3 rounded-button bg-purple-accent text-white font-semibold hover:opacity-90 transition"
            >
              Explorar gremios
            </Link>

            <Link
              to="/grimorio"
              className="px-5 py-3 rounded-button border border-app-border text-app-text font-semibold hover:bg-app-surface transition"
            >
              Ver grimorio
            </Link>

          </div>

        </section>

        {/* =========================
            COMO FUNCIONA
        ========================= */}
        <section className="max-w-5xl mx-auto px-8 pb-16 text-center">

          <h2 className="text-3xl font-bold text-app-text">
            ¿Cómo funciona?
          </h2>

          <p className="text-app-muted mt-3 max-w-2xl mx-auto">
            Potion Lab convierte las ideas de los alquimistas en pociones
            mediante colaboración y votación.
          </p>

          <div className="grid gap-5 md:grid-cols-3 mt-8">

            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">
                🧪
              </div>

              <h3 className="text-xl font-bold text-app-text">
                1. Crea o únete
              </h3>

              <p className="text-app-muted mt-3">
                Forma parte de un gremio de alquimistas o crea el tuyo
                propio para comenzar a experimentar.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">
                🗳️
              </div>

              <h3 className="text-xl font-bold text-app-text">
                2. Propón y vota
              </h3>

              <p className="text-app-muted mt-3">
                Los alquimistas pueden crear fórmulas y votar por el
                ingrediente, método de calentamiento y frasco.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">
                ✨
              </div>

              <h3 className="text-xl font-bold text-app-text">
                3. Destila la poción
              </h3>

              <p className="text-app-muted mt-3">
                Cuando termina la votación, la fórmula se transforma en
                una poción con su propia dificultad y rareza.
              </p>
            </Card>

          </div>

        </section>

        {/* =========================
            QUE PUEDES HACER
        ========================= */}
        <section className="max-w-5xl mx-auto px-8 pb-20 text-center">

          <Card className="p-8">

            <h2 className="text-3xl font-bold text-app-text">
              Tu laboratorio, tus decisiones
            </h2>

            <p className="text-app-muted max-w-2xl mx-auto mt-3">
              Explora gremios, participa en fórmulas, descubre pociones
              destiladas y consulta el ranking de los mejores alquimistas.
            </p>

            <div className="flex justify-center gap-3 mt-6 flex-wrap">

              <Link
                to="/gremios"
                className="text-purple-accent font-semibold hover:underline"
              >
                Ver gremios →
              </Link>

              <Link
                to="/grimorio"
                className="text-purple-accent font-semibold hover:underline"
              >
                Explorar grimorio →
              </Link>

            </div>

          </Card>

        </section>

      </main>
    </>
  );
}

export default Home;