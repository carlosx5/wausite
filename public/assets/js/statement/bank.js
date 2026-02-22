//-HTML LOADED
document.addEventListener("DOMContentLoaded", () => {
    $("#menuTop .btnBank").classList.add("active");

    //:INIT
    lockedDay.init();
});

//-BUSCA BANCO
const find = {
    name: {
        callback(data) {
            ls.set(g.table, data.id);
            database.get();
        },

        start() {
            if (!$permission(68)) return;

            $findModule.init({
                urn: "bank/register/find/findBank",
                title: "Busca Banco",
                tptTexts: { col2: "Banco" },
                columnsQuantity: 2,
                width: "350px",
                callback: (y) => this.callback(y),
            });
        },
    },
};

//-DATAS BLOQUEADAS
const lockedDay = {
    database: {
        /** ///BUSCA LISTA DE DIAS BLOQUEADOS NO MÊS
         * @param {mix} bankId
         * @param {mix} month
         * @returns {array}
         */
        async get(bankId, month) {
            return await $fetch({
                url: "statement/bank/getLockedDaysList",
                par: { bankId, month },
                fnName: "BUSCA LISTA DE DIAS BLOQUEADOS #652",
            });
        },
    },

    //.MODAL md7
    modalMd7BlockedDays: {
        start() {
            const bankId = ls.bank;
            const month = ls.dateIn.split("-")[1];

            //:SETA CALLBACK
            md7.callback = (y, x) => this.callback(y, x);

            (async function () {
                const resp = await lockedDay.database.get(bankId, month);

                md7.start(ls.dateIn, resp.list);
                return;
            })();
        },

        /** ///CALLBACK
         * @param {string} dt data a ser setada
         * @param {string} event tipo de evento - dayClick=seta dia | monthClick=retorna p/ modal com mês clicado e lista de dias bloqueados
         */
        callback(dt, event) {
            //:CLIQUE EM DIA - SETA DIA
            if (event == "dayClick") {
                sidebarFilter.period.set(dt, dt);
                sidebarFilter.filter.filter();
                return;
            }
            //:CLIQUE EM MÊS - RETORNA P/ MODAL COM MÊS CLICADO E LISTA DE DIAS BLOQUEADOS
            if (event == "monthClick") {
                const bankId = ls.bank;
                const month = dt.split("-")[1];

                (async function () {
                    const resp = await lockedDay.database.get(bankId, month);

                    md7.start(dt, resp.list);
                    return;
                })();
            }
            //:CLIQUE EM ANO - RETORNA P/ MODAL COM ANO CLICADO E LISTA DE DIAS BLOQUEADOS
            return cl("PARADO AKI");
        },
    },

    /** ///EVENTOS */
    eventClick(target) {
        //:BUSCA ULTIMA DATA BLOQUEADA
        if (target.closest(".lastLockedDay")) {
            if (!$permission(9)) return;

            //:FETCH
            (async function () {
                const resp = await $fetch({
                    url: "statement/bank/getLastLockedDay",
                    par: { bankId: ls.bank },
                    fnName: "BUSCA ULTIMA DATA BLOQUEADA #648",
                });

                sidebarFilter.period.set(resp.date, resp.date);
                sidebarFilter.filter.filter();
            })();
        }
        //:ABRE MODAL DE DATA "md7" C/ LISTA DE DIAS BLOQUEADOS
        if (target.closest(".teste")) return lockedDay.modalMd7BlockedDays.start();
    },

    /** ///INICIO */
    init() {
        //:EVENTOS
        // $('.sidebarTools .lockedDay').addEventListener('click', event => lockedDay.eventClick(event.target));//TODO
    },
};
