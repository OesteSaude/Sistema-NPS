import { state } from './state.js';
import { formatarNumeroMilhares } from './utils.js';

// =============================================================================
// 🧠 1. MÁQUINAS DO TEMPO E MATEMÁTICA
// =============================================================================

export function calcularNPSRetroativo(mesBase, qtdMeses) {
    if (!state.resumoPorMes) return { nps: 0, pro: 0, pas: 0, det: 0, total: 0 };

    const mesesDisponiveis = Object.keys(state.resumoPorMes).sort().reverse();
    if (mesesDisponiveis.length === 0) return { nps: 0, pro: 0, pas: 0, det: 0, total: 0 };

    let startIndex = 0;
    if (mesBase) {
        const idx = mesesDisponiveis.indexOf(mesBase);
        if (idx !== -1) startIndex = idx + 1;
    }

    const mesesFatia = mesesDisponiveis.slice(startIndex, startIndex + qtdMeses);

    let pro = 0, pas = 0, det = 0, total = 0;

    mesesFatia.forEach(m => {
        const dados = state.resumoPorMes[m];
        pro += dados.promotores  !== undefined ? dados.promotores  : (dados.totalPromotores || 0);
        pas += dados.passivos    !== undefined ? dados.passivos    : (dados.neutros !== undefined ? dados.neutros : (dados.totalPassivos || dados.totalNeutros || 0));
        det += dados.detratores  !== undefined ? dados.detratores  : (dados.totalDetratores || 0);
    });

    total = pro + pas + det;
    const nps = total === 0 ? 0 : Math.round(((pro / total) * 100) - ((det / total) * 100));

    return { nps, pro, pas, det, total };
}

export function calcularNPSYTD(mesBase) {
    if (!state.resumoPorMes) return { nps: 0, pro: 0, pas: 0, det: 0, total: 0 };

    const mesesDisponiveis = Object.keys(state.resumoPorMes).sort().reverse();
    if (mesesDisponiveis.length === 0) return { nps: 0, pro: 0, pas: 0, det: 0, total: 0 };

    const targetMonth = mesBase || mesesDisponiveis[0];
    const targetYear  = targetMonth.substring(0, 4);
    const mesesFatia  = mesesDisponiveis.filter(m => m.startsWith(targetYear) && m <= targetMonth);

    let pro = 0, pas = 0, det = 0, total = 0;

    mesesFatia.forEach(m => {
        const dados = state.resumoPorMes[m];
        pro += dados.promotores  !== undefined ? dados.promotores  : (dados.totalPromotores || 0);
        pas += dados.passivos    !== undefined ? dados.passivos    : (dados.neutros !== undefined ? dados.neutros : (dados.totalPassivos || dados.totalNeutros || 0));
        det += dados.detratores  !== undefined ? dados.detratores  : (dados.totalDetratores || 0);
    });

    total = pro + pas + det;
    const nps = total === 0 ? 0 : Math.round(((pro / total) * 100) - ((det / total) * 100));

    return { nps, pro, pas, det, total };
}

// =============================================================================
// 🎛️ 2. GATILHO DO FILTRO
// =============================================================================

