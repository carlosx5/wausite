/**
 * Cria ou atualiza um módulo de smoking dinamicamente.
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

        //:Define valores dos campos do módulo
        dataSet(moduleNode, moduleData);

        //:Ajusta scroll para módulo atualizado
        if (typeof scrollTop === "function") scrollTop(moduleNode);
        return;
    }

    //:Cria conteúdo específico para o tipo de módulo
    const content = `
        <div class="row mt-4 check-items">
            <div class="col-4">
                <label>Fumante a quantos anos?</label>
                <input class="form-control" name="years" mask="number" mask-type="0" />
            </div>
            <div class="col-4">
                <label>Quantos cigarros por dia?</label>
                <input class="form-control" name="quantity" mask="number" mask-type="0" />
            </div>
            <div class="col-4">
                <label>Carga Tabágica</label>
                <input class="form-control" name="result" mask="number" readonly />
            </div>
        </div>
    `;

    //: Busca template correspondente ao tipo de módulo e coloca os devidos valores
    const template = $m.tpt[moduleData.type];
    const html = template
        .replace("{id}", id)
        .replace("{title}", moduleData.title)
        .replace("{comment}", moduleData.comment ? `(${moduleData.comment})` : "")
        .replace("{index}", moduleData.index)
        .replace("{type}", moduleData.type)
        .replace("{rightBox}", rightBoxHtml)
        .replace("{content}", content);

    //:Insere novo módulo no final da lista do pai
    fatherList.insertAdjacentHTML("beforeend", html);

    //:Define valores dos campos do módulo
    dataSet(fatherList, moduleData);
    return;
    //* * * * * * * * * * * * * * * * * * * *

    //:Define valores dos campos do módulo
    function dataSet(module, moduleData) {
        const dataSplit = moduleData.content.split(";");

        $n(module, "years").value = dataSplit[0] || "";
        $n(module, "quantity").value = dataSplit[1] || "";
        $n(module, "result").value = dataSplit[2] || "";
    }
};

//:Funções do módulo de smoking
const fnc = {
    /** //:Eventos do módulo
     *
     * @param {*} event - Evento disparado
     * @param {*} module - Database do Módulo atual
     * @param {*} content - Elemento de conteúdo do módulo
     * @returns
     */
    events(event, module, content) {
        const smokingNode = event.target.closest(".mod-main.smoking");
        const resultNode = $n(smokingNode, "result");

        const years = +$n(smokingNode, "years").value;
        const quantity = +$n(smokingNode, "quantity").value;
        const result = ((quantity / 20) * years).toFixed(2).replace(".", ",");

        resultNode.value = result;

        //:Atualiza o conteúdo do módulo
        module.content = `${years};${quantity};${result}`;
    },
};

export { obj, fnc };
