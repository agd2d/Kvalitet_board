const dashboardData = {
  periodLabel: 'Marts 2026',
  updatedAt: '22. marts 2026 kl. 10:30',
  headline: {
    title: 'DB-dashboard for Dinero og Smartplan',
    description:
      'Et selvstændigt projekt der samler omsætning fra Dinero og timelønnet forbrug fra Smartplan, så du kan styre dækningsbidrag pr. kunde, team og periode i ét samlet overblik.',
    primaryAction: 'Klar til GitHub-publicering',
    secondaryAction: 'Næste step: koble rigtige API’er på',
  },
  kpis: [
    {
      label: 'Faktureret omsætning',
      value: '684.000 kr.',
      trend: '+8,4% mod sidste måned',
      trendTone: 'positive',
      note: 'Baseret på bogførte fakturaer i Dinero.',
    },
    {
      label: 'Lønomkostning',
      value: '459.500 kr.',
      trend: '+3,1% mod sidste måned',
      trendTone: 'neutral',
      note: 'Beregnet ud fra Smartplan timer × timeløn.',
    },
    {
      label: 'Dækningsbidrag',
      value: '224.500 kr.',
      trend: '+11,8% mod sidste måned',
      trendTone: 'positive',
      note: 'DB% på tværs af alle aktive kunder: 32,8%.',
    },
    {
      label: 'Kunder under DB-mål',
      value: '3 kunder',
      trend: 'Målgrænse: 20% DB',
      trendTone: 'negative',
      note: 'Bør udløse pris- eller planlægningsgennemgang.',
    },
  ],
  customers: [
    {
      name: 'Hotel Fjordblik',
      shifts: 28,
      revenue: '192.000 kr.',
      labor: '118.500 kr.',
      db: '73.500 kr.',
      dbPercent: 38.3,
      status: 'Sund',
      tone: 'positive',
    },
    {
      name: 'Nordpak Lager',
      shifts: 41,
      revenue: '154.000 kr.',
      labor: '121.900 kr.',
      db: '32.100 kr.',
      dbPercent: 20.8,
      status: 'Hold øje',
      tone: 'warning',
    },
    {
      name: 'City Klinikker',
      shifts: 22,
      revenue: '86.000 kr.',
      labor: '72.400 kr.',
      db: '13.600 kr.',
      dbPercent: 15.8,
      status: 'Lav DB',
      tone: 'negative',
    },
    {
      name: 'Vestkontoret',
      shifts: 17,
      revenue: '63.000 kr.',
      labor: '38.700 kr.',
      db: '24.300 kr.',
      dbPercent: 38.6,
      status: 'Sund',
      tone: 'positive',
    },
  ],
  segments: [
    { label: 'Erhverv', percent: 36 },
    { label: 'Hoteller', percent: 33 },
    { label: 'Klinikker', percent: 20 },
    { label: 'Privat', percent: 29 },
  ],
  drivers: [
    {
      title: 'Overtid i Smartplan',
      value: '+18.200 kr.',
      tone: 'warning',
      text: 'Særligt fredag og lørdag på to større kunder.',
    },
    {
      title: 'Ikke-fakturerede ekstratimer',
      value: '14 timer',
      tone: 'negative',
      text: 'Vagter er registreret, men er ikke mappet til fakturalinje i Dinero.',
    },
    {
      title: 'Fejl i kundematch',
      value: '2 poster',
      tone: 'brand',
      text: 'Mangler kunde-tag mellem Smartplan-vagt og Dinero-kunde.',
    },
  ],
  integrations: [
    {
      icon: 'D',
      tone: 'brand',
      title: 'Dinero',
      text: 'Hent bogførte fakturaer, kunder, ordrelinjer og periodiseret omsætning.',
    },
    {
      icon: 'S',
      tone: 'teal',
      title: 'Smartplan',
      text: 'Hent vagter, timer, lønsatser, tillæg og fravær for timelønnede medarbejdere.',
    },
    {
      icon: 'Σ',
      tone: 'purple',
      title: 'DB-motor',
      text: 'Mapper data, beregner DB/DB% og viser afvigelser på kunde- og månedsniveau.',
    },
  ],
  formulas: [
    'Omsætning = bogførte fakturaer fra Dinero i valgt periode.',
    'Forbrug = Smartplan timer × timeløn + tillæg.',
    'DB = Omsætning − direkte lønomkostning.',
    'DB% = DB / Omsætning × 100.',
  ],
  roadmap: [
    'Afklar kunde-mapping mellem Dinero og Smartplan.',
    'Opsæt API-kald eller importflow til begge systemer.',
    'Gem nøgletal i en simpel database eller ETL-tabel.',
    'Tilføj alarmer for kunder under ønsket DB%.',
  ],
};

const app = document.querySelector('#app');

function badgeClass(tone) {
  return `badge badge--${tone}`;
}

function renderKpiCard(kpi) {
  return `
    <article class="card kpi-card">
      <p class="eyebrow-label">${kpi.label}</p>
      <h3>${kpi.value}</h3>
      <p class="trend trend--${kpi.trendTone}">${kpi.trend}</p>
      <p class="card-note">${kpi.note}</p>
    </article>
  `;
}