export function atualizarSlideComFiltro() {
    const seletorMes    = document.getElementById('monthFilter') || document.getElementById('filtroMes');
    const mesSelecionado = seletorMes ? seletorMes.value : '';

    let metricasPeriodo = state.totaisGlobais;

    if (mesSelecionado && state.resumoPorMes && state.resumoPorMes[mesSelecionado]) {
        metricasPeriodo = state.resumoPorMes[mesSelecionado];
    }

    const dados3M   = calcularNPSRetroativo(mesSelecionado, 3);
    const dados12M  = calcularNPSRetroativo(mesSelecionado, 12);
    const dadosYTD  = calcularNPSYTD(mesSelecionado);

    const pro = metricasPeriodo.totalPromotores !== undefined
        ? metricasPeriodo.totalPromotores
        : (metricasPeriodo.promotores || 0);

    const pas = metricasPeriodo.totalPassivos   !== undefined ? metricasPeriodo.totalPassivos  :
               (metricasPeriodo.totalNeutros    !== undefined ? metricasPeriodo.totalNeutros   :
               (metricasPeriodo.passivos        !== undefined ? metricasPeriodo.passivos       :
               (metricasPeriodo.neutros || 0)));

    const det = metricasPeriodo.totalDetratores !== undefined
        ? metricasPeriodo.totalDetratores
        : (metricasPeriodo.detratores || 0);

    const totalResp = metricasPeriodo.totalRespostas !== undefined
        ? metricasPeriodo.totalRespostas
        : (pro + pas + det);

    const npsG = metricasPeriodo.npsGeral !== undefined
        ? metricasPeriodo.npsGeral
        : (metricasPeriodo.nps || 0);

    const pctPro = totalResp > 0 ? (pro / totalResp) * 100 : 0;
    const pctPas = totalResp > 0 ? (pas / totalResp) * 100 : 0;
    const pctDet = totalResp > 0 ? (det / totalResp) * 100 : 0;

    const pctPasBackend = metricasPeriodo.percentualPassivos !== undefined
        ? metricasPeriodo.percentualPassivos
        : metricasPeriodo.percentualNeutros;

    const metr = {
        totalRespostas:       totalResp,
        npsGeral:             npsG,
        percentualPromotores: metricasPeriodo.percentualPromotores !== undefined ? metricasPeriodo.percentualPromotores : pctPro,
        percentualPassivos:   pctPasBackend !== undefined ? pctPasBackend : pctPas,
        percentualDetratores: metricasPeriodo.percentualDetratores !== undefined ? metricasPeriodo.percentualDetratores : pctDet,
        totalPromotores:      pro,
        totalPassivos:        pas,
        totalDetratores:      det,
    };

    const labelPeriodo = document.getElementById('slidePeriodo');
    if (labelPeriodo) labelPeriodo.textContent = mesSelecionado ? mesSelecionado : 'Todos os dados';

    atualizarSlideExportacao(metr, dados3M, dados12M, dadosYTD);

    const cenaComparativo = document.getElementById('cenaComparativo');
    if (cenaComparativo && cenaComparativo.style.display !== 'none') {
        renderizarGraficoComparativo();
    }
}

// =============================================================================
// 🎨 3. DESENHA O SLIDE GERAL
// =============================================================================

