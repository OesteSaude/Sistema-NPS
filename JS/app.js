import { state } from './state.js';
import { fetchResumo, fetchRespostas } from './api.js';
import * as uiLib from './ui.js';
import * as chartsLib from './charts.js';
import * as exportLib from './export.js';

// ==========================================
// 🛠️ SISTEMA DE LOGS PARRUDO
// ==========================================
const logger = {
    info: (msg, data = '') => console.log(`%c 🔵 [INFO] ${msg}`, 'color: #3b82f6; font-weight: bold;', data),
    success: (msg, data = '') => console.log(`%c 🟢 [SUCESSO] ${msg}`, 'color: #10b981; font-weight: bold;', data),
    warn: (msg, data = '') => console.log(`%c 🟠 [AVISO] ${msg}`, 'color: #f59e0b; font-weight: bold;', data),
    error: (msg, err = '') => console.error(`%c 🔴 [ERRO] ${msg}`, 'color: #ef4444; font-weight: bold;', err),
    divisor: () => console.log('%c--------------------------------------------------', 'color: #cbd5e1;')
};

// ==========================================
// FUNÇÃO DE INICIALIZAÇÃO (CARREGA OS DADOS)
// ==========================================
async function init() {
    console.groupCollapsed(`🚀 INICIANDO DASHBOARD: [${state.unidadeAtual.toUpperCase()}]`);
    console.time('⏳ Tempo total de carregamento');
    logger.info('Iniciando ciclo de vida da aplicação...');

    try {
        // UI Setup
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('errorScreen').classList.add('hidden');

        // 1. Fetch Resumo
        logger.info(`Chamando API de Resumo para: ${state.unidadeAtual}...`);
        document.getElementById('loadingStatus').textContent = `Carregando resumo (${state.unidadeAtual === 'operadora' ? 'Operadora' : 'Centro Médico'})...`;
        
        console.time('📡 Tempo API Resumo');
        const resultResumo = await fetchResumo();
        console.timeEnd('📡 Tempo API Resumo');
        
        logger.success('Dados do resumo recebidos!', { 
            meses: resultResumo.mesesDisponiveis.length, 
            totaisGlobais: resultResumo.totais 
        });
        
        state.resumoPorMes = resultResumo.resumoPorMes;
        state.totaisGlobais = resultResumo.totais;
        state.mesesDisponiveis = resultResumo.mesesDisponiveis;

        // 2. Fetch Respostas
        logger.info(`Chamando API de Respostas Brutas para: ${state.unidadeAtual}...`);
        document.getElementById('loadingStatus').textContent = 'Carregando respostas individuais...';
        
        console.time('📡 Tempo API Brutos');
        state.dadosGlobais = await fetchRespostas();
        console.timeEnd('📡 Tempo API Brutos');

        logger.success(`Respostas brutas recebidas!`, `Total de linhas processadas: ${state.dadosGlobais.length}`);

        // 3. Process Data
        logger.info('Enviando dados para os módulos de renderização (UI / Gráficos)...');
        processarDados();

        // Finish
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        logger.success('✨ Tudo renderizado! Dashboard pronto para uso.');

    } catch (error) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('errorScreen').classList.remove('hidden');
        document.getElementById('errorMessage').textContent = error.message;
        
        logger.error('Falha fatal durante o fluxo de inicialização:', error);
    } finally {
        console.timeEnd('⏳ Tempo total de carregamento');
        logger.divisor();
        console.groupEnd();
    }
}

// ==========================================
// FUNÇÃO QUE ORQUESTRA A RENDERIZAÇÃO
// ==========================================
function processarDados() {
    try {
        console.time('🎨 Tempo de Renderização UI');
        
        uiLib.atualizarKPIs(state.totaisGlobais);
        uiLib.popularFiltroMeses(state.mesesDisponiveis);
        logger.info('KPIs e Filtros atualizados.');
        
        chartsLib.gerarGraficoNotaGeral();
        chartsLib.gerarGraficoRecomendacao(state.totaisGlobais);
        logger.info('Gráficos principais desenhados.');
        
        const totaisColeta = chartsLib.gerarColetaComparacao();
        uiLib.atualizarCardsColeta(totaisColeta);
        logger.info('Métricas de coleta (Manual/Digital) renderizadas.');
        
        uiLib.renderizarUltimasRespostas();
        uiLib.renderizarSugestoes();
        logger.info('Listas de respostas e sugestões preenchidas.');
        
        exportLib.atualizarSlideExportacao(state.totaisGlobais);
        logger.info('Slide de diretoria pré-renderizado no DOM invisível.');

        console.timeEnd('🎨 Tempo de Renderização UI');
    } catch (error) {
        logger.error('Erro na hora de desenhar os dados na tela (processarDados):', error);
        throw error; // Repassa pro catch do init()
    }
}

