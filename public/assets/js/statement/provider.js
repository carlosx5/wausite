document.addEventListener("DOMContentLoaded", () => {
    $("#menuTop .btnProvider").classList.add("active");
});

const find = {
    name: {
        callback(data) {
            ls.set(g.table, data.id);
            database.get();
        },

        start() {
            if (!$permission(88)) return;

            $findModule.init({
                urn: "provider/provider_statement/find",
                title: "Busca Fornecedor",
                tptTexts: { col2: "Fornecedor" },
                columnsQuantity: 2,
                width: "450px",
                callback: (y) => this.callback(y),
            });
        },
    },
};
