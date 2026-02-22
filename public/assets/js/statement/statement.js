//-HTML LOADED
document.addEventListener("DOMContentLoaded", () => {
    if (g.table == "user" && !ls[g.table]) ls.set(g.table, cookie.get("log_userId"));
    if (g.table == "clinic" && !ls.clinic) ls.set("clinic", 8);

    //:Executa init
    (function () {
        const initList = ["sidebar", "menuTop", "list"];
        initList.forEach((el) => eval(`${el}.init`)());
    })();

    //:Inicia "sidebarFilter.js"
    sidebarFilter.init("database.get");

    //:Inicia "bank_register_module.js" (botão para editar lançamento)
    bankRegister.init({ callback: (y) => database.get(y) });

    //:Inicia "bank_check_module.js" (botão de checagem de lançamento)
    if ($permission(152, 0)) btnCheckStatement.init((y) => database.get(y));

    //:Busca dados
    database.get();
});

//-BODY MENU TOPO
const menuTop = {
    data: {},
    lockedDay: "",

    //.DATABASE
    database: {
        /** ///SETA */
        set(data) {
            menuTop.data = data.data;
            menuTop.lockedDay = data.lockedDay;
        },
    },

    //.DOM
    dom: {
        inputs() {
            $(".name").value = menuTop.data.name ?? menuTop.data.name_social;
            $(".id").value = menuTop.data.id;
        },
    },

    //.EVENTOS
    events: {
        /** ///EVENTO CLICK */
        click(target) {
            //:BUSCA REGISTRO
            if (target.closest(".btnFindBank")) return find.name.start();
            //:BLOQUEIA DATA
            if (target.closest(".btnLockedDay")) {
                if (!$permission([166, 167])) return;

                const dateInNode = $(".sidebarTools .f_period .dateIn");
                const dateOutNode = $(".sidebarTools .f_period .dateOut");

                if (dateInNode.value !== dateOutNode.value) return;

                (async function () {
                    await $fetch({
                        url: "statement/bank/dateLocked",
                        par: {
                            bankId: menuTop.data.id,
                            date: dateInNode.value,
                        },
                        messageType: 1,
                        fnName: "BLOQUEIA DATA #638",
                    });

                    database.get();
                })();

                return;
            }
            //:VAI P/ TELA EXTRATO DE BANCO
            if (target.closest(".btnBank")) return go.bankStatement();
            //:VAI P/ TELA EXTRATO DE CLINICA
            if (target.closest(".btnClinic")) return go.clinicStatement();
            //:VAI P/ TELA EXTRATO DE USUÁRIO
            if (target.closest(".btnUser")) return go.userStatement();
        },
    },

    /** ///INICIO */
    init() {
        //:EVENTO CLICK
        $("#menuTop").addEventListener("click", (event) => menuTop.events.click(event.target));
    },
};