function renderCustomerRow(customer) {
  return `
    <tr>
      <td>
        <strong>${customer.name}</strong>
        <span>${customer.shifts} planlagte vagter</span>
      </td>
      <td>${customer.revenue}</td>
      <td>${customer.labor}</td>
      <td>${customer.db}</td>
      <td>${customer.dbPercent.toFixed(1)}%</td>
      <td><span class="${badgeClass(customer.tone)}">${customer.status}</span></td>
    </tr>
  `;
}

function renderSegmentRow(segment) {
  return `
    <div class="bar-row">
      <span>${segment.label}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(segment.percent / 40) * 100}%"></div>
      </div>
      <strong>${segment.percent}%</strong>
    </div>
  `;
}

function renderListCard(item) {
  return `
    <div class="mini-card">
      <div class="mini-card__header">
        <strong>${item.title}</strong>
        <span class="${badgeClass(item.tone)}">${item.value}</span>
      </div>
      <p>${item.text}</p>
    </div>
  `;
}

function renderIntegration(item) {
  return `
    <div class="integration-card">
      <div class="integration-card__icon integration-card__icon--${item.tone}">${item.icon}</div>
      <div>
        <h4>${item.title}</h4>
        <p>${item.text}</p>
      </div>
    </div>
  `;
}

function renderBulletList(items) {
  return items.map((item) => `<li>${item}</li>`).join('');
}

app.innerHTML = `
  <main class="page-shell">
    <section class="hero">
      <div class="hero__content">
        <span class="pill">Selvstændigt GitHub-projekt</span>
        <h1>${dashboardData.headline.title}</h1>
        <p>${dashboardData.headline.description}</p>
        <div class="hero__actions">
          <span class="badge badge--brand">${dashboardData.headline.primaryAction}</span>
          <span class="badge badge--neutral">${dashboardData.headline.secondaryAction}</span>
        </div>
      </div>
      <aside class="hero__panel card">
        <p class="eyebrow-label">Aktiv periode</p>
        <h2>${dashboardData.periodLabel}</h2>
        <p class="hero__updated">Senest opdateret ${dashboardData.updatedAt}</p>
        <div class="hero__panel-grid">
          <div>
            <span>DB i perioden</span>
            <strong>224.500 kr.</strong>
          </div>
          <div>
            <span>Datadækning</span>
            <strong>97%</strong>
          </div>
        </div>
      </aside>
    </section>

    <section class="content-section">
      <div class="section-header">
        <div>
          <p class="eyebrow-label">Overblik</p>
          <h2>Ledelses-KPI’er</h2>
        </div>
        <span class="badge badge--brand">Bygget som separat projektstruktur</span>
      </div>
      <div class="kpi-grid">
        ${dashboardData.kpis.map(renderKpiCard).join('')}
      </div>
    </section>

    <div class="content-grid">
      <section class="content-section content-section--wide">
        <div class="section-header">
          <div>
            <p class="eyebrow-label">Kundeøkonomi</p>
            <h2>DB pr. kunde</h2>
          </div>
          <span class="badge badge--positive">Sorter på laveste DB%</span>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kunde</th>
                <th>Omsætning</th>
                <th>Lønomkostning</th>
                <th>DB</th>
                <th>DB%</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${dashboardData.customers.map(renderCustomerRow).join('')}
            </tbody>
          </table>
        </div>
        <p class="section-note">DB er her defineret som omsætning fra Dinero minus direkte lønomkostning fra Smartplan. Senere kan projektet udvides med materialer, kørsel og underleverandører.</p>
      </section>

      <aside class="sidebar">
        <section class="content-section">
          <div class="section-header">
            <div>
              <p class="eyebrow-label">Integrationer</p>
              <h2>Datakilder</h2>
            </div>
          </div>
          <div class="stack">
            ${dashboardData.integrations.map(renderIntegration).join('')}
          </div>
        </section>

        <section class="content-section">
          <div class="section-header">
            <div>
              <p class="eyebrow-label">Beregning</p>
              <h2>DB-logik</h2>
            </div>
          </div>
          <ul class="bullet-list">
            ${renderBulletList(dashboardData.formulas)}
          </ul>
        </section>
      </aside>
    </div>

    <section class="content-section">
      <div class="section-header">
        <div>
          <p class="eyebrow-label">Analyse</p>
          <h2>Drivere og kundegrupper</h2>
        </div>
      </div>

      <div class="analysis-grid">
        <article class="card">
          <p class="eyebrow-label">DB% pr. kundegruppe</p>
          <div class="chart-list">
            ${dashboardData.segments.map(renderSegmentRow).join('')}
          </div>
        </article>

        <article class="card">
          <p class="eyebrow-label">Top drivere bag DB-fald</p>
          <div class="stack">
            ${dashboardData.drivers.map(renderListCard).join('')}
          </div>
        </article>
      </div>
    </section>

    <section class="content-section">
      <div class="section-header">
        <div>
          <p class="eyebrow-label">Roadmap</p>
          <h2>Næste skridt for projektet</h2>
        </div>
      </div>
      <ol class="roadmap-list">
        ${dashboardData.roadmap.map((step) => `<li>${step}</li>`).join('')}
      </ol>
    </section>
  </main>
`;
