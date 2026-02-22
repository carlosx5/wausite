export const obj = {
    data: {},
    dataChanged: [],

    database: {
        get: async function () {
            //:Fetch
            const resp = await $fetch({
                url: "clinic/branch/clinicBranch/getData",
                par: { clinicId: ls.clinicId },
                fnName: "BUSCA FILIAIS #680",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            cl("DATABASE SAVE");
        },

        delete: async function () {
            cl("DATABASE DELETE");
        },

        change(elNode, saveMode = true) {
            cl("DATABASE CHANGE");
        },

        resset() {
            cl("DATABASE RESSET");
        },

        set(resp) {
            //:Erro ou vazio -> limpa dados
            if (resp.status !== 200) return this.resset();

            //:Seta dados
            ls.set("clinicId", resp.localStorage.clinicId);
            ls.set("clinicName", resp.localStorage.clinicName);
            obj.dataChanged = [];
            obj.data.mainClinic = resp.mainClinic || {};
            obj.data.branchList = resp.branchList ?? [];

            //:Atualiza toda tela
            obj.dom.all();
        },
    },

    dom: {
        mainClinic() {
            $n("#branch, clinicMainName").value = obj.data.mainClinic.name_social;
        },

        branchList() {
            const tpt = obj.data.branchList
                .map(({ id, name_social }) => {
                    return `
                        <tr data-id="${id}">
                            <th scope="row">${id}</th>
                            <td>${name_social}</td>
                        </tr>`;
                })
                .join("");

            $("#branch tbody").innerHTML = tpt;
        },

        btnHeaderbar(disabled) {
            $$("#service .headerBar .btn").forEach((el) => (el.disabled = disabled));
        },

        all() {
            menuTop.name();
            obj.dom.mainClinic();
            obj.dom.branchList();
        },
    },

    headerBar(target) {
        //:Botão buscar clínica
        if (target.closest(".search")) return findClinic();
    },

    events(event) {
        const target = event.target;

        //:Target inativo
        if ($check.ch1(target)) return;

        //:Valida tecla precionada
        if ($check.ch2(event)) return;

        //:Alteração em Input|Textarea
        if ($check.ch3(event)) return $maskInput(target, target.value, event.type, "register");

        //:Evento "click"
        if (event.type == "click") {
            //:Botões na barra de cabeçalho
            if (target.closest(".headerBar")) return this.headerBar(target);
        }
    },
};