//-BODY LIST
const list = {
    data: [],

    //.DATABASE
    database: {
        /** ///SETA */
        set(data) {
            list.data = data;
        },
    },

    //.DOM
    dom: {
        list() {
            // let line = pagination.totalRegisters - ((pagination.pagInit - 1) * pagination.pagLimit) + 1;
            let line = 0;
            let unidentifiedColor = "";
            let dateUnic = list.data[0]?.date;
            let checkColor = "";
            let iconCheck = "";
            let checkOn = $permission([152], 0);
            let iconDelete = $permission([9], 0) ? '<i class="fa-light fa-trash-can ms-2"></i>' : "";
            let iconRegister = $permission([129], 0) ? '<i class="far fa-copy ms-2 modalRegister"></i>' : "";
            let userStatementPermission = $permission([112], 0);

            let tpt = list.data
                .map(({ id, id_bl, month, date, id_source, nm_source, description, value, positive, nm_clinic, check }) => {
                    value = (positive == 1 ? "" : "-") + value;
                    unidentifiedColor = +id_source == 14 ? ' style="color:#48ff00"' : "";

                    if (dateUnic && dateUnic !== date) dateUnic = false;

                    if (checkOn) {
                        checkColor = check ? ' style="color:red"' : "";
                        iconCheck = `<i class="far fa-calendar-check check me-2 btnCheck" ${checkColor}></i>`;
                    }

                    iconUserStatement =
                        userStatementPermission && ",5,6,7,9,13,".includes(id_source)
                            ? '<i class="fa-light fa-user ms-2 goUserStatement"></i>'
                            : "";

                    return `
                    <tr data-id="${id}" data-id_bl="${id_bl}">
                        <th scope="row">${++line}</th>
                        <td>${id}</td>
                        <td>${date} <i class="fa-light fa-calendar-days pointer ms-2 calendar"></i></td>
                        <td>${month}</td>
                        <td${unidentifiedColor}>${nm_source}</td>
                        <td class="sourceId"${unidentifiedColor}>${description}${iconUserStatement}</td>
                        <td>${nm_clinic}</td>
                        <td class="text-end">${value}</td>
                        <td class="text-center py-0">
                            ${iconCheck}
                            <i class="fa-light fa-clipboard-medical goOs"></i>
                            ${iconRegister}
                            ${iconDelete}
                        </td>
                    </tr>`;
                })
                .join("");

            $(".container tbody").innerHTML = tpt;

            //:BOTÃO DATA BLOQUEADA
            const btnLockedDay = $(".btnLockedDay");
            btnLockedDay.disabled = $permission(9, 0) ? false : true;
            btnLockedDay.style.display = dateUnic ? "flex" : "none";
            btnLockedDay.classList[menuTop.lockedDay ? "add" : "remove"]("active");
            btnLockedDay.textContent = menuTop.lockedDay ? "Bloqueado" : "Desbloqueado";
        },
    },

    //.EVENTOS
    events: {
        /** ///EVENTO CLICK */
        click(target) {
            //:BOTÃO DELETAR
            if (target.closest(".fa-trash-alt")) {
                if (!$permission(9, 0)) return;
                if (!confirm("Deseja deletar esse registro?")) return;

                const bankId = target.closest("tr").dataset.id;

                (async function () {
                    await $fetch({
                        url: "bank/entry/entryAdd/entryDelete",
                        par: { bankId },
                        fnName: "DELETA REGISTRO #637",
                    });

                    database.get();
                })(bankId);

                return;
            }
            //:VAI PARA TELA DE OS
            if (target.closest(".goOs")) return go.os(target);
            //:VAI PARA TELA DE EXTRATO DE USUÁRIO
            if (target.closest(".goUserStatement")) {
                if (!$permission(112)) return;
                const bankId = target.closest("tr").dataset.id;

                (async function () {
                    const resp = await $fetch({
                        url: "statement/statement/get_user_id",
                        par: { bankId },
                        fnName: "BUSCA ID DO USUÁRIO #649",
                    });

                    ls.set("user", resp.userId, "statement");
                    go.userStatement();
                })();

                return;
            }
            //:ABRE MODAL DE CADASTRO
            if (target.closest(".modalRegister")) return bankRegister.getData(target);
            //:FILTRA PELA DATA SELECIONADA
            if (target.closest(".calendar")) {
                const date = $date.format(target.parentElement.textContent, "Sq");

                sidebarFilter.period.set(date, date);
                sidebarFilter.filter.filter();

                return;
            }
            //:BOTÃO CHECK
            if (target.closest(".btnCheck")) {
                const id = target.closest("tr").dataset.id_bl;
                btnCheckStatement.check(id, 15);

                return;
            }
        },
    },

    /** ///INICIO */
    init() {
        //:EVENTO CLICK
        $("#list").addEventListener("click", (event) => list.events.click(event.target));
    },
};

