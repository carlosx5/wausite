export const obj = (content) => {
    const template = buildTemplate(content);
    return `<ul class="textlist li-div">${template}</ul>`;
};

function buildTemplate(content) {
    if (typeof content !== "string") return "";

    const split = content.split(";");
    return split.map((value) => `<li>- ${value.trim()}</li>`).join("");
}
