/**
 * Cria ou atualiza um módulo de radio dinamicamente.
 * @param {Object} moduleData - Dados do módulo.
 * @param {string} rightBoxHtml - HTML adicional para o módulo.
 * @param {HTMLElement} fatherList - Elemento pai onde o módulo será inserido.
 * @param {Function} [scrollTop] - Função opcional para rolar até o módulo.
 */
const obj = (moduleData, rightBoxHtml, parentListElement, scrollToFunction) => {
    //: Gera ID do módulo, garantindo o prefixo "id" se não for novo
    const moduleId = moduleData.id.includes("new") ? moduleData.id : `id${moduleData.id}`;
    const moduleNode = document.getElementById(moduleId);

    //:Atualiza módulo existente, se já houver
    if (moduleNode) {
        //: Atualiza título do módulo
        const titleElement = $(moduleNode, ".title-main h6");
        if (titleElement) titleElement.textContent = moduleData.title;

        //: Atualiza comentário
        const commentElement = $(moduleNode, ".title-main span");
        if (commentElement) commentElement.textContent = moduleData.comment ? `(${moduleData.comment})` : "";

        //: Atualiza dados do módulo
        moduleNode.dataset.type = moduleData.type;
        moduleNode.dataset.height = moduleData.height;

        //: Ajusta scroll para o módulo atualizado
        if (typeof scrollToFunction === "function") scrollToFunction(moduleNode);
        return;
    }

    //: Gera HTML dos itens de conteúdo (radios)
    const contentItems = moduleData.content.split(";");
    const radioItemsHtml = contentItems
        .map((item, index) => {
            const [label = "", checkedValue = "0"] = item.split("=");
            const isChecked = Number(checkedValue) ? "checked" : "";
            return `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="${moduleId}" id="${moduleId}-${index}" ${isChecked} />
                    <label class="form-check-label" for="${moduleId}-${index}">${label}</label>
                </div>`;
        })
        .join("");

    //: Monta conteúdo do módulo
    const moduleContentHtml = `<div style="display:flex;flex-wrap:wrap;column-gap:20px">${radioItemsHtml}</div>`;

    //: Busca template correspondente ao tipo de módulo e coloca os devidos valores
    const moduleTemplate = $m.tpt[moduleData.type];
    const finalHtml = moduleTemplate
        .replace("{id}", moduleId)
        .replace("{title}", moduleData.title)
        .replace("{comment}", moduleData.comment ? `(${moduleData.comment})` : "")
        .replace("{index}", moduleData.index)
        .replace("{type}", moduleData.type)
        .replace("{rightBox}", rightBoxHtml)
        .replace("{content}", moduleContentHtml);

    //: Insere novo módulo no DOM
    parentListElement.insertAdjacentHTML("beforeend", finalHtml);
};

//:Funções do módulo de radio
const fnc = {
    /** //:Eventos do módulo
     *
     * @param {*} event - Evento disparado
     * @param {*} module - Database do Módulo atual
     * @param {*} content - Elemento de conteúdo do módulo
     * @returns
     */
    events(event, module, content) {
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
