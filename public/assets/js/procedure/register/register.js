const d = {
    //DATA
    clinic: "",
    procedure_name: "",
    procedure_clinic: "",
};

const v = {
    //VARIAVEIS
    fields: ["tax", "doctor", "collector", "stamp", "nto", "operational", "agent", "partner", "laboratory"],
    activeFields: [],
};

document.addEventListener("DOMContentLoaded", () => {
    //MASK
    mask.currency.init({ element: ".vl", end: " $" });
    mask.currency.init({ element: ".pc", type: 0, end: " %" });

    //GET (TEM Q FICAR APÓS EXECUÇÃO DE MASK)
    database.get();
});

const database = {
    get: async function () {
        const procedureId = ls.procedureId;

        const resp = await $fetch({
            url: "procedure/register/register/get",
            par: { procedureId },
            fnName: "BUSCA PROCEDIMENTO #596",
        });

        database.set.procedure(resp);
        viewdom.procedure();
        viewdom.btnsActive();
    },

    save: async function () {
        const procedureId = ls.procedureId;
        const data = {};

        //DATA BOTÕES
        v.activeFields = [];
        $$(".f_clinic .btn").forEach((e) => {
            if (+e.dataset.active) v.activeFields.push(e.dataset.field);
        });
        data["active_fields"] = v.activeFields.toString();

        //DATA INPUTS
        $$(".f_clinic input").forEach((e) => (data[e.id] = e.value));

        //DATA OUTROS
        data["name"] = $i("name").value;
        data["id_clinic"] = $i("id_clinic").value;

        //FETCH
        const resp = await $fetch({
            url: "procedure/register/register/save",
            par: { procedureId, data },
            fnName: "SALVA PROCEDIMENTO #597",
        });

        database.set.procedure(resp);
        viewdom.procedure();
        viewdom.btnsActive();
    },

    resset() {
        const inputList = $$("input");
        inputList.forEach((e) => (e.value = ""));

        d.procedure = {};
        d.procedure.id = "Novo";
        d.procedure.id_clinic = cookie.get("log_clinicId");
        d.procedure.nm_clinic = cookie.get("log_clinicName");
        //
        v.activeFields = [];
        //
        ls.set("procedureId", "Novo");

        viewdom.procedure();
        viewdom.btnsActive();
    },

    set: {
        procedure(data) {
            d.procedure = data.procedure || {};
            ls.set("procedureId", d.procedure.id || 0);
            v.activeFields = $split(d.procedure.active_fields);
        },
    },
};

const viewdom = {
    //ATUALIZA TELA COM INFORMAÇÕES DO PROCEDIMENTO
    procedure() {
        const inputList = document.querySelectorAll("input");
        const btnList = document.querySelectorAll(".f_config button");

        if (d.procedure.id) {
            inputList.forEach((e) => {
                e.disabled = false;
                $change(e, d.procedure[e.id]);
            });

            btnList.forEach((e) => (e.disabled = false));
        } else {
            inputList.forEach((e) => {
                e.disabled = true;
                e.value = "---";
            });

            btnList.forEach((e) => (e.disabled = true));
        }

        $i("id").value = d.procedure.id || "";
        $i("name").value = d.procedure.name || "";

        changeEvents.btnSaveCancelClicked();
    },

    //ATUALIZA BOTÕES DE CAMPOS ATIVOS
    btnsActive() {
        v.fields.forEach((field) => {
            $(`[data-field=${field}]`).dataset.active = 0;
        });

        v.activeFields.forEach((field) => {
            $(`[data-field=${field}]`).dataset.active = 1;
        });
    },
};

const procedure = {
    activeFieldsChange(e) {
        const active = +e.dataset.active;
        e.dataset.active = active ? 0 : 1;

        $trigger("main", "keyup");
    },

    init: (function () {
        $(".sidebarTools .btn.new").onclick = () => database.resset();
        $(".sidebarTools .btn.delete").onclick = () => procedure.delete();
        $$(".f_clinic .btn").forEach((e) => (e.onclick = (e) => procedure.activeFieldsChange(e.currentTarget)));
    })(),
};

const find = {
    procedure: {
        callback(par) {
            ls.set("procedureId", par.id || 0);
            database.get();
        },

        start() {
            if (!$permission(9)) return;

            $findModule.init({
                urn: "procedure/register/find/findProcedure",
                title: "Busca Procedimento",
                tptTexts: { col2: "Nome" },
                columnsQuantity: 2,
                width: "450px",
                callback: (y) => this.callback(y),
            });
        },
    },

    partner: {
        callback(data) {
            $change("[name=id_partner]", data.id);
            $("[name=nm_partner]").value = data.col2;
        },

        start() {
            if (!$permission([88])) return;

            $findModule.init({
                urn: "provider/provider_register/find_provider",
                title: "Busca Parceiro",
                tptTexts: { col2: "Parceiro" },
                columnsQuantity: 2,
                width: "450px",
                callback: (y) => this.callback(y),
            });
        },
    },

    init: (function () {
        $(".sidebarTools .btn.search").onclick = () => find.procedure.start();
        $(".btnPartner").onclick = () => find.partner.start();
    })(),
};

const sidebarBtn = {
    save() {
        database.save();
    },

    cancel() {
        location.reload();
    },

    init: (function () {
        //bwe = Block when editing
        changeEvents.init({
            rules: [{ ev: "ch", da: "main input", db: "" }],
            blockForAll: ".btn_sidebar.search, .btn_sidebar.new, .btn_sidebar.delete, .navbar",
        });
    })(),
};
