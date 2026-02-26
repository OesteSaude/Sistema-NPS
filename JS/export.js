import { state } from './state.js';
import { formatarNumeroMilhares } from './utils.js';

// ==========================================
// 🧠 1. MÁQUINAS DO TEMPO E MATEMÁTICA
// ==========================================

// Calcula meses anteriores IGNORANDO o mês atual (Regra Nova!)
export function calcularNPSRetroativo(mesBase, qtdMeses) {
    if (!state.resumoPorMes) return { nps: 0, pro: 0, pas: 0, det: 0, total: 0 };
    
    const mesesDisponiveis = Object.keys(state.resumoPorMes).sort().reverse();
    if (mesesDisponiveis.length === 0) return { nps: 0, pro: 0, pas: 0, det: 0, total: 0 };

    let startIndex = 0;
    // PULO DO GATO: Se o cara escolheu um mês, a gente começa a contar a partir do mês ANTERIOR (+1 no array reverso)
    if (mesBase) {
        const idx = mesesDisponiveis.indexOf(mesBase);
        if (idx !== -1) startIndex = idx + 1; 
    }

    const mesesFatia = mesesDisponiveis.slice(startIndex, startIndex + qtdMeses);

    let pro = 0, pas = 0, det = 0, total = 0;
    mesesFatia.forEach(m => {
        const dados = state.resumoPorMes[m];
        pro += dados.promotores !== undefined ? dados.promotores : (dados.totalPromotores || 0);
        pas += dados.passivos !== undefined ? dados.passivos : (dados.neutros !== undefined ? dados.neutros : (dados.totalPassivos || dados.totalNeutros || 0));
        det += dados.detratores !== undefined ? dados.detratores : (dados.totalDetratores || 0);
    });

    total = pro + pas + det;
    const nps = total === 0 ? 0 : Math.round(((pro / total) * 100) - ((det / total) * 100));
    return { nps, pro, pas, det, total };
}

// NOVO: Calcula o Acumulado do Ano (YTD) - Janeiro até o Mês Base
export function calcularNPSYTD(mesBase) {
    if (!state.resumoPorMes) return { nps: 0, pro: 0, pas: 0, det: 0, total: 0 };
    
    const mesesDisponiveis = Object.keys(state.resumoPorMes).sort().reverse();
    if (mesesDisponiveis.length === 0) return { nps: 0, pro: 0, pas: 0, det: 0, total: 0 };

    // Se tiver no global, pega o último mês que existe de referência
    const targetMonth = mesBase || mesesDisponiveis[0];
    const targetYear = targetMonth.substring(0, 4); // Puxa só o '2026'

    // Filtra: Só os meses do MESMO ano e que sejam ANTERIORES ou IGUAIS ao mês escolhido
    const mesesFatia = mesesDisponiveis.filter(m => m.startsWith(targetYear) && m <= targetMonth);

    let pro = 0, pas = 0, det = 0, total = 0;
    mesesFatia.forEach(m => {
        const dados = state.resumoPorMes[m];
        pro += dados.promotores !== undefined ? dados.promotores : (dados.totalPromotores || 0);
        pas += dados.passivos !== undefined ? dados.passivos : (dados.neutros !== undefined ? dados.neutros : (dados.totalPassivos || dados.totalNeutros || 0));
        det += dados.detratores !== undefined ? dados.detratores : (dados.totalDetratores || 0);
    });

    total = pro + pas + det;
    const nps = total === 0 ? 0 : Math.round(((pro / total) * 100) - ((det / total) * 100));
    return { nps, pro, pas, det, total };
}

