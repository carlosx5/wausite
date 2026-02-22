/** //:Formata uma data no formato por extenso em pt-BR.
 *
 * @param {string|Date} inputDate - Data no formato "YYYY-MM-DD", string ISO ou Date.
 * @param {{ locale?: string, forceLowercase?: boolean }} [options]
 * @returns {string|null} Data formatada ou null se inválida.
 */
export default function formatDateLong(inputDate, { locale = "pt-BR", forceLowercase = true } = {}) {
    //:Normaliza a entrada para um objeto Date válido sem efeitos de fuso horário
    let date;
    if (inputDate instanceof Date) {
        date = new Date(inputDate.getTime());
    } else if (typeof inputDate === "string") {
        const trimmed = inputDate.trim();
        //:Se for exatamente YYYY-MM-DD, cria data via componentes para evitar shift de fuso horário
        const isoYMD = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoYMD) {
            const year = Number(isoYMD[1]);
            const monthIndex = Number(isoYMD[2]) - 1;
            const day = Number(isoYMD[3]);
            date = new Date(year, monthIndex, day);
        } else {
            //:Fallback para parsing geral (ex: ISO completo ou outros formatos reconhecidos)
            date = new Date(trimmed);
        }
    } else {
        return null;
    }

    //:Verifica validade
    if (Number.isNaN(date.getTime())) return null;

    //:Formata usando Intl
    const formatOptions = { day: "numeric", month: "long", year: "numeric" };
    let formatted = new Intl.DateTimeFormat(locale, formatOptions).format(date);

    //:Garante caixa baixa para mês/connector "de" se solicitado
    if (forceLowercase) formatted = formatted.toLowerCase();

    return formatted;
}
