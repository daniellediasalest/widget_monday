import { useEffect, useState } from "react";
import mondaySdk from "monday-sdk-js";
import "@vibe/core/tokens";
import "./App.css";

const monday = mondaySdk();

/* ------------------------------------------------------------------ *
 * DADOS FICTÍCIOS (MOCKS)
 *
 * Nomes, áreas, planos de ação, quantidades e status abaixo são
 * inventados apenas para demonstrar o layout. Não existe contrato real
 * de dados nesta rodada e nada aqui confere com boards da Monday.
 *
 * As quantidades por status são obtidas contando os planos de ação do
 * próprio mock (contagem simples, sem regra de negócio). Os valores de
 * "progress", "planned" e "actual" são independentes e só ilustram.
 * ------------------------------------------------------------------ */

// Áreas fictícias. "Relacionamento" não tem objetivo de propósito, para
// demonstrar o estado vazio do filtro.
const mockAreas = [
  "Programação",
  "Formação",
  "Digital",
  "Pesquisa",
  "Relacionamento",
];

const mockObjectives = [
  {
    // Caso base: poucos status, um segmento pequeno (Atenção = 1).
    id: "OBJ-01",
    title: "Ampliar o acesso à programação cultural",
    area: "Programação",
    progress: 72,
    result: "Alcançar 40 mil participações nas atividades culturais",
    planned: "40.000 participações",
    actual: "28.800 participações",
    actions: [
      {
        id: "OBJ-01-P1",
        title: "Ampliar a divulgação da programação",
        owner: "Equipe A — demonstração",
        status: "Em andamento",
      },
      {
        id: "OBJ-01-P2",
        title: "Mapear novos parceiros de divulgação",
        owner: "Equipe B — demonstração",
        status: "Concluído",
      },
      {
        id: "OBJ-01-P3",
        title: "Atualizar a agenda semanal de atividades",
        owner: "Equipe C — demonstração",
        status: "Concluído",
      },
      {
        id: "OBJ-01-P4",
        title: "Revisar as condições de acesso gratuito",
        owner: "Equipe A — demonstração",
        status: "Concluído",
      },
      {
        id: "OBJ-01-P5",
        title: "Planejar ações para novos públicos",
        owner: "Equipe B — demonstração",
        status: "Em andamento",
      },
      {
        id: "OBJ-01-P6",
        title: "Definir os indicadores de participação",
        owner: "Equipe C — demonstração",
        status: "Atenção",
      },
    ],
  },
  {
    // Caso base: vários status, incluindo "Não iniciado".
    id: "OBJ-02",
    title: "Fortalecer iniciativas de formação e desenvolvimento",
    area: "Formação",
    progress: 45,
    result: "Realizar 20 oficinas de formação",
    planned: "20 oficinas",
    actual: "9 oficinas",
    actions: [
      {
        id: "OBJ-02-P1",
        title: "Definir o calendário das próximas oficinas",
        owner: "Equipe C — demonstração",
        status: "Em andamento",
      },
      {
        id: "OBJ-02-P2",
        title: "Confirmar a disponibilidade dos facilitadores",
        owner: "Equipe A — demonstração",
        status: "Não iniciado",
      },
      {
        id: "OBJ-02-P3",
        title: "Preparar os materiais didáticos",
        owner: "Equipe B — demonstração",
        status: "Não iniciado",
      },
      {
        id: "OBJ-02-P4",
        title: "Abrir as inscrições da turma seguinte",
        owner: "Equipe C — demonstração",
        status: "Não iniciado",
      },
      {
        id: "OBJ-02-P5",
        title: "Avaliar a última oficina realizada",
        owner: "Equipe A — demonstração",
        status: "Concluído",
      },
      {
        id: "OBJ-02-P6",
        title: "Rever o orçamento das oficinas",
        owner: "Equipe B — demonstração",
        status: "Atenção",
      },
    ],
  },
  {
    // Caso de TÍTULO LONGO: o texto deve quebrar linha, nunca ser cortado.
    id: "OBJ-03",
    title:
      "Expandir a presença digital e a acessibilidade dos conteúdos culturais em todas as plataformas, linguagens e formatos oferecidos ao público presencial e remoto",
    area: "Digital",
    progress: 25,
    result: "Publicar 80 conteúdos com recursos de acessibilidade",
    planned: "80 conteúdos",
    actual: "20 conteúdos",
    actions: [
      {
        id: "OBJ-03-P1",
        title: "Revisar os recursos de acessibilidade dos conteúdos",
        owner: "Equipe B — demonstração",
        status: "Em andamento",
      },
      {
        id: "OBJ-03-P2",
        title: "Organizar o calendário de publicação",
        owner: "Equipe C — demonstração",
        status: "Não iniciado",
      },
      {
        id: "OBJ-03-P3",
        title: "Criar legendas e audiodescrição para os vídeos",
        owner: "Equipe A — demonstração",
        status: "Em andamento",
      },
      {
        id: "OBJ-03-P4",
        title: "Testar os conteúdos com leitores de tela",
        owner: "Equipe B — demonstração",
        status: "Atenção",
      },
      {
        id: "OBJ-03-P5",
        title: "Atualizar o guia de linguagem acessível",
        owner: "Equipe C — demonstração",
        status: "Concluído",
      },
    ],
  },
  {
    // Caso SEM PLANOS DE AÇÃO: total zero, sem percentuais.
    id: "OBJ-04",
    title: "Consolidar a pesquisa e a documentação sobre acervos culturais",
    area: "Pesquisa",
    progress: null,
    result: "Resultado ainda não definido (dado fictício)",
    planned: null,
    actual: null,
    actions: [],
  },
  {
    // Caso de STATUS DESCONHECIDO ("Em revisão" não mapeado) e AUSENTE
    // (planos sem o campo status), além de segmentos pequenos.
    id: "OBJ-05",
    title: "Diversificar as parcerias institucionais da programação",
    area: "Programação",
    progress: 60,
    result: "Firmar 12 parcerias institucionais",
    planned: "12 parcerias",
    actual: "7 parcerias",
    actions: [
      {
        id: "OBJ-05-P1",
        title: "Levantar instituições com afinidade temática",
        owner: "Equipe A — demonstração",
        status: "Concluído",
      },
      {
        id: "OBJ-05-P2",
        title: "Elaborar o modelo de acordo de cooperação",
        owner: "Equipe B — demonstração",
        status: "Concluído",
      },
      {
        id: "OBJ-05-P3",
        title: "Realizar reuniões de apresentação",
        owner: "Equipe C — demonstração",
        status: "Concluído",
      },
      {
        id: "OBJ-05-P4",
        title: "Formalizar as primeiras parcerias",
        owner: "Equipe A — demonstração",
        status: "Concluído",
      },
      {
        id: "OBJ-05-P5",
        title: "Registrar aprendizados das parcerias encerradas",
        owner: "Equipe B — demonstração",
        status: "Concluído",
      },
      {
        id: "OBJ-05-P6",
        title: "Acompanhar as parcerias em negociação",
        owner: "Equipe C — demonstração",
        status: "Em andamento",
      },
      {
        id: "OBJ-05-P7",
        title: "Resolver pendência de documentação com um parceiro",
        owner: "Equipe A — demonstração",
        status: "Atenção",
      },
      {
        id: "OBJ-05-P8",
        title: "Avaliar proposta recebida de nova instituição",
        owner: "Equipe B — demonstração",
        // Valor fora do mapeamento: deve cair em "Desconhecido".
        status: "Em revisão",
      },
      {
        id: "OBJ-05-P9",
        title: "Atualizar o cadastro de contatos institucionais",
        owner: "Equipe C — demonstração",
        // Sem campo "status": também deve cair em "Desconhecido".
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * STATUS (MOCK)
 *
 * PENDENTE: o mapeamento real de status e cores da Monday ainda não foi
 * fornecido. Os rótulos e as cores abaixo (ver App.css, "mock-status")
 * são provisórios e NÃO representam os valores reais da Monday.
 * ------------------------------------------------------------------ */
const UNKNOWN_STATUS_KEY = "desconhecido";

// A ordem aqui define a ordem dos segmentos da barra e da legenda.
const statusDefinitions = [
  { key: "concluido", label: "Concluído", mockValues: ["Concluído"] },
  { key: "andamento", label: "Em andamento", mockValues: ["Em andamento"] },
  { key: "atencao", label: "Atenção", mockValues: ["Atenção"] },
  { key: "nao-iniciado", label: "Não iniciado", mockValues: ["Não iniciado"] },
  { key: UNKNOWN_STATUS_KEY, label: "Desconhecido", mockValues: [] },
];

const statusByKey = Object.fromEntries(
  statusDefinitions.map((definition) => [definition.key, definition])
);

// Resolve o valor bruto do mock para um status conhecido. Qualquer valor
// ausente ou não mapeado vira "Desconhecido".
function resolveStatus(rawStatus) {
  const match = statusDefinitions.find((definition) =>
    definition.mockValues.includes(rawStatus)
  );

  return match ?? statusByKey[UNKNOWN_STATUS_KEY];
}

// Conta os planos por status. Não calcula percentuais: com total zero,
// nenhuma divisão é feita.
function summarizeStatuses(actions) {
  const total = actions.length;

  const items = statusDefinitions.map((definition) => ({
    ...definition,
    count: actions.filter(
      (action) => resolveStatus(action.status).key === definition.key
    ).length,
  }));

  return { total, items };
}

function pluralizePlans(count) {
  return count === 1 ? "1 plano de ação" : `${count} planos de ação`;
}

/* ------------------------------------------------------------------ *
 * FILTRO POR ÁREA
 * ------------------------------------------------------------------ */
const ALL_AREAS = "";
const ALL_AREAS_LABEL = "Todas as áreas";

function matchesArea(objective, areaFilter) {
  return areaFilter === ALL_AREAS || objective.area === areaFilter;
}

// Os planos de ação herdam a área do objetivo a que pertencem. Esta é a
// única função que aplica o recorte de área aos planos.
function getVisibleActions(objective, areaFilter) {
  return matchesArea(objective, areaFilter) ? objective.actions : [];
}

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

function AreaFilter({
  areaFilter,
  onChange,
  onClear,
  visibleCount,
  totalCount,
}) {
  const activeLabel = areaFilter === ALL_AREAS ? ALL_AREAS_LABEL : areaFilter;

  return (
    <section className="area-filter" aria-label="Filtro por área">
      <div className="area-filter-field">
        <label htmlFor="area-filter-select">Filtrar por área</label>

        <select
          id="area-filter-select"
          value={areaFilter}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value={ALL_AREAS}>{ALL_AREAS_LABEL}</option>

          {mockAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="navigation-button"
        onClick={onClear}
        disabled={areaFilter === ALL_AREAS}
      >
        Limpar filtro
      </button>

      <p className="area-filter-status" role="status">
        <span>
          Filtro ativo: <strong>{activeLabel}</strong>
        </span>
        <span>
          Exibindo {visibleCount} de {totalCount} objetivos (fictícios)
        </span>
      </p>
    </section>
  );
}

function StatusChip({ status }) {
  return (
    <span className="status-chip">
      <span
        className={`status-swatch mock-status-${status.key}`}
        aria-hidden="true"
      />
      {status.label}
    </span>
  );
}

// Barra horizontal segmentada. Cada segmento tem rótulo textual (leitores
// de tela) e número visível; a legenda repete nome e quantidade, então a
// informação nunca depende apenas da cor.
function StatusDistribution({ objectiveId, actions }) {
  const { total, items } = summarizeStatuses(actions);
  const segments = items.filter((item) => item.count > 0);

  return (
    <div className="status-distribution">
      <p className="status-total">
        Total: <strong>{total}</strong>{" "}
        {total === 1 ? "plano de ação" : "planos de ação"}
      </p>

      {total === 0 ? (
        <p className="status-empty">
          Nenhum plano de ação neste objetivo (dado fictício). Não há
          distribuição por status para exibir.
        </p>
      ) : (
        <>
          <ul
            className="status-bar"
            role="list"
            aria-label={`Distribuição fictícia de ${pluralizePlans(
              total
            )} por status`}
          >
            {segments.map((item) => (
              <li
                key={item.key}
                className={`status-segment mock-status-${item.key}`}
                style={{ flexGrow: item.count }}
              >
                <span className="sr-only">
                  {item.label}: {item.count} de {pluralizePlans(total)}
                </span>
                <span aria-hidden="true">{item.count}</span>
              </li>
            ))}
          </ul>

          <ul
            className="status-legend"
            role="list"
            aria-label="Legenda de status (fictícia)"
            id={`legend-${objectiveId}`}
          >
            {items.map((item) => (
              <li key={item.key}>
                <span
                  className={`status-swatch mock-status-${item.key}`}
                  aria-hidden="true"
                />
                <span className="legend-label">{item.label}</span>
                <strong className="legend-count">{item.count}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function EmptyState({ title, children, onClear, showClear }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{children}</p>

      {showClear && (
        <button type="button" className="navigation-button" onClick={onClear}>
          Limpar filtro
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState("objetivos");
  const [areaFilter, setAreaFilter] = useState(ALL_AREAS);

  // Objetivo escolhido pela pessoa. Mantido mesmo se o filtro o esconder,
  // para que ele volte a ser o ativo quando o filtro for limpo.
  const [selectedObjectiveId, setSelectedObjectiveId] = useState(
    mockObjectives[0].id
  );

  // Ordem estável: a mesma ordem do array de mocks.
  const visibleObjectives = mockObjectives.filter((objective) =>
    matchesArea(objective, areaFilter)
  );

  // Comportamento adotado: se o objetivo selecionado não pertence ao
  // filtro, o ativo passa a ser o primeiro objetivo compatível (ou nenhum,
  // caso não haja). Valor derivado, sem efeitos colaterais.
  const activeObjective =
    visibleObjectives.find((objective) => objective.id === selectedObjectiveId) ??
    visibleObjectives[0] ??
    null;

  const clearFilter = () => setAreaFilter(ALL_AREAS);

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
  const filterIsActive = areaFilter !== ALL_AREAS;

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
          Demonstração — todos os nomes, números, quantidades e status abaixo
          são fictícios. As cores de status são provisórias; o mapeamento real
          da Monday está pendente.
        </p>

        <AreaFilter
          areaFilter={areaFilter}
          onChange={setAreaFilter}
          onClear={clearFilter}
          visibleCount={visibleObjectives.length}
          totalCount={mockObjectives.length}
        />

        {activeScreen === "objetivos" ? (
          visibleObjectives.length === 0 ? (
            <EmptyState
              title="Nenhum objetivo nesta área"
              onClear={clearFilter}
              showClear={filterIsActive}
            >
              Nenhum objetivo fictício corresponde ao filtro “{areaFilter}”.
            </EmptyState>
          ) : (
            <div className="objectives-grid">
              {visibleObjectives.map((objective) => {
                const isActive = activeObjective?.id === objective.id;

                return (
                  <article
                    className={`objective-card${isActive ? " is-active" : ""}`}
                    key={objective.id}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <div className="objective-card-top">
                      <span className="objective-area">
                        {objective.id} · {objective.area}
                      </span>

                      {isActive && (
                        <span className="status-badge active-badge">
                          Objetivo ativo
                        </span>
                      )}
                    </div>

                    <h2>{objective.title}</h2>

                    <p className="objective-result">{objective.result}</p>

                    <StatusDistribution
                      objectiveId={objective.id}
                      actions={getVisibleActions(objective, areaFilter)}
                    />

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
                );
              })}
            </div>
          )
        ) : activeObjective === null ? (
          <EmptyState
            title="Nenhum objetivo para exibir"
            onClear={clearFilter}
            showClear={filterIsActive}
          >
            Nenhum objetivo fictício corresponde ao filtro “{areaFilter}”, por
            isso não há detalhes nem planos de ação para mostrar.
          </EmptyState>
        ) : (
          <div className="objective-detail">
            <div className="objective-selector">
              <label htmlFor="objective-select">Objetivo em exibição</label>

              <select
                id="objective-select"
                value={activeObjective.id}
                onChange={(event) => setSelectedObjectiveId(event.target.value)}
              >
                {visibleObjectives.map((objective) => (
                  <option key={objective.id} value={objective.id}>
                    {objective.id} — {objective.title}
                  </option>
                ))}
              </select>
            </div>

            <article className="detail-card" aria-current="true">
              <button
                type="button"
                className="navigation-button back-button"
                onClick={() => setActiveScreen("objetivos")}
              >
                ← Voltar à visão geral
              </button>

              <div className="objective-card-top">
                <span className="objective-area">
                  {activeObjective.id} · {activeObjective.area}
                </span>

                <span className="status-badge active-badge">
                  Objetivo ativo
                </span>
              </div>

              <h2>{activeObjective.title}</h2>
              <p>{activeObjective.result}</p>

              <dl className="metrics-grid">
                <div>
                  <dt>Planejado</dt>
                  <dd>{activeObjective.planned ?? "Não informado"}</dd>
                </div>

                <div>
                  <dt>Realizado</dt>
                  <dd>{activeObjective.actual ?? "Não informado"}</dd>
                </div>

                <div>
                  <dt>Progresso demonstrativo</dt>
                  <dd>
                    {activeObjective.progress === null
                      ? "Não informado"
                      : `${activeObjective.progress}%`}
                  </dd>
                </div>
              </dl>

              <h3>Distribuição dos planos por status</h3>

              <StatusDistribution
                objectiveId={`detalhe-${activeObjective.id}`}
                actions={getVisibleActions(activeObjective, areaFilter)}
              />

              <h3>Planos de ação</h3>

              {getVisibleActions(activeObjective, areaFilter).length === 0 ? (
                <p className="status-empty">
                  Este objetivo não possui planos de ação cadastrados (dado
                  fictício).
                </p>
              ) : (
                <ul className="action-list">
                  {getVisibleActions(activeObjective, areaFilter).map(
                    (action) => {
                      const status = resolveStatus(action.status);

                      return (
                        <li key={action.id}>
                          <div>
                            <strong>{action.title}</strong>
                            <p>{action.owner}</p>
                          </div>

                          <span className="action-status">
                            <StatusChip status={status} />
                            {status.key === UNKNOWN_STATUS_KEY && (
                              <small>
                                {action.status
                                  ? `Valor “${action.status}” não mapeado`
                                  : "Status não informado"}
                              </small>
                            )}
                          </span>
                        </li>
                      );
                    }
                  )}
                </ul>
              )}
            </article>
          </div>
        )}
      </section>
    </WidgetLayout>
  );
}
