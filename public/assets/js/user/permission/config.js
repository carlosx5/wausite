//:Importa SortableJS, cria um elemento "script" e inclui no head
if (typeof Sortable === "undefined") {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js";
    document.head.appendChild(script);

    script.onload = function () {
        config.init();
    };
}

const config = {
    database: {
        get: async function () {
            const activityId = ls.activityId;
            const activeView = ls.activeView;

            const resp = await $fetch({
                url: "userPermission/getActivity",
                par: { activityId, activeView },
                fnName: "BUSCA DADOS WAU-0045",
            });

            this.set(resp);
        },

        save: async function () {
            const activityId = ls.activityId;
            const activeView = ls.activeView;
            const activityPerm = $arrayToString($m.permission.data.userPerm);

            //:Fetch
            const resp = await $fetch({
                url: "userPermission/setActivity",
                par: { activityId, activeView, activityPerm },
                fnName: "SALVA PERMISSOES WAU-0046",
            });

            this.set(resp);
        },

        set(resp) {
            //:Seta dados
            $m.permission.data.viewList = resp.viewList;
            $m.permission.data.permList = resp.permList;
            $m.permission.data.userPerm = $split(resp.activity.permissions, ",");
            $m.permission.data.activityPerm = [];

            //:Atualiza toda tela
            this.dom(resp);
        },

        dom(resp) {
            $("#menuTop .name").value = resp.activity.name;
            $m.permission.left.renderlist();
            $m.permission.right.renderlist();

            $saveMode.disable();
        },
    },

    view: {
        btnSelected: null,

        show() {
            //:Limpa seleção anterior
            const inputNode = $("#permission .modal.config-view .tools input");
            inputNode.value = "";
            config.view.btnSelected = null;
            this.domBtns.btnUpdateEnable(true);
            this.domBtns.btnNewEnable(true);
            this.domBtns.btnSaveEnable(true);

            //:Renderiza lista de permissões
            this.renderlist();

            $modalOpen("#permission .modal.config-view");
        },

        renderlist() {
            const tpt = Object.values($m.permission.data.viewList).map(({ id, name }) => {
                return `
                    <div>
                        <button
                            class="btn btn-item"
                            data-id="${id}"
                            title="id: ${id}">
                            <span>${name}</span>
                        </button>
                    </div>`;
            });

            $("#permission .modal.config-view .list").innerHTML = tpt.join("");
        },

        domBtns: {
            btnUpdateEnable(value) {
                $("#permission .modal.config-view .btn.update").disabled = value;
            },

            btnNewEnable(value) {
                $("#permission .modal.config-view .btn.new").disabled = value;
            },

            btnSaveEnable(value) {
                $("#permission .modal.config-view .btn.save").disabled = value;
            },
        },

        save: async function () {
            const userId = ls.userId;
            const activeView = ls.activeView;

            //:Cria lista de views
            const btnsNode = $$("#permission .modal.config-view .list .btn-item");
            const viewList = Array.from(btnsNode).map((btn, index) => {
                const id = btn.dataset.id;
                const name = btn.querySelector("span").textContent;
                const ord = index + 1;
                return { id, name, ord };
            });

            //:Fetch
            const resp = await $fetch({
                url: "userPermission/setViewConfig",
                par: { userId, activeView, viewList },
                fnName: "SALVA VIEWS WAU-0020",
            });

            $m.permission.database.set(resp);

            $modalClose("#permission .modal.config-view");
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    if (target.closest(".btn.btn-item")) return selectItem();
                    if (target.closest(".btn.update")) return btnUpdate();
                    if (target.closest(".btn.new")) return btnNew();
                    if (target.closest(".btn.save")) return this.save();
                    return;

                case "keyup":
                    if (target.closest(".tools input")) return config.view.domBtns.btnNewEnable();
                    return;

                default:
                    return;
            }

            function selectItem() {
                //:Remove classe do botão selecionado anteriormente
                if (config.view.btnSelected) {
                    config.view.btnSelected.querySelector(".btn-item").classList.remove("active");
                }

                //:Seleciona novo botão
                config.view.btnSelected = target.closest("div");

                //:Adiciona classe ao novo botão selecionado
                config.view.btnSelected.querySelector(".btn-item").classList.add("active");

                //:Preenche input com o nome do botão selecionado
                const inputNode = $("#permission .modal.config-view .tools input");
                const textContent = target.closest(".btn-item").querySelector("span").textContent;
                inputNode.value = textContent;

                config.view.domBtns.btnUpdateEnable(false);
                config.view.domBtns.btnNewEnable(false);
            }

            function btnUpdate() {
                const inputNode = $("#permission .modal.config-view .tools input");
                const spanNode = config.view.btnSelected.querySelector("span");
                spanNode.textContent = inputNode.value;

                config.view.domBtns.btnSaveEnable(false);
            }

            function btnNew() {
                const name = $("#permission .modal.config-view .tools input").value;
                const html = `
                    <div>
                        <button
                            class="btn btn-item"
                            data-id="0"
                            title="id: new">
                            <span>${name}</span>
                        </button>
                    </div>`;

                const listNode = $("#permission .modal.config-view .list");
                listNode.insertAdjacentHTML("beforeend", html);

                config.view.domBtns.btnSaveEnable(false);
            }
        },
    },

    perm: {
        btnSelected: null,

        show() {
            //:Limpa seleção anterior
            const inputNode = $("#permission .modal.config-perm .tools input");
            inputNode.value = "";
            config.perm.btnSelected = null;
            this.domBtns.btnUpdateEnable(true);
            this.domBtns.btnNewEnable(true);
            this.domBtns.btnSaveEnable(true);

            //:Renderiza lista de permissões
            this.renderlist();

            $modalOpen("#permission .modal.config-perm");
        },

        renderlist() {
            const tpt = Object.values($m.permission.data.permList).map(({ id, name, dev }) => {
                const devIcon = +dev ? '<i class="fa-regular fa-gear-code me-2"></i>' : "";

                return `
                    <div>
                        <button
                            class="btn btn-item"
                            data-id="${id}"
                            title="id: ${id}">
                            ${devIcon}<span>${name}</span>
                        </button>
                    </div>`;
            });

            $("#permission .modal.config-perm .list").innerHTML = tpt.join("");
        },

        domBtns: {
            btnUpdateEnable(value) {
                $("#permission .modal.config-perm .btn.update").disabled = value;
            },

            btnNewEnable(value) {
                $("#permission .modal.config-perm .btn.new").disabled = value;
            },

            btnSaveEnable(value) {
                $("#permission .modal.config-perm .btn.save").disabled = value;
            },
        },

        save: async function () {
            const userId = ls.userId;
            const activeView = ls.activeView;

            //:Cria lista de permissões
            const btnsNode = $$("#permission .modal.config-perm .list .btn-item");
            const permList = Array.from(btnsNode).map((btn, index) => {
                const id = btn.dataset.id;
                const id_view = ls.activeView;
                const name = btn.querySelector("span").textContent;
                const ord = index + 1;
                return { id, id_view, name, ord };
            });

            //:Fetch
            const resp = await $fetch({
                url: "userPermission/setPermConfig",
                par: { userId, activeView, permList },
                fnName: "SALVA PERMISSOES WAU-0047",
            });

            $m.permission.database.set(resp);

            $modalClose("#permission .modal.config-perm");
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    if (target.closest(".btn.btn-item")) return selectItem();
                    if (target.closest(".btn.update")) return btnUpdate();
                    if (target.closest(".btn.new")) return btnNew();
                    if (target.closest(".btn.save")) return this.save();
                    return;

                case "keyup":
                    if (target.closest(".tools input")) return config.perm.domBtns.btnNewEnable();
                    return;

                default:
                    return;
            }

            function selectItem() {
                //:Remove classe do botão selecionado anteriormente
                if (config.perm.btnSelected) {
                    config.perm.btnSelected.querySelector(".btn-item").classList.remove("active");
                }

                //:Seleciona novo botão
                config.perm.btnSelected = target.closest("div");

                //:Adiciona classe ao novo botão selecionado
                config.perm.btnSelected.querySelector(".btn-item").classList.add("active");

                //:Preenche input com o nome do botão selecionado
                const inputNode = $("#permission .modal.config-perm .tools input");
                const textContent = target.closest(".btn-item").querySelector("span").textContent;
                inputNode.value = textContent;

                config.perm.domBtns.btnUpdateEnable(false);
                config.perm.domBtns.btnNewEnable(false);
            }

            function btnUpdate() {
                const inputNode = $("#permission .modal.config-perm .tools input");
                const spanNode = config.perm.btnSelected.querySelector("span");
                spanNode.textContent = inputNode.value;

                config.perm.domBtns.btnSaveEnable(false);
            }

            function btnNew() {
                const name = $("#permission .modal.config-perm .tools input").value;
                const html = `
                    <div>
                        <button
                            class="btn btn-item"
                            data-id="0"
                            title="id: new">
                            <span>${name}</span>
                        </button>
                    </div>`;

                const listNode = $("#permission .modal.config-perm .list");
                listNode.insertAdjacentHTML("beforeend", html);

                config.perm.domBtns.btnSaveEnable(false);
            }
        },
    },

    headerBar: {
        //:Renderiza botões de configuração na headerBar
        renderBtns() {
            const html = `
                <button class="btn btn-headerBar config findActivity">
                    <i class="fa-light fa-folder-open"></i>
                    Busca atividades
                </button>
                <button class="btn btn-headerBar config configView">
                    <i class="fa-light fa-gear"></i>
                    Configura views
                </button>
                <button class="btn btn-headerBar config configPerm">
                    <i class="fa-light fa-gear"></i>
                    Configura permissões
                </button>`;

            const target = $("#permission #headerBar .menu");
            target.insertAdjacentHTML("beforeend", html);
        },

        findActivity() {
            $findModule.init({
                urn: "userLibraries/find_activity",
                title: "Busca Atividade",
                tptTexts: { col2: "Atividade" },
                columnsQuantity: 2,
                width: "500px",
                callback: (par) => {
                    ls.set("activityId", par.id);

                    config.database.get();
                },
            });
        },
    },

    events(event) {
        const target = event.target;

        if (target.closest(".modal.config-view")) return config.view.events(event);
        if (target.closest(".modal.config-perm")) return config.perm.events(event);
    },

    init() {
        //:Sortable para botões das views
        const view = $("#permission .modal.config-view .list");
        new Sortable(view, {
            animation: 150,
            ghostClass: "blue-background-class",

            onUpdate: async function (event) {
                config.view.domBtns.btnSaveEnable(false);
            },
        });

        //:Sortable para botões das permissões
        const perm = $("#permission .modal.config-perm .list");
        new Sortable(perm, {
            animation: 150,
            ghostClass: "blue-background-class",

            onUpdate: async function (event) {
                config.perm.domBtns.btnSaveEnable(false);
            },
        });

        config.headerBar.renderBtns();
    },
};
