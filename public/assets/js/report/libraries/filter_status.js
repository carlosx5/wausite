export const obj = {
    fatherNode: "",

    events(event) {
        const target = event.target;

        //:Seleciona status
        if (target.closest("tr")) return obj.set(target);
        //:Mostra todos
        if (target.closest(".all")) return obj.set("all");
        //:Fecha dropdown
        if (target.closest(".cancel")) return obj.close();
    },

    set(target) {
        const all = target === "all";
        const statusId = all ? 0 : target.closest("tr").dataset.id;
        const statusName = all ? "Status" : target.closest("tr td").innerText.trim();

        //:Salva no local storage
        ls.set("f_statusId", statusId);
        ls.set("f_statusName", statusName);

        //:Atualiza interface
        obj.dom();

        //:Fecha menu
        obj.close();

        //:Atualiza lista
        $m.list.database.get();
    },

    resset() {
        ls.set("f_statusId", 0);

        obj.dom();
    },

    close() {
        const menu = this.fatherNode.querySelector(".dropdown-menu");
        menu.classList.remove("show");
    },

    dom() {
        //:Se não tiver status salvo, seta padrão
        if (!ls.f_statusId || !ls.f_statusName) {
            ls.set("f_statusId", 0);
            ls.set("f_statusName", "Status");
        }

        $(this.fatherNode, ".dropdown-toggle p").innerText = ls.f_statusName;
    },
};
