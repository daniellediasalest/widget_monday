import { useEffect, useState } from "react";
import mondaySdk from "monday-sdk-js";
import "@vibe/core/tokens";
import "./App.css";

const monday = mondaySdk();

// Dados fictícios, usados apenas para visualizar o layout.
const mockObjectives = [
  {
    id: "OBJ-01",
    title: "Ampliar o acesso à programação cultural",
    area: "Programação",
    progress: 72,
    status: "No prazo",
    tone: "success",
    result: "Alcançar 40 mil participações nas atividades culturais",
    planned: "40.000 participações",
    actual: "28.800 participações",
    actions: [
      {
        title: "Ampliar a divulgação da programação",
        owner: "Equipe A — demonstração",
        status: "Em andamento",
      },
      {
        title: "Mapear novos parceiros de divulgação",
        owner: "Equipe B — demonstração",
        status: "Concluído",
      },
    ],
  },
  {
    id: "OBJ-02",
    title: "Fortalecer iniciativas de formação e desenvolvimento",
    area: "Formação",
    progress: 45,
    status: "Atenção",
    tone: "warning",
    result: "Realizar 20 oficinas de formação",
    planned: "20 oficinas",
    actual: "9 oficinas",
    actions: [
      {
        title: "Definir o calendário das próximas oficinas",
        owner: "Equipe C — demonstração",
        status: "Em andamento",
      },
      {
        title: "Confirmar a disponibilidade dos facilitadores",
        owner: "Equipe A — demonstração",
        status: "Pendente",
      },
    ],
  },
  {
    id: "OBJ-03",
    title:
      "Expandir a presença digital e a acessibilidade dos conteúdos culturais",
    area: "Digital",
    progress: 25,
    status: "Em atraso",
    tone: "danger",
    result: "Publicar 80 conteúdos com recursos de acessibilidade",
    planned: "80 conteúdos",
    actual: "20 conteúdos",
    actions: [
      {
        title: "Revisar os recursos de acessibilidade dos conteúdos",
        owner: "Equipe B — demonstração",
        status: "Em andamento",
      },
      {
        title: "Organizar o calendário de publicação",
        owner: "Equipe C — demonstração",
        status: "Pendente",
      },
    ],
  },
];

const screens = {
  objetivos: {
    title: "Objetivos estratégicos",
    description: "Visão geral dos objetivos e seus resultados.",
  },
  detalhes: {
    title: "Detalhes do objetivo",
    description: "Acompanhamento dos resultados e planos de ação.",
  },
};

function WidgetLayout({ activeScreen, onNavigate, children }) {
  return (
    <div className="widget-layout">
      <a className="skip-link" href="#conteudo-principal">
        Ir para o conteúdo
      </a>

      <header className="widget-header">
        <div className="widget-brand">
          <img
            className="brand-logo"
            src={`${import.meta.env.BASE_URL}itau-cultural-logo.png`}
            alt="Itaú Cultural"
          />

          <p className="brand-description">
            Acompanhamento estratégico
          </p>
        </div>

        <span className="preview-label">Layout em desenvolvimento</span>
      </header>

      <nav className="widget-navigation" aria-label="Telas do painel">
        <button
          type="button"
          className="navigation-button"
          aria-current={activeScreen === "objetivos" ? "page" : undefined}
          onClick={() => onNavigate("objetivos")}
        >
          Objetivos
        </button>

        <button
          type="button"
          className="navigation-button"
          aria-current={activeScreen === "detalhes" ? "page" : undefined}
          onClick={() => onNavigate("detalhes")}
        >
          Detalhes
        </button>
      </nav>

      <main id="conteudo-principal" className="widget-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState("objetivos");

  const [selectedObjectiveId, setSelectedObjectiveId] = useState(
    mockObjectives[0].id
  );

  const selectedObjective = mockObjectives.find(
    (objective) => objective.id === selectedObjectiveId
  );

  useEffect(() => {
    // Integração existente: manter o recebimento de contexto da Monday.
    const unsubscribe = monday.listen("context", (response) => {
      // O layout não depende do contexto para aparecer no navegador local.
      // O tratamento dos dados será conectado nas próximas tarefas.
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const screen = screens[activeScreen];

  return (
    <WidgetLayout
      activeScreen={activeScreen}
      onNavigate={setActiveScreen}
    >
      <section aria-labelledby="screen-title">
        <div className="page-heading">
          <h1 id="screen-title">{screen.title}</h1>
          <p>{screen.description}</p>
        </div>

        <p className="demo-notice">
          Demonstração — todos os nomes, números e status abaixo são fictícios.
        </p>

        {activeScreen === "objetivos" ? (
          <div className="objectives-grid">
            {mockObjectives.map((objective) => (
              <article className="objective-card" key={objective.id}>
                <div className="objective-card-top">
                  <span className="objective-area">{objective.area}</span>

                  <span className={`status-badge status-${objective.tone}`}>
                    {objective.status}
                  </span>
                </div>

                <h2>{objective.title}</h2>

                <div className="objective-progress">
                  <label htmlFor={`progress-${objective.id}`}>
                    Progresso demonstrativo
                    <strong>{objective.progress}%</strong>
                  </label>

                  <progress
                    id={`progress-${objective.id}`}
                    value={objective.progress}
                    max="100"
                  >
                    {objective.progress}%
                  </progress>
                </div>

                <p className="objective-result">{objective.result}</p>

                <button
                  type="button"
                  className="navigation-button objective-details-button"
                  onClick={() => {
                    setSelectedObjectiveId(objective.id);
                    setActiveScreen("detalhes");
                  }}
                >
                  Ver detalhes
                  <span className="sr-only"> de {objective.title}</span>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="objective-detail">
            <div className="objective-selector">
              <label htmlFor="objective-select">Objetivo em exibição</label>

              <select
                id="objective-select"
                value={selectedObjectiveId}
                onChange={(event) => setSelectedObjectiveId(event.target.value)}
              >
                {mockObjectives.map((objective) => (
                  <option key={objective.id} value={objective.id}>
                    {objective.title}
                  </option>
                ))}
              </select>
            </div>

            <article className="detail-card">
              <span className={`status-badge status-${selectedObjective.tone}`}>
                {selectedObjective.status}
              </span>

              <h2>{selectedObjective.title}</h2>
              <p>{selectedObjective.result}</p>

              <dl className="metrics-grid">
                <div>
                  <dt>Planejado</dt>
                  <dd>{selectedObjective.planned}</dd>
                </div>

                <div>
                  <dt>Realizado</dt>
                  <dd>{selectedObjective.actual}</dd>
                </div>

                <div>
                  <dt>Progresso demonstrativo</dt>
                  <dd>{selectedObjective.progress}%</dd>
                </div>
              </dl>

              <h3>Planos de ação</h3>

              <ul className="action-list">
                {selectedObjective.actions.map((action) => (
                  <li key={action.title}>
                    <div>
                      <strong>{action.title}</strong>
                      <p>{action.owner}</p>
                    </div>

                    <span className="action-status">{action.status}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        )}
      </section>
    </WidgetLayout>
  );
}