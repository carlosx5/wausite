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

    //: Busca template correspondente ao tipo de módulo e coloca os devidos valores
    const moduleTemplate = $m.tpt[moduleData.type];
    const finalHtml = moduleTemplate
        .replace("{id}", moduleId)
        .replace("{title}", moduleData.title)
        .replace("{comment}", moduleData.comment ? `(${moduleData.comment})` : "")
        .replace("{index}", moduleData.index)
        .replace("{type}", moduleData.type)
        .replace("{rightBox}", rightBoxHtml);

    //: Insere novo módulo no DOM
    parentListElement.insertAdjacentHTML("beforeend", finalHtml);

    //:Gera HTML do conteúdo atualizado
    const dataNode = document.querySelector(`.left #${moduleId} .data`);
    const content = moduleData.content;
    const contentArray = content ? content.split(";") : [];
    fnc.renderHtml(dataNode, contentArray);
};

//:Funções do módulo de alergia
const fnc = {
    /** //:Busca alergias com debounce
     *
     * @param {string} find - Texto a ser buscado.
     */
    _debounce: $debounce(async (find) => {
        if (!find || find.length < 1) {
            //:Limpa a lista se a busca estiver vazia
            const listNode = $("#allergy");
            if (listNode) listNode.innerHTML = "";
            return;
        }

        try {
            const resp = await $fetch({
                url: "record/register/recordRegister/getAllergy",
                par: { find },
                overlay: false,
                fnName: "BUSCA ALERGIAS #706",
            });

            //:Adiciona verificação para 'resp.list'
            const tpt = resp?.list?.map(({ id, name }) => `<option value="${name}" data-id="${id}">`).join("");

            const listNode = $("#allergy");
            if (listNode) {
                listNode.innerHTML = tpt || ""; //:Garante que não seja 'undefined'
            }
        } catch (error) {
            console.error("Erro ao buscar alergias:", error);
        }
    }, 300),
    ///Função de busca de alergias (chamar externamente)
    findAllergy(find) {
        this._debounce(find);
    },

    /** //:Cria valor para o campo contetúdo e gera HTML
     *
     * @param {node} dataNode - Node de ".data" do módulo
     * @param {string} content - Conteúdo atual do módulo
     * @param {string} addValue - Valor a ser adicionado
     * @return {string} - Novo valor do conteúdo
     */
    renderContent(dataNode, content, addValue) {
        const contentArray = content ? content.split(";") : [];

        //:Adiciona novo valor se não existir
        if (addValue && !contentArray.includes(addValue)) {
            contentArray.push(addValue);
        }

        //:Gera HTML do conteúdo atualizado
        this.renderHtml(dataNode, contentArray);

        //:Retorna novo valor do conteúdo
        return contentArray.join(";");
    },

    /** //:Gera HTML do conteúdo
     *
     * @param {node} dataNode - Node de ".data" do módulo
     * @param {array} contentArray - Array de conteúdos
     */
    renderHtml(dataNode, contentArray) {
        const html = contentArray.map((value) => {
            return `
                <div class="ms-3">
                    <span>${value}</span>
                    <i class="fa-light fa-circle-xmark text-danger"></i>
                </div>`;
        });

        dataNode.innerHTML = html.join("");
    },

    /** //:Eventos do módulo
     *
     * @param {*} event - Evento disparado
     * @param {*} module - Database do Módulo atual
     * @returns
     */
    events(event, module) {
        const target = event.target;

        if (event.type == "click") return addNewAllergy();
        if (event.type == "change") return addNewAllergy();

        //:Busca resposta do fetch de alergias
        const input = target.value.trim();
        this.findAllergy(input);

        return;
        //* * * * * * * * * * * * * * * * * * * *

        function addNewAllergy() {
            if (!event.target.value) return;
            const addValue = event.target.value.trim();
            const modMainNode = target.closest(".mod-main");
            const dataNode = $(modMainNode, ".data");

            //:Atualiza o conteúdo do módulo e gera HTML
            module.content = fnc.renderContent(dataNode, module.content, addValue);

            //:limpa datalist
            $(`#allergy`).innerHTML = "";

            //:Limpa input
            target.value = "";
        }
    },
};

export { obj, fnc };
