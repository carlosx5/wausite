export const obj = (content) => {
    console.log("content: ", content);
    const template = buildTemplate(content);
    return `<ul class="smoking li-div">${template}</ul>`;
};

function buildTemplate(content) {
    if (typeof content !== "string") return "";

    const [years, quantity, result] = content.split(";");

    return `
        <li>- Fumante a quantos anos: ${years}</li>
        <li>- Quantos cigarros por dia: ${quantity}</li>
        <li>- Carga Tabágica: ${result}</li>`;
}
