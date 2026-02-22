export const obj = (content) => {
    const template = buildTemplate(content);
    return `<ul class="check li-div">${template}</ul>`;
};

function buildTemplate(content) {
    if (typeof content !== "string") return "";

    return content
        .split(";")
        .map((pair) => pair.split("="))
        .filter(([key, value]) => {
            const number = Number(value);
            return Number.isFinite(number) && Boolean(number);
        })
        .map(([key]) => `<li>- ${key.trim()}</li>`)
        .join("");
}