// ==========================================
// FUNÇÃO DO SWITCHER (OPERADORA / CENTRO)
// ==========================================
async function trocarDashboard(novaUnidade) {
    if (state.unidadeAtual === novaUnidade) {
        logger.warn(`Tentativa de trocar para a mesma unidade atual: ${novaUnidade}. Ignorado.`);
        return; 
    }
    
    logger.info(`🔄 SWITCHER ATIVADO: Trocando de [${state.unidadeAtual}] para [${novaUnidade}]`);
    state.unidadeAtual = novaUnidade;
    
    const btnOp = document.getElementById('btnOp');
    const btnCm = document.getElementById('btnCm');
    const subtitulo = document.getElementById('headerSubtitle');
    const tituloSlide = document.querySelector('.slide-header p');
    
    // 1. Limpa o estado ativo dos dois botões
    btnOp.classList.remove('active');
    btnCm.classList.remove('active');

    // 2. Acende o botão correto e muda os textos
    if (novaUnidade === 'operadora') {
        btnOp.classList.add('active');
        subtitulo.textContent = "Operadora Oeste Saúde";
        if(tituloSlide) tituloSlide.textContent = "Operadora Oeste Saúde - Reunião de Diretoria";
    } else {
        btnCm.classList.add('active');
        subtitulo.textContent = "Centro Médico Oeste Saúde";
        if(tituloSlide) tituloSlide.textContent = "Centro Médico Oeste Saúde - Reunião de Diretoria";
    }

    // Resetamos a UI para ter a tela de loading de novo
    await init();
}

// ==========================================
// EXPOR FUNÇÕES PARA O HTML (Escopo Global)
// ==========================================
logger.info('Registrando funções no escopo global (window)...');

window.initApp = init;
window.carregarDados = init;
window.trocarDashboard = trocarDashboard;
window.mudarAba = uiLib.mudarAba;
window.toggleResposta = uiLib.toggleResposta;
window.atualizarSlideComFiltro = exportLib.atualizarSlideComFiltro;
window.exportarSlide = exportLib.exportarSlide;

// Inicializa a brincadeira toda
window.addEventListener('DOMContentLoaded', () => {
    logger.info('DOM carregado. Chamando init()...');
    init();

});

