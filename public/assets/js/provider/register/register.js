const d = {
    providerRegister: {},
};

document.addEventListener("DOMContentLoaded", () => {
    //MASK
    mask.phone.init("#phone");

    //SIDEBAR
    $(".sidebarTools .new").onclick = () => database.resset();

    //GET
    database.get();

    //INIT
    sidebarBtn.init();
});

const database = {
    get: async function () {
        const providerId = ls.providerId;

        const resp = await $fetch({
            url: "provider/register/register/get_data",
            par: { providerId },
            fnName: "BUSCA FORNECEDOR #533",
        });

        database.set.providerRegister(resp);
        viewdom.providerRegister();
    },

    save: async function () {
        const providerId = ls.providerId;
        const data = {};

        $$(".f_register input").forEach((e) => (data[e.id] = e.value));

        const resp = await $fetch({
            url: "provider/register/register/save_providerRegister",
            par: { providerId, data },
            fnName: "SALVA FORNECEDOR #534",
        });

        database.set.providerRegister(resp);
        viewdom.providerRegister();
    },

    resset() {
        d.providerRegister = {};
        d.providerRegister.id = "Novo";
        //
        ls.set("providerId", "Novo");

        viewdom.providerRegister();
    },

    set: {
        providerRegister(data) {
            d.providerRegister = data.providerRegister || {};
            ls.set("providerId", d.providerRegister.id || 0);
        },
    },
};

const viewdom = {
    //ATUALIZA TELA COM INFORMAÇÕES DA OS
    providerRegister() {
        $$(".f_register input").forEach((e) => (e.value = d.providerRegister[e.id] || ""));
    },
};

const find = {
    provider: {
        callback(data) {
            ls.set("providerId", data.id);
            database.get();
        },

        start() {
            if (!$permission([88])) return;

            $findModule.init({
                urn: "provider/register/register/find_provider",
                title: "Busca NTO",
                tptTexts: { col2: "Fornecedor" },
                columnsQuantity: 2,
                width: "400px",
                callback: (y) => this.callback(y),
            });
        },
    },

    init: (function () {
        $(".sidebarTools .search").onclick = () => find.provider.start();
    })(),
};

const sidebarBtn = {
    save() {
        database.save();
    },

    cancel() {
        location.reload();
    },

    init() {
        changeEvents.init({
            rules: [{ ev: "ku", da: "[js=d_data]", db: "button" }],
            blockForAll: ".navbar, .btn_sidebar.search, .btn_sidebar.new",
        });
    },
};
