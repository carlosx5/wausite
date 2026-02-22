export const obj = {
    data: { plan: {}, planList: [] },
    dataChanged: [],

    database: {
        get: async function () {
            const planId = ls.planId;

            const resp = await $fetch({
                url: "planRegister/getData",
                par: { planId },
                fnName: "BUSCA DADOS WAU-0186",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            if (!$permission("73P")) return;

            //:Validação
            if ($validate(obj.data.plan.name, "Nome", "alert")) return;

            //:Data
            const data = { plan: {} };

            //:Keys de procedure alteradas
            data.plan = $dataFetchRender(obj.data.plan);
            if ($isEmpty(data.plan)) delete data.plan;

            //:Nada para salvar
            if ($isEmpty(data)) return this.dom();

            //:Fetch
            const resp = await $fetch({
                url: "planRegister/setPlan",
                par: { data },
                fnName: "SALVA PLANO WAU-0187",
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
            ls.set("planId", "new");

            obj.data.plan = {};
            obj.data.plan.id = "new";

            this.dom();
        },

        set(resp) {
            //:Seta dados
            obj.data.plan = resp.plan;
            obj.data.planList = resp.planList;

            ls.set("planId", resp.plan?.id || "");
            ls.set("planName", resp.plan?.name || "");

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
            const data = obj.data.plan || {};

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
            if ($check.ch3(event)) return $inputChange(target, target.value, event.type, obj.data.plan);
        },
    },

    right: {
        dom() {
            const html = obj.data.planList.map((plan) => {
                return `
                    <tr data-id="${plan.id}">
                        <td>${plan.name}</td>
                    </tr>
                `;
            });

            $("#register .right tbody").innerHTML = html.join("");
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    if (target.closest("tr")) return setPlan();
                    break;

                default:
                    return;
            }

            function setPlan() {
                ls.set("planId", target.closest("tr").dataset.id);
                obj.database.get();
            }
        },
    },

    newPlan() {
        //:Limpa campos
        $$("#register input").forEach((el) => (el.value = ""));

        //:Seta id como "Novo"
        $maskInput($n("#register, id"), "Novo", "change", "register");

        ls.set("planId", "Novo");
    },

    headerBar(event) {
        //:Botão novo plano
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
