import { CONFIG } from './config.js';

export function formatarNumeroMilhares(numero) {
    return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function getNota0a10(dadoLinha) {
    const chaveNota = Object.keys(dadoLinha).find(k => k.toLowerCase().includes('nota') || k.toLowerCase().includes('0 a 10'));
    if (!chaveNota) return null;
    const nota = parseInt(String(dadoLinha[chaveNota]).trim());
    return (!isNaN(nota) && nota >= 0 && nota <= 10) ? nota : null;
}

export function getRecomendacao(dadoLinha) {
    const chaveRec = Object.keys(dadoLinha).find(k => k.toLowerCase().includes('recomendaria'));
    return chaveRec ? String(dadoLinha[chaveRec]).trim().toUpperCase() : 'N/A';
}

export function getComentario(dadoLinha) {
    const chaveCom = Object.keys(dadoLinha).find(k => k.toLowerCase().includes('por que') || k.toLowerCase().includes('comentar'));
    return chaveCom ? String(dadoLinha[chaveCom]).trim() : '';
}

export function obterBadge(nota) {
    if (nota === null) return 'badge-na';
    if (nota >= 9) return 'badge-excelencia';
    if (nota >= 7) return 'badge-qualidade';
    return 'badge-critica';
}

export function obterTextoNota(nota) {
    if (nota === null) return 'N/A';
    if (nota >= 9) return 'Promotor';
    if (nota >= 7) return 'Passivo';
    return 'Detrator';
}

export function obterZona(npsScore) {
    if (npsScore >= 76) return { texto: 'Excelência', desc: '76 a 100' };
    if (npsScore >= 51) return { texto: 'Qualidade', desc: '51 a 75' };
    if (npsScore >= 1) return { texto: 'Aperfeiçoamento', desc: '1 a 50' };
    return { texto: 'Crítica', desc: '-100 a 0' };
}

export function contarPalavras(texto) {
    if (!texto) return 0;
    return String(texto).trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function formatarDataBR(dataISO) {
    if (!dataISO) return 'Sem data';
    try {
        const data = new Date(dataISO);
        if (isNaN(data.getTime())) return dataISO;
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
    } catch (e) {
        return dataISO;
    }
}