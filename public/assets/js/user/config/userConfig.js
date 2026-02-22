export const obj = {
    data: { user: {} },

    database: {
        get: async function () {
            const userId = ls.userId;

            //:fetch
            const resp = await $fetch({
                url: "userConfig/getData",
                par: { userId },
                fnName: "BUSCA DADOS WAU-0043",
            });

            //:Seta dados
            this.set(resp);
        },

        resset() {
            //:Seta dados
            ls.set("userId", 0);
            ls.set("userName", "");
            obj.data.user = {};

            //:Atualiza toda tela
            this.dom();
        },

        set(resp) {
            //:Erro ou vazio -> limpa dados
            if (resp.status !== 200 || $numberOnly(resp.user?.id) < 1) return this.resset();

            //:Seta dados
            ls.set("userId", resp.user.id);
            ls.set("userName", resp.user.name);
            obj.data.user = resp.user || {};

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            menuTop.name();
            obj.left.dom();
        },
    },

    left: {
        dom() {
            //:Botão logout
            // const btnLogoutNode = $(".left .logout-box .btn.logout");
            // const disabled = ls.userId == cookie.get("log_userId") ? false : true;
            // btnLogoutNode.disabled = disabled;

            //:Cadastro
            const inputsNode = $$(".left .register input");
            inputsNode.forEach((input) => {
                const field = input.name;
                input.value = obj.data.user[field] || "";
            });
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    //:Editar módulo
                    if (target.closest(".btn.logout")) return logout();
                    return;

                default:
                    return;
            }

            async function logout() {
                const resp = await $fetch({
                    url: "login/doLogout",
                    overlay: false,
                    fnName: "FAZ LOGOUT WAU-0038",
                });

                if (resp?.status === 200) {
                    window.location.href = "login";
                }
            }
        },
    },

    right: {
        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    //:Alterar tema
                    if (target.closest(".theme .btn")) return theme();
                    return;

                default:
                    return;
            }

            async function theme() {
                const userId = ls.userId;
                const color = target.closest(".btn").dataset.color;

                const resp = await $fetch({
                    url: "userConfig/colorChange",
                    par: { userId, color },
                    fnName: "BUSCA DADOS WAU-0039",
                });

                if (resp?.status === 200) location.reload();
            }
        },
    },

    events(event) {
        const target = event.target;

        //:Esquerda
        if (target.closest(".left")) return obj.left.events(event);
        //:Direita
        if (target.closest(".right")) return obj.right.events(event);
    },

    init() {},
};
