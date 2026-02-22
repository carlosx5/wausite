export const obj = {
    pdfPreviewActive: false,
    data: { patient: {}, record: {}, modules: [] },
    dataChanged: [],
    lastModuleClicked: null,
    currentModule: {},

    database: {
        get: async function () {
            const recordId = ls.recordId;
            if (!+recordId) return this.resset();

            const resp = await $fetch({
                url: "recordRegister/getData",
                par: { recordId },
                fnName: "BUSCA DADOS WAU-0067",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            if (!$permission(143)) return;

            //:Data
            const data = { record: {}, modules: [] };

            //:Se dados do prontuário foram alterados
            if (obj.data.record.save) {
                data.record = obj.data.record;
            }

            //:Checa quais módulos foram alterados
            obj.dataChanged.forEach((moduleId) => {
                const id = moduleId.replace("id", "");
                const module = obj.data.modules.find((module) => module.id === id);
                const isNew = module.id.includes("new");

                data.modules.push(moduleSavingPrepare(module, isNew));
            });

            //:Fetch
            const recordId = ls.recordId;
            const resp = await $fetch({
                url: "recordRegister/setData",
                par: { recordId, data },
                fnName: "SALVA PRONTUARIO WAU-0069",
            });

            //:Erro ao salvar
            if (resp.status !== 200) {
                $toast("Ocorreu um erro ao salvar!", "danger");
                return this.get();
            }

            //:Sucesso ao salvar
            $toast("Alterações salvas com sucesso!");
            this.set(resp);
            return;

            //:Prepara dados do módulo para salvar
            function moduleSavingPrepare(module, isNew) {
                const { id, id_file_type, title, content } = module;

                if (isNew) {
                    return {
                        id: "new",
                        id_record: ls.recordId,
                        id_file_type,
                        title,
                        content,
                    };
                }

                return { id, title, content };
            }
        },

        delete: async function () {
            //:Fetch
            const resp = await $fetch({
                url: "recordRegister/deleteRecord",
                par: { recordId: ls.recordId },
                fnName: "DELETA PRONTUARIO WAU-0070",
            });

            if (resp.status !== 200) return;

            //:Redireciona para pagina de origem
            const sourcePage = ls.sourcePage;
            if (sourcePage === "serviceList") {
                //:Se origem for lista de atendimentos
                ls.set("menuTop", "list", "service");
                return (window.location.href = `${baseURL}relatorio-atendimentos`);
            } else {
                //:Se origem for qualque outra, direciona para lista de prontuários
                ls.set("menuTop", "list", "record");
                return (window.location.href = `${baseURL}prontuarios`);
            }
        },

        finalizeRecord: async function () {
            const recordId = ls.recordId;

            //:Gera e salva conteúdo do PDF
            const pdfContent = await obj.createPdfContent(recordId);
            ///
            const pdfResp = await $fetch({
                url: "recordRegister/setPdf",
                par: { recordId, pdfContent },
                fnName: "SALVA PDF #712",
            });
            ///
            if (pdfResp.status !== 200) return;

            //:Fecha prontuário
            await $fetch({
                url: "recordRegister/finalizeRecord",
                par: { recordId },
                fnName: "FECHA PRONTUARIO #707",
            });

            //:Renderiza no modulo "list"
            moduleRender("list");
        },

        change(moduleId) {
            if (!obj.dataChanged.includes(moduleId)) obj.dataChanged.push(moduleId);

            $saveMode.enable();
        },

        resset() {
            cookie.del("pendingRecord");
            ls.set("recordId", 0);
            ls.set("menuTop", "list");
            location.reload();
            return "stop"; //:Envia sinal para parar a execução vinda de "recordMain.js"
        },

        set(resp) {
            if (!resp.record) return this.resset();

            //:Seta dados
            $patientId(resp.patient.id);
            ls.set("recordId", resp.record?.id || "new");
            ls.set("patientName", resp.patient.name);

            obj.data = resp;
            obj.dataChanged = [];

            this.moduleDataCertification();

            //:Atualiza toda tela
            obj.dom.all();
        },

        //:Cria módulos que não existem
        moduleDataCertification() {
            obj.data.modulesType.forEach((moduleType) => {
                const module = obj.data.modules.find((m) => m.id_file_type == moduleType.id);
                if (!module) {
                    obj.data.modules.push({
                        id: `new${moduleType.id}`,
                        id_record: ls.recordId,
                        id_file_type: moduleType.id,
                        content: moduleType.content || "",
                        type: moduleType.type,
                        title: moduleType.title,
                        required: moduleType.required,
                    });
                }
            });
        },
    },

    left: {
        editModules: {
            fatherList: $("#register .left .edit"),
            rightBox: `
                <button class="btn text-danger delete">
                    <i class="fa-regular fa-eye-low-vision"></i>
                </button>`,

            showAllModules: async function () {
                const record = obj.data.record;

                //:Mostra modo de edição e esconde modo de visualização
                const editNode = $("#register .left .edit");
                const viewNode = $("#register .left .view");
                editNode.style.display = "flex";
                viewNode.style.display = "none";

                editNode.innerHTML = ""; //:Limpa módulos anteriores
                obj.right.sortable.option("sort", true); //:Habilita Sortable
                $("#register #headerBar .btn.toggleViewEdit span").textContent = "Visualizar prontuário";

                const modulesOrder = $split(record.modulesOrder, ";");
                const hiddenModules = $split(record.hiddenModules, ";");
                for (const id of modulesOrder) {
                    if (!hiddenModules.includes(id)) {
                        obj.currentModule = obj.data.modules.find((mod) => mod.id_file_type === id);
                        await this.showOneModule();
                    }
                }
            },

            showOneModule: async function () {
                //:Nome do módulo
                const module = `edit_${obj.currentModule.type}`;

                //:Importa módulo
                if (!obj[module]) {
                    //:Importa módulo
                    const mod = await import(`${jsURL}record/modules/${module}.js?v=${g.refresh}`);

                    //:Adiciona módulo que irá gerar o html
                    obj[module] = mod.obj;

                    //:Se o módulo tiver função extra para ser executada -> importa também
                    //:Da o mesmo nome do módulo com sufixo "_fnc" no final para facilitar a identificação
                    const moduleFunction = module + "_fnc";
                    obj[moduleFunction] = mod.fnc;
                }

                //:Renderiza html do módulo
                await obj[module](obj.currentModule, this.rightBox, this.fatherList, this.scrollTop);
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

                    $(".left .edit").scrollBy({ top: -20, behavior: "smooth" });
                }, 1000);

                //:Efeito em background
                moduleNode.style.transition = "none";
                moduleNode.classList.add("show");
                setTimeout(() => {
                    moduleNode.style.transition = "background-color .5s linear";
                    moduleNode.classList.remove("show");
                }, 400);
            },
        },

        viewModules() {
            //:Mostra modo de visualização e esconde modo de edição
            const editNode = $("#register .left .edit");
            const viewNode = $("#register .left .view");
            editNode.style.display = "none";
            viewNode.style.display = "flex";
            $("#register #headerBar .btn.toggleViewEdit span").textContent = "Editar prontuário";

            (async function () {
                let content = await obj.createPdfContent();

                //:Transforma módulo de formato PDF p/ WEB
                //:Troca todos os <ul> e <li> por <div>
                content = content.replaceAll("<ul", "<div");
                content = content.replaceAll("</ul", "</div");
                content = content.replaceAll("<li", "<div");
                content = content.replaceAll("</li", "</div");

                viewNode.innerHTML = content;
            })();
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    //:Clique na ferramenta de textarea
                    if (target.closest(".mod-main.textarea .ql-formats")) return makeModuleAsChanged();
                    if (target.closest(".mod-main.allergy .add")) return makeModuleAsChanged();
                    if (target.closest(".mod-main.numberlist input")) return makeModuleAsChanged();
                    return;

                default:
                    //:Target inativo
                    if ($check.ch1(target)) return;
                    //:Valida tecla precionada
                    if ($check.ch2(event)) return;
                    //:Alteração em Input|Textarea
                    if ($check.ch3(event)) return makeModuleAsChanged();
                    //:Alteração em textarea de quill
                    if (target.closest(".ql-editor")) return makeModuleAsChanged();
                    return;
            }

            function makeModuleAsChanged() {
                const id = target.closest(".mod-main").id.replace("id", "");
                const type = target.closest(".mod-main").dataset.type;
                const module = obj.data.modules.find((mod) => mod.id === id);
                const content = target.closest(".content");

                //:Chama função específica do módulo para atualizar o conteúdo
                //:As funções chamadas abaixo estão declaradas em "record/modules/edit_[type].js"
                const fnc = `edit_${type}_fnc`;
                eval(obj[fnc]).events(event, module, content);

                obj.database.change(id);
            }
        },
    },

    right: {
        sortable: new Sortable($("#register .right .modulesActives .list"), {
            animation: 150, //:tempo da animação em ms
            ghostClass: "ghost", //:classe aplicada ao item "fantasma"

            onUpdate: async function (evt) {
                const modules = $$("#register .right .list .module");
                const modulesOrder = Array.from(modules).map((el) => el.dataset.id);

                obj.data.record.modulesOrder = modulesOrder.join(";");
                obj.data.record.save = 1;

                obj.right.showAllModulesBtns();
                obj.left.editModules.showAllModules();
                $saveMode.enable();
            },
        }),

        showAllModulesBtns() {
            if (!obj.data.record.modulesOrder) return;

            const hiddenModules = $split(obj.data.record.hiddenModules, ";");
            let tptActives = "";
            let tptInactives = "";

            const modulesOrder = $split(obj.data.record.modulesOrder, ";");
            modulesOrder.map((id) => {
                const module = obj.data.modules.find((module) => module.id_file_type === id);
                const y = { id };

                if (!hiddenModules.includes(id)) {
                    y.checked = "checked";
                    y.checkedTxt = "Ativo";
                    tptActives += templateFactory(y);
                } else {
                    y.checked = "";
                    y.checkedTxt = "Inativo";
                    tptInactives += templateFactory(y);
                }

                function templateFactory(y) {
                    return `
                    <div class="module shadow-sm" data-id="${y.id}" data-active="${y.active}" data-order="${y.order}">
                        <i class="fa-light fa-circle-sort fa-xl" title="Precione e arraste"></i>
                        ${module?.title}
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="switchCheckChecked" ${y.checked}>
                            <label class="form-check-label me-3">${y.checkedTxt}</label>
                        </div>
                    </div>`;
                }
            });

            $("#register .right .modulesActives .list").innerHTML = tptActives;
            $("#register .right .modulesInactives .list").innerHTML = tptInactives;
        },

        showPatient() {
            //:Seta dados do paciente
            const patient = obj.data.patient;
            const inputList = $$("#register .right .patient input");
            inputList.forEach((el) => $inputChange(el, patient[el.name]));
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "change":
                    //:Alterar módulo ativo/inativo
                    if (target.type === "checkbox") return changeModuleActiveInactive();
                    return;

                case "click":
                    //:Coloca módulo a esquerda em evidência
                    if (target.closest(".modulesActives .list .module")) return showModuleAtLeft();
                    return;

                default:
                    return;
            }

            function showModuleAtLeft() {
                const id = target.closest(".right .modulesActives .list .module").dataset.id;

                obj.currentModule = obj.data.modules.find((mod) => mod.id_file_type === id);
                obj.left.editModules.showOneModule();
            }

            function changeModuleActiveInactive() {
                const moduleNode = target.closest(".module");
                const id = moduleNode.dataset.id;
                const record = obj.data.record;
                const hiddenModules = $split(record.hiddenModules, ";");

                if (hiddenModules.includes(id)) {
                    //:Tira módulo do array de módulos ocultos
                    const novaArray = hiddenModules.filter((item) => item !== id);
                    record.hiddenModules = novaArray.join(";");
                } else {
                    //:Coloca módulo no array de módulos ocultos
                    hiddenModules.push(id);
                    record.hiddenModules = hiddenModules.join(";");
                }

                record.save = 1;

                obj.right.showAllModulesBtns();
                obj.left.editModules.showAllModules();
                $saveMode.enable();
            }
        },
    },

    dom: {
        headbar() {
            //:Botões "disabled"
            const btnNode = $("#register #headerBar .btn.finalizeRecord");
            btnNode.disabled = obj.data.record.id_pending ? false : true;
        },

        all: async function () {
            obj.lastModuleClicked = null;

            $m.menuTop.set(obj.data.patient);

            obj.dom.headbar();
            $saveMode.disable();

            //:Box do paciente
            obj.right.showPatient();

            //:Cria todos os botões de módulos em "right"
            obj.right.showAllModulesBtns();

            //:Cria todos os módulos em "left"
            obj.left.editModules.showAllModules();

            //:Destaque em botões de menu
            $destackButtons("#register .btn.toggleViewEdit, #register .btn.finalizeRecord, #register .btn.delete");
        },
    },

    headerBar(event) {
        if (event.type !== "click") return;
        const target = event.target.closest(".btn");
        const method = target.dataset.method;

        if (method === "delete") return del();
        if (method === "toggleViewEdit") return toggleViewEdit();
        if (method === "finalizeRecord") return finalizeRecord();
        if (method === "goModuleConfig") return goModuleConfig();
        return;
        //* * * * * * * * * * * * * * * * * * * *

        //:Deleta prontuário
        function del() {
            $m.msg.delete();
        }

        //:Muda entre modo editar e visualizar
        function toggleViewEdit() {
            const viewModeIsVisible = $isVisible("#register .left .view");

            if (viewModeIsVisible) {
                //:Se edição estiver oculto -> mostra modo de edição
                obj.left.editModules.showAllModules();
            } else {
                //:Se visualização estiver oculto -> mostra modo de visualização
                obj.left.viewModules();
            }
        }

        //:Finaliza prontuário
        function finalizeRecord() {
            $m.msg.finalizeRecord();
        }

        //:Vai para: Usuários -> Prontuário
        function goModuleConfig() {
            cl("Ir para configuração de módulos");

            ls.set("menuTop", "record", "user");
            window.location.href = `${baseURL}usuarios`;
        }
    },

    //:Renderiza todo os módulos para o formato PDF
    async createPdfContent() {
        const record = obj.data.record;
        let content = "";

        const modulesOrder = $split(record.modulesOrder, ";");
        const hiddenModules = $split(record.hiddenModules, ";");
        for (const id of modulesOrder) {
            if (!hiddenModules.includes(id)) {
                const data = obj.data.modules.find((mod) => mod.id_file_type === id);
                content += await renderModule(data);
            }
        }

        return content.replaceAll("  ", " ");
        //* * * * * * * * * * * * * * * * * * * *

        // cookie.set("printId", 18, 1);
        // window.open(`${baseURL}print-prontuario`);

        async function renderModule(data) {
            //:Nome do módulo
            const module = `pdf_${data.type}`;

            //:Importa módulo
            if (!obj[module]) {
                const mod = await import(`${jsURL}record/modules/${module}.js?v=${g.refresh}`);
                obj[module] = mod.obj;
            }

            //:Mostra módulo
            const content = await obj[module](data.content);

            return `
                <div class="record">
                    <div class="title">
                        ${data.title}
                    </div>
                    <div class="content">
                        ${content}
                    </div>
                </div>
                <hr>`;
        }
    },

    events(event) {
        const target = event.target;

        //:Eventos da esquerda
        if (target.closest(".left .edit")) return obj.left.events(event);

        //:Eventos da direita
        if (target.closest(".right")) return obj.right.events(event);

        return;
    },

    init() {
        //:Inicializa savemode
        $saveMode.init(`.navbar, #menuTop .right, #headerBar .menu`);
    },
};
