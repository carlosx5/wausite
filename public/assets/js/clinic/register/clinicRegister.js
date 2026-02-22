export const obj = {
    data: { clinic: {}, optLock: null },

    database: {
        get: async function () {
            const clinicId = ls.clinicId;

            const resp = await $fetch({
                url: "clinicRegister/getData",
                par: { clinicId },
                fnName: "BUSCA DADOS WAU-0161",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            const optLock = obj.data.optLock;
            const reg = obj.data.clinic;

            //:Validação
            if ($validate(reg.name_corporate, "Rasão Social", "alert")) return;
            if ($validate(reg.name_trading, "Nome Fantasia", "alert")) return;
            if ($validate(reg.name_social, "Nome curto", "alert")) return;

            //:Data
            const data = { clinic: {} };

            //:Keys de clinic alteradas
            data.clinic = $dataFetchRender(reg);
            if ($isEmpty(data.clinic)) delete data.clinic;

            if ($isEmpty(data)) return this.dom();

            //:Fetch
            const resp = await $fetch({
                url: "clinicRegister/setClinic",
                par: { optLock, data },
                fnName: "SALVA REGISTRO WAU-0167",
            });

            //:Seta dados
            this.set(resp);
        },

        resset(newRegister = false) {
            //:Seta dados
            ls.set("clinicId", newRegister ? "new" : 0);

            //:Seta dados
            obj.data.clinic = {};
            const data = obj.data.clinic;
            data.id = newRegister ? "new" : 0;
            data.id_display = newRegister ? "new" : "";
            data.id_clinic = newRegister ? cookie.get("log_clinicId") : 0;
            data.nm_clinic = newRegister ? cookie.get("log_clinicName") : "";
            data.phone_ddi = newRegister ? "55" : "";

            //:Atualiza toda tela
            this.dom();
        },

        set(resp) {
            //:Erro ou vazio -> limpa dados
            if (resp.status !== 200 || !resp.clinic?.id > 0) return this.resset();

            //:Seta dados
            ls.set("clinicId", resp.clinic.id);
            obj.data.clinic = resp.clinic;
            obj.data.optLock = resp.clinic.optLock;

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            // menuTop.name();
            $saveMode.disable();
            obj.dom();
        },
    },

    dom() {
        const data = obj.data.clinic;

        //:Todos inputs que tenham attribute name
        const list = $$("#register .left input, #register .left select");
        const inputs = Array.from(list).filter((el) => el.hasAttribute("name"));
        inputs.forEach((el) => $inputChange(el, data[el.name]));
        $displayId(data.id_display, data.id);

        //:Ativa/Desativa box de cadastro
        $disableForm("#register .left", `#${ls.menuTop} #headerBar .search, #${ls.menuTop} #headerBar .new`, data.id, 75);

        $requiredMark.unset("#register .left");
    },

    headerBar(event) {
        if (event.type !== "click") return;

        //:Botão buscar clínica
        if (event.target.closest(".search")) return findClinic();
    },

    events(event) {
        const target = event.target;

        //:Target inativo
        if ($check.ch1(target)) return;

        //:Valida tecla precionada
        if ($check.ch2(event)) return;

        //:Alteração em Input|Textarea
        if ($check.ch3(event)) return $inputChange(target, target.value, event.type, obj.data.clinic);
    },

    init() {
        //:Inicializa savemode
        const selectors = `.navbar, #menuTop .right, .headerBar .generic`;
        $saveMode.init(selectors);

        //:Inicializa CEP
        $m.zip.init({ zipInput: "#address_zip", database: "$m.register.data.clinic" });
    },
};
