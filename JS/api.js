import { CONFIG } from './config.js';
import { state } from './state.js';

export async function fetchResumo() {
    // Agora passa a &unidade=operadora ou &unidade=centro
    const response = await fetch(`${CONFIG.API_URL_BASE}?acao=resumo&unidade=${state.unidadeAtual}&t=${Date.now()}`);
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || 'Erro ao carregar resumo');
    return result;
}

export async function fetchRespostas() {
    const response = await fetch(`${CONFIG.API_URL_BASE}?acao=brutos&unidade=${state.unidadeAtual}&t=${Date.now()}`);
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || 'Erro ao carregar respostas brutas');
    return result.data;
}