export function atualizarSlideExportacao(metricas, dados3M, dados12M, dadosYTD) {
    if (!dados3M)   dados3M  = calcularNPSRetroativo(null, 3);
    if (!dados12M)  dados12M = calcularNPSRetroativo(null, 12);
    if (!dadosYTD)  dadosYTD = calcularNPSYTD(null);

    // --- Helpers internos ---

    function obterCoresEZona(score) {
        if (score >= 76) return { cor: '#10b981', zona: 'Zona de Excelência' };
        if (score >= 51) return { cor: '#3b82f6', zona: 'Zona de Qualidade' };
        if (score >= 1)  return { cor: '#f59e0b', zona: 'Zona de Aperfeiçoamento' };
        return             { cor: '#ef4444', zona: 'Zona Crítica' };
    }

    function obterCorDaPizza(score) {
        return score >= 84 ? '#10b981' : '#ef4444';
    }

    // --- Cores calculadas ---

    const npsAtual      = obterCoresEZona(metricas.npsGeral);
    const corPizzaAtual = obterCorDaPizza(metricas.npsGeral);
    const corPizzaYTD   = obterCorDaPizza(dadosYTD.nps);
    const corPizza3M    = obterCorDaPizza(dados3M.nps);
    const corPizza12M   = obterCorDaPizza(dados12M.nps);

    // --- KPIs simples ---

    const slideTotal = document.getElementById('slideTotal');
    if (slideTotal) slideTotal.textContent = formatarNumeroMilhares(metricas.totalRespostas);

    const slideProm = document.getElementById('slidePromotores');
    if (slideProm) slideProm.textContent = metricas.percentualPromotores.toFixed(1) + '%';

    // --- Container NPS principal ---

    const containerNPS = document.getElementById('kpiNpsContainer');
    if (containerNPS) {
        containerNPS.style.background   = npsAtual.cor;
        containerNPS.style.borderColor  = npsAtual.cor;

        const labelNps = document.getElementById('labelNPS');
        if (labelNps) labelNps.style.color = 'rgba(255, 255, 255, 0.9)';

        const slideNPS = document.getElementById('slideNPS');
        if (slideNPS) {
            slideNPS.textContent  = metricas.npsGeral;
            slideNPS.style.color  = '#ffffff';
        }

        const slideNPSZona = document.getElementById('slideNPSZona');
        if (slideNPSZona) slideNPSZona.textContent = npsAtual.zona;

        const iconeMeta  = document.getElementById('iconeMeta');
        const textoMeta  = document.getElementById('textoMeta');
        const statusMeta = document.getElementById('statusMetaInterna');

        if (statusMeta) statusMeta.style.color = 'rgba(255, 255, 255, 0.9)';

        if (metricas.npsGeral >= 84) {
            if (iconeMeta)  iconeMeta.textContent  = '🏆';
            if (textoMeta)  textoMeta.textContent  = 'Meta Atingida (84+)';
            if (statusMeta) {
                statusMeta.style.background   = 'rgba(255, 255, 255, 0.2)';
                statusMeta.style.padding      = '3px 8px';
                statusMeta.style.borderRadius = '4px';
            }
        } else {
            if (iconeMeta)  iconeMeta.textContent = '🎯';
            const pontosFaltando = 84 - metricas.npsGeral;
            if (textoMeta)  textoMeta.textContent = `Meta: 84 (Faltam ${pontosFaltando} pts)`;
            if (statusMeta) {
                statusMeta.style.background = 'transparent';
                statusMeta.style.padding    = '0';
            }
        }
    }

    // --- Textos centrais dos doughnuts ---

    const mapTextosCentrais = [
        { id: 'slideNPSValue',    val: metricas.npsGeral, cor: corPizzaAtual },
        { id: 'slideNPSValueYTD', val: dadosYTD.nps,      cor: corPizzaYTD  },
        { id: 'slideNPSValue3M',  val: dados3M.nps,        cor: corPizza3M   },
        { id: 'slideNPSValue12M', val: dados12M.nps,       cor: corPizza12M  },
    ];

    mapTextosCentrais.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            el.textContent  = item.val;
            el.style.color  = item.cor;
        }
    });

    // --- Gráficos doughnut ---

    gerarDoughnutNPS('slideChartNPS',    'exportNpsAtual', metricas.npsGeral, corPizzaAtual);
    gerarDoughnutNPS('slideChartNPSYTD', 'exportNpsYTD',   dadosYTD.nps,     corPizzaYTD);
    gerarDoughnutNPS('slideChartNPS3M',  'exportNps3M',    dados3M.nps,      corPizza3M);
    gerarDoughnutNPS('slideChartNPS12M', 'exportNps12M',   dados12M.nps,     corPizza12M);

    // --- Mini legendas ---

    function popularMiniLegenda(prefixo, dados) {
        const pctPro = dados.total > 0 ? (dados.pro / dados.total) * 100 : 0;
        const pctPas = dados.total > 0 ? (dados.pas / dados.total) * 100 : 0;
        const pctDet = dados.total > 0 ? (dados.det / dados.total) * 100 : 0;

        const elPro = document.getElementById(`legenda${prefixo}Pro`);
        const elNeu = document.getElementById(`legenda${prefixo}Neu`) || document.getElementById(`legenda${prefixo}Pas`);
        const elDet = document.getElementById(`legenda${prefixo}Det`);
        const elTot = document.getElementById(`legenda${prefixo}Total`);

        if (elPro) elPro.textContent = `${formatarNumeroMilhares(dados.pro)} (${pctPro.toFixed(1)}%)`;
        if (elNeu) elNeu.textContent = `${formatarNumeroMilhares(dados.pas)} (${pctPas.toFixed(1)}%)`;
        if (elDet) elDet.textContent = `${formatarNumeroMilhares(dados.det)} (${pctDet.toFixed(1)}%)`;
        if (elTot) elTot.textContent = formatarNumeroMilhares(dados.total);
    }

    popularMiniLegenda('Atual', {
        pro:   metricas.totalPromotores,
        pas:   metricas.totalPassivos,
        det:   metricas.totalDetratores,
        total: metricas.totalRespostas,
    });
    popularMiniLegenda('YTD', dadosYTD);
    popularMiniLegenda('3M',  dados3M);
    popularMiniLegenda('12M', dados12M);
}

// =============================================================================
// 🍕 4. FÁBRICA DE PIZZAS
// =============================================================================

function gerarDoughnutNPS(canvasId, instanceKey, npsScore, corPrincipal) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (state.chartsInstances?.[instanceKey]) {
        state.chartsInstances[instanceKey].destroy();
    }

    if (!state.chartsInstances) state.chartsInstances = {};

    const validNps       = isNaN(npsScore) ? 0 : npsScore;
    const npsNormalizado = (validNps + 100) / 2;

    state.chartsInstances[instanceKey] = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['NPS', 'Restante'],
            datasets: [{
                data:            [npsNormalizado, 100 - npsNormalizado],
                backgroundColor: [corPrincipal, '#e2e8f0'],
                borderWidth:     0,
                cutout:          '72%',
            }],
        },
        options: {
            responsive:          true,
            maintainAspectRatio: false,
            plugins: {
                legend:  { display: false },
                tooltip: { enabled: false },
            },
            animation: { duration: 0 },
        },
    });
}

