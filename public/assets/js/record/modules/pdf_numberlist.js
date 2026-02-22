export const obj = (content) => {
    const template = buildTemplate(content);
    return `<ul class="numberList li-div">${template}</ul>`;
};

function buildTemplate(content) {
    if (typeof content !== "string") return "";

    const response = [];
    const contentParts = content.split("&");

    contentParts.forEach((item) => {
        const itemParts = item.split(";");
        if (Number(itemParts[3])) {
            response.push(`<li>- ${itemParts[0]}=${itemParts[3]} ${itemParts[2]}</li>`);
        }
    });

    return response.join("");
}
