/**
 * Cria ou atualiza um módulo de textarea dinamicamente.
 * @param {Object} moduleData - Dados do módulo.
 * @param {string} rightBoxHtml - HTML adicional para o módulo.
 * @param {HTMLElement} fatherList - Elemento pai onde o módulo será inserido.
 * @param {Function} [scrollTop] - Função opcional para rolar até o módulo.
 */
const obj = (moduleData, rightBoxHtml, fatherList, scrollTop) => {
    //:Gera ID do módulo, garantindo o prefixo "id" se não for novo
    const id = moduleData.id.includes("new") ? moduleData.id : `id${moduleData.id}`;
    const moduleNode = document.getElementById(id);

    //:Se módulo já existe, atualiza os dados
    if (moduleNode) {
        //:Atualiza título do módulo
        const titleElement = moduleNode.querySelector(".title-main h6");
        if (titleElement) titleElement.textContent = moduleData.title;

        //:Atualiza comentário, se houver
        const commentElement = moduleNode.querySelector(".title-main span");
        if (commentElement) commentElement.textContent = moduleData.comment ? `(${moduleData.comment})` : "";

        //:Atualiza dados do módulo
        moduleNode.dataset.type = moduleData.type;
        moduleNode.dataset.height = moduleData.height;

        //:Atualiza conteúdo do editor Quill
        if (moduleData.quill && moduleData.quill.root) {
            moduleData.quill.root.innerHTML = moduleData.content || "";
        }

        //:Ajusta scroll para o módulo atualizado
        if (typeof scrollTop === "function") scrollTop(moduleNode);
        return;
    }

    //: Busca template correspondente ao tipo de módulo e coloca os devidos valores
    const template = $m.tpt[moduleData.type];
    const html = template
        .replace(/{title}/g, moduleData.title)
        .replace(/{comment}/g, moduleData.comment ? `(${moduleData.comment})` : "")
        .replace(/{index}/g, moduleData.index)
        .replace(/{height}/g, moduleData.height)
        .replace(/{type}/g, moduleData.type)
        .replace(/{id}/g, id)
        .replace(/{rightBox}/g, rightBoxHtml);

    //:Insere HTML do módulo no elemento pai
    fatherList.insertAdjacentHTML("beforeend", html);

    //:Inicializa editor Quill para o novo módulo
    moduleData.quill = new Quill(`#${id} .quillText`, { theme: "snow" });
    moduleData.quill.root.innerHTML = moduleData.content || "";
};

//:Funções do módulo de textarea
const fnc = {
    /** //:Eventos do módulo
     *
     * @param {*} event - Evento disparado
     * @param {*} module - Database do Módulo atual
     * @returns
     */
    events(event, module) {
        //:Atualiza o conteúdo do módulo
        module.content = module.quill.root.innerHTML;
    },
};

export { obj, fnc };
