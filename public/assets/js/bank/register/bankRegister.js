export const obj = {
    data: { bank: {}, bankList: [] },
    dataChanged: [],

    database: {
        get: async function () {
            const bankId = ls.bankId;

            const resp = await $fetch({
                url: "bankRegister/getData",
                par: { bankId },
                fnName: "BUSCA DADOS #685",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            if (!$permission("68P")) return;

            //:Validação
            if ($validate(obj.data.bank.name, "Nome", "alert")) return;

            //:Data
            const data = { bank: {} };

            //:Keys de procedure alteradas
            data.bank = $dataFetchRender(obj.data.bank);
            if ($isEmpty(data.bank)) delete data.bank;

            //:Nada para salvar
            if ($isEmpty(data)) return this.dom();

            //:Fetch
            const resp = await $fetch({
                url: "bankRegister/setBank",
                par: { data },
                fnName: "SALVA BANCO WAU-0175",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) return this.get();

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        change(elNode, saveMode = true) {
            //:Inclui campo na lista de campos a serem salvos
            if (!obj.dataChanged.includes(elNode.name)) obj.dataChanged.push(elNode.name);

            //:Atualiza "data" com o valor do elemento
            obj.data.register[elNode.name] = elNode.classList.contains("val")
                ? $numberOnly(elNode.value)
                : (obj.data.register[elNode.name] = elNode.value);

            //:Ativa modo salvar
            if (saveMode) $saveMode.show();
        },

        setNew() {
            ls.set("bankId", "new");

            obj.data.bank = {};
            obj.data.bank.id = "new";

            this.dom();
        },

        set(resp) {
            //:Seta dados
            obj.data.bank = resp.bank;
            obj.data.bankList = resp.bankList;

            ls.set("bankId", resp.bank?.id || "");
            ls.set("bankName", resp.bank?.name || "");

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            $saveMode.disable();
            obj.left.dom();
            obj.right.dom();
        },
    },

    left: {
        dom() {
            const data = obj.data.bank || {};

            //:Todos inputs
            const inputs = $$("#register .left input");
            inputs.forEach((el) => $inputChange(el, data[el.name]));

            //:Ativa/Desativa box de cadastro
            $disableForm(
                "#register .left",
                `#${ls.menuTop} #headerBar .search, #${ls.menuTop} #headerBar .new`,
                data.id,
                "58P",
            );

            $requiredMark.unset("#register .left");
        },

        events(event) {
            const target = event.target;

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
            if ($check.ch3(event)) return $inputChange(target, target.value, event.type, obj.data.bank);
        },
    },

    right: {
        dom() {
            const html = obj.data.bankList.map((bank) => {
                return `
                    <tr data-id="${bank.id}">
                        <td>${bank.name}</td>
                    </tr>
                `;
            });

            $("#register .right tbody").innerHTML = html.join("");
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    if (target.closest("tr")) return setBank();
                    break;

                default:
                    return;
            }

            function setBank() {
                ls.set("bankId", target.closest("tr").dataset.id);
                obj.database.get();
            }
        },
    },

    newBank() {
        //:Limpa campos
        $$("#register input").forEach((el) => (el.value = ""));

        //:Seta id como "Novo"
        $maskInput($n("#register, id"), "Novo", "change", "register");

        //:Seta clínica do login
        $maskInput($n("#register, id_clinic"), cookie.get("log_clinicId"), "change", "register");
        $n("#register, clinicName").value = cookie.get("log_clinicName");

        ls.set("bankId", "Novo");
    },

    changeClinic() {
        if (!$permission(55)) return;

        $findModule.init({
            urn: "clinic/clinicFind/find",
            title: "Busca Clínica",
            tptTexts: { col2: "Clinica" },
            columnsQuantity: 2,
            width: "500px",
            callback: (par) => {
                $n("#register, id_clinic").value = par.id;
                $n("#register, clinicName").value = par.col2;
            },
        });
    },

    headerBar(event) {
        //:Botão novo banco
        if (event.target.closest(".new")) return obj.database.setNew();
    },

    events(event) {
        if (event.target.closest(".left")) return obj.left.events(event);
        if (event.target.closest(".right")) return obj.right.events(event);
    },

    init() {
        //:Inicializa savemode
        const selectors = `.navbar, #menuTop .right, .headerBar .generic`;
        $saveMode.init(selectors);
    },
};