// =============================================================================
// 📈 5. GRÁFICO COMPARATIVO ANUAL (Barra + Linha)
// =============================================================================

export function renderizarGraficoComparativo() {
    const ctx = document.getElementById('chartComparativoLinhas');
    if (!ctx) return;

    const seletorMes     = document.getElementById('monthFilter') || document.getElementById('filtroMes');
    const mesSelecionado = seletorMes ? seletorMes.value : '';
    const mesesDisponiveis = Object.keys(state.resumoPorMes || {}).sort().reverse();
    const targetMonth    = mesSelecionado || (mesesDisponiveis[0] || new Date().toISOString().substring(0, 7));

    const currentYear  = parseInt(targetMonth.substring(0, 4));
    const prevYear     = currentYear - 1;
    const labelsMeses  = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const dataCurrentYear = [];
    const dataPrevYear    = [];
    const dataMeta        = Array(12).fill(84);

    for (let i = 1; i <= 12; i++) {
        const mesStr = i.toString().padStart(2, '0');

        const keyCurrent = `${currentYear}-${mesStr}`;
        dataCurrentYear.push(state.resumoPorMes?.[keyCurrent]?.nps ?? null);

        const keyPrev = `${prevYear}-${mesStr}`;
        dataPrevYear.push(state.resumoPorMes?.[keyPrev]?.nps ?? null);
    }

    if (state.chartsInstances?.['comparativoLinhas']) {
        state.chartsInstances['comparativoLinhas'].destroy();
    }

    if (!state.chartsInstances) state.chartsInstances = {};

    state.chartsInstances['comparativoLinhas'] = new window.Chart(ctx, {
        data: {
            labels: labelsMeses,
            datasets: [
                {
                    // Linha da meta
                    type:        'line',
                    label:       'Meta (84+)',
                    data:        dataMeta,
                    borderColor: '#10b981',
                    borderWidth: 2,
                    borderDash:  [6, 6],
                    pointRadius: 0,
                    fill:        false,
                    tension:     0,
                    order:       1,
                },
                {
                    // Ano atual
                    type:                'line',
                    label:               `NPS ${currentYear} (Atual)`,
                    data:                dataCurrentYear,
                    borderColor:         '#003D58',
                    borderWidth:         4,
                    pointRadius:         6,
                    pointBackgroundColor: '#fff',
                    pointBorderColor:    '#003D58',
                    pointBorderWidth:    3,
                    pointHoverRadius:    8,
                    fill:                false,
                    tension:             0.3,
                    spanGaps:            true,
                    order:               2,
                },
                {
                    // Ano anterior
                    type:            'bar',
                    label:           `NPS ${prevYear} (Anterior)`,
                    data:            dataPrevYear,
                    backgroundColor: 'rgba(0, 164, 153, 0.4)',
                    borderColor:     'transparent',
                    borderWidth:     0,
                    borderRadius:    4,
                    barPercentage:   0.6,
                    order:           3,
                },
            ],
        },
        options: {
            responsive:          true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font:           { size: 13, weight: 'bold', family: "'Montserrat', sans-serif" },
                        padding:        20,
                        usePointStyle:  true,
                    },
                },
                tooltip: { enabled: true },
            },
            scales: {
                y: {
                    min:   -100,
                    max:   100,
                    ticks: { stepSize: 25, font: { size: 11, weight: '600' } },
                    grid:  { color: '#f1f5f9' },
                },
                x: {
                    ticks: { font: { size: 12, weight: 'bold' }, color: '#475569' },
                    grid:  { display: false },
                },
            },
            animation: { duration: 0 },
        },
    });
}

// =============================================================================
// 🎭 6. SISTEMA DE CENAS
// =============================================================================

export function mudarCenaExport(cenaAlvo) {
    const cenaGeral      = document.getElementById('cenaGeral');
    const cenaComparativo = document.getElementById('cenaComparativo');
    const btnGeral       = document.getElementById('btnCenaGeral');
    const btnComp        = document.getElementById('btnCenaComparativo');

    if (cenaGeral)      cenaGeral.style.display      = 'none';
    if (cenaComparativo) cenaComparativo.style.display = 'none';

    const classeInativa = 'px-4 py-2 text-sm font-bold rounded-md text-gray-500 hover:text-[#003D58] transition-all';
    const classeAtiva   = 'px-4 py-2 text-sm font-bold rounded-md bg-white shadow-sm text-[#003D58] transition-all';

    if (btnGeral) btnGeral.className = classeInativa;
    if (btnComp)  btnComp.className  = classeInativa;

    if (cenaAlvo === 'geral') {
        if (cenaGeral) cenaGeral.style.display = 'block';
        if (btnGeral)  btnGeral.className = classeAtiva;
    } else {
        if (cenaComparativo) cenaComparativo.style.display = 'block';
        if (btnComp)         btnComp.className = classeAtiva;
        renderizarGraficoComparativo();
    }
}

