export const obj = {
    data: {
        user: {}, //:dados do usuário
        viewList: [], //:lista de views
        permList: [], //:lista de permissões
        userPerm: [], //:permissões do usuário
        activityPerm: [], //:permissões das atividades do usuário
        optLock: null,
        sortableChangedRight: false,
    },

    database: {
        get: async function () {
            const activityId = ls.activityId;
            if (activityId > 0) return config.database.get();

            //:Fetch
            const resp = await $fetch({
                url: "userPermission/getData",
                par: {
                    userId: ls.userId,
                    activeView: ls.activeView,
                    permId: ls.permId,
                },
                fnName: "BUSCA DADOS WAU-0014",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            const activityId = ls.activityId;
            if (activityId > 0) return config.database.save();

            const optLock = obj.data.optLock;
            const userId = ls.userId;
            const activeView = ls.activeView;
            const userPerm = $arrayToString(obj.data.userPerm);

            //:Fetch
            const resp = await $fetch({
                url: "userPermission/setUserPerm",
                par: { optLock, userId, activeView, userPerm },
                fnName: "SALVA PERMISSOES WAU-0015",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) return this.get();

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        delete: async function () {
            return cl("DATABASE DELETE");
            if (!$patientId()) return;
            if (!confirm("Deseja realmente excluir esse paciente?")) return;

            //-FETCH
            await $fetch({
                url: "patient/register/patientRegister/delete_patientRegister",
                par: { registerId: $patientId() },
                fnName: "DELETA PACIENTE WAU-0019",
            });
        },

        resset() {
            return cl("DATABASE RESSET");
            $$("#register input").forEach((el) => (el.value = ""));

            //:Seta dados
            ls.set("patientName", "");
            obj.data = {};
            obj.data.id = "Novo";

            //:Atualiza toda tela
            obj.database.dom();
        },

        set(resp) {
            //:Erro ou vazio -> limpa dados
            if (resp.status !== 200) return this.resset();

            //:Seta dados
            ls.set("userId", resp.user.id);
            ls.set("userName", resp.user.name);
            ls.set("activeView", resp.sistem.activeView);
            obj.data.user = resp.user;
            obj.data.viewList = resp.viewList;
            obj.data.permList = resp.permList;
            obj.data.userPerm = $split(resp.user.permissions, ",");
            obj.data.activityPerm = $split(resp.activityPerm, ",");
            obj.data.optLock = resp.user.optLock;

            //:Se mudou alguma permissão do usuário logado, atualiza sessão
            if (resp.sistem.newPermValue) {
                g.perm = resp.sistem.newPermValue;
            }

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            menuTop.name();
            obj.left.renderlist();
            obj.left.btnActivity();
            obj.right.renderlist();

            $saveMode.disable();
        },
    },

    left: {
        renderlist() {
            const tpt = Object.values(obj.data.viewList).map(({ id, name }) => {
                const activeClass = id == ls.activeView ? "active" : "";

                return `
                    <div>
                        <button
                            class="btn btn-item ${activeClass}"
                            data-id="${id}"
                            title="id: ${id}">
                            ${name}
                        </button>
                    </div>`;
            });

            $("#permission .left .list").innerHTML = tpt.join("");
        },

        btnActivity() {
            const btnNode = $("#permission .left .header .btn.activity");
            const btnOn = +obj.data.user.activityPermOn;
            const activeClass = btnOn ? "add" : "remove";
            const activeText = btnOn ? "Ativado" : "Desativado";

            btnNode.classList[activeClass]("active");
            btnNode.textContent = activeText;
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    //:Seleciona view
                    if (target.closest(".btn-item")) return selectView();
                    //:Ativa/desativa permissão de atividades
                    if (target.closest(".header .btn.activity")) return toggleActivityPerm();
                    return;

                default:
                    return;
            }

            function selectView() {
                const id = $numberOnly(target.closest(".btn-item").dataset.id);

                ls.set("activeView", id);

                obj.database.get();
            }

            async function toggleActivityPerm() {
                const optLock = obj.data.optLock;
                const btnOn = +obj.data.user.activityPermOn;
                const activityPermOn = btnOn ? 0 : 1;

                const userId = ls.userId;
                const activeView = ls.activeView;

                //:Fetch
                const resp = await $fetch({
                    url: "userPermission/setActivityPermOnOff",
                    par: { optLock, userId, activeView, activityPermOn },
                    fnName: "SALVA PERMISSOES WAU-0050",
                });

                obj.database.set(resp);
            }
        },
    },

    right: {
        renderlist() {
            const tpt = Object.values(obj.data.permList).map(({ id, name, dev }) => {
                // name = "Acesso ao financeiro do paciente";
                const devIcon = +dev ? '<i class="fa-regular fa-gear-code me-2"></i>' : "";
                const textlength = name.length > 30 ? " long-text" : "";

                let className = "";
                if (obj.data.userPerm.includes(id)) {
                    className = ` active${textlength}`;
                } else if (obj.data.activityPerm.includes(id)) {
                    className = ` activity${textlength}`;
                } else {
                    className = textlength;
                }

                return `
                    <div>
                        <button
                            class="btn btn-item${className}"
                            data-id="${id}"
                            title="id: ${id}">
                            <span>${devIcon}${name}</span>
                        </button>
                    </div>`;
            });

            $("#permission .right .list").innerHTML = tpt.join("");
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    if (target.closest(".btn-item")) return changePerm();
                    return;

                default:
                    return;
            }

            function changePerm() {
                const id = target.closest(".btn-item").dataset.id;

                //:Remove/adiciona permissão
                const index = obj.data.userPerm.indexOf(id);
                if (index > -1) {
                    obj.data.userPerm.splice(index, 1);
                } else {
                    obj.data.userPerm.push(id);
                }

                obj.right.renderlist();

                $saveMode.enable();
            }
        },
    },

    headerBar(event) {
        if (event.type !== "click") return;

        const target = event.target;

        //:Busca usuário
        if (target.closest(".search")) return findUser();
        //:Remove todas as permissões
        if (target.closest(".removeAllPerm")) {
            obj.data.userPerm = [];
            return obj.database.save();
        }

        //:Busca atividades
        if (target.closest(".findActivity")) return config.headerBar.findActivity();
        //:Configura view
        if (target.closest(".btn.configView")) return config.view.show();
        //:Configura permissão
        if (target.closest(".btn.configPerm")) return config.perm.show();
    },

    events(event) {
        const target = event.target;

        //:Eventos de modal
        if (target.closest(".modal")) return config.events(event);

        switch (event.type) {
            case "click":
                if (target.closest(".left")) return obj.left.events(event);
                if (target.closest(".right")) return obj.right.events(event);
                return;

            default:
                return;
        }
    },

    init() {
        //:Inicializa savemode
        $saveMode.init(`#sidebar, #menuTop .right, #headerBar`);
    },
};
