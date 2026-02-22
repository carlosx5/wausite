document.addEventListener("DOMContentLoaded", () => {
    $("main").addEventListener("click", (event) => events.click(event));
    $(".sidebarTools").addEventListener("click", (event) => sidebar.events(event.target));
});

//:BARRA LATERAL
const sidebar = {
    //*EVENTOS
    events(target) {
        //-NOVO CHATBOT
        if (target.closest(".new")) return modal.show("new");
        //-BOTÃO DELETAR
        if (target.closest(".delete")) return register.database.delete();
        //-BOTÃO SALVAR
        if (target.closest(".update")) return register.database.save();
        //-BOTÃO CANCELAR
        if (target.closest(".cancel")) {
            database.get();
            register.dom.saveMode.inactive();
            return;
        }
    },
};

const modal = {
    //*DATABASE
    database: {
        //-BOTÃO SALVAR
        save() {
            if (!$permission(9)) return;

            const id = $n(".modalEdit id").value;
            const idFather = $n(".modalEdit idFather").value;
            const message = $n(".modalEdit message").value;

            //-VALIDAÇÃO
            if ($validate(message, "Mensagem", "alert")) return;

            //-FETCH
            (async function () {
                //-FETCH
                const resp = await $fetch({
                    url: "marketing/chatbot/chatbot/setChatbot",
                    par: { id, idFather, message },
                    fnName: "SALVA CHATBOT #610",
                });

                //-ATUALIZA DADOS
                ls.set("chatbotId", resp.chatbotId);
                // database.get();
                // register.dom.saveMode.inactive();
                // changeEvents.msgSaved(resp.status);

                $showHideModal(".modalEdit");
            })();
        },

        //-BOTÃO CANCELAR
        cancel() {
            cl($n(".modalEdit id").value);
            cl($n(".modalEdit message").value);

            $showHideModal(".modalEdit");
        },

        //-DELETAR
        delete() {
            return;
            if (!ls.patientId) return;
            if (!confirm("Deseja realmente excluir esse paciente?")) return;

            (async function () {
                //-FETCH
                await $fetch({
                    url: "patient/register/register/delete_patientRegister",
                    par: { registerId: ls.patientId },
                    fnName: "DELETA PACIENTE #517",
                });

                //-ATUALIZA DATA
                database.get();
            })();
        },

        //-ALTERAÇÃO EM DATA
        change(elNode, saveMode = true) {
            return;
            //-INCLUI CAMPO NA LISTA DE CAMPOS A SEREM SALVOS
            if (!register.dataChanged.includes(elNode.name)) register.dataChanged.push(elNode.name);

            //-ATUALIZA "DATA" COM O VALOR DO ELEMENTO
            register.data[elNode.name] = elNode.classList.contains("val")
                ? $numberOnly(elNode.value)
                : (register.data[elNode.name] = elNode.value);

            //-ATIVA O MODO SALVAR
            if (saveMode) register.dom.saveMode.active();
        },

        //-ZERA DADOS
        resset() {
            return;
            //-LIMPA LOCALHOST
            ls.set("registerId", "Novo");

            //-LIMPA DATA
            register.data = {};
            register.data.id = "Novo";
            register.dataChanged = [];

            //-DDI PADRÃO BRASIL
            register.data.ddi_flag =
                "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/22px-Flag_of_Brazil.svg.png";
            $mask.input($n("id_ddi"), 31, "change", "register", false);
            $mask.input($n("phone_ddi"), 55, "change", "register", false);

            //-ATUALIZA FORM
            register.dom.all();
        },

        //-SETA DADOS VINDOS DE DATABADE
        set(resp) {
            return;
            register.dataChanged = [];

            //-CADASTRO VEIO ZERADO
            if (!resp?.id > 0) {
                menuTop.set("register");
                register.database.resset();
                return;
            }

            //-SETA VALORES
            ls.set("registerId", resp.id);
            register.data = resp || {};
            register.data.ddi_flag = `https://upload.wikimedia.org/wikipedia/commons/thumb/${register.data.ddi_flag}`;
            register.dom.all();
        },
    },

    //*SHOW
    show(type) {
        if (!$permission(9)) return;

        if (type == "new") {
            $n(".modalEdit id").value = "new";
            $n(".modalEdit idFather").value = 0;
            $n(".modalEdit message").value = "";
        }

        $showHideModal(".modalEdit");
    },

    //*EVENTOS
    events(target) {
        //-SALVAR
        if (target.closest(".btnSave")) return modal.database.save();
        if (target.closest(".btnCancel")) return modal.database.cancel();
    },
};

const events = {
    click(event) {
        const target = event.target;

        if (target.closest(".modalEdit")) return modal.events(target);
    },
};
