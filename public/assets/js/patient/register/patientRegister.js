export const obj = {
    data: { patient: {}, optLock: null },

    database: {
        get: async function () {
            const patientId = $patientId();

            //:Fetch
            const resp = await $fetch({
                url: "patientRegister/getData",
                par: { patientId },
                fnName: "BUSCA PACIENTE WAU-0151",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            const optLock = obj.data.optLock;
            const reg = obj.data.patient;

            //:Validação
            if ($validate(reg.name, "Nome", "alert")) return;
            if ($validate(reg.name_social, "Nome Social", "alert")) return;
            if ($validate(reg.name_prefix, "Prefixo", "alert")) return;
            if ($validate(reg.phone_ddi, "DDI do telefone", "alert")) return;
            if ($validate(reg.phone_number, "Telefone", "alert")) return;
            if ($validate(reg.email, "Email", "alert")) return;
            if ($validate(reg.id_clinic, "Clínica", "alert")) return;

            //:Data
            const data = {
                patient: {},
            };

            //:Keys de patient alteradas
            data.patient = $dataFetchRender(reg);
            if ($isEmpty(data.patient)) delete data.patient;

            //:Nada para salvar
            if ($isEmpty(data)) return this.dom();

            //:Erro no ID
            if (data?.patient?.id !== $patientId())
                return $toast("O registro do paciente não corresponde ao atual!", "warning");

            //:Fetch
            const resp = await $fetch({
                url: "patientRegister/setData",
                par: { optLock, data },
                fnName: "SALVA PACIENTE WAU-0153",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) return this.get();

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        delete: async function () {
            if (!$patientId()) return;
            if (!confirm("Deseja realmente excluir esse paciente?")) return;

            //-FETCH
            await $fetch({
                url: "patientRegister/delPatient",
                par: { patientId: $patientId() },
                fnName: "DELETA PACIENTE WAU-0152",
            });
        },

        resset(newPatient = false) {
            $patientId(newPatient ? "new" : 0);
            ls.set("patientName", "");

            //:Seta dados
            obj.data.patient = {};
            obj.data.patient.id = newPatient ? "new" : 0;
            obj.data.patient.id_display = newPatient ? "new" : "";
            obj.data.patient.id_clinic = newPatient ? cookie.get("log_clinicId") : 0;
            obj.data.patient.nm_clinic = newPatient ? cookie.get("log_clinicName") : "";
            obj.data.patient.phone_ddi = newPatient ? "55" : "";
            obj.data.optLock = newPatient ? "new" : "";

            //:Atualiza toda tela
            this.dom();
        },

        set(resp) {
            //:Erro ou vazio -> limpa dados
            if (resp.status !== 200 || !resp.patient?.id > 0) return this.resset();

            //:Seta dados
            $patientId(resp.patient.id);
            ls.set("patientName", resp.patient.name);
            obj.data.patient = resp.patient;
            obj.data.optLock = resp.patient.optLock;

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            $m.menuTop.set(obj.data.patient);

            $saveMode.disable();
            obj.dom();
        },
    },

    newPatient() {
        obj.database.resset("new");
        $requiredMark.set("#register .left");
    },

    find(option) {
        const methods = { clinic };
        if (methods[option]) methods[option]();

        function clinic() {
            if (!$permission(96)) return;

            $findModule.init({
                urn: "patientLibraries/patientClinic",
                title: "Busca Clínica",
                tptTexts: { col2: "Clínica" },
                columnsQuantity: 2,
                width: "450px",
                callback: (data) => {
                    $inputChange($n("#register, id_clinic"), data.id, false, obj.data.patient);
                    $inputChange($n("#register, nm_clinic"), data.col2);
                },
            });
        }
    },

    dom() {
        const data = obj.data.patient;

        //:Todos inputs
        $$("#register input, #register select").forEach((el) => $inputChange(el, data[el.name]));
        $displayId(data.id_display, data.id);

        //:Prefixo de nome
        $inputChange($n("#register, name_prefix"), data.name_prefix);

        //:Botão para alterar clínica
        $(".btnChangeClinic").disabled = $permission(96, 0) && data.id !== "new" ? false : true;

        //:Botão "Novo paciente"
        $("#register #headerBar .new").disabled = !$permission(71, 0);

        //:Ativa/Desativa box de cadastro
        $disableForm("#register .left", `#${ls.menuTop} #headerBar .search, #${ls.menuTop} #headerBar .new`, data.id, "71P");

        $requiredMark.unset("#register .left");
    },

    headerBar(event) {
        if (event.type !== "click") return;

        //:Botão buscar paciente
        if (event.target.closest(".search")) return findPatient();
        //:Botão novo paciente
        if (event.target.closest(".new")) return obj.newPatient();
        //:Botão deletar paciente
        // if (target.closest(".delete")) return obj.database.delete();
    },

    events(event) {
        const target = event.target;

        switch (event.type) {
            case "click":
                if (target.closest(".headerBar")) return this.headerBar(target);
                if (target.closest(".btnChangeClinic")) return obj.find("clinic");
                if (target.closest(".btnNameShort"))
                    return $inputChange($n("name_social"), $n("name").value, "change", obj.data.patient);
                break;

            case "change":
                if (target.closest(".cpf")) cpfChange();
                break;

            default:
                break;
        }

        //:Target inativo
        if ($check.ch1(target)) return;

        //:Valida tecla precionada
        if ($check.ch2(event)) return;

        //:Alteração em Input|Textarea
        if ($check.ch3(event)) return $inputChange(target, target.value, event.type, obj.data.patient);

        async function cpfChange() {
            const cpf = target.value;

            if (cpf.length !== 14) return;

            const resp = await $fetch({
                url: "patientRegister/checkCpf",
                par: { cpf },
                overlay: false,
                fnName: "CHECA CPF WAU-0182",
            });

            if (resp.patient?.id > 0) return obj.messages.duplicateCpf(resp);
        }
    },

    messages: {
        duplicateCpf(resp) {
            $messageModal({
                color: "warning",
                title: "CPF já cadastrado",
                text1: `O sistema identificou que esse CPF já está cadastrado em nome de: <b>${resp.patient.name}</b>.`,
                text2: `Não é permitido cadastrar o mesmo CPF para mais de um paciente.`,
                btn: [
                    { text: "Visualizar cadastro", color: "primary", dataset: "goRegister" },
                    { text: "Fechar", color: "secondary", dataset: "exit" },
                ],
                btnWidth: "170px",
                timer: false,
                callback: async (dtback) => {
                    if (dtback !== "goRegister") return;

                    $patientId(resp.patient.id);
                    obj.database.get();
                },
            });
        },
    },

    init() {
        //:Inicializa savemode
        $saveMode.init(`.navbar, #menuTop .right, #register #headerBar .menu`);

        //:Inicializa CEP
        $m.zip.init({ zipInput: "#address_zip", database: "$m.register.data.patient" });
    },
};
