export const obj = {
    fatherNode: "",
    listNode: "",
    find: "",

    events(event) {
        const target = event.target;

        //:Abre dropdown
        if (target.closest(".btn.dropdown-toggle.show")) return obj.open();
        //:Seleciona status
        if (target.closest("tr")) return obj.set(target);
        //:Mostra todas clínicas
        if (target.closest(".all")) return obj.set("all");
        //:Fecha dropdown
        if (target.closest(".cancel")) return obj.close();
        //:Busca profissional
        if (target.closest(".find")) return obj.find(target.value);
    },

    open() {
        if (!obj.find) obj.createDebounce();

        obj.find("");
    },

    close() {
        const menu = this.fatherNode.querySelector(".dropdown-menu");
        menu.classList.remove("show");
    },

    set(target) {
        const all = target === "all";
        const bankId = all ? 0 : target.closest("tr").dataset.id;
        const bankName = all ? "Banco" : target.closest("tr td").innerText.trim();

        //:Salva no local storage
        ls.set("f_bankId", bankId);
        ls.set("f_bankName", bankName);

        //:Atualiza interface
        obj.dom();

        //:Fecha menu
        obj.close();

        //:Atualiza lista
        $m.list.database.get();
    },

    resset() {
        ls.set("f_bankId", 0);

        obj.dom();
    },

    createDebounce() {
        obj.listNode = this.fatherNode.querySelector(".list tbody");

        obj.find = $debounce(async (find) => {
            const resp = await $fetch({
                url: "report/find_bank",
                par: { find },
                overlay: false,
                fnName: "BUSCA BANCO WAU-0177",
            });

            this.renderList(resp);
        });
    },

    renderList(resp) {
        const tpt = resp.list.map(({ id, name }) => {
            return `<tr data-id="${id}"><td>${name}</td></tr>`;
        });

        obj.listNode.innerHTML = tpt.join("");
    },

    dom() {
        const btnNode = $(this.fatherNode, ".btn.dropdown-toggle");

        //:Se não tem permissão para todas clínicas, seta a clínica do usuário logado
        if (!$permission(["126P", "156P"], 0)) {
            ls.set("f_bankId", cookie.get("log_bankId"));
            ls.set("f_bankName", cookie.get("log_bankName"));
            btnNode.disabled = true;
        } else {
            btnNode.disabled = false;
        }

        //:Se não tiver status salvo, seta padrão
        if (!ls.f_bankId || !ls.f_bankName) {
            ls.set("f_bankId", 0);
            ls.set("f_bankName", "Banco");
        }

        $(this.fatherNode, ".dropdown-toggle p").innerText = ls.f_bankName;
    },
};
