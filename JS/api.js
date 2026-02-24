import { CONFIG } from './config.js';
import { state } from './state.js';

export async function fetchResumo() {
    const response = await fetch(`${CONFIG.API_URL_BASE}?acao=resumo&unidade=${state.unidadeAtual}&t=${Date.now()}`);
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || 'Erro ao carregar resumo');
    return result;
}

export async function fetchRespostas() {
    const response = await fetch(`${CONFIG.API_URL_BASE}?acao=brutos&unidade=${state.unidadeAtual}&t=${Date.now()}`);
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || 'Erro ao carregar respostas brutas');
    
    // MÁGICA AQUI: O Backend manda um array de objetos com chaves em Português.
    // Nós pegamos e mapeamos para o padrão interno do painel.
    return result.data.map(item => ({
        data: item["Data/Hora"],
        mes: item["Mês"],
        cidade: item["Cidade"], // <--- BINGO! Aqui está o plug conectado.
        nota: parseInt(item["Nota 0 a 10"]),
        comentario: item["Por que você deu essa nota?"],
        coletaManual: item["Tipo de Coleta"]
    }));
}
