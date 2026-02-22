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
        //:Mostra todos profissionais
        if (target.closest(".all")) return obj.set("all");
        //:Fecha dropdown
        if (target.closest(".cancel")) return obj.close();
        //:Busca profissional
        if (target.closest(".find")) return obj.find(target.value);
    },

    open() {
        if (!obj.find) obj.findDebounce();

        obj.find("");
    },

    close() {
        const menu = this.fatherNode.querySelector(".dropdown-menu");
        menu.classList.remove("show");
    },

    set(target) {
        const all = target === "all";
        const profId = all ? 0 : target.closest("tr").dataset.id;
        const profName = all ? "Profissional" : target.closest("tr td").innerText.trim();

        //:Salva no local storage
        ls.set("f_profId", profId);
        ls.set("f_profName", profName);

        //:Atualiza interface
        obj.dom();

        //:Fecha menu
        obj.close();

        //:Atualiza lista
        $m.list.database.get();
    },

    resset() {
        ls.set("f_profId", 0);

        obj.dom();
    },

    findDebounce() {
        obj.listNode = this.fatherNode.querySelector(".list tbody");

        obj.find = $debounce(async (find) => {
            const resp = await $fetch({
                url: "report/find_prof",
                par: { find },
                overlay: false,
                fnName: "BUSCA PROFISSIONAL WAU-0090",
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

        //:Se não tem permissão para todos profissionais, seta o profissional do usuário logado
        if (!$permission(["125P", "165P"], 0)) {
            ls.set("f_profId", cookie.get("log_userId"));
            ls.set("f_profName", cookie.get("log_userName"));
            btnNode.disabled = true;
        } else {
            btnNode.disabled = false;
        }

        //:Se não tiver status salvo, seta padrão
        if (!ls.f_profId || !ls.f_profName) {
            ls.set("f_profId", 0);
            ls.set("f_profName", "Profissional");
        }

        $(this.fatherNode, ".dropdown-toggle p").innerText = ls.f_profName;
    },
};
