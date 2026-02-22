export const obj = {
    data: {},
    dataChanged: [],

    database: {
        get: async function () {
            const resp = await $fetch({
                url: "clinic/register/clinicRegister/getData",
                par: { clinicId: ls.clinicId },
                fnName: "BUSCA DADOS #582",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            //:Validação
            if ($validate(obj.data.name_corporate, "Rasão Social", "alert")) return;
            if ($validate(obj.data.name_trading, "Nome Fantasia", "alert")) return;
            if ($validate(obj.data.name_social, "Nome curto", "alert")) return;

            //:Data
            const data = {};
            obj.dataChanged.forEach((field) => (data[field] = obj.data[field]));

            //:Fetch
            const resp = await $fetch({
                url: "clinic/register/clinicRegister/saveRegister",
                par: {
                    clinicId: ls.clinicId,
                    data,
                },
                fnName: "SALVA REGISTRO #585",
            });

            //:ATUALIZA TABELA
            if (resp.refresh) return location.reload();

            //:Seta dados
            this.set(resp);

            //:Desativa savemode
            $saveMode.hide(resp.status);
        },

        change(elNode, saveMode = true) {
            //:INCLUI CAMPO NA LISTA DE CAMPOS A SEREM SALVOS
            if (!obj.dataChanged.includes(elNode.name)) obj.dataChanged.push(elNode.name);

            //:ATUALIZA "DATA" COM O VALOR DO ELEMENTO number|string
            const value = elNode.getAttribute("mask") == "number" ? $numberOnly(elNode.value) : elNode.value;
            obj.data[elNode.name] = value;

            //:ATIVA O MODO SALVAR
            if (saveMode) $saveMode.show();
        },

        resset() {
            //:Seta dados
            ls.set("clinicId", 0);
            ls.set("clinicName", "");
            obj.dataChanged = [];
            obj.data = {};
            obj.data.id = "Novo";

            //:Atualiza toda tela
            obj.dom.all();
        },

        set(resp) {
            //:Erro ou vazio -> limpa dados
            if (resp.status !== 200 || !resp.register?.id > 0) return this.resset();

            //:Seta dados
            ls.set("clinicId", resp.localStorage.clinicId);
            ls.set("clinicName", resp.localStorage.clinicName);
            obj.dataChanged = [];
            obj.data = resp.register || {};

            //:Atualiza toda tela
            obj.dom.all();
        },
    },

    dom: {
        form() {
            $$("#register input").forEach((el) => $maskInput(el, obj.data[el.name]));
            $$("#register select").forEach((el) => $maskInput(el, obj.data[el.name]));

            //:DDI bandeira
            if (obj.data.phone_flag1 || obj.data.phone_flag2) {
                $ddi.domFlag($(".phone-home img"), obj.data.phone_flag1, obj.data.phone_flag2);
            }

            //:DDI bandeira do sistema
            if (obj.data.sistemPhoneFlag1 || obj.data.sistemPhoneFlag2) {
                $ddi.domFlag($(".phone-sistem img"), obj.data.sistemPhoneFlag1, obj.data.sistemPhoneFlag2);
            }
        },

        all() {
            menuTop.name();
            this.form();
        },
    },

    headerBar(target) {
        //:Botão buscar clínica
        if (target.closest(".search")) return searchClinic();
        //:Botão salvar
        if (target.closest(".save")) return obj.database.save();
        //:Botão cancelar
        if (target.closest(".cancel")) {
            $m.permission.database.get();
            $saveMode.hide(); //:Desativa savemode
            return;
        }
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

            //:DDI
            if (target.closest(".phone-home .container-ddi")) return $ddi.start(target);
            //:DDI sistema
            if (target.closest(".phone-sistem .container-ddi")) return $ddi.start(target);
        }
    },

    init() {
        //:Inicializa savemode
        const selectors = `.navbar, #menuTop .right, .headerBar .generic`;
        $saveMode.init(selectors);

        //:Inicializa CEP
        $m.zip.init({ zipInput: "#address_zip", changeEvents: "register" });
    },
};
