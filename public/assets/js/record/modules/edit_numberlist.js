/**
 * Cria ou atualiza um módulo de numeração dinamicamente.
 * @param {Object} moduleData - Dados do módulo.
 * @param {string} rightBoxHtml - HTML adicional para o módulo.
 * @param {HTMLElement} fatherList - Elemento pai onde o módulo será inserido.
 * @param {Function} [scrollTop] - Função opcional para rolar até o módulo.
 */
const obj = (moduleData, rightBoxHtml, fatherList, scrollTop) => {
    //:Gera ID do módulo, garantindo o prefixo "id" se não for novo
    const id = moduleData.id.includes("new") ? moduleData.id : `id${moduleData.id}`;
    const moduleNode = document.getElementById(id);

    //:Caso módulo já exista, atualiza suas informações
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

        //:Ajusta scroll para módulo atualizado
        if (typeof scrollTop === "function") scrollTop(moduleNode);
        return;
    }

    //:Processa conteúdo do módulo separando cada item
    const contentList = moduleData.content.split("&");
    const content = contentList.map((contentItem) => {
        const items = contentItem.split(";");
        const name = items[0] || "";
        const decimal = items[1] || "";
        const prefix = items[2] || "";
        const value = items[3] || 0;

        //:Monta HTML de cada item do conteúdo
        return `
            <div class="col-4 mt-2 item">
                <div class="input-group">
                    <span class="input-group-text name">${name}</span>
                    <input type="text" class="form-control" value="${value}" mask="number" mask-type="${decimal}">
                    <span class="input-group-text prefix">${prefix}</span>
                </div>
            </div>`;
    });

    //: Busca template correspondente ao tipo de módulo e coloca os devidos valores
    const template = $m.tpt[moduleData.type];
    const html = template
        .replace("{id}", id)
        .replace("{title}", moduleData.title)
        .replace("{comment}", moduleData.comment ? `(${moduleData.comment})` : "")
        .replace("{index}", moduleData.index)
        .replace("{type}", moduleData.type)
        .replace("{rightBox}", rightBoxHtml)
        .replace("{content}", content.join(""));

    //:Insere HTML do novo módulo no elemento pai
    fatherList.insertAdjacentHTML("beforeend", html);
};

//:Funções do módulo de numeração
const fnc = {
    /** //:Eventos do módulo
     *
     * @param {*} event - Evento disparado
     * @param {*} module - Database do Módulo atual
     * @param {*} content - Elemento de conteúdo do módulo
     * @returns
     */
    events(event, module, content) {
        const target = event.target;

        if (event.type === "click") return $maskLib.number.onClick(target);

        if (event.type !== "change") return;

        //:Atualiza valor do input
        $inputChange(target, event.target.value);

        //:Seleciona todos os itens dentro do content
        const contentList = content.querySelectorAll(".item");

        //:Cria novo conteúdo atualizado
        const newContent = Array.from(contentList).map((el) => {
            const name = el.querySelector(".name")?.textContent.trim() ?? "";
            const decimal = el.querySelector("input")?.getAttribute("mask-type") ?? "";
            const prefix = el.querySelector(".prefix")?.textContent.trim() ?? "";
            const value = el.querySelector("input")?.value.trim() || "0";
            return `${name};${decimal};${prefix};${value}`;
        });

        //:Atualiza o conteúdo do módulo
        module.content = newContent.join("&");
    },
};

export { obj, fnc };
