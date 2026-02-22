export const obj = {
    data: { user: {}, modules: [], optLock: null },
    currentModule: {},

    database: {
        get: async function () {
            const userId = ls.userId;

            //:fetch
            const resp = await $fetch({
                url: "userRecord/getData",
                par: { userId },
                fnName: "BUSCA DADOS WAU-0017",
            });

            //:Seta dados
            this.set(resp);
        },

        reorderModules() {
            //:Seleciona todos os módulos ativos
            const activeModuleNodes = $$("#modulesActives .list .module");

            //:Cria uma string separada por ";" com os IDs dos módulos ativos
            const activeModuleIds = Array.from(activeModuleNodes)
                .map((el) => el.dataset.id)
                .join(";");

            //:Se houve mudança nos dados, habilita o modo de salvar
            if ($dataChange(obj.data.user, "modulesOrder", activeModuleIds)) $saveMode.enable();
        },

        save: async function () {
            //:Data
            const optLock = obj.data.optLock;
            const userId = ls.userId;
            const data = { user: {}, module: [] };

            //:Keys de user alteradas
            data.user = $dataFetchRender(obj.data.user);
            if ($isEmpty(data.user)) delete data.user;

            //:Módulos alterados
            obj.data.modules.forEach((el) => {
                const element = $dataFetchRender(el);
                if (element) data.module.push(element);
            });
            if ($isEmpty(data.module)) delete data.module;

            if ($isEmpty(data)) return this.dom();

            //:Fetch
            const resp = await $fetch({
                url: "userRecord/saveData",
                par: { optLock, userId, data },
                fnName: "SALVA MODULO WAU-0035",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) return this.get();

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        resset() {
            //:Seta dados
            ls.set("userId", 0);
            ls.set("userName", "");
            obj.data.modules = [];

            //:Atualiza toda tela
            this.dom();
        },

        set(resp) {
            //:Erro ou vazio -> limpa dados
            if (resp.status !== 200 || $numberOnly(resp.user?.id) < 1) return this.resset();

            //:Seta dados
            ls.set("userId", resp.user.id);
            ls.set("userName", resp.user.name);
            obj.data.modules = resp.modules || [];
            obj.data.user = resp.user || {};
            obj.data.optLock = resp.user.optLock;

            //:Atualiza toda tela
            this.dom();
        },

        dom(saveMode = false) {
            menuTop.name();

            //:Desabilita/abilita saveMode
            $saveMode[saveMode ? "enable" : "disable"]();

            //:Ordena os módulos conforme o campo "modulesOrder"
            obj.data.modules = $sortArrayBySequence(obj.data.modules, obj.data.user.modulesOrder);

            //:Adiciona index em cada módulo
            let index = 0;
            obj.data.modules.forEach((module) => (module.index = index++));

            //:Cria todos os botões de módulos em "right"
            obj.right.showAllModulesBtns();

            //:Cria todos os módulos em "left"
            obj.left.showAllModules();
        },
    },

    left: {
        fatherList: $("#record .left"),
        rightBox: `
            <button class="btn {onOff} edit" title="Alterar módulo">
                <i class="fa-light fa-floppy-disk"></i>
                <span class="d-sm-inline text-light ms-2">Editar</span>
            </button>
            <button class="btn {onOff} delete" title="Deleta módulo">
                <i class="fa-light fa-trash-can"></i>
                <span class="d-sm-inline text-light ms-2">Deletar</span>
            </button>
            <button class="btn color-wau2 disable" title="Desativa módulo">
                <i class="fa-regular fa-eye"></i>
                <span class="d-sm-inline text-light ms-2">Ocultar</span>
            </button>
            <button class="btn color-wau2 showRight" title="Localiza módulo a direita">
                <i class="fa-regular fa-right-to-bracket fa-lg"></i>
            </button>`,

        showAllModules: async function () {
            $("#record .left").innerHTML = "";

            const modulesOrder = obj.data.user.modulesOrder.split(";") || [];
            for (const id of modulesOrder) {
                obj.currentModule = obj.data.modules.find((mod) => mod.id == id);

                if (!obj.currentModule) {
                    cl("MÓDULO NÃO ENCONTRADO:", id);
                    cl(obj.data.modules);
                } else {
                    await this.showOneModule();
                }
            }
        },

        showOneModule: async function () {
            if (obj.currentModule?.z_del) return;

            //:Nome do módulo
            const module = `edit_${obj.currentModule.type}`;

            //:Importa módulo
            if (!obj[module]) {
                const mod = await import(`${jsURL}record/modules/${module}.js?v=${g.refresh}`);
                obj[module] = mod.obj;
            }

            //:Habilita ou desabilita botões "Editar e Deletar" conforme "untrash"
            const untrash = +obj.currentModule.untrash;
            const onOff = untrash > 1 ? "btn-secondary disabledColor" : untrash === 1 ? "btn-secondary" : "color-wau2";
            const rightBoxHtml = this.rightBox.replaceAll("{onOff}", onOff);

            //:Renderiza módulo
            await obj[module](obj.currentModule, rightBoxHtml, this.fatherList, this.scrollTop);
        },

        //:Coloca módulo no topo com efeito
        scrollTop(moduleNode) {
            //:Coloca módulo no topo
            moduleNode.scrollIntoView({ behavior: "smooth" });

            //:Ajusta
            setTimeout(() => {
                //:Se estiver 80px abaixo do topo -> sai sem ajustar
                const topPosition = moduleNode.getBoundingClientRect().top + window.scrollY;
                if (topPosition > 80) return;

                $(".left.scrollbar").scrollBy({ top: -20, behavior: "smooth" });
            }, 1000);

            //:Efeito em background
            moduleNode.style.transition = "none";
            moduleNode.classList.add("show");
            setTimeout(() => {
                moduleNode.style.transition = "background-color .5s linear";
                moduleNode.classList.remove("show");
            }, 400);
        },

        //:Eventos
        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    //:Editar módulo
                    if (target.closest(".btn.edit")) return btnEditDelete("edit");
                    //:Deleta módulo
                    if (target.closest(".btn.delete")) return btnEditDelete("delete");
                    //:Desativa módulo
                    if (target.closest(".btn.disable")) return btnDisable();
                    //:Localiza módulo a direita
                    if (target.closest(".btn.showRight")) return showModuleAtRight();
                    return;

                default:
                    //:Target inativo
                    if ($check.ch1(target)) return;
                    //:Valida tecla precionada
                    if ($check.ch2(event)) return;
                    //:Alteração em Input|Textarea
                    if ($check.ch3(event)) return inputChange();
                    return;
            }

            function btnEditDelete(action) {
                const node = target.closest(".mod-main");
                const index = node.dataset.index;
                obj.modals.isNew = false;

                //:Seta modal ativo
                obj.currentModule = obj.data.modules[index];

                //:Se for um módulo modelo -> não permite edição e abre modal de aviso
                if (+obj.currentModule.untrash > 0) return obj.modals.modalModuleUntrash.show(action);

                //:Abre modal
                const type = obj.helper.makeFirstWordUp(obj.currentModule.type);
                $modalOpen(`#module${type}`);
            }

            function btnDisable() {
                const id = target.closest(".mod-main").id.replace("id", "");

                obj.helper.modulesOrderChangeData(id, false);
                obj.database.dom(true);
            }

            function showModuleAtRight() {
                const father = target.closest(".mod-main");
                const index = father.dataset.index;

                //:Seta modal correspondente a direita
                const moduleNode = $d("#modulesActives", "index", index);

                //:Efeito em background
                moduleNode.style.transition = "none";
                moduleNode.classList.add("show");
                setTimeout(() => {
                    moduleNode.style.transition = "background-color .5s linear";
                    moduleNode.classList.remove("show");
                }, 400);
            }

            function inputChange() {
                $inputChange(target, target.value, event.type);

                //:Executa eventos individualmente por módulo
                const father = target.closest(".mod-main");
                const type = father.dataset.type;
                const fnClone = { smoking };

                if (fnClone[type]) fnClone[type]();
                return;

                function smoking() {
                    const time = $n(father, "time").value;
                    const day = $n(father, "day").value;
                    const result = (day / 20) * time;

                    $inputChange($n(father, "result"), result, "change");
                }
            }
        },
    },

    right: {
        showAllModulesBtns() {
            let tptActives = "";
            let tptInactives = "";

            const modulesOrder = obj.data.user.modulesOrder.split(";") || [];

            obj.data.modules.forEach(({ id, index, title, untrash, z_del }) => {
                const dd = +untrash > 0 ? "disabled" : "";
                const ut = +untrash > 0 ? "-slash" : "";
                const y = { id, index, title, untrash, ut, dd, z_del };

                if (modulesOrder.includes(id)) {
                    y.checked = "checked";
                    y.checkedTxt = "Ativo";
                    y.ms = "3";
                    tptActives += templateFactory(y);
                } else {
                    y.checked = "";
                    y.checkedTxt = "Inativo";
                    y.ms = "1";
                    tptInactives += templateFactory(y);
                }
            });

            function templateFactory(y) {
                if (y.z_del) return "";

                return `
                    <div class="module shadow-sm" data-id="${y.id}" data-index="${y.index}"  data-untrash="${y.untrash}">
                        <i class="fa-light fa-circle-sort fa-xl me-3"></i>
                        ${y.title}
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" ${y.checked}>
                            <label class="form-check-label me-${y.ms}">${y.checkedTxt}</label>
                        </div>
                        <button class="btn color-wau1 delete" ${y.dd}>
                            <i class="fa-light fa-trash-can${y.ut} fa-lg"></i>
                        </button>
                    </div>`;
            }

            $("#modulesActives .list").innerHTML = tptActives;
            $("#modulesInactives .list").innerHTML = tptInactives;
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "change":
                    //:Alterar módulo ativo/inativo
                    if (target.type === "checkbox") return changeModuleActiveInactive();
                    return;

                case "click":
                    //:Deletar módulo
                    if (target.closest("button.delete")) return deleteModule();
                    //:Abre modal com as opções para criar novo módulo
                    if (target.closest("button.moduleCreate")) return newModule();
                    //:Coloca módulo a esquerda em evidência
                    if (target.closest("#modulesActives .list .module")) return showModuleAtLeft();
                    return;

                default:
                    return;
            }

            function newModule() {
                if ($saveMode.active)
                    return $toast("Salve ou cancele as alterações antes de criar um novo módulo.", "warning");

                $modalOpen("#moduleCreate");
            }

            function deleteModule() {
                obj.helper.setCurrentModuleByTarget(target);
                obj.helper.modulesOrderChangeData(obj.currentModule.id, false);

                obj.currentModule.z_del = 1;

                obj.database.dom(true);
            }

            function changeModuleActiveInactive() {
                const id = obj.helper.getIdFromTargetModules(target);

                if (obj.helper.checkIfModuleIsActive(id)) {
                    obj.helper.modulesOrderChangeData(id, false);
                } else {
                    obj.helper.modulesOrderChangeData(id, true);
                }

                obj.database.dom(true);
            }

            function showModuleAtLeft() {
                obj.helper.setCurrentModuleByTarget(target);

                obj.left.showOneModule();
            }
        },
    },

    modals: {
        btnOut: `
            <i class="fa-regular fa-circle-xmark fa-lg me-2"></i>
            Sair sem atualizar
        `,
        btnOutNew: `
            <i class="fa-regular fa-circle-xmark fa-lg me-2"></i>
            Sair sem adicionar
        `,
        btnSave: `
            <i class="fa-regular fa-floppy-disk fa-lg me-2"></i>
            Atualizar módulo
        `,
        btnSaveNew: `
            <i class="fa-regular fa-floppy-disk fa-lg me-2"></i>
            Adicionar novo módulo
        `,
        isNew: true,

        //:Modal para a escolha do novo módulo a ser criado
        moduleCreate: {
            show() {
                cl("ABRIU MODAL DE CRIAÇÃO DE MÓDULO");
            },

            events(event) {
                const target = event.target;

                switch (event.type) {
                    case "show.bs.modal":
                        return this.show();

                    case "click":
                        if (target.closest(".textarea")) return createNewTextarea();
                        if (target.closest(".radio")) return createNewRadio();
                        if (target.closest(".check")) return createNewCheck();
                        return;

                    default:
                        return;
                }

                function createNewTextarea() {
                    obj.modals.isNew = true;
                    $modalClose("#moduleCreate");
                    $modalOpen("#moduleTextarea");
                }

                function createNewRadio() {
                    obj.modals.isNew = true;
                    $modalClose("#moduleCreate");
                    $modalOpen("#moduleRadio");
                }

                function createNewCheck() {
                    obj.modals.isNew = true;
                    $modalClose("#moduleCreate");
                    $modalOpen("#moduleCheck");
                }
            },
        },

        //:Modal para novo/alterar módulos do tipo "textarea"
        modalTextarea: {
            quill: false,

            show() {
                const isNew = obj.modals.isNew;
                const moduleData = obj.currentModule;

                //:Adiciona template ao container do Quill
                const quillContainer = $("#moduleTextarea .quillBox");
                const textareaTemplate = $m.tpt.textarea;
                const templateHtml = textareaTemplate
                    .replace("{title}", isNew ? "O título digitado acima aparecerá aqui." : moduleData.title)
                    .replace("{comment}", moduleData.comment ? `(${moduleData.comment})` : "")
                    .replace("{rightBox}", "");
                quillContainer.innerHTML = ""; //:Limpa conteúdo anterior do Quill
                quillContainer.insertAdjacentHTML("beforeend", templateHtml);

                //:Inicializa o editor Quill
                obj.modals.modalTextarea.quill = new Quill("#moduleTextarea .quillText", {
                    theme: "snow",
                });

                //:Define valor do input de título
                const titleInput = $("#moduleTextarea .titleName");
                titleInput.value = isNew ? "" : moduleData.title;

                //:Define valor do input de comentário
                const commentInput = $n("#moduleTextarea, comment");
                commentInput.value = isNew ? "" : moduleData.comment;

                //:Define valor do select de altura
                const heightSelect = $("#moduleTextarea .form-select.height");
                heightSelect.value = isNew ? "2" : moduleData.height;

                //:Atualiza altura do módulo
                const moduleMainBox = $("#moduleTextarea .mod-main");
                moduleMainBox.dataset.height = isNew ? "2" : moduleData.height;

                //:Define o conteúdo do editor Quill
                this.quill.root.innerHTML = isNew ? "" : moduleData.content;

                //:Atualiza o texto do botão de sair
                const exitButton = $("#moduleTextarea .btn.exit");
                exitButton.innerHTML = isNew ? obj.modals.btnOutNew : obj.modals.btnOut;

                //:Atualiza o texto do botão de salvar
                const saveButton = $("#moduleTextarea .btn.save");
                saveButton.innerHTML = isNew ? obj.modals.btnSaveNew : obj.modals.btnSave;
            },

            save() {
                $modalClose("#moduleTextarea");

                const title = $("#moduleTextarea .title-main h6").textContent.trim();
                const comment = $n("#moduleTextarea, comment").value.trim();
                const content = obj.modals.modalTextarea.quill.root.innerHTML.trim();
                const heightNode = $("#moduleTextarea .form-select.height");
                const height = heightNode.options[heightNode.selectedIndex].value;

                //:Atualiza módulo
                $dataChange(obj.currentModule, "title", title);
                $dataChange(obj.currentModule, "comment", comment);
                $dataChange(obj.currentModule, "content", content);
                $dataChange(obj.currentModule, "height", height);

                $saveMode.enable();

                //:Atualiza tela
                obj.left.showOneModule();
                obj.right.showAllModulesBtns();
            },

            events(event) {
                const target = event.target;

                //:Quando abrir o modal
                if (event.type === "show.bs.modal") return this.show();

                //:Titulo do módulo
                if (target.closest(".titleName")) {
                    const title = $("#moduleTextarea h6");
                    title.textContent =
                        target.value.replace(/[^\p{L}\p{N}\s]/gu, "") || "O título digitado acima aparecerá aqui.";
                    return;
                }

                //:Tamanho do módulo
                if (target.closest(".height") && event.type === "change") {
                    const heightNode = target.closest(".form-select.height");
                    const height = heightNode.options[heightNode.selectedIndex].value;

                    const boxHeight = $("#moduleTextarea .mod-main");
                    boxHeight.dataset.height = height;
                    return;
                }

                //:Modelo pronto para Quill
                if (target.closest(".quillModel") && event.type === "change") {
                    const option = target.closest(".quillModel").options[target.selectedIndex].value;
                    obj.modals.modalTextarea.quill.root.innerHTML = $m.tpt.quillModel[option];
                    return;
                }

                //:Comentário do módulo
                if (target.closest(".comment")) {
                    const comment = $("#moduleTextarea .title-main span");
                    comment.textContent = target.value.replace(/[^\p{L}\p{N}\s]/gu, "") || "";
                    return;
                }

                //:Botão de salvar
                if (target.closest(".save") && event.type === "click") return this.save();
            },
        },

        //:Modal para novo/alterar módulos do tipo "radio"
        modalRadio: {
            show() {
                const isNew = obj.modals.isNew;
                const moduleData = obj.currentModule;

                //:Define o input do título
                const titleInput = $n("#moduleRadio, title");
                titleInput.value = isNew ? "" : moduleData.title;

                //:Define valor do input de comentário
                const commentInput = $n("#moduleRadio, comment");
                commentInput.value = isNew ? "" : moduleData.comment;

                //:Define a lista de seletores
                $("#moduleRadio .radio-items").innerHTML = ""; //:Limpa a lista anterior
                const selectorList = isNew ? ["", ""] : (moduleData.content?.split(";") ?? ["", ""]);
                selectorList.forEach((selectorValue) => this.addRadio(selectorValue));

                //:Atualiza a lista de botões deletar
                this.refreshBtnDeleteList();

                //:Define o botão de sair
                const exitButton = $("#moduleRadio .btn.exit");
                exitButton.innerHTML = isNew ? obj.modals.btnOutNew : obj.modals.btnOut;

                //:Define o botão de salvar
                const saveButton = $("#moduleRadio .btn.save");
                saveButton.innerHTML = isNew ? obj.modals.btnSaveNew : obj.modals.btnSave;
            },

            refreshBtnDeleteList() {
                const list = $$("#moduleRadio .radio-items .btn.delete");
                const action = list.length > 2 ? false : true;

                //:Habilita/desabilita botões de deletar
                list.forEach((btn) => (btn.disabled = action));

                //:Mostra/oculta mensagem de minimo de 2 seletores
                const msg = $("#moduleRadio .msg");
                msg.style.display = action ? "block" : "none";
            },

            addRadio(value = "") {
                const tpt = `
                    <div class="input-group">
                        <input class="form-control" value="${value}" mask="string" placeholder="digite um seletor" />
                        <button class="btn btn-danger ms-2 delete">
                            <i class="fa-light fa-trash-can fa-lg"></i>
                        </button>
                    </div>`;

                $("#moduleRadio .radio-items").insertAdjacentHTML("beforeend", tpt);

                this.refreshBtnDeleteList();
            },

            deleteRadio(target) {
                target.closest(".input-group").remove();

                this.refreshBtnDeleteList();
            },

            save() {
                const listNode = $$("#moduleRadio .radio-items input");
                const listArray = Array.from(listNode);

                //:Pega valores dos inputs
                let contentList = listArray.map((input) => input.value.trim());
                contentList = contentList.filter((i) => i);
                if (contentList.length < 2) return $toast("Digite ao menos dois seletores.", "warning");
                const content = contentList.join(";");

                $modalClose("#moduleRadio");

                const title = $n("#moduleRadio, title").value.trim();
                const comment = $n("#moduleRadio, comment").value.trim();

                const isNew = obj.modals.isNew;
                if (isNew) {
                    //:Cria novo módulo
                    obj.data.modules.push({
                        id: "new",
                        type: "radio",
                        title: title,
                        comment: comment,
                        content: content,
                        required: 0,
                        untrash: 0,
                    });

                    obj.database.save();
                    return;
                }

                //:Atualiza módulo
                $dataChange(obj.currentModule, "title", title);
                $dataChange(obj.currentModule, "comment", comment);
                $dataChange(obj.currentModule, "content", content);
                $dataChange(obj.currentModule, "height", 0);

                obj.database.dom(true);
            },

            events(event) {
                const target = event.target;

                switch (event.type) {
                    case "show.bs.modal":
                        return this.show();

                    case "change":
                        if (target.closest("input")) return inputChange(target);

                    case "click":
                        if (target.closest(".add")) return this.addRadio();
                        if (target.closest(".delete")) return this.deleteRadio(target);
                        if (target.closest(".save")) return this.save();
                        return;

                    default:
                        return;
                }

                function inputChange() {
                    //:Substitui ponto e virgula por vírgula
                    const inputNode = target.closest("input");
                    inputNode.value = inputNode.value.replace(/;/g, ",");
                }
            },
        },

        //:Modal para novo/alterar módulos do tipo "check"
        modalCheck: {
            show() {
                const isNew = obj.modals.isNew;
                const moduleData = obj.currentModule;

                //:Define o input do título
                const titleInput = $n("#moduleCheck, title");
                titleInput.value = isNew ? "" : moduleData.title;

                //:Define valor do input de comentário
                const commentInput = $n("#moduleCheck, comment");
                commentInput.value = isNew ? "" : moduleData.comment;

                //:Define a lista de seletores
                $("#moduleCheck .check-items").innerHTML = ""; //:Limpa a lista anterior
                const selectorsList = isNew ? ["", ""] : (moduleData.content?.split(";") ?? ["", ""]);
                selectorsList.forEach((selector) => this.addCheck(selector));

                //:Atualiza a lista de botões de deletar
                this.refreshBtnDeleteList();

                //:Define o botão de sair
                const exitButton = $("#moduleCheck .btn.exit");
                exitButton.innerHTML = isNew ? obj.modals.btnOutNew : obj.modals.btnOut;

                //:Define o botão de salvar
                const saveButton = $("#moduleCheck .btn.save");
                saveButton.innerHTML = isNew ? obj.modals.btnSaveNew : obj.modals.btnSave;
            },

            refreshBtnDeleteList() {
                const list = $$("#moduleCheck .check-items .btn.delete");
                const action = list.length > 2 ? false : true;

                //:Habilita/desabilita botões de deletar
                list.forEach((btn) => (btn.disabled = action));

                //:Mostra/oculta mensagem de minimo de 2 seletores
                const msg = $("#moduleCheck .msg");
                msg.style.display = action ? "block" : "none";
            },

            addCheck(value = "") {
                const tpt = `
                    <div class="input-group">
                        <input class="form-control" value="${value}" mask="string" placeholder="digite um seletor" />
                        <button class="btn btn-danger ms-2 delete">
                            <i class="fa-light fa-trash-can fa-lg"></i>
                        </button>
                    </div>`;

                $("#moduleCheck .check-items").insertAdjacentHTML("beforeend", tpt);

                this.refreshBtnDeleteList();
            },

            deleteCheck(target) {
                target.closest(".input-group").remove();

                this.refreshBtnDeleteList();
            },

            save() {
                const listNode = $$("#moduleCheck .check-items input");
                const listArray = Array.from(listNode);

                //:Pega valores dos inputs
                let contentList = listArray.map((input) => input.value.trim());
                contentList = contentList.filter((i) => i);
                if (contentList.length < 2) return $toast("Digite ao menos dois seletores.", "warning");
                const content = contentList.join(";");

                $modalClose("#moduleCheck");

                const title = $n("#moduleCheck, title").value.trim();
                const comment = $n("#moduleCheck, comment").value.trim();

                const isNew = obj.modals.isNew;
                if (isNew) {
                    //:Cria novo módulo
                    obj.data.modules.push({
                        id: "new",
                        type: "check",
                        title: title,
                        comment: comment,
                        content: content,
                        required: 0,
                        untrash: 0,
                    });

                    obj.database.save();
                    return;
                }

                //:Atualiza módulo
                $dataChange(obj.currentModule, "title", title);
                $dataChange(obj.currentModule, "comment", comment);
                $dataChange(obj.currentModule, "content", content);
                $dataChange(obj.currentModule, "height", 0);

                obj.database.dom(true);
            },

            events(event) {
                const target = event.target;

                switch (event.type) {
                    case "show.bs.modal":
                        return this.show();

                    case "change":
                        if (target.closest("input")) return inputChange(target);

                    case "click":
                        if (target.closest(".add")) return this.addCheck();
                        if (target.closest(".delete")) return this.deleteCheck(target);
                        if (target.closest(".save")) return this.save();
                        return;

                    default:
                        return;
                }

                function inputChange() {
                    //:Substitui ponto e virgula por vírgula
                    const inputNode = target.closest("input");
                    inputNode.value = inputNode.value.replace(/;/g, ",");
                }
            },
        },

        //:Modal para novo/alterar módulos do tipo "numberlist"
        modalNumberlist: {
            itemSelected: null,

            show() {
                const isNew = obj.modals.isNew;
                const currentModuleData = obj.currentModule;

                //:Define o valor do input do título
                const titleInputNode = $n("#moduleNumberlist, title");
                titleInputNode.value = isNew ? "" : currentModuleData.title;

                //:Define valor do input de comentário
                const commentInput = $n("#moduleNumberlist, comment");
                commentInput.value = isNew ? "" : currentModuleData.comment;

                //:Define a pré-visualização da lista de seletores
                const previewHtml = `<div class="title">Pré-visualização das medidas:</div>`;
                $("#moduleNumberlist .numberlist-items").innerHTML = previewHtml;
                const selectorList = isNew ? ["", ""] : currentModuleData.content?.split("&") || ["", ""];
                selectorList.forEach((selectorValue, selectorIndex) => this.addTemplate(selectorValue, selectorIndex));

                //:Atualiza a lista de botões de ação (deletar)
                this.refreshActionBtns();

                //:Define o texto do botão "sair"
                const exitButton = $("#moduleNumberlist .btn.exit");
                exitButton.innerHTML = isNew ? obj.modals.btnOutNew : obj.modals.btnOut;

                //:Define o texto do botão "salvar"
                const saveButton = $("#moduleNumberlist .btn.save");
                saveButton.innerHTML = isNew ? obj.modals.btnSaveNew : obj.modals.btnSave;
            },

            refreshActionBtns() {
                //:Valida inputs
                const input = $("#moduleNumberlist .input-box");
                const name = input.querySelector(".name input").value ? true : false;
                const decimal = input.querySelector(".decimal select").value ? true : false;

                //:Pega botões
                const node = $("#moduleNumberlist .action-box");
                const addBtn = node.querySelector("button.add");
                const changeBtn = node.querySelector("button.change");
                const deleteBtn = node.querySelector("button.delete");

                //:Desabilita todos os botões
                [addBtn, changeBtn, deleteBtn].forEach((btn) => (btn.disabled = true));

                //:Habilita botões conforme condições
                if (name && decimal) addBtn.disabled = false;
                if (name && decimal && this.itemSelected) changeBtn.disabled = false;
                if (this.itemSelected) deleteBtn.disabled = false;
            },

            addTemplate(data, index) {
                if (!data) return cl("Sem dados para adicionar item na lista.");

                const list = data.split(";");
                const name = list[0] || "";
                const decimal = list[1] || "";
                const prefix = list[2] || "";

                const tpt = `
                    <div class="col-4 mt-2 item" data-index="${index}">
                        <div class="input-group">
                            <span class="input-group-text name">${name}</span>
                            <input class="form-control decimal" data-decimal="${decimal}" mask="number" mask-type="${decimal}">
                            <span class="input-group-text prefix">${prefix}</span>
                        </div>
                    </div>`;

                $("#moduleNumberlist .numberlist-items").insertAdjacentHTML("beforeend", tpt);
            },

            addItem() {
                const input = $("#moduleNumberlist .input-box");
                const name = input.querySelector(".name input").value;
                const decimal = input.querySelector(".decimal select").value;
                const prefix = input.querySelector(".prefix input").value;

                const index = $$("#moduleNumberlist .numberlist-items .item").length;
                const data = `${name};${decimal};${prefix}`;

                this.addTemplate(data, index);

                this.refreshActionBtns();
            },

            changeItem() {
                const input = $("#moduleNumberlist .input-box");
                const name = input.querySelector(".name input").value;
                const decimal = input.querySelector(".decimal select").value;
                const prefix = input.querySelector(".prefix input").value;

                this.itemSelected.querySelector(".name").textContent = name;
                this.itemSelected.querySelector(".decimal").dataset.decimal = decimal;
                this.itemSelected.querySelector(".prefix").textContent = prefix;

                this.refreshActionBtns();
            },

            cleanItem() {
                const input = $("#moduleNumberlist .input-box");
                input.querySelector(".name input").value = "";
                input.querySelector(".decimal select").value = 0;
                input.querySelector(".prefix input").value = "";

                this.refreshActionBtns();
            },

            removeItem() {
                this.itemSelected.remove();
                this.itemSelected = null;

                this.refreshActionBtns();
            },

            selectItem(target, removeOnly = false) {
                //:Remove seleção anterior
                if (this.itemSelected) this.itemSelected.querySelector(".input-group").classList.remove("selected");
                if (removeOnly) return;

                //:Adiciona nova seleção
                const item = target.closest(".item");
                item.querySelector(".input-group").classList.add("selected");
                this.itemSelected = item;

                //:Pega dados do item selecionado
                const name = item.querySelector(".name").textContent;
                const decimal = item.querySelector(".decimal").dataset.decimal;
                const prefix = item.querySelector(".prefix").textContent;

                //:Coloca dados nos inputs de alteração
                const input = $("#moduleNumberlist .input-box");
                input.querySelector(".name input").value = name;
                input.querySelector(".decimal select").value = decimal;
                input.querySelector(".prefix input").value = prefix;

                this.refreshActionBtns();
            },

            save() {
                //:Gera conteúdo do módulo
                let content = "";
                const listNode = $$("#moduleNumberlist .numberlist-items .item");
                listNode.forEach((node, index) => {
                    const name = node.querySelector(".name").textContent;
                    const decimal = node.querySelector(".decimal").dataset.decimal;
                    const prefix = node.querySelector(".prefix").textContent;

                    content += `${name};${decimal};${prefix}${index < listNode.length - 1 ? "&" : ""}`;
                });

                $modalClose("#moduleNumberlist");

                //:Atualiza módulo
                const title = $n("#moduleNumberlist, title").value.trim();
                const comment = $n("#moduleNumberlist, comment").value.trim();
                $dataChange(obj.currentModule, "title", title);
                $dataChange(obj.currentModule, "comment", comment);
                $dataChange(obj.currentModule, "content", content);

                obj.database.dom(true);
            },

            events(event) {
                const target = event.target;

                switch (event.type) {
                    case "show.bs.modal":
                        return this.show();

                    case "change":
                        if (target.closest("input")) return inputChange(target);

                    case "click":
                        if (target.closest(".numberlist-items .item")) return this.selectItem(target);
                        if (target.closest(".add")) return this.addItem();
                        if (target.closest(".change")) return this.changeItem();
                        if (target.closest(".clean")) return this.cleanItem();
                        if (target.closest(".delete")) return this.removeItem(target);
                        if (target.closest(".save")) return this.save();
                        return;

                    case "keyup":
                        if (target.closest(".input-box input")) return this.refreshActionBtns();
                        if (target.closest(".input-box select")) return this.refreshActionBtns();
                        return;

                    default:
                        return;
                }

                function inputChange() {
                    //:Substitui ponto e virgula por vírgula
                    const inputNode = target.closest("input");
                    inputNode.value = inputNode.value.replace(/;/g, ",");
                }
            },
        },

        //:Modal para novo/alterar módulos do tipo "numberlist"
        modalSmoking: {
            show() {
                const isNew = obj.modals.isNew;
                const currentModuleData = obj.currentModule;

                //:Define o input do título
                const titleInput = $n("#moduleSmoking, title");
                titleInput.value = isNew ? "" : currentModuleData.title;

                //:Define o botão de sair
                const exitButton = $("#moduleSmoking .btn.exit");
                exitButton.innerHTML = isNew ? obj.modals.btnOutNew : obj.modals.btnOut;

                //:Define o botão de salvar
                const saveButton = $("#moduleSmoking .btn.save");
                saveButton.innerHTML = isNew ? obj.modals.btnSaveNew : obj.modals.btnSave;
            },

            refreshActionBtns() {
                //:Valida inputs
                const input = $("#moduleNumberlist .input-box");
                const name = input.querySelector(".name input").value ? true : false;
                const decimal = input.querySelector(".decimal select").value ? true : false;

                //:Pega botões
                const node = $("#moduleNumberlist .action-box");
                const addBtn = node.querySelector("button.add");
                const changeBtn = node.querySelector("button.change");
                const deleteBtn = node.querySelector("button.delete");

                //:Desabilita todos os botões
                [addBtn, changeBtn, deleteBtn].forEach((btn) => (btn.disabled = true));

                //:Habilita botões conforme condições
                if (name && decimal) addBtn.disabled = false;
                if (name && decimal && this.itemSelected) changeBtn.disabled = false;
                if (this.itemSelected) deleteBtn.disabled = false;
            },

            save() {
                const listNode = $$("#moduleNumberlist .numberlist-items .item");
                let content = "";

                listNode.forEach((node, index) => {
                    const name = node.querySelector(".name").textContent;
                    const decimal = node.querySelector(".decimal").dataset.decimal;
                    const prefix = node.querySelector(".prefix").textContent;

                    content += `${name};${decimal};${prefix}${index < listNode.length - 1 ? "&" : ""}`;
                });

                $modalClose("#moduleNumberlist");

                $dataChange(obj.currentModule, "content", content);

                obj.database.dom(true);
            },

            events(event) {
                const target = event.target;

                switch (event.type) {
                    case "show.bs.modal":
                        return this.show();

                    case "change":
                        if (target.closest("input")) return inputChange(target);

                    case "click":
                        if (target.closest(".numberlist-items .item")) return this.selectItem(target);
                        if (target.closest(".add")) return this.addItem();
                        if (target.closest(".change")) return this.changeItem();
                        if (target.closest(".clean")) return this.cleanItem();
                        if (target.closest(".delete")) return this.removeItem(target);
                        if (target.closest(".save")) return this.save();
                        return;

                    case "keyup":
                        if (target.closest(".input-box input")) return this.refreshActionBtns();
                        if (target.closest(".input-box select")) return this.refreshActionBtns();
                        return;

                    default:
                        return;
                }

                function inputChange() {
                    //:Substitui ponto e virgula por vírgula
                    const inputNode = target.closest("input");
                    inputNode.value = inputNode.value.replace(/;/g, ",");
                }
            },
        },

        //:Modal de aviso ao tentar editar módulo modelo
        modalModuleUntrash: {
            show(option) {
                const msgNode = $("#modalModuleUntrash .msg-1");
                const msgOption = option === "edit" ? "editar" : "deletar";
                const msgText = `Você está tentando ${msgOption} um <b>MÓDULO MODELO</b> e isso não é possivel!`;
                msgNode.innerHTML = msgText;

                $modalOpen("#modalModuleUntrash");
            },

            events(event) {
                const target = event.target;

                switch (event.type) {
                    case "click":
                        if (target.closest(".btn.copy")) return copy();
                        if (target.closest(".btn.exit")) return exit();
                        return;

                    default:
                        return;
                }

                function copy() {
                    //:Se o módulo não for modelo, não faz nada
                    if (+obj.currentModule.untrash >= 3) return;
                    console.log("+obj.currentModule.untrash: ", +obj.currentModule.untrash);
                    return;

                    //:Cria cópia do módulo e edita valores
                    const copy = { ...obj.currentModule };
                    copy.id = "new";
                    copy.id_user = cookie.get("log_userId");
                    copy.title = "Módulo copiado";
                    copy.comment = "";
                    copy.required = 2;
                    copy.untrash = 0;

                    //:Adiciona cópia ao banco de dados
                    obj.data.modules.push(copy);
                    obj.database.save();
                }

                function exit() {
                    $modalClose("#modalModuleUntrash");
                }
            },
        },
    },

    headerBar(event) {
        //:Clicou em botão de criar módulo -> redireciona para eventos no "right" e abre modal
        if (event.target.closest(".btn.moduleCreate")) return obj.right.events(event);
    },

    helper: {
        checkIfModuleIsActive(id) {
            const modulesOrder = obj.data.user.modulesOrder.split(";") || [];
            return modulesOrder.includes(id);
        },

        getIdFromTargetModules(target) {
            const moduleNode = target.closest(".module");
            return moduleNode.dataset.id;
        },

        modulesOrderChangeData(id, add) {
            const modulesOrder = obj.data.user.modulesOrder.split(";") || [];

            if (add) {
                //:Adiciona id ao final
                modulesOrder.push(id);
            } else {
                //:Remove id
                const index = modulesOrder.indexOf(id);
                if (index > -1) modulesOrder.splice(index, 1);
            }

            $dataChange(obj.data.user, "modulesOrder", modulesOrder.join(";"));
        },

        setCurrentModuleByTarget(target) {
            const moduleNode = target.closest(".module");
            obj.currentModule = obj.data.modules[moduleNode.dataset.index];
            return obj.currentModule;
        },

        makeFirstWordUp(text) {
            return text.charAt(0).toUpperCase() + text.slice(1);
        },
    },

    events(event) {
        const target = event.target;

        //:Eventos da esquerda
        if (target.closest(".left")) return obj.left.events(event);

        //:Eventos da direita
        if (target.closest(".right")) return obj.right.events(event);

        //:Eventos em modal "moduleCreate"
        if (target.closest("#moduleCreate")) return obj.modals.moduleCreate.events(event);

        //:Eventos em modal "moduleTextarea"
        if (target.closest("#moduleTextarea")) return obj.modals.modalTextarea.events(event);

        //:Eventos em modal "moduleRadio"
        if (target.closest("#moduleRadio")) return obj.modals.modalRadio.events(event);

        //:Eventos em modal "moduleCheck"
        if (target.closest("#moduleCheck")) return obj.modals.modalCheck.events(event);

        //:Eventos em modal "moduleNumberlist"
        if (target.closest("#moduleNumberlist")) return obj.modals.modalNumberlist.events(event);

        //:Eventos em modal "smoking"
        if (target.closest("#moduleSmoking")) return obj.modals.modalSmoking.events(event);

        //:Eventos em modal "moduleUntrash"
        if (target.closest("#modalModuleUntrash")) return obj.modals.modalModuleUntrash.events(event);

        //:Eventos na barra de cabeçalho
        if (target.closest(".headerBar .menu") && event.type === "click") return obj.headerBar(target);
    },

    init() {
        //:Inicializa savemode
        $saveMode.init(`.navbar, #menuTop .right`);

        //:Destaque em botões de menu
        $destackButtons("#record .btn.moduleCreate");

        //:Cria Sortable para o lado direito (módulos ativos)
        new Sortable($("#modulesActives .list"), {
            animation: 150,
            ghostClass: "blue-background-class",

            onUpdate: async function (event) {
                obj.database.reorderModules();
                obj.database.dom(true);
            },
        });

        //:Cria Sortable para o modal de número lista
        new Sortable($("#moduleNumberlist .numberlist-items"), {
            animation: 150,
            ghostClass: "blue-background-class",

            onUpdate: async function (event) {},
        });
    },
};
