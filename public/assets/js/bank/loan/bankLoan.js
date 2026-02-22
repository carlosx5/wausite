//-HTML LOADED
document.addEventListener("DOMContentLoaded", () => {
    database.get();

    init();
    sidebar.init();
});

//-DATABASE
const database = {
    /** ///BUSCA CADASTRO E LISTA */
    get() {
        (async function () {
            const resp = await $fetch({
                url: "bank/loan/bankLoan/getData",
                par: { registerId: ls.registerId },
                fnName: "BUSCA REGISTRO #635",
            });

            //:ATUALIZA TABELA
            register.database.set(resp.register);
            list.database.set(resp.list);
        })();
    },
};

//-SIDEBAR
const sidebar = {
    /** ///EVENTOS */
    events(target) {
        //:BUSCA REGISTRO
        if (target.closest(".search")) return register.find.register.start();
        //:NOVO REGISTRO
        if (target.closest(".new")) {
            register.database.resset();
            list.database.resset();
            return;
        }
        //:BOTÃO SALVAR
        if (target.closest(".update")) return register.database.save();
        //:BOTÃO CANCELAR
        if (target.closest(".cancel")) {
            database.get();
            register.dom.saveMode.inactive();
            return;
        }
    },

    /** ///INICIO */
    init() {
        //:EVENTOS
        $(".sidebarTools").addEventListener("click", (event) => sidebar.events(event.target));
    },
};

