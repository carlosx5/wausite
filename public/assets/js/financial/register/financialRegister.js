export const obj = {
    data: { patient: {}, osList: [], financialList: [], osSelectedId: null, optLock: null },

    database: {
        get: async function () {
            const patientId = $patientId();

            //:Fetch
            const resp = await $fetch({
                url: "financialRegister/getData",
                par: { patientId },
                fnName: "BUSCA FINANCEIRO WAU-0150",
            });

            //:Seta dados
            this.set(resp);
        },

        saveNewBank: async function (dataFetch) {
            const optLock = obj.data.optLock;
            const osId = obj.data.osSelectedId;
            const patientId = $patientId();

            //:Fetch
            const resp = await $fetch({
                url: "financialRegister/setNewFinancial",
                par: { optLock, osId, patientId, dataFetch },
                fnName: "SALVA LANCAMENTO WAU-0157",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) {
                $toast("Erro ao salvar lançamento!", "danger");
                return this.get();
            }

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        saveNewPlan: async function (dataFetch) {
            const optLock = obj.data.optLock;
            const osId = obj.data.osSelectedId;
            const patientId = $patientId();

            //:Fetch
            const resp = await $fetch({
                url: "financialRegister/setNewFinancial",
                par: { optLock, osId, patientId, dataFetch },
                fnName: "SALVA LANCAMENTO WAU-0188",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) {
                $toast("Erro ao salvar lançamento!", "danger");
                return this.get();
            }

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        deleteFinancial: async function (contentId) {
            const optLock = obj.data.optLock;
            const patientId = $patientId();

            //:Fetch
            const resp = await $fetch({
                url: "financialRegister/deleteFinancial",
                par: { optLock, contentId, patientId },
                fnName: "EXCLUI LANCAMENTO WAU-0191",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) {
                $toast("Erro ao excluir lançamento!", "danger");
                return this.get();
            }

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        set(resp) {
            //:Seta dados
            $patientId(resp.patient.id);
            obj.data.patient = resp.patient;
            obj.data.osList = resp.osList;
            obj.data.financialList = resp.financialList;
            obj.data.optLock = resp.patient.optLock;

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            $m.menuTop.set(obj.data.patient);

            $saveMode.disable();

            obj.left.renderList();
            obj.right.renderList();
            obj.right.balance();
        },
    },

    left: {
        renderList() {
            //:Ordena lista deixando a selecionada no topo
            let list;
            if (obj.data.osSelectedId) {
                list = obj.data.osList.slice().sort((a, b) => {
                    if (a.id === obj.data.osSelectedId) return -1;
                    if (b.id === obj.data.osSelectedId) return 1;
                    return 0;
                });
            } else {
                list = obj.data.osList;
            }

            const html = list.map((item) => {
                const formatedDate = $date.format(item.date, "Br/");
                const valTotal = $valFormat(item.vlTotal);
                const selected = obj.data.osSelectedId === item.id ? " colorMedium" : "";

                return `
                    <tr class="${selected}" data-id="${item.id}">
                        <td>${item.id}</td>
                        <td>${formatedDate}</td>
                        <td>${item.procedureName}</td>
                        <td>${item.profName}</td>
                        <td class="text-end">${valTotal}</td>
                        <td>
                            <div class="action-btn">
                                <button class="btn px-1 py-0 goService">
                                    <i class="fa-light fa-files-medical fa-lg"></i>
                                </button>
                                <button class="btn px-1 py-0 selectOs">
                                    <i class="fa-light fa-clipboard-check fa-lg${selected}"></i>
                                </button>
                            </div>
                        </td>
                    </tr>`;
            });

            const osTableNode = $("#register .left tbody");
            osTableNode.innerHTML = html.join("");
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    if (target.closest(".goService")) return goService(target);
                    if (target.closest(".selectOs")) return selectOs(target);
                    break;

                default:
                    return;
            }

            function goService(target) {
                return;
            }

            function selectOs(target) {
                const osId = target.closest("tr").dataset.id;
                if (!osId) return;

                obj.data.osSelectedId = osId;
                obj.left.renderList();
                obj.right.renderList();
            }
        },
    },

    right: {
        renderList() {
            const html = obj.data.financialList.map((item) => {
                const formatedDate = $date.format(item.date, "Br/");
                const targetName = item.planName || item.bankName;
                const targetIcon = item.planName ? "fa-credit-card" : "fa-bank";
                const value = $valFormat(item.value);

                //:Se tem OS selecionada -> filtra
                if (obj.data.osSelectedId && obj.data.osSelectedId !== item.osId) return;

                return `
                    <tr data-content_id="${item.contentId}">
                        <td>${formatedDate}</td>
                        <td>${item.text}</td>
                        <td><i class="fa-light ${targetIcon} me-1"></i>${targetName}</td>
                        <td class="text-end">${value}</td>
                        <td class="text-end">
                            <div class="action-btn">
                                <button class="btn px-1 py-0 delete">
                                    <i class="fa-light fa-trash-can fa-lg"></i>
                                </button>
                            </div>
                        </td>
                    </tr>`;
            });

            const rightTableNode = $("#register .right tbody");
            rightTableNode.innerHTML = html.join("");
        },

        balance() {
            const balanceOsNode = $("#register h5.balanceOs");
            balanceOsNode.textContent = $valFormat(obj.data.patient.balance_os);

            const balancePaidNode = $("#register h5.balancePaid");
            balancePaidNode.textContent = $valFormat(obj.data.patient.balance_paid);

            const balanceTotalNode = $("#register h5.balanceTotal");
            balanceTotalNode.textContent = $valFormat(obj.data.patient.balance_total);
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    if (target.closest(".btn.delete")) return deleteFinancial(target);
                    break;

                default:
                    return;
            }

            function deleteFinancial(target) {
                const trNode = target.closest("tr");
                const contentId = trNode.dataset.content_id;
                if (!contentId) return;

                obj.database.deleteFinancial(contentId);
            }
        },
    },

    headerBar(event) {
        switch (event.type) {
            case "click":
                //:Buscar paciente
                if (event.target.closest(".search")) return findPatient();
                //:Novo lançamento em banco
                if (event.target.closest(".newBank")) return newBank();
                //:Novo lançamento em plano
                if (event.target.closest(".newPlan")) return newPlan();
                return;

            default:
                return;
        }

        //:Abre modal de novo lançamento em banco
        async function newBank() {
            if (!obj.data.osSelectedId) return $toast("Selecione uma OS", "warning");

            if (!$m.newBank) await importModules();

            //:Dados p/ modal
            const osId = obj.data.osSelectedId;
            const patientName = obj.data.patient.nameSocial;
            const data = {
                objDescription: `OS: ${osId} - Paciente: ${patientName}`,
                objDate: $date.now("Sq-"),
                objBankId: "",
                objBankName: "",
                objValue: 0,
                objStatusId: 1,
            };
            $m.newBank.open(data);

            //:Importa módulos necessários
            async function importModules() {
                //:Importa js
                const url = `${jsURL}financial/libraries/mod_patientBank/patientBank.js?v=${g.refresh}`;
                $m.newBank = (await import(url)).default;

                //:Inicializa módulo
                const saveCallback = (y) => obj.database.saveNewBank(y);
                await $m.newBank.init(saveCallback);
            }
        }

        //:Abre modal de novo lançamento em plano
        async function newPlan() {
            if (!obj.data.osSelectedId) return $toast("Selecione uma OS", "warning");

            if (!$m.newPlan) await importModules();

            //:Dados p/ modal
            const osId = obj.data.osSelectedId;
            const patientName = obj.data.patient.nameSocial;
            const data = {
                objDescription: `OS: ${osId} - Paciente: ${patientName}`,
                objDate: $date.now("Sq-"),
                objBankId: "",
                objBankName: "",
                objValue: 0,
                objStatusId: 1,
            };
            $m.newPlan.open(data);

            //:Importa módulos necessários
            async function importModules() {
                //:Importa js
                const url = `${jsURL}financial/libraries/mod_patientPlan/patientPlan.js?v=${g.refresh}`;
                $m.newPlan = (await import(url)).default;

                //:Inicializa módulo
                const saveCallback = (y) => obj.database.saveNewPlan(y);
                await $m.newPlan.init(saveCallback);
            }
        }
    },

    events(event) {
        if (event.target.closest(".left")) return this.left.events(event);
        if (event.target.closest(".right")) return this.right.events(event);
    },

    init() {},
};
