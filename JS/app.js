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