// =============================================================================
// 📸 7. EXPORTAR (HTML → SVG → PNG RETINA)
// =============================================================================

/**
 * Baixa a fonte via fetch e injeta como @font-face base64 no <head>,
 * evitando o SecurityError de cssRules em stylesheets cross-origin.
 */
async function injetarFontesInline() {
    const STYLE_ID = '__fontes_inline_export__';
    if (document.getElementById(STYLE_ID)) return;

    try {
        const response = await fetch(
            'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap'
        );
        let css = await response.text();

        const urlRegex = /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g;
        const matches  = [...css.matchAll(urlRegex)];

        await Promise.all(matches.map(async ([, url]) => {
            try {
                const fontResp = await fetch(url);
                const blob     = await fontResp.blob();
                const base64   = await new Promise(res => {
                    const reader = new FileReader();
                    reader.onloadend = () => res(reader.result);
                    reader.readAsDataURL(blob);
                });
                css = css.replace(url, base64);
            } catch (e) {
                console.warn('Não foi possível converter fonte:', url);
            }
        }));

        const style = document.createElement('style');
        style.id    = STYLE_ID;
        style.textContent = css;
        document.head.appendChild(style);

    } catch (e) {
        console.warn('Falha ao injetar fontes inline (export usará fonte fallback):', e);
    }
}

export async function exportarSlide(event) {
    const botao         = event.currentTarget;
    const textoOriginal = botao.innerHTML;
    botao.innerHTML     = 'Gerando... 🚀';
    botao.disabled      = true;

    try {
        const slide   = document.getElementById('slideExportacao');
        const escala  = 3;
        const largura = slide.offsetWidth;
        const altura  = slide.offsetHeight;

        const canvas  = document.createElement('canvas');
        canvas.width  = largura * escala;
        canvas.height = altura  * escala;

        const ctx = canvas.getContext('2d');
        ctx.scale(escala, escala);

        // 1. Fundo branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, largura, altura);

        // 2. Renderiza o slide como imagem via foreignObject (só o layout, sem fetch externo)
        const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}">
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml">
                        ${slide.outerHTML}
                    </div>
                </foreignObject>
            </svg>`;

        await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => { ctx.drawImage(img, 0, 0, largura, altura); resolve(); };
            img.onerror = reject;
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
        });

        // 3. Copia os canvas do Chart.js por cima (resolve o problema dos gráficos em branco)
        const canvasIds = [
            'slideChartNPS', 'slideChartNPSYTD',
            'slideChartNPS3M', 'slideChartNPS12M',
            'chartComparativoLinhas'
        ];

        canvasIds.forEach(id => {
            const c = document.getElementById(id);
            if (!c || c.closest('#cenaGeral,#cenaComparativo')?.style.display === 'none') return;

            const rect       = c.getBoundingClientRect();
            const slideRect  = slide.getBoundingClientRect();
            const x = rect.left - slideRect.left;
            const y = rect.top  - slideRect.top;

            ctx.drawImage(c, x, y, rect.width, rect.height);
        });

        // 4. Copia o logo por cima (resolve o problema da imagem externa)
        const logoEl = document.getElementById('logoSlide');
        if (logoEl) {
            const rect      = logoEl.getBoundingClientRect();
            const slideRect = slide.getBoundingClientRect();
            const x = rect.left - slideRect.left;
            const y = rect.top  - slideRect.top;
            ctx.drawImage(logoEl, x, y, rect.width, rect.height);
        }

        // 5. Download
        const link    = document.createElement('a');
        const isGeral = document.getElementById('cenaGeral')?.style.display === 'block';
        link.download = `NPS-${isGeral ? 'VisaoGeral' : 'Comparativo'}-${new Date().toISOString().split('T')[0]}.png`;
        link.href     = canvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error('Erro no export:', error);
        alert('Erro ao gerar a imagem. Verifique o console.');
    } finally {
        botao.innerHTML = textoOriginal;
        botao.disabled  = false;
    }
}

// =============================================================================
// 🌐 BINDINGS GLOBAIS
// =============================================================================

window.atualizarSlideComFiltro    = atualizarSlideComFiltro;
window.exportarSlide              = exportarSlide;
window.mudarCenaExport            = mudarCenaExport;
window.renderizarGraficoComparativo = renderizarGraficoComparativo;