// ==========================================
// 🎛️ 2. GATILHO DO FILTRO
// ==========================================
window.atualizarSlideComFiltro = function() {
    const seletorMes = document.getElementById('monthFilter') || document.getElementById('filtroMes');
    const mesSelecionado = seletorMes ? seletorMes.value : '';
    
    let metricasPeriodo = state.totaisGlobais; 
    
    if (mesSelecionado && state.resumoPorMes && state.resumoPorMes[mesSelecionado]) {
        metricasPeriodo = state.resumoPorMes[mesSelecionado];
    }

    // Calcula todas as visões temporais
    const dados3M = calcularNPSRetroativo(mesSelecionado, 3);
    const dados12M = calcularNPSRetroativo(mesSelecionado, 12);
    const dadosYTD = calcularNPSYTD(mesSelecionado);

    // Mapeamento Blindado (Passivos x Neutros)
    const pro = metricasPeriodo.totalPromotores !== undefined ? metricasPeriodo.totalPromotores : (metricasPeriodo.promotores || 0);
    const pas = metricasPeriodo.totalPassivos !== undefined ? metricasPeriodo.totalPassivos : 
               (metricasPeriodo.totalNeutros !== undefined ? metricasPeriodo.totalNeutros : 
               (metricasPeriodo.passivos !== undefined ? metricasPeriodo.passivos : 
               (metricasPeriodo.neutros || 0)));
    const det = metricasPeriodo.totalDetratores !== undefined ? metricasPeriodo.totalDetratores : (metricasPeriodo.detratores || 0);
    
    const totalResp = metricasPeriodo.totalRespostas !== undefined ? metricasPeriodo.totalRespostas : (pro + pas + det);
    const npsG = metricasPeriodo.npsGeral !== undefined ? metricasPeriodo.npsGeral : (metricasPeriodo.nps || 0);

    const pctPro = totalResp > 0 ? (pro / totalResp) * 100 : 0;
    const pctPas = totalResp > 0 ? (pas / totalResp) * 100 : 0;
    const pctDet = totalResp > 0 ? (det / totalResp) * 100 : 0;

    const pctPasBackend = metricasPeriodo.percentualPassivos !== undefined ? metricasPeriodo.percentualPassivos : metricasPeriodo.percentualNeutros;

    const metr = {
        totalRespostas: totalResp,
        npsGeral: npsG,
        percentualPromotores: metricasPeriodo.percentualPromotores !== undefined ? metricasPeriodo.percentualPromotores : pctPro,
        percentualPassivos: pctPasBackend !== undefined ? pctPasBackend : pctPas,
        percentualDetratores: metricasPeriodo.percentualDetratores !== undefined ? metricasPeriodo.percentualDetratores : pctDet,
        totalPromotores: pro,
        totalPassivos: pas,
        totalDetratores: det
    };

    // Arruma o texto de qual período está sendo lido
    const labelPeriodo = document.getElementById('slidePeriodo');
    if(labelPeriodo) labelPeriodo.textContent = mesSelecionado ? mesSelecionado : 'Todos os dados';

    atualizarSlideExportacao(metr, dados3M, dados12M, dadosYTD);
    
    // Atualiza o gráfico de linhas caso a aba "Comparativo" esteja ativa
    if (document.getElementById('cenaComparativo').style.display !== 'none') {
        window.renderizarGraficoComparativo();
    }
}

