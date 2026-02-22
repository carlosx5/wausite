/**
 * Cria ou atualiza um módulo de radio dinamicamente.
 * @param {Object} moduleData - Dados do módulo.
 * @param {string} rightBoxHtml - HTML adicional para o módulo.
 * @param {HTMLElement} fatherList - Elemento pai onde o módulo será inserido.
 * @param {Function} [scrollTop] - Função opcional para rolar até o módulo.
 */
export const obj = (moduleData, rightBoxHtml, parentListElement, scrollToFunction) => {
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

    //: Busca template correspondente ao tipo de módulo e coloca os devidos valores
    const moduleTemplate = $m.tpt[moduleData.type];
    const finalHtml = moduleTemplate
        .replace("{id}", moduleId)
        .replace("{title}", moduleData.title)
        .replace("{comment}", moduleData.comment ? `(${moduleData.comment})` : "")
        .replace("{index}", moduleData.index)
        .replace("{type}", moduleData.type)
        .replaceAll("{list}", `list_${moduleId}`)
        .replace("{rightBox}", rightBoxHtml);

    //: Insere novo módulo no DOM
    parentListElement.insertAdjacentHTML("beforeend", finalHtml);
};
