export const obj = {
    data: { procedure: {}, optLock: null },
    wauSelect: { category: null },

    database: {
        get: async function () {
            const procedureId = ls.procedureId;

            const resp = await $fetch({
                url: "procedureRegister/getData",
                par: { procedureId },
                fnName: "BUSCA DADOS WAU-0098",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            const optLock = obj.data.optLock;

            //:Data
            const data = { procedure: {} };

            //:Keys de procedure alteradas
            data.procedure = $dataFetchRender(obj.data.procedure);
            if ($isEmpty(data.procedure)) delete data.procedure;

            //:Nada para salvar
            if ($isEmpty(data)) return this.dom();

            //:Fetch
            const resp = await $fetch({
                url: "procedureRegister/setProcedure",
                par: { optLock, data },
                fnName: "SALVA PROCEDIMENTO WAU-0160",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) return this.get();

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        resset(newProcedure = false) {
            ls.set("procedureId", newProcedure ? "new" : 0);

            //:Seta dados
            obj.data.procedure = {};
            obj.data.procedure.id = newProcedure ? "new" : 0;
            obj.data.procedure.id_display = newProcedure ? "new" : "";
            obj.data.optLock = newProcedure ? "new" : "";

            //:Atualiza toda tela
            this.dom();
        },

        set(resp) {
            if (!resp.procedure) return this.resset();

            //:Seta dados
            ls.set("procedureId", resp.procedure.id);

            obj.data.procedure = resp.procedure;
            obj.data.optLock = resp.procedure.optLock;

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            $saveMode.disable();
            obj.left.dom();
        },
    },

    left: {
        newPatient() {
            if (!$permission("164P")) return;

            obj.database.resset("new");
            $requiredMark.set("#register .left");
        },

        dom() {
            const data = obj.data.procedure;

            //:Todos inputs
            const inputs = $$("#register input");
            inputs.forEach((el) => $inputChange(el, data[el.name]));

            //:Textarea
            const textarea = $$("#register textarea");
            textarea.forEach((el) => $inputChange(el, data[el.name]));

            //:Id
            $displayId(data.id_display, data.id);

            //:Ativa/Desativa box de cadastro
            $disableForm(
                "#register .left",
                `#${ls.menuTop} #headerBar .search, #${ls.menuTop} #headerBar .new`,
                data.id,
                "164P",
            );

            $requiredMark.unset("#register .left");
        },

        events(event) {
            const target = event.target;

            $wauSelect.events(obj.wauSelect.category, event, "category", obj.data.procedure);

            switch (event.type) {
                case "click":
                    break;

                default:
                    break;
            }

            //:Target inativo
            if ($check.ch1(target)) return;

            //:Valida tecla precionada
            if ($check.ch2(event)) return;

            //:Alteração em Input|Textarea
            if ($check.ch3(event)) return $inputChange(target, target.value, event.type, obj.data.procedure);
        },
    },

    events(event) {
        if (event.target.closest("#register .left")) return obj.left.events(event);
    },

    headerBar(event) {
        if (event.type !== "click") return;

        //:Buscca procedimento
        if (event.target.closest(".search")) return findProcedure();
        //:Novo procedimento
        if (event.target.closest(".new")) return obj.left.newPatient();
    },

    init() {
        obj.wauSelect.category = $wauSelect.factory("#register", "category", "procedure/find_category");
    },
};
