//-HTML LOADED
document.addEventListener("DOMContentLoaded", () => {
    $("#menuTop .btnUser").classList.add("active");
});

//-BUSCA USUÁRIO
const find = {
    name: {
        callback(data) {
            ls.set(g.table, data.id);
            database.get();
        },

        start() {
            if (!$permission([53, 62, 82, 85])) return;

            $findModule.init({
                urn: "statement/user/find",
                title: "Busca Usuário",
                tptTexts: { col2: "Nome" },
                columnsQuantity: 2,
                width: "350px",
                callback: (y) => this.callback(y),
            });
        },
    },
};