export function renderizarAbaCidades(respostasBrutas) {
    // Se não houver dados, aborta
    if (!respostasBrutas || respostasBrutas.length === 0) return;

    // 1. Dicionário para armazenar a matemática de cada cidade
    const cidadesStats = {};

    respostasBrutas.forEach(item => {
        // ⚠️ ATENÇÃO: Aqui você precisa garantir que o nome da propriedade bate com o seu JSON/Planilha. 
        // Geralmente é item.cidade, item.municipio ou item.local. Se for diferente, troque aqui embaixo:
        const cidade = item.cidade || item.local || item.municipio || "Não Informada";
        
        // Ignora respostas sem cidade válida
        if (cidade === "Não Informada" || cidade.trim() === "") return;

        // Se a cidade não existe no dicionário, cria ela
        if (!cidadesStats[cidade]) {
            cidadesStats[cidade] = { promotores: 0, passivos: 0, detratores: 0, total: 0 };
        }

        // Pega a nota da pessoa (0 a 10)
        const nota = parseInt(item.nota || item.nps || 0);

        // Contabiliza
        cidadesStats[cidade].total++;
        if (nota >= 9) cidadesStats[cidade].promotores++;
        else if (nota >= 7) cidadesStats[cidade].passivos++;
        else cidadesStats[cidade].detratores++;
    });

    // 2. Prepara os Arrays para construir a Tela e o Gráfico
    const nomesCidades = [];
    const npsCidades = [];
    let htmlCards = '';

    // Transforma o dicionário num Array pra gente poder ordenar (do maior NPS pro menor)
    const arrayCidades = Object.keys(cidadesStats).map(cidade => {
        const stats = cidadesStats[cidade];
        const pctPro = (stats.promotores / stats.total) * 100;
        const pctDet = (stats.detratores / stats.total) * 100;
        const nps = Math.round(pctPro - pctDet);
        return { cidade, ...stats, nps };
    });

    // Ordena do melhor pro pior NPS
    arrayCidades.sort((a, b) => b.nps - a.nps);

    // 3. Monta o Visual (Gráfico e Cards)
    arrayCidades.forEach(dados => {
        nomesCidades.push(dados.cidade);
        npsCidades.push(dados.nps);

        // Cálculos de % para a barrinha do card
        const pctPro = ((dados.promotores / dados.total) * 100).toFixed(0);
        const pctPas = ((dados.passivos / dados.total) * 100).toFixed(0);
        const pctDet = ((dados.detratores / dados.total) * 100).toFixed(0);

        // Lógica de Cores da Oeste Saúde
        let corBorda = 'bg-slate-300';
        let corNps = 'text-slate-600';
        
        if (dados.nps >= 76) { corBorda = 'bg-emerald-500'; corNps = 'text-emerald-600'; } // Excelência
        else if (dados.nps >= 51) { corBorda = 'bg-[#00A8B0]'; corNps = 'text-[#00A8B0]'; } // Qualidade
        else if (dados.nps >= 1) { corBorda = 'bg-amber-500'; corNps = 'text-amber-500'; } // Aperfeiçoamento
        else { corBorda = 'bg-red-500'; corNps = 'text-red-500'; } // Crítico

        // Monta o Card HTML chique em Tailwind
        htmlCards += `
            <article class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 ${corBorda}"></div>
                <h3 class="text-lg font-bold text-gray-800 mb-1 truncate" title="${dados.cidade}">${dados.cidade}</h3>
                <p class="text-xs text-gray-500 mb-4">${dados.total} avaliações coletadas</p>
                
                <div class="flex items-end gap-2 mb-4">
                    <div class="text-4xl font-black ${corNps}">${dados.nps}</div>
                    <div class="text-xs font-semibold text-gray-400 mb-1 uppercase">NPS Score</div>
                </div>
                
                <!-- Barra de Perfil -->
                <div class="w-full bg-gray-100 rounded-full h-2 flex overflow-hidden mb-2">
                    <div style="width: ${pctPro}%" class="bg-emerald-500"></div>
                    <div style="width: ${pctPas}%" class="bg-amber-500"></div>
                    <div style="width: ${pctDet}%" class="bg-red-500"></div>
                </div>
                <div class="flex justify-between text-[10px] font-bold uppercase">
                    <span class="text-emerald-600">${pctPro}% PRO</span>
                    <span class="text-amber-600">${pctPas}% PAS</span>
                    <span class="text-red-600">${pctDet}% DET</span>
                </div>
            </article>
        `;
    });

    // Injeta os cards na tela
    const grid = document.getElementById('gridCardsCidades');
    if(grid) grid.innerHTML = htmlCards;

    // 4. Desenha o Gráfico de Barras (Ranking)
    const ctx = document.getElementById('chartNPSCidades');
    if (!ctx) return;

    // Se já tiver um gráfico lá, destroi pra desenhar de novo
    if (window.graficoCidades) window.graficoCidades.destroy();

    window.graficoCidades = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nomesCidades,
            datasets: [{
                label: 'NPS Score',
                data: npsCidades,
                backgroundColor: npsCidades.map(nps => nps >= 50 ? '#00A8B0' : (nps >= 0 ? '#f59e0b' : '#ef4444')),
                borderRadius: 6,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: -100, max: 100, grid: { borderDash: [4, 4] } },
                x: { grid: { display: false } }
            }
        }
    });
}
