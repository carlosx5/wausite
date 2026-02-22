//-LOADED
document.addEventListener("DOMContentLoaded", () => {
    database.get({ getChoice: ["views", "permissions"] });

    //:EXECUTA INITs
    (function () {
        const initList = ["views", "permissions", "tools"];
        initList.forEach((el) => eval(`${el}.init`)());
    })();
});

//-BODY TELAS
const views = {
    data: {},
    index: 0,
    update: false,
    id: 0,

    //.DOM
    dom: {
        template() {
            const tpt = views.data
                .map(
                    ({ id, name }, key) => `
                <div class="col-6 p-2" data-row="${key}">
                    <button class="btn_view btn btn-secondary w-100 inactive" data-id="${id}">${name}</button>
                </div>
            `
                )
                .join("");

            $(".views_template").innerHTML = tpt;
        },

        style() {
            const vi = views.index;
            const list = $$(".btn_view");
            list.forEach((el, key) => $classToggle(el, key === vi ? "inactive" : "active", key == vi ? "active" : "inactive"));
        },

        all() {
            this.template();
            this.style();
        },
    },

    /** ///EVENTO DE CLIQUE EM BOTÕES */
    btnClick(target) {
        if (target.dataset.id == "new") return;
        if (!target.closest(".btn_view")) return;

        views.id = target.dataset.id;
        views.index = +target.parentNode.dataset.row;
        permissions.update = false;
        permissions.index = false;
        tools.tableActive = "views";

        $(".tools .input").value = $findArray(views.data, "id", views.id).name;
        views.dom.all();

        database.get({ getChoice: ["permissions"] });
    },

    /** ///INICIO */
    init() {
        $("#views").addEventListener("click", (event) => views.btnClick(event.target));
    },
};

//-BODY PERMISSÕES
const permissions = {
    data: {},
    index: false,
    update: false,

    //.DOM
    dom: {
        template() {
            const tpt = permissions.data
                .map(
                    ({ id, name }, key) => `
                <div class="col-4 d-grid p-2" data-row="${key}">
                    <button
                        type="button"
                        class="btn_permissions btn btn-secondary w-100 inactive"
                        data-id="${id}"
                        title="id: ${id}">
                        ${name}
                    </button>
                </div>
            `
                )
                .join("");

            $(".permissions_template").innerHTML = tpt;
        },

        style() {
            const pi = permissions.index;
            const list = $$(".permissions_template .btn_permissions");
            list.forEach((el, key) => $classToggle(el, key === pi ? "inactive" : "active", key == pi ? "active" : "inactive"));
        },

        all() {
            this.template();
            this.style();
        },
    },

    /** ///EVENTO DE CLIQUE EM BOTÕES */
    btnClick(target) {
        if (!target.closest(".btn_permissions")) return;

        tools.tableActive = "permissions";

        permissions.index = +target.parentNode.dataset.row;
        permissions.dom.all();

        $(".tools .input").value = permissions.data[permissions.index].name;
        tools.dom.all([0, 0, 0, 0, 1, 1], false);
    },

    /** ///INICIO */
    init() {
        //:EVENTOS
        $("#permissions").addEventListener("click", (event) => permissions.btnClick(event.target));
    },
};

