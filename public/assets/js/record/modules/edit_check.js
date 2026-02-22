/**
 * Cria ou atualiza um módulo de checkboxes dinamicamente.
 * @param {Object} moduleData - Dados do módulo.
 * @param {string} rightBoxHtml - HTML adicional para o módulo.
 * @param {HTMLElement} fatherList - Elemento pai onde o módulo será inserido.
 * @param {Function} [scrollTop] - Função opcional para rolar até o módulo.
 */
const obj = (moduleData, rightBoxHtml, fatherList, scrollTop) => {
    //:Gera ID do módulo, garantindo o prefixo "id" se não for novo
    const id = moduleData.id.includes("new") ? moduleData.id : `id${moduleData.id}`;
    const moduleNode = document.getElementById(id);

    //:Atualiza módulo existente, se já houver
    if (moduleNode) {
        //:Atualiza título do módulo
        const titleEl = $(moduleNode, ".title-main h6");
        if (titleEl) titleEl.textContent = moduleData.title;

        //:Atualiza comentário
        const commentEl = $(moduleNode, ".title-main span");
        if (commentEl) commentEl.textContent = moduleData.comment ? `(${moduleData.comment})` : "";

        //:Atualiza dados do módulo
        moduleNode.dataset.type = moduleData.type;
        moduleNode.dataset.height = moduleData.height;

        //:Ajusta scroll para o módulo atualizado
        if (typeof scrollTop === "function") scrollTop(moduleNode);
        return;
    }

    //:Cria itens de conteúdo para os checkboxes
    const contentList = (moduleData.content || "").split(";");
    const itemsHtml = contentList
        .map((item, idx) => {
            const [label = "", checkedVal = "0"] = item.split("=");
            const checked = Number(checkedVal) ? "checked" : "";
            return `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="${id}" id="${id}-${idx}" ${checked} />
                    <label class="form-check-label" for="${id}-${idx}">${label}</label>
                </div>
            `;
        })
        .join("");

    //:Monta conteúdo do módulo
    const contentHtml = `<div style="display:flex;flex-wrap:wrap;column-gap:20px">${itemsHtml}</div>`;

    //: Busca template correspondente ao tipo de módulo e coloca os devidos valores
    const template = $m.tpt[moduleData.type];
    const html = template
        .replace("{id}", id)
        .replace("{title}", moduleData.title)
        .replace("{comment}", moduleData.comment ? `(${moduleData.comment})` : "")
        .replace("{index}", moduleData.index)
        .replace("{type}", moduleData.type)
        .replace("{rightBox}", rightBoxHtml)
        .replace("{content}", contentHtml);

    //:Insere módulo no elemento pai
    fatherList.insertAdjacentHTML("beforeend", html);
};

//:Funções do módulo de checkboxes
const fnc = {
    /** //:Eventos do módulo
     *
     * @param {*} event - Evento disparado
     * @param {*} module - Database do Módulo atual
     * @param {*} content - Elemento de conteúdo do módulo
     * @returns
     */
    events(event, module, content) {
        //:Seleciona todos os inputs dentro de content
        const inputList = content.querySelectorAll("input");

        //:Cria novo conteúdo atualizado
        const newContent = Array.from(inputList)
            .filter((input) => input.nextElementSibling)
            .map((input) => {
                const label = input.nextElementSibling.textContent.trim();
                const value = input.checked ? 1 : 0;
                return `${label}=${value}`;
            });

        //:Atualiza conteúdo do módulo
        module.content = newContent.join(";");
    },
};

export { obj, fnc };
