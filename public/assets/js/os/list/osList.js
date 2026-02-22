export const obj = {
    data: { osList: [], patient: {} },

    database: {
        get: async function () {
            const patientId = $patientId();

            const resp = await $fetch({
                url: "osList/getData",
                par: { patientId },
                fnName: "BUSCA DADOS WAU-0052",
            });

            //:Seta dados
            this.set(resp);
        },

        set(resp) {
            console.log("resp: ", resp);
            obj.data.osList = resp.osList || [];
            obj.data.patient = resp.patient || {};

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            $m.menuTop.set(obj.data.patient);

            obj.left.renderList();
        },
    },

    left: {
        //:Renderiza lista de serviços
        renderList() {
            //:Duplica o array original 15 vezes para fins de teste
            // cl("LISTA SENDO DUPLICADA 15X PARA TESTES");
            const repeatedList = obj.data.osList; // Array(15).fill(obj.data.osList).flat();

            const listItems = repeatedList.map((item, index) => {
                console.log("item: ", item);
                const collapseId = `col_${index}`;
                const formattedDate = $date.format(item.created_at, "Br/");
                const calendarStart = $date.format(item.calendar_start, "tm");
                const calendarEnd = $date.format(item.calendar_end, "tm");

                return `
                <div class="list-box flex-md-row align-items-md-center justify-content-between gap-4" data-id="${item.id}" data-target="${collapseId}">
                    <div class="procedure-box">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <span class="badge bg-light text-secondary border px-2 py-1 fw-bold">${item.id}</span>
                            <h5 class="mb-0 fw-bold text-dark">${item.procedureName}</h5>
                        </div>
                        <div class="d-flex align-items-center gap-2 text-secondary">
                            <i class="bi bi-person text-secondary opacity-75"></i>
                            <span class="small fw-medium">${item.profName}</span>
                        </div>
                    </div>
                    <div class="date-box">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-calendar-event text-primary"></i>
                            <div class="small">
                                <span class="fw-bold text-dark">${formattedDate}</span>
                                <span class="text-muted mx-1">&bull;</span>
                                <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                                    ${calendarStart} - ${calendarEnd}
                                </span>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-1 text-muted" style="font-size: 0.75rem;">
                            <i class="bi bi-clock"></i>
                            <span>Criado em: ${formattedDate}</span>
                        </div>
                    </div>
                    <div class="btn-box">
                        <button class="btn btn-outline-secondary action-btn" title="Acessar Serviço">
                            <i class="bi bi-file-earmark-plus fs-5"></i>
                        </button>
                    </div>
                </div>`;
            });

            //:Renderiza os itens na interface
            $("#list .left").innerHTML = listItems.join("");
        },

        collapse: async (target) => {
            return cl("Função inativa");

            //:Obtém card onde o conteúdo será inserido
            const boxNode = target.closest(".list-box");
            const cardNode = boxNode.querySelector(".card-body");
            const collapseId = boxNode.dataset.target;
            const recordId = boxNode.dataset.id;

            //:Card existe -> toggle em collapse e retorna
            if (cardNode.querySelector("*")) return $collapse.toggle(`#${collapseId}`);

            //:Realiza a busca dos módulos via API
            const response = await $fetch({
                url: "recordList/getModules",
                par: { recordId },
                overlay: false,
                fnName: "BUSCA MODULOS WAU-0075",
            });

            //: Monta o template com o conteúdo dos módulos
            const record = obj.data.osList.find((item) => item.id === recordId);
            const orderedModules = $split(record.modulesOrder, ";");
            const hiddenModules = $split(record.hiddenModules, ";");
            let modulesTpt = "";
            for (const moduleId of orderedModules) {
                //:Verifica se o módulo não está oculto
                if (!hiddenModules.includes(moduleId)) {
                    const moduleData = response.modules.find((module) => module.id_file_type === moduleId);
                    modulesTpt += await buildModuleTemplate(moduleData);
                }
            }

            //:Insere o conteúdo no card
            cardNode.innerHTML = modulesTpt;

            //:Abre o collapse
            $collapse.show(`#${collapseId}`);
            return;
            //* * * * * * * * * * * * * * * * * * * *

            //:Constroi o template de cada módulo
            async function buildModuleTemplate(data) {
                //:Nome do módulo
                const module = `view_${data.type}`;

                //:Importa módulo
                if (!obj[module]) {
                    const mod = await import(`${jsURL}record/modules/${module}.js?v=${g.refresh}`);
                    obj[module] = mod.obj;
                }

                //:Gera conteúdo
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
                    <hr>
                `;
            }
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    //:Clique em icone de abrir registro
                    if (target.closest(".list-box")) return goOs();
                    //:Clique em icone de expandir/collapse
                    if (target.closest(".list-item")) return obj.left.collapse(target);
                    return;

                default:
                    return;
            }

            function goOs() {
                const osId = target.closest(".list-box").dataset.id;
                if ($isEmpty(osId)) return;
                ls.set("osId", osId);

                moduleRender("register");
            }
        },
    },

    headerBar(event) {
        if (event.type !== "click") return;

        //:Buscar paciente
        if (event.target.closest(".search")) return findPatient();
    },

    events(event) {
        const target = event.target;

        //:Eventos da esquerda
        if (target.closest(".left")) return obj.left.events(event);

        //:Eventos da direita
        // if (target.closest(".right")) return obj.right.events(event);

        return;
    },

    init() {},
};