// ==========================================
// 🎨 3. DESENHA O SLIDE GERAL
// ==========================================
export function atualizarSlideExportacao(metricas, dados3M, dados12M, dadosYTD) {
    if (!dados3M) dados3M = calcularNPSRetroativo(null, 3);
    if (!dados12M) dados12M = calcularNPSRetroativo(null, 12);
    if (!dadosYTD) dadosYTD = calcularNPSYTD(null);

    // Regras de cor implacáveis
    function obterCoresEZona(score) {
        if (score >= 76) return { cor: '#10b981', zona: 'Zona de Excelência' }; 
        if (score >= 51) return { cor: '#3b82f6', zona: 'Zona de Qualidade' };  
        if (score >= 1)  return { cor: '#f59e0b', zona: 'Zona de Aperfeiçoamento' }; 
        return { cor: '#ef4444', zona: 'Zona Crítica' }; 
    }

    function obterCorDaPizza(score) {
        return score >= 84 ? '#10b981' : '#ef4444'; 
    }

    const npsAtual = obterCoresEZona(metricas.npsGeral);
    
    // Calcula a cor da pizza pra cada momento
    const corPizzaAtual = obterCorDaPizza(metricas.npsGeral);
    const corPizzaYTD = obterCorDaPizza(dadosYTD.nps);
    const corPizza3M = obterCorDaPizza(dados3M.nps);
    const corPizza12M = obterCorDaPizza(dados12M.nps);

    // 1. Atualizar KPIs Base do Slide
    const slideTotal = document.getElementById('slideTotal');
    if(slideTotal) slideTotal.textContent = formatarNumeroMilhares(metricas.totalRespostas);
    
    const slideProm = document.getElementById('slidePromotores');
    if(slideProm) slideProm.textContent = metricas.percentualPromotores.toFixed(1) + '%';
    
    // Container Mestre do NPS
    const containerNPS = document.getElementById('kpiNpsContainer');
    if (containerNPS) {
        containerNPS.style.background = npsAtual.cor;
        containerNPS.style.borderColor = npsAtual.cor;
        
        const labelNps = document.getElementById('labelNPS');
        if(labelNps) labelNps.style.color = 'rgba(255, 255, 255, 0.9)';
        
        const slideNPS = document.getElementById('slideNPS');
        if(slideNPS) {
            slideNPS.textContent = metricas.npsGeral;
            slideNPS.style.color = '#ffffff';
        }
        
        const slideNPSZona = document.getElementById('slideNPSZona');
        if(slideNPSZona) slideNPSZona.textContent = npsAtual.zona;

        const iconeMeta = document.getElementById('iconeMeta');
        const textoMeta = document.getElementById('textoMeta');
        const statusMeta = document.getElementById('statusMetaInterna');
        
        if(statusMeta) statusMeta.style.color = 'rgba(255, 255, 255, 0.9)';
        
        if (metricas.npsGeral >= 84) {
            if(iconeMeta) iconeMeta.textContent = '🏆';
            if(textoMeta) textoMeta.textContent = 'Meta Atingida (84+)';
            if(statusMeta) {
                statusMeta.style.background = 'rgba(255, 255, 255, 0.2)';
                statusMeta.style.padding = '3px 8px';
                statusMeta.style.borderRadius = '4px';
            }
        } else {
            if(iconeMeta) iconeMeta.textContent = '🎯';
            const pontosFaltando = 84 - metricas.npsGeral;
            if(textoMeta) textoMeta.textContent = `Meta: 84 (Faltam ${pontosFaltando} pts)`;
            if(statusMeta) {
                statusMeta.style.background = 'transparent';
                statusMeta.style.padding = '0';
            }
        }
    }

    // 2. Textos do Meio das Pizzas
    const mapTextosCentrais = [
        { id: 'slideNPSValue', val: metricas.npsGeral, cor: corPizzaAtual },
        { id: 'slideNPSValueYTD', val: dadosYTD.nps, cor: corPizzaYTD },
        { id: 'slideNPSValue3M', val: dados3M.nps, cor: corPizza3M },
        { id: 'slideNPSValue12M', val: dados12M.nps, cor: corPizza12M }
    ];

    mapTextosCentrais.forEach(item => {
        const el = document.getElementById(item.id);
        if(el) { el.textContent = item.val; el.style.color = item.cor; }
    });

    // 3. Desenhar as 4 Pizzas de Evolução
    gerarDoughnutNPS('slideChartNPS', 'exportNpsAtual', metricas.npsGeral, corPizzaAtual); 
    gerarDoughnutNPS('slideChartNPSYTD', 'exportNpsYTD', dadosYTD.nps, corPizzaYTD); 
    gerarDoughnutNPS('slideChartNPS3M', 'exportNps3M', dados3M.nps, corPizza3M);              
    gerarDoughnutNPS('slideChartNPS12M', 'exportNps12M', dados12M.nps, corPizza12M);           

    // 4. Preencher as Mini Legendas Mágicas embaixo das Pizzas
    function popularMiniLegenda(prefixo, dados) {
        const pctPro = dados.total > 0 ? (dados.pro / dados.total) * 100 : 0;
        const pctPas = dados.total > 0 ? (dados.pas / dados.total) * 100 : 0;
        const pctDet = dados.total > 0 ? (dados.det / dados.total) * 100 : 0;
        
        const elPro = document.getElementById(`legenda${prefixo}Pro`);
        const elNeu = document.getElementById(`legenda${prefixo}Neu`) || document.getElementById(`legenda${prefixo}Pas`);
        const elDet = document.getElementById(`legenda${prefixo}Det`);
        const elTot = document.getElementById(`legenda${prefixo}Total`);

        if(elPro) elPro.textContent = `${formatarNumeroMilhares(dados.pro)} (${pctPro.toFixed(1)}%)`;
        if(elNeu) elNeu.textContent = `${formatarNumeroMilhares(dados.pas)} (${pctPas.toFixed(1)}%)`;
        if(elDet) elDet.textContent = `${formatarNumeroMilhares(dados.det)} (${pctDet.toFixed(1)}%)`;
        if(elTot) elTot.textContent = formatarNumeroMilhares(dados.total);
    }

    // Passa os dados processados pras legendas
    popularMiniLegenda('Atual', { pro: metricas.totalPromotores, pas: metricas.totalPassivos, det: metricas.totalDetratores, total: metricas.totalRespostas });
    popularMiniLegenda('YTD', dadosYTD);
    popularMiniLegenda('3M', dados3M);
    popularMiniLegenda('12M', dados12M);
}

