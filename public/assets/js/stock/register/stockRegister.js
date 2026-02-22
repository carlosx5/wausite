export const obj = {
    data: { register: {} },

    database: {
        get: async function () {
            //:Fetch
            const resp = await $fetch({
                url: "stock/register/stockRegister/getData",
                par: { stockId: ls.stockId },
                fnName: "BUSCA ESTOQUE #690",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            const reg = obj.data.register;

            //:Validação
            if ($validate(reg.name, "Nome", "alert")) return;
            if ($validate(reg.id_category, "Categoria", "alert")) return;

            const stockId = ls.stockId;

            //:Data
            const data = {
                register: {},
            };

            //:Keys de register alteradas
            data.register = $dataFetchRender(reg);
            if ($isEmpty(data.register)) delete data.register;

            //:Erro no ID
            if (data.register.id !== stockId) return $toast("O registro de estoque não corresponde ao atual!", "warning");

            if ($isEmpty(data)) return this.dom();

            //:Fetch
            const resp = await $fetch({
                url: "stock/register/stockRegister/setRegister",
                par: { stockId, data },
                fnName: "SALVA PACIENTE #520",
            });

            //:Mensagem de status
            const bodyText = resp.status === 200 ? "Alterações salvas com sucesso!" : "Ocorreu um erro ao salvar!";
            $toast(bodyText, "warning");

            //:Seta dados
            this.set(resp);
        },

        delete: async function () {
            return cl("PARADO");
            if (!$patientId()) return;
            if (!confirm("Deseja realmente excluir esse paciente?")) return;

            //-FETCH
            await $fetch({
                url: "patient/register/patientRegister/delete_patientRegister",
                par: { registerId: $patientId() },
                fnName: "DELETA PACIENTE #517",
            });
        },

        resset(newRegister = false) {
            ls.set("stockId", newRegister ? "new" : 0);
            ls.set("stockName", "");

            //:Seta dados
            obj.data.register = {};
            obj.data.register.id = newRegister ? "new" : 0;
            obj.data.register.displayId = newRegister ? "new" : 0;

            //:Atualiza toda tela
            this.dom();
        },

        set(resp) {
            //:Erro ou vazio -> limpa dados
            if (resp.status !== 200 || $isEmpty(resp?.register?.id)) return this.resset();

            //:Seta dados
            ls.set("stockId", resp.localStorage.stockId);
            ls.set("stockName", resp.localStorage.stockName);
            obj.data.register = resp.register || {};

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            menuTop.name();
            $saveMode.disable();
            obj.registerMain.dom();
        },
    },

    registerMain: {
        dom() {
            const data = obj.data.register;

            $("#menuTop .left").style.display = "flex";

            //:Todos inputs
            const list = $$("#register .unique-main input, #register .unique-main select");
            list.forEach((el) => $inputChange(el, data[el.name]));
            $displayId(data.id_display);

            //:Botão "Novo Estoque"
            $("#register #headerBar .new").disabled = !$permission(11, 0);

            //:Ativa/Desativa box de cadastro
            $disableForm(
                "#register .content-main",
                `#${ls.menuTop} #headerBar .search, #${ls.menuTop} #headerBar .new`,
                data.id,
                11
            );
        },

        events(event) {
            const target = event.target;

            //:Target inativo
            if ($check.ch1(target)) return;

            //:Valida tecla precionada
            if ($check.ch2(event)) return;

            //:Alteração em Input|Textarea
            if ($check.ch3(event)) return $inputChange(target, target.value, event.type, obj.data.register);
        },
    },

    headerBar(event) {
        if (event.type !== "click") return;

        //:Botão buscar estoque
        if (event.target.closest(".search")) return findStock();

        //:Botão novo estoque
        if (event.target.closest(".new")) return obj.database.resset("new");
    },

    events(event) {
        //:Evento em cadastro
        if (event.target.closest(".unique-main")) return obj.registerMain.events(event);
    },

    init() {
        //:Inicializa savemode
        $saveMode.init(`.navbar, #menuTop .right, .headerBar`);
    },
};
