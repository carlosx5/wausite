export const obj = (content) => {
    const template = buildTemplate(content);
    return `<ul class="radio li-div">${template}</ul>`;
};

function buildTemplate(content) {
    if (typeof content !== "string") return "";

    return content
        .split(";")
        .map((pair) => pair.split("="))
        .filter(([key, value]) => {
            const numberValue = Number(value);
            return Number.isFinite(numberValue) && Boolean(numberValue);
        })
        .map(([key]) => `<li>- ${key.trim()}</li>`)
        .join("");
}