//-BODY FERRAMENTAS NO RODAPÉ
const tools = {
    tableNm: "",
    tableActive: "",

    //.DOM
    dom: {
        /** ///STYLE */
        style(status = [0, 0, 0, 0, 0, 0]) {
            const btns = $$(".tools button");
            const colors = ["btn-secondary", "btn-primary", "btn-danger"];
            status[0] = views.update || permissions.update ? 2 : 0;

            //:DESABILITA TODOS
            btns.forEach((el) => {
                colors.forEach((color) => el.classList.remove(color));
                el.disabled = true;
            });

            //:HABILITA CONFORME STATUS
            btns.forEach((el, index) => {
                el.classList.add(colors[status[index]]);
                el.disabled = status[index] > 0 ? false : true;
            });

            //:SE "views.index" ESTIVER SELECIONADO ATIVA BOTÕES 4-up|5-down
            if (views.index) {
                [4, 5].map((index) => {
                    btns[index].classList.remove("btn-secondary", "btn-primary", "btn-danger");
                    btns[index].classList.add("btn-primary");
                    btns[index].disabled = false;
                });
            }
        },

        /** ///INPUT */
        input(disabled = true) {
            if (views.index) disabled = false;

            $(".tools .input").disabled = disabled;
        },

        /** ///ALL */
        all(status, disabled) {
            this.input(disabled);
            this.style(status);
        },
    },

    /** ///BOTÃO ALTERAR */
    btnUpdate() {
        eval(`method_${tools.tableActive}`)();

        function method_views() {
            const key = $findArray(views.data, "id", views.id).index;
            const input = $(".tools .input").value;

            views.data[key].name = input;

            views.update = true;
            views.dom.all();

            tools.dom.style();
        }

        function method_permissions() {
            permissions.data[permissions.index].name = $(".tools .input").value;
            permissions.update = true;
            permissions.dom.all();

            tools.dom.style([2, 1, 1, 0, 1, 1]);
        }
    },

    /** ///BOTÃO ADICIONAR */
    btnAdd() {
        eval(`method_${tools.tableActive}`)();

        function method_views() {
            views.data.push({
                id: "new",
                name: $(".tools .input").value,
                access: "",
                // ord: (views.data.length + 1).toString(),
            });

            views.update = true;
            views.dom.all();

            tools.dom.style();
        }

        function method_permissions() {
            permissions.data.push({
                id: "new",
                id_views: views.id,
                name: $(".tools .input").value,
                // ord: (permissions.data.length + 1).toString(),
            });

            permissions.update = true;
            permissions.dom.all();

            tools.dom.style([2, 1, 1, 0, 1, 1]);
        }
    },

    /** ///BOTÃO SALVAR */
    btnSave: async function () {
        await $fetch({
            url: "tools/config/permission/permission/update_data",
            par: {
                views: views.update ? views.data : "",
                permissions: permissions.update ? permissions.data : "",
            },
            fnName: "SALVA #579",
        });

        database.get({ getChoice: ["views", "permissions"] });
    },

    /** ///BOTÃO SUBIR */
    btnUp() {
        eval(`method_${tools.tableActive}`)();

        function method_views() {
            if (!views.index) return;
            const vi = views.index;

            //:TROCA A ORDEM
            const memo = views.data[vi - 1];
            views.data[vi - 1] = views.data[vi];
            views.data[vi] = memo;

            //:ATUALIZA O INDEX SELECIONADO
            views.index = vi - 1;

            //:ATUALIZA TELA
            views.update = true;
            views.dom.all();

            //:ATUALIZA BOTÕES
            tools.dom.style([2, 0, 0, 0, 1, 1]);
        }

        function method_permissions() {
            if (!permissions.index) return;
            const pi = permissions.index;

            //:TROCA A ORDEM
            const memo = permissions.data[pi - 1];
            permissions.data[pi - 1] = permissions.data[pi];
            permissions.data[pi] = memo;

            //:ATUALIZA O INDEX SELECIONADO
            permissions.index = pi - 1;

            //:ATUALIZA TELA
            permissions.update = true;
            permissions.dom.all();

            //:ATUALIZA BOTÕES
            tools.dom.style([2, 0, 0, 0, 1, 1]);
        }
    },

    /** ///BOTÃO DESCER */
    btnDown() {
        eval(`method_${tools.tableActive}`)();

        function method_views() {
            if (views.index >= views.data.length - 1) return;
            const vi = views.index;

            //:TROCA A ORDEM
            const memo = views.data[vi + 1];
            views.data[vi + 1] = views.data[vi];
            views.data[vi] = memo;

            //:ATUALIZA O INDEX SELECIONADO
            views.index = vi + 1;

            //:ATUALIZA TELA
            views.update = true;
            views.dom.all();

            //:ATUALIZA BOTÕES
            tools.dom.style([2, 0, 0, 0, 1, 1]);
        }

        function method_permissions() {
            if (permissions.index >= permissions.data.length - 1) return;
            const pi = permissions.index;

            //:TROCA A ORDEM
            const memo = permissions.data[pi + 1];
            permissions.data[pi + 1] = permissions.data[pi];
            permissions.data[pi] = memo;

            //:ATUALIZA O INDEX SELECIONADO
            permissions.index = pi + 1;

            //:ATUALIZA TELA
            permissions.update = true;
            permissions.dom.all();

            //:ATUALIZA BOTÕES
            tools.dom.style([2, 0, 0, 0, 1, 1]);
        }
    },

    /** ///EVENTOS */
    eventClick(target) {
        target = target.closest("button");

        //:VAI P/ MÉTODO CLICADO
        if (target) eval(`this.${target.name}`)();
    },

    /** ///INICIO */
    init() {
        //:EVENTOS
        $(".tools .btnGroup").addEventListener("click", (event) => tools.eventClick(event.target));
        $(".tools .input").addEventListener("keyup", () => tools.dom.all([2, 1, 1, 0, 1, 1], false));
    },
};

//-DATABASE
const database = {
    get: async function (data) {
        let getChoice = data.getChoice;
        let idView = views.id;

        const resp = await $fetch({
            url: "tools/config/permission/permission/get_data",
            par: { getChoice, idView },
            fnName: "BUSCA DADOS #577",
        });

        //SE BUSCOU VIEWS, ATUALIZA.
        if (getChoice.includes("views")) database.set.views(resp.views);

        //SE BUSCOU PERMISSIONS, ATUALIZA.
        if (getChoice.includes("permissions")) database.set.permissions(resp.permissions);
    },

    resset() {
        return;
    },

    set: {
        views(list) {
            views.data = list || {};
            views.update = false;
            // views.index = false;
            views.id = views.id || views.data[0].id;

            tools.tableActive = "views";

            views.dom.all();
        },

        permissions(list) {
            permissions.data = list || {};
            permissions.update = false;
            permissions.index = false;
            permissions.dom.all();
            tools.dom.all();
        },

        all(data) {
            this.views(data.views);
            this.permissions(data.permissions);
        },
    },
};
