export const obj = {
    data: { user: {}, activityList: [], optLock: null },

    database: {
        get: async function () {
            const userId = ls.userId;

            const resp = await $fetch({
                url: "userRegister/getData",
                par: { userId },
                fnName: "BUSCA DADOS WAU-0030",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            const optLock = obj.data.optLock;
            const userId = ls.userId;
            const reg = obj.data.user;

            //:Validação
            if ($validate(reg.name, "Nome", "alert")) return;
            if ($validate(reg.name_social, "Nome Curto", "alert")) return;
            if ($validate(reg.name_prefix, "Prefixo", "alert")) return;
            if ($validate(reg.phone_ddi, "DDI do telefone", "alert")) return;
            if ($validate(reg.phone_number, "Telefone", "alert")) return;
            if ($validate(reg.email, "Email", "alert")) return;
            if ($validate(reg.id_clinic, "Clínica", "alert")) return;
            if ($validate(reg.id_clinicLog, "Clínica de login", "alert")) return;

            //:Data
            const data = { user: {} };

            //:Keys de user alteradas
            data.user = $dataFetchRender(reg);

            //:Se não houver dados alterados -> retorna com dom
            if ($isEmpty(data.user)) return this.dom();

            //:Erro no ID
            if (data.user.id !== userId) return $toast("O registro não corresponde ao atual!", "warning");

            //:Fetch
            const resp = await $fetch({
                url: "userRegister/setUser",
                par: { optLock, userId, data },
                fnName: "SALVA PACIENTE WAU-0031",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) return this.get();

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        delete: async function () {
            return cl("PARADO");
            if (!$patientId()) return;
            if (!confirm("Deseja realmente excluir esse paciente?")) return;

            //-FETCH
            await $fetch({
                url: "userRegister/delUser",
                par: { userId: $patientId() },
                fnName: "DELETA PACIENTE WAU-0032",
            });
        },

        resset(newUser = false) {
            ls.set("userId", newUser ? "new" : 0);
            ls.set("userName", "");

            //:Seta dados
            obj.data.user = {};
            obj.data.user.id = newUser ? "new" : 0;
            obj.data.user.id_display = newUser ? "new" : "";
            obj.data.user.id_clinic = newUser ? cookie.get("log_clinicId") : 0;
            obj.data.user.nm_clinic = newUser ? cookie.get("log_clinicName") : "";
            obj.data.user.id_clinicLog = newUser ? cookie.get("log_clinicId") : 0;
            obj.data.user.nm_clinicLog = newUser ? cookie.get("log_clinicName") : "";
            obj.data.user.phone_ddi = newUser ? "55" : "";
            obj.data.optLock = newUser ? "new" : "";

            //:Atualiza toda tela
            this.dom();
        },

        set(resp) {
            //:Erro ou vazio -> limpa dados
            if (resp.status !== 200 || !resp.user?.id > 0) return this.resset();

            //:Seta dados
            ls.set("userId", resp.user.id);
            ls.set("userName", resp.user.name);
            obj.data.user = resp.user || {};
            obj.activityList = resp.activityList || [];
            obj.data.optLock = resp.user.optLock;

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            menuTop.name();
            obj.left.dom();
            obj.left.activityRender();

            $saveMode.disable();
        },
    },

    left: {
        dom() {
            const data = $m.register.data.user;

            //:Todos inputs
            const inputsNode = $$("#register input");
            inputsNode.forEach((el) => $inputChange(el, data[el.name]));

            //:ID de exibição
            $displayId(data.id_display, data.id);

            //:Prefixo de nome
            const prefixNode = $n("#register, name_prefix");
            $inputChange(prefixNode, data.name_prefix);

            //:Ativa/Desativa box de cadastro
            const selectorsToDisable = "#register .left";
            const botonsListToFlash = `#${ls.menuTop} #headerBar .search, #${ls.menuTop} #headerBar .new`;
            const valueToCheck = data.id;
            const permToCheck = 1;
            $disableForm(selectorsToDisable, botonsListToFlash, valueToCheck, permToCheck);

            $requiredMark.unset("#register .left");
        },

        activityRender() {
            const html = obj.activityList.map(({ id, name, adminOnly }) => {
                const checked = obj.data.user?.activity?.includes(id) ? "checked" : "";
                const activeClass = checked ? "" : " outline";

                return `
                    <button
                        type="button"
                        class="btn color-wau3${activeClass}"
                        data-id="${id}"
                        data-admin_only="${adminOnly}"
                    >
                        ${name}
                    </button>`;
            });

            const node = $("#register .activityList");
            node.innerHTML = html.join("");
        },

        events(event) {
            const target = event.target;

            //:Evento "click"
            if (event.type == "click") {
                cl(target);
                //:Botão apelido
                if (target.closest(".btnNameShort")) return nameSocial();
                //:Botão atividade
                if (target.closest(".activityList .btn")) return activityClick();
            }

            //:Target inativo
            if ($check.ch1(target)) return;

            //:Valida tecla precionada
            if ($check.ch2(event)) return;

            //:Alteração em Input|Textarea
            if ($check.ch3(event)) {
                return $inputChange(target, target.value, event.type, $m.register.data.user);
            }

            function nameSocial() {
                const nameSocialNode = $n("#register, name_social");
                const name = $n("#register, name").value;
                const dataForChange = $m.register.data.user;
                $inputChange(nameSocialNode, name, "change", dataForChange);
            }

            function activityClick() {
                const btnNode = target.closest(".btn");
                const activityId = btnNode.dataset.id;
                const adminOnly = +btnNode.dataset.admin_only;
                const activityArray = $m.register.data.user.activity.split(",");

                if (adminOnly && !$permission("1P")) {
                    return $toast("Apenas outro administrador pode fazer essa alteração!", "warning");
                }

                //:Atualiza "activity"
                const newValue = (function () {
                    const exists = activityArray.includes(activityId);
                    if (exists) {
                        const idx = activityArray.indexOf(activityId);
                        if (idx > -1) activityArray.splice(idx, 1);
                    } else {
                        activityArray.push(activityId);
                    }

                    return $arrayToString(activityArray, ",", true);
                })();

                $dataChange($m.register.data.user, "activity", newValue);

                $saveMode.enable();
                obj.left.activityRender();
            }
        },
    },

    newUser() {
        if (!$permission(1)) return;

        $m.register.database.resset("new");
        $requiredMark.set("#register .left");
    },

    headerBar(event) {
        if (event.type !== "click") return;

        //:Botão buscar usuário
        if (event.target.closest(".search")) return findUser();
        //:Botão novo usuário
        if (event.target.closest(".new")) return obj.newUser();
        //:Botão deletar usuário
        if (event.target.closest(".delete")) return obj.database.delete();
    },

    events(event) {
        if (event.target.closest(".left")) return obj.left.events(event);
    },

    init() {
        //:Inicializa savemode
        $saveMode.init(`.navbar, #menuTop .right, .headerBar`);

        //:Inicializa CEP
        $m.zip.init({ zipInput: "#address_zip", database: "$m.register.data.user" });
    },
};