//-BODY SIDEBAR
const sidebar = {
    data: {},

    //.DATABASE
    database: {
        /** ///SETA */
        set(data) {
            sidebar.data = data;
        },
    },

    /** ///DOM */
    dom() {
        //:SALDO
        const balance = $(".sidebarTools .balance");
        balance.value = $mask.number.format(sidebar.data?.value ?? 0);
        if (sidebar.data.bankLink) balance.style.color = "red";

        //:ATIVA FILTRO
        $(".sidebarTools .filter").classList.remove("disabledColor");
    },

    /** ///EVENTOS */
    eventClick(target) {
        //:BUSCA REGISTRO
        if (target.closest(".search")) return find.name.start();
        //:ABRE MODAL DE LANÇAMENTO
        if (target.closest(".new")) return bankModal.newEntry((x, y) => database.newBankEntry(x, y));
        //:ABRE TELA DE LANÇAMENTOS MÚLTIPLOS
        if (target.closest(".btnMultiEntry")) return md5.start();
        //:ABRE TELA DE LANÇAMENTOS MÚLTIPLAS ENTRADAS
        // if (target.closest('.btnMultiExpense')) return md8.start('credito');
        //:ABRE MODAL DE LANÇAMENTOS MÚLTIPLOS OS
        if (target.closest(".btnMultiOs")) return md8.start("credito", "os,expense");
        //:ABRE MODAL DE LANÇAMENTOS MÚLTIPLAS DESPESAS
        if (target.closest(".btnMultiExpense")) return md8.start("debito", "expense");
    },

    /** ///INICIO */
    init() {
        //:EVENTO CLICK
        $(".sidebarTools .content_0").addEventListener("click", (event) => sidebar.eventClick(event.target));
    },
};

//-PAGINAÇÃO
// const pagination = Pagination();
// pagination.init({
//     father: '.pagination',
//     totalPage: 0,
//     pagInit: 1,
//     pagLimit: 100,
//     totalRegisters: 0,
//     balance: 0,
//     callback: () => database.get(),
// });

//-BANCO DE DADOS GLOBAL
const database = {
    /** ///BUSCA LISTA */
    get: async function () {
        const data = {
            method: "getList",
            table: g.table,
            id: ls[g.table],
            // pagInit: pagination.pagInit,
            // pagLimit: pagination.pagLimit,
            dateIn: ls.dateIn,
            dateOut: ls.dateOut,
            month: ls.monthEndClosing,
            unidentified: ls.unidentified,
            valueFilter: "",
            user: cookie.get("log_userId"),
        };

        if (!data.id || !data.table) return;

        const resp = await $fetch({
            url: "statement/statement/getList",
            par: { data },
            fnName: "BUSCA EXTRATO #544",
        });

        // pagination.set(resp.pagination);
        menuTop.database.set(resp.menuTop);
        list.database.set(resp.list);
        sidebar.database.set(resp.sidebar);

        // pagination.show();
        menuTop.dom.inputs();
        list.dom.list();
        sidebar.dom();
    },

    /** ///CALLBACK QUE SERÁ CHAMADO APÓS FINALIZAR NOVO LANÇAMENTO */
    newBankEntry(entry1Id, entry2Id) {
        // ls.set('bank', entry2Id);
        database.get();
    },
};

//-VAI P/ OUTRAS PAGINAS
const go = {
    bankStatement() {
        if (g.table == "bank" || !$permission(114, 0)) return;
        window.location.href = `${baseURL}statement/bank`;
    },

    clinicStatement() {
        if (g.table == "clinic" || !$permission(113, 0)) return;
        window.location.href = `${baseURL}statement/clinic`;
    },

    userStatement() {
        if (g.table == "user" || !$permission(112, 0)) return;
        window.location.href = `${baseURL}statement/user`;
    },

    os(e) {
        if (!$permission(76)) return;

        let text = e.closest("tr").querySelector(".sourceId").textContent;
        let osId = text.split(";")[0].split("OS #")[1];
        if (!osId) return;

        ls.set("osId", osId, "os_register");
        window.location.href = `${baseURL}os/old`;
    },

    user() {
        if (!$permission(50)) return;

        ls.set("userId", ls.user, "user_register");
        window.location.href = `${baseURL}user/user_register`;
    },
};