//-BODY CADASTRO
const register = {
    data: {},
    dataChanged: [],

    //.DATABASE
    database: {
        /** ///SALVA DADOS */
        save() {
            if ($validate(register.data.name, "Nome", "alert")) return;
            if ($validate(register.data.date, "Data", "alert")) return;
            if ($validate(register.data.id_clinic, "Ide da clínica", "alert")) return;
            if ($validate(register.data.id_bank, "Id do banco", "alert")) return;

            //DATA
            const data = {};
            register.dataChanged.forEach((field) => (data[field] = register.data[field]));

            (async function () {
                const resp = await $fetch({
                    url: "bank/loan/bankLoan/saveRegister",
                    par: {
                        registerId: ls.registerId,
                        data,
                    },
                    fnName: "SALVA REGISTRO #634",
                });

                //ATUALIZA TABELA
                register.database.set(resp.register);
                register.dom.saveMode.inactive();
                changeEvents.msgSaved(resp.status);
            })();
        },

        /** ///1-COLOCA CAMPO NA LISTA DE CAMPOS A SEREM ALTERADOS | 2-ATUALIZA CAMPO EM DATA | 3-ATIVA MODO SALVAR NO DOM
         * @param {node} elNode node do input do respectivo campo
         * @param {bool} saveMode ativa ou não o modo salvar | default = true
         */
        change(elNode, saveMode = true) {
            //:INCLUI CAMPO NA LISTA DE CAMPOS A SEREM SALVOS
            if (!register.dataChanged.includes(elNode.name)) register.dataChanged.push(elNode.name);

            //:ATUALIZA "DATA" COM O VALOR DO ELEMENTO number|string
            const value = elNode.getAttribute("mask") == "number" ? $numberOnly(elNode.value) : elNode.value;
            register.data[elNode.name] = value;

            //:ATIVA O MODO SALVAR
            if (saveMode) register.dom.saveMode.active();
        },

        /** ///REINICIA DADOS */
        resset() {
            $$("#register input").forEach((el) => (el.value = ""));

            ls.set("registerId", "Novo");

            register.data = {};
            register.data.id = "Novo";
            register.dataChanged = [];

            register.dom.all();
        },

        /** ///SETA DADOS */
        set(data) {
            register.dataChanged = [];

            if (!data?.id > 0) return register.database.resset();

            ls.set("registerId", data.id);
            register.data = data || {};
            register.dom.all();
        },
    },

    //.DOM
    dom: {
        form() {
            $$("#register input").forEach((el) => $mask.input(el, register.data[el.name]));
        },

        btnLaunchLoan() {
            $("#register .btnLaunchLoan").disabled = +register.data.status ? true : false;
        },

        all() {
            this.form();
            this.btnLaunchLoan();
        },

        saveMode: {
            selectors: ".sidebarTools .btn.search, .sidebarTools .btn.new, .navbar, .f_menuTop, #list, .btnLaunchLoan",
            statusActive: false,

            active() {
                if (this.statusActive) return;

                $classAdd(this.selectors, "disabledColor");

                changeEvents.btnSaveCancelDisabled(false);

                this.statusActive = true;
            },

            inactive() {
                if (!this.statusActive) return;

                $classRemove(this.selectors, "disabledColor");

                changeEvents.btnSaveCancelDisabled(true);

                this.statusActive = false;
            },
        },
    },

    //.BUSCA
    find: {
        register: {
            callback(data) {
                ls.set("registerId", data.id);
                database.get();
            },

            start() {
                if (!$permission(9)) return;

                $findModule.init({
                    urn: "bank/loan/find/findLoan",
                    title: "Busca Empréstimo",
                    tptTexts: { col2: "Nome" },
                    columnsQuantity: 2,
                    width: "450px",
                    callback: (y) => this.callback(y),
                });
            },
        },

        clinic: {
            callback(data) {
                const clinicIdNode = $n("id_clinic");

                clinicIdNode.value = data.id;
                $n("nm_clinic").value = data.col2;

                register.database.change(clinicIdNode);
            },

            start() {
                if (!$permission(9)) return;

                $findModule.init({
                    urn: "clinic/register/find/findClinic",
                    title: "Busca Clínica",
                    tptTexts: { col2: "Clínica" },
                    columnsQuantity: 2,
                    width: "450px",
                    callback: (y) => this.callback(y),
                });
            },
        },

        bank: {
            callback(data) {
                const clinicIdNode = $n("id_bank");

                clinicIdNode.value = data.id;
                $n("nm_bank").value = data.col2;

                register.database.change(clinicIdNode);
            },

            start() {
                if (!$permission(9)) return;

                $findModule.init({
                    urn: "bank/register/find/findBank",
                    title: "Busca Banco",
                    tptTexts: { col2: "Banco" },
                    columnsQuantity: 2,
                    width: "450px",
                    callback: (y) => this.callback(y),
                });
            },
        },
    },

    /** ///LANÇA DEBITO NA LISTA */
    launchLoan() {
        const data = {
            id_clinic: register.data.id_clinic,
            id_source: 20,
            source_category: 0,
            description: `Empréstimo (${register.data.name})`,
            date: register.data.date,
            value: $numberOnly(register.data.vl_loan, 2),
            available: 1,
            links: {
                0: { destination: register.data.id, table: 13, positive: 2 },
                1: { destination: register.data.id_bank, table: 10, positive: 1 },
            },
        };

        (async function (data) {
            await $fetch({
                url: "bank/loan/bankLoan/launchLoan",
                par: {
                    registerId: ls.registerId,
                    data,
                },
                fnName: "FAZ LANÇAMENTO DE EMPRESTIMO #636",
            });

            database.get();
        })(data);
    },

    /** ///EVENTOS */
    events(event) {
        const target = event.target;
        if (target.readOnly == true || target.disabled == true) return;

        //:SE FOR KEYUP MAS NÃO FOR ENTER
        if (event.type == "keyup" && event.key !== "Enter") return;

        //:SE ENTRAR OU SAIR DE UM INPUT
        if ($existIn("input", target.localName)) {
            //:EXECUTA MASK EM INPUT
            $mask.input(target, target.value, event.type, "register");

            //:SE FOR "QT.PARCELAS" OU "VL.PARCELAS" CALCULA O CAMPO "VL.JUROS"
            if ("qt_installment,vl_installment".includes(target.name)) {
                //:CALCULA APENAS SE TIVER A QUANTIDADE E O VALOR DAS PARCELAS
                if (+register.data.qt_installment && +register.data.vl_installment) {
                    const vl = register.data.qt_installment * register.data.vl_installment;
                    $mask.input($n("vl_interest"), vl, "change", "register");
                }
            }

            return;
        }

        //:SE FOR CLICK
        if (event.type == "click") {
            //:BOTÃO BUSCA CLINICA
            if (target.closest(".btnClinic")) return register.find.clinic.start();
            //:BOTÃO BUSCA BANCO
            if (target.closest(".btnBank")) return register.find.bank.start();
            //:BOTÃO LANÇAR EMPRÉSTIMO
            if (target.closest(".btnLaunchLoan")) return register.launchLoan();

            return;
        }
    },
};

//-BODY LISTA
const list = {
    data: [],

    database: {
        resset() {
            list.data = [];
            list.dom.all();
        },

        set(resp) {
            list.data = resp || [];
            list.dom.all();
        },
    },

    dom: {
        all() {
            let line = 1;

            let tpt = list.data
                .map(({ id, month, date, nm_source, description, value, positive, nm_clinic }) => {
                    value = (positive == 1 ? "" : "-") + value;

                    return `
                    <tr data-id="${id}">
                        <th scope="row">${line++}</th>
                        <td>${id}</td>
                        <td>${date}</td>
                        <td>${month}</td>
                        <td>${nm_source}</td>
                        <td>${description}</td>
                        <td>${nm_clinic}</td>
                        <td class="text-end">${value}</td>
                    </tr>`;
                })
                .join("");

            $("#list tbody").innerHTML = tpt;
        },
    },
};

/** ///INICIO */
const init = () => {
    //:EVENTOS
    $event(
        "main",
        false,
        "change,keyup,click,focusout",
        (event) => {
            const target = event.target;

            //:CADASTRO
            if (target.closest("#register")) return register.events(event);
        },
        false
    );
};