// ==========================================
// 🍕 4. FÁBRICA DE PIZZAS (Chart.js)
// ==========================================
function gerarDoughnutNPS(canvasId, instanceKey, npsScore, corPrincipal) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    if (state.chartsInstances && state.chartsInstances[instanceKey]) {
        state.chartsInstances[instanceKey].destroy();
    }
    if (!state.chartsInstances) state.chartsInstances = {};

    const validNps = isNaN(npsScore) ? 0 : npsScore;
    const npsNormalizado = (validNps + 100) / 2;

    state.chartsInstances[instanceKey] = new window.Chart(ctx, {
        type: 'doughnut',
        data: { 
            labels: ['NPS', 'Restante'], 
            datasets: [{ 
                data: [npsNormalizado, 100 - npsNormalizado], 
                backgroundColor: [corPrincipal, '#e2e8f0'], 
                borderWidth: 0,
                cutout: '82%'
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { display: false },
                tooltip: { enabled: false }
            },
            animation: { duration: 0 } // Desativa animação para print perfeito do PNG
        }
    });
}

// ==========================================
// 📈 5. GRÁFICO COMPARATIVO ANUAL (Linhas)
// ==========================================
window.renderizarGraficoComparativo = function() {
    const ctx = document.getElementById('chartComparativoLinhas');
    if (!ctx) return;

    const seletorMes = document.getElementById('monthFilter') || document.getElementById('filtroMes');
    const mesSelecionado = seletorMes ? seletorMes.value : '';

    const mesesDisponiveis = Object.keys(state.resumoPorMes || {}).sort().reverse();
    const targetMonth = mesSelecionado || (mesesDisponiveis[0] || new Date().toISOString().substring(0, 7));
    
    const currentYear = parseInt(targetMonth.substring(0, 4));
    const prevYear = currentYear - 1;

    const labelsMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dataCurrentYear = [];
    const dataPrevYear = [];
    const dataMeta = Array(12).fill(84); // Linha reta da meta

    // Varre de 1 a 12 (Jan a Dez) e extrai o NPS. Se não existir o mês no banco, joga null (linha quebra lindamente)
    for(let i = 1; i <= 12; i++) {
        const mesStr = i.toString().padStart(2, '0');
        
        const keyCurrent = `${currentYear}-${mesStr}`;
        if(state.resumoPorMes && state.resumoPorMes[keyCurrent]) {
            dataCurrentYear.push(state.resumoPorMes[keyCurrent].nps);
        } else {
            dataCurrentYear.push(null);
        }

        const keyPrev = `${prevYear}-${mesStr}`;
        if(state.resumoPorMes && state.resumoPorMes[keyPrev]) {
            dataPrevYear.push(state.resumoPorMes[keyPrev].nps);
        } else {
            dataPrevYear.push(null);
        }
    }

    if (state.chartsInstances && state.chartsInstances['comparativoLinhas']) {
        state.chartsInstances['comparativoLinhas'].destroy();
    }
    if (!state.chartsInstances) state.chartsInstances = {};

    state.chartsInstances['comparativoLinhas'] = new window.Chart(ctx, {
        type: 'line',
        data: {
            labels: labelsMeses,
            datasets: [
                {
                    label: `Meta (84+)`,
                    data: dataMeta,
                    borderColor: '#10b981', // Verde
                    borderWidth: 2,
                    borderDash: [5, 5], // Linha pontilhada estilosa
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                },
                {
                    label: `NPS ${currentYear}`,
                    data: dataCurrentYear,
                    borderColor: '#003D58', // Azul Marinho
                    backgroundColor: '#003D58',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: false,
                    tension: 0.3,
                    spanGaps: true // Conecta a linha mesmo se faltar mês no meio
                },
                {
                    label: `NPS ${prevYear}`,
                    data: dataPrevYear,
                    borderColor: '#00A8B0', // Turquesa
                    backgroundColor: '#00A8B0',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: false,
                    tension: 0.3,
                    spanGaps: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: { enabled: true }
            },
            scales: {
                y: {
                    min: -100,
                    max: 100,
                    ticks: { stepSize: 25 }
                }
            },
            animation: { duration: 0 } // Desativa animação para print não sair em branco
        }
    });
}

// ==========================================
// 🎭 6. SISTEMA DE CENAS (Alterna o Palco)
// ==========================================
window.mudarCenaExport = function(cenaAlvo) {
    // Esconde tudo
    document.getElementById('cenaGeral').style.display = 'none';
    document.getElementById('cenaComparativo').style.display = 'none';
    
    // Reseta visual dos botões
    const btnGeral = document.getElementById('btnCenaGeral');
    const btnComp = document.getElementById('btnCenaComparativo');
    
    btnGeral.className = "px-4 py-2 text-sm font-bold rounded-md text-gray-500 hover:text-[#003D58] transition-all";
    btnComp.className = "px-4 py-2 text-sm font-bold rounded-md text-gray-500 hover:text-[#003D58] transition-all";
    
    // Mostra o escolhido e ativa o botão
    if(cenaAlvo === 'geral') {
        document.getElementById('cenaGeral').style.display = 'block';
        btnGeral.className = "px-4 py-2 text-sm font-bold rounded-md bg-white shadow-sm text-[#003D58] transition-all";
    } else {
        document.getElementById('cenaComparativo').style.display = 'block';
        btnComp.className = "px-4 py-2 text-sm font-bold rounded-md bg-white shadow-sm text-[#003D58] transition-all";
        // Renderiza o gráfico mágico
        window.renderizarGraficoComparativo();
    }
}

// ==========================================
// 📸 7. TIRA A FOTO DO SLIDE 
// ==========================================
window.exportarSlide = async function(event) {
    const elemento = document.getElementById('slideExportacao');
    const botao = event.target.closest('.export-button');
    const textoOriginal = botao.innerHTML;

    botao.innerHTML = 'Gerando...';
    botao.disabled = true;

    try {
        const estiloOriginal = elemento.style.cssText;
        elemento.style.height = 'auto';
        elemento.style.minHeight = '720px';
        
        await new Promise(resolve => setTimeout(resolve, 500));
        const canvas = await html2canvas(elemento, { scale: 2, useCORS: true, backgroundColor: '#ffffff', allowTaint: true });
        elemento.style.cssText = estiloOriginal;

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        
        // Pega qual aba tá ativa pra mudar o nome do arquivo
        const tipoExport = document.getElementById('cenaGeral').style.display === 'block' ? 'Geral' : 'Comparativo';
        link.download = `NPS-${tipoExport}-Diretoria-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
    } catch (error) {
        console.error('Erro ao exportar:', error);
        alert('Erro ao gerar a imagem.');
    } finally {
        botao.innerHTML = textoOriginal;
        botao.disabled = false;
    }
}
