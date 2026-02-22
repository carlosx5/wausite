export const obj = {
    data: {
        os: {},
        procedureList: [],
        stockList: [],
        comissList: [],
        partnerList: [],
        financialList: [],
        patient: {},
        optLock: null,
    },
    leftMain: {},
    rightMain: {},

    database: {
        get: async function () {
            const osId = ls.osId;

            //:fetch
            const resp = await $fetch({
                url: "osRegister/getData",
                par: { osId },
                fnName: "BUSCA DADOS WAU-0051",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            const optLock = obj.data.optLock;
            const osId = ls.osId;

            //:Data
            const data = { os: {}, procedure: [], stock: [], comiss: [], partner: [] };

            //:Keys de os alteradas
            data.os = $dataFetchRender(obj.data.os);
            if ($isEmpty(data.os)) delete data.os;

            //:Procedimentos alterados
            obj.data.procedureList.forEach((el) => {
                const element = $dataFetchRender(el);
                if (element) data.procedure.push(element);
            });
            if ($isEmpty(data.procedure)) delete data.procedure;

            //:Estoques alterados
            obj.data.stockList.forEach((el) => {
                const element = $dataFetchRender(el);
                if (element) data.stock.push(element);
            });
            if ($isEmpty(data.stock)) delete data.stock;

            //:Comissões alteradas
            obj.data.comissList.forEach((el) => {
                const element = $dataFetchRender(el);
                if (element) data.comiss.push(element);
            });
            if ($isEmpty(data.comiss)) delete data.comiss;

            //:Participações alteradas
            obj.data.partnerList.forEach((el) => {
                const element = $dataFetchRender(el);
                if (element) data.partner.push(element);
            });
            if ($isEmpty(data.partner)) delete data.partner;

            if ($isEmpty(data)) return this.dom();

            //:Fetch
            const resp = await $fetch({
                url: "osRegister/setData",
                par: { optLock, osId, data },
                fnName: "SALVA PRONTUARIO WAU-0082",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) return this.get();

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        stockMove: async function (data) {
            if (!$permission("100P")) return;

            const optLock = obj.data.optLock;

            if ($isEmpty(data)) return cl("Nenhum item para movimentar!");

            const osId = ls.osId;

            const resp = await $fetch({
                url: "osRegister/moveStock",
                par: { optLock, osId, data },
                fnName: "MOVIMENTA ESTOQUE #703",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) return this.get();

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        delete: async function () {
            const optLock = obj.data.optLock;
            const osId = ls.osId;

            //:fetch
            const resp = await $fetch({
                url: "osRegister/deleteOs",
                par: { optLock, osId },
                fnName: "DELETA OS WAU-0140",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) return this.get();

            window.location.href = `${baseURL}pacientes`;
        },

        change(moduleId) {
            return cl("PARADO");
            if (!obj.dataChanged.includes(moduleId)) obj.dataChanged.push(moduleId);

            $saveMode.enable();
        },

        resset() {
            return cl("PARADO");
            $$("#register input").forEach((el) => (el.value = ""));

            //:Seta dados
            obj.dataChanged = [];
            obj.data = {};

            //:Atualiza toda tela
            obj.dom.all();
        },

        set(resp) {
            if (!resp.os) {
                $saveMode.disable();
                moduleRender("list");
                return;
            }

            //:Seta dados
            ls.set("osId", resp.os.id);
            ///
            obj.data.patient = resp.patient;
            obj.data.os = resp.os;
            obj.data.procedureList = resp.procedureList;
            obj.data.stockList = resp.stockList;
            obj.data.comissList = resp.comissList;
            obj.data.partnerList = resp.partnerList;
            obj.data.financialList = resp.financialList;
            obj.data.optLock = resp.os.optLock;
            ///
            obj.dataChanged = [];
            ///
            obj.leftMain.dom.newStockEnable = false;
            obj.leftMain.dom.newComissEnable = false;
            ///
            $patientId(resp.os.id_patient);

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            $m.menuTop.set(obj.data.patient);

            $saveMode.disable();

            const headerTitleNode = $("#register #headerBar .title span");
            headerTitleNode.innerHTML = `Ordem de Serviço: #${obj.data.os.id}`;

            obj.leftMain.dom.all();
            obj.rightMain.dom.all();
        },

        refresh() {
            obj.recalculate();

            const functionList = ["procedure", "stock", "comiss"];
            const functionClone = { procedure, stock, comiss };
            functionList.forEach((sub) => functionClone[sub]());
            return;

            function procedure() {
                obj.leftMain.dom.procedure();
                obj.rightMain.dom.procedure();
            }

            function stock() {
                obj.leftMain.dom.stock();
                obj.rightMain.dom.stock();
            }

            function comiss() {
                obj.leftMain.dom.comiss();
                obj.rightMain.dom.comiss();
            }
        },
    },

    /** //:SOBE E DESCE ACCORDION INDIVIDUALMENTE
     *
     * @param {node|string} father ///Accordion pai
     * @param {true|false} show ///true = show | false = hide
     */
    accordionToggle(father, show) {
        if (!(father instanceof Node)) father = $(father);

        const collapseElement = father.querySelector(".accordion-collapse");
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });

        //:Executa evento de show/hide
        father.querySelector(".accordion-button").classList.toggle("collapsed", !show);
        bsCollapse[show ? "show" : "hide"]();
    },

    /** //:SOBE E DESCE TODOS OS ACCORDION
     *
     * @param {up|down} option
     */
    accordionToggleAll(option, exeption = null) {
        const list = ["procedure", "stock", "comiss", "partner", "financial"];
        let action = option === "up" ? false : true;

        list.forEach((main) => {
            ls.set("accActiveName", null);

            if (exeption) {
                action = exeption === main ? true : false;
                ls.set("accActiveName", exeption);
                ls.set("accActiveOs", ls.osId);
            }

            const mainUp = main.charAt(0).toUpperCase() + main.slice(1);
            const key = `accordion${mainUp}Show`;
            ls.set(key, action);

            const fatherLeft = $(`#register .left-main .${main}-main`);
            obj.accordionToggle(fatherLeft, ls[key]);

            const fatherRight = $(`#register .right-main .${main}-main`);
            obj.accordionToggle(fatherRight, ls[key]);
        });
    },

    recalculate() {
        const functionList = ["procedure", "stock", "comiss", "partner", "financial"];
        const functionClone = { procedure, stock, comiss, partner, financial };
        const os = obj.data.os;
        const proc = {
            vl_procedureTable: 0,
            vl_procedureDiscount: 0,
            vl_procedureTax: 0,
            vl_procedureTotal: 0,
            vl_procedureMargin: 0,

            pc_procedureDiscount: 0,
            pc_procedureTax: 0,
        };
        const stk = {
            vl_stockTable: 0,
            vl_stockDiscount: 0,
            vl_stockTotal: 0,
            vl_stockTax: 0,
            vl_stockCost: 0,
            vl_stockMargin: 0,

            pc_stockDiscount: 0,
            pc_stockTax: 0,
        };

        //:Executa funções
        functionList.forEach((sub) => functionClone[sub]());
        return;

        function procedure() {
            console.error("PROCEDURE");
            //:Tabela
            obj.data.procedureList.forEach((el) => {
                if (!el.z_del) proc.vl_procedureTable += $numberOnly(+el.vl_sale * el.qt, 2) || 0;
            });

            //:Desconto
            if (os.tp_procedureDiscount == 0) {
                //:Desconto em $
                proc.vl_procedureDiscount = $numberOnly(os.vl_procedureDiscount, 2);
                proc.pc_procedureDiscount = $numberOnly((proc.vl_procedureDiscount / proc.vl_procedureTable) * 100, 2);
            } else {
                //:Desconto em %
                proc.pc_procedureDiscount = $numberOnly(os.pc_procedureDiscount, 2);
                proc.vl_procedureDiscount = $numberOnly(proc.vl_procedureTable * (proc.pc_procedureDiscount / 100), 2);
            }

            //:Total
            proc.vl_procedureTotal = $numberOnly(proc.vl_procedureTable - proc.vl_procedureDiscount, 2);

            //:Imposto
            if (os.tp_procedureTax == 0) {
                //:Imposto em $
                proc.vl_procedureTax = $numberOnly(os.vl_procedureTax, 2);
                proc.pc_procedureTax = $numberOnly((proc.vl_procedureTax / proc.vl_procedureTotal) * 100, 2);
            } else {
                //:Imposto em %
                proc.pc_procedureTax = $numberOnly(os.pc_procedureTax, 2);
                proc.vl_procedureTax = $numberOnly(proc.vl_procedureTotal * (proc.pc_procedureTax / 100), 2);
            }

            //:Total
            proc.vl_procedureMargin = $numberOnly(proc.vl_procedureTotal - proc.vl_procedureTax, 2);

            //:Compara e atualiza campos alterados
            const files = [
                "vl_procedureTable",
                "vl_procedureDiscount",
                "vl_procedureTax",
                "vl_procedureTotal",
                "vl_procedureMargin",
                "pc_procedureDiscount",
                "pc_procedureTax",
            ];
            files.forEach((prop) => {
                $dataChange(os, prop, proc[prop], 2);
            });
        }

        function stock() {
            console.error("STOCK");
            //:Tabela
            obj.data.stockList.forEach((el) => {
                if (!el.z_del) {
                    stk.vl_stockTable += $numberOnly(+el.vl_sale * el.qt, 2) || 0;
                    stk.vl_stockCost += $numberOnly(+el.vl_purchase * el.qt, 2) || 0;
                }
            });

            //:Desconto
            if (os.tp_stockDiscount == 0) {
                //:Desconto em $
                stk.vl_stockDiscount = $numberOnly(os.vl_stockDiscount, 2);
                stk.pc_stockDiscount = $numberOnly((stk.vl_stockDiscount / stk.vl_stockTable) * 100, 2);
            } else {
                //:Desconto em %
                stk.pc_stockDiscount = $numberOnly(os.pc_stockDiscount, 2);
                stk.vl_stockDiscount = $numberOnly(stk.vl_stockTable * (stk.pc_stockDiscount / 100), 2);
            }

            //:Total
            stk.vl_stockTotal = $numberOnly(stk.vl_stockTable - stk.vl_stockDiscount, 2);

            //:Imposto
            if (os.tp_stockTax == 0) {
                //:Imposto em $
                stk.vl_stockTax = $numberOnly(os.vl_stockTax, 2);
                stk.pc_stockTax = $numberOnly((stk.vl_stockTax / stk.vl_stockTotal) * 100, 2);
            } else {
                //:Imposto em %
                stk.pc_stockTax = $numberOnly(os.pc_stockTax, 2);
                stk.vl_stockTax = $numberOnly(stk.vl_stockTotal * (stk.pc_stockTax / 100), 2);
            }

            //:Margem
            stk.vl_stockMargin = $numberOnly(stk.vl_stockTotal - stk.vl_stockTax - stk.vl_stockCost, 2);

            //:Compara e atualiza campos alterados
            const files = [
                "vl_stockTable",
                "vl_stockDiscount",
                "vl_stockTotal",
                "vl_stockTax",
                "vl_stockCost",
                "vl_stockMargin",
                "pc_stockDiscount",
                "pc_stockTax",
            ];
            files.forEach((prop) => {
                $dataChange(os, prop, stk[prop], 2);
            });
        }

        function comiss() {
            console.error("COMISS");
            let vlTotal = 0;

            //:Percorre todas comissões do tipo %
            obj.data.comissList.forEach((el) => {
                let newVal = 0;

                if (+el.id_type === 1) {
                    newVal = $numberOnly(el.value, 2);
                } else if (+el.id_type === 2) {
                    newVal = $calculator(+os.vl_procedureMargin, +el.percent, "%", true);
                }

                $dataChange(el, "value", newVal, 2);

                vlTotal += newVal;
            });

            $dataChange(os, "vl_comissTotal", vlTotal, 2);
        }

        function partner() {
            console.error("PARTNER");
            let vlTotal = 0;

            //:Percorre todas participações do tipo %
            obj.data.partnerList.forEach((el) => {
                let newVal = 0;

                if (+el.id_type === 1) {
                    newVal = $numberOnly(el.value, 2);
                } else if (+el.id_type === 2) {
                    newVal = $calculator(+os.vl_procedureMargin, +el.percent, "%", true);
                }

                $dataChange(el, "value", newVal, 2);

                vlTotal += newVal;
            });

            $dataChange(os, "vl_partnerTotal", vlTotal, 2);
        }

        function financial() {
            console.error("FINANCIAL");

            const vlTotal = proc.vl_procedureTotal + stk.vl_stockTotal;

            $dataChange(os, "vl_invoiceTotal", vlTotal, 2);
        }
    },

    headerBar(event) {
        if (event.type !== "click") return;

        //:Abre apenas accordion específico
        if (event.target.closest(".down")) return down();
        //:Botão accordion up
        if (event.target.closest(".all-up")) return obj.accordionToggleAll("up");
        //:Botão accordion down
        if (event.target.closest(".all-down")) return obj.accordionToggleAll("down");
        //:Botão deletar OS
        if (event.target.closest(".delete")) return delOs();

        //:Abre apenas accordion específico
        function down() {
            const exeption = event.target.closest(".down").dataset.target;

            obj.accordionToggleAll("down", exeption);
        }

        //:Deletar OS
        function delOs() {
            $messageModal({
                text1: "Após confirmar essa ação, não será mais possível recuperar as informações.",
                text2: "Confirma deletar esse Serviço?",
                btn: [
                    { text: "Deletar", color: "danger", dataset: "delete" },
                    { text: "Cancelar", color: "secondary", dataset: "exit" },
                ],
                btnWidth: "150px",
                timer: false,
                callback(dtback) {
                    if (dtback !== "delete") return;

                    obj.database.delete();
                },
            });
        }
    },

    events(event) {
        const target = event.target;

        //:Clique no botão do accordion em leftMain ou rightMain
        const accordionButton = target.closest(".accordion-button");
        if (accordionButton && event.type === "click") {
            const mainName = accordionButton.dataset.main;
            const mainUp = mainName.charAt(0).toUpperCase() + mainName.slice(1);
            const key = `accordion${mainUp}Show`;

            ls.set(key, ls[key] ? false : true);

            const fatherLeft = $(`#register .left-main .${mainName}-main`);
            obj.accordionToggle(fatherLeft, ls[key]);

            const rightLeft = $(`#register .right-main .${mainName}-main`);
            obj.accordionToggle(rightLeft, ls[key]);

            return;
        }

        //:Eventos da esquerda
        if (target.closest(".left-main")) return obj.leftMain.events(event);

        //:Eventos da direita
        if (target.closest(".right-main")) return obj.rightMain.events(event);
    },

    init: async function () {
        //:Inicializa savemode
        $saveMode.init(".navbar, #menuTop .right, #register #headerBar .menu .delete");

        const x = await import(`${jsURL}os/register/leftMain.js?v=${g.refresh}`);
        obj.leftMain = x.obj;
        obj.leftMain.init();

        const y = await import(`${jsURL}os/register/rightMain.js?v=${g.refresh}`);
        obj.rightMain = y.obj;
        obj.rightMain.init();

        if (!ls.accActiveName || ls.accActiveOs !== ls.osId) {
            ls.set("accActiveName", null);
            ls.set("accActiveOs", null);
        }

        if (ls.accActiveName) {
            ls.set("accordionProcedureShow", false);
            ls.set("accordionStockShow", false);
            ls.set("accordionComissShow", false);
            ls.set("accordionPartnerShow", false);
            ls.set("accordionFinancialShow", false);
            obj.accordionToggleAll("down", ls.accActiveName);
        } else {
            ls.set("accordionProcedureShow", true);
            ls.set("accordionStockShow", true);
            ls.set("accordionComissShow", true);
            ls.set("accordionPartnerShow", true);
            ls.set("accordionFinancialShow", true);
        }
    },
};
