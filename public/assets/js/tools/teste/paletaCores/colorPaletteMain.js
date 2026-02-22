document.addEventListener("DOMContentLoaded", () => {
    selectors.dom();

    $(".elements-container").addEventListener("click", (event) => selectors.events(event));
});

const selectors = {
    root: ["--cl10", "--cl15", "--cl35", "--cl30", "--cl95", "--input-color", "--input-bg", "--input-border"],
    selected: "--cl10",

    dom() {
        selectors.root.forEach((el) => {
            const rgb = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue(el).trim());
            $(`.${el} .form-control`).value = rgb;
            $(`.${el} .refresh`).dataset.rgb = rgb;
        });
    },

    events(event) {
        const target = event.target;

        //:Se for click
        if (event.type == "click") {
            //:Botão seletor de elemento
            if (target.closest(".select")) {
                selectors.selected = target.closest(".form-group").dataset.root;

                const rgb = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue(selectors.selected).trim());
                initializeColorPrecisely(rgb);

                return;
            }

            //:Botão refresh
            if (target.closest(".refresh")) {
                selectors.selected = target.closest(".form-group").dataset.root;

                const rgb = target.closest(".refresh").dataset.rgb;
                document.documentElement.style.setProperty(selectors.selected, rgb);
                initializeColorPrecisely(rgb);

                return;
            }
        }
    },
};

function hexToRgb(hex) {
    //:remove espaços
    hex = hex.replace(/\s+/g, "");

    //:Se for RGB (2 virgulas) retorna o valor
    if (hex.split(",").length - 1 === 2) return hex;

    //:Se não for hexa retorna o valor
    if (!hex.includes("#")) return hex;

    //:Remove o "#"
    hex = hex.replace(/^#/, "");

    //:Se for um hex curto (#fff), expande para #ffffff
    if (hex.length === 3) {
        hex = hex
            .split("")
            .map((char) => char + char)
            .join("");
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgb(${r},${g},${b})`;
}
