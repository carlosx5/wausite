document.addEventListener("DOMContentLoaded", () => {
    price.database.get();
});

const price = {
    data: {},

    database: {
        get() {
            (async function () {
                const resp = await $fetch({
                    url: "procedure/priceList/priceList/getPrice",
                    par: { id: ls.procedureId },
                    fnName: "BUSCA DADOS #630",
                });

                //ATUALIZA TABELA
                price.data = resp.price || {};
                price.dom.all();
            })();
        },

        save() {
            (async function () {
                const resp = await $fetch({
                    url: "procedure/priceList/priceList/updatePrice",
                    par: {
                        id: ls.procedureId,
                        priceList: $("#table textarea").value,
                    },
                    fnName: "SALVA DADOS #631",
                });

                //ATUALIZA TABELA
                price.data = resp.price || {};
                price.dom.all();
            })();
        },
    },

    dom: {
        all() {
            const textarea = $("#table textarea");

            $("#id").value = price.data.id || "";
            $("#name").value = price.data.name || "";
            textarea.value = price.data.price_list || "";
            textarea.disabled = $permission(164, 0) ? false : true;
        },
    },

    events: {
        keydown() {
            return changeEvents.executeEvent("");
        },
    },

    init: (function () {
        $("#table textarea").addEventListener("keydown", () => price.events.keydown());
    })(),
};

const find = {
    procedure: {
        callback(par) {
            ls.set("procedureId", par.id || 0);
            price.database.get();
        },

        start() {
            if (!$permission(163)) return;

            $findModule.init({
                urn: "procedure/priceList/priceList/findProcedure",
                title: "Busca Procedimento",
                tptTexts: { col2: "Nome" },
                columnsQuantity: 2,
                width: "450px",
                callback: (y) => this.callback(y),
            });
        },
    },

    init: (function () {
        $(".sidebarTools .btn.search").onclick = () => find.procedure.start();
    })(),
};

const sidebarBtn = {
    save() {
        price.database.save();
    },

    cancel() {
        price.database.get();
    },

    init: (function () {
        changeEvents.init();
    })(),
};
