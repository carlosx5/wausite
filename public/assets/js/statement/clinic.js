document.addEventListener("DOMContentLoaded", () => {
    $('#menuTop .btnClinic').classList.add('active');
});

const find = {
    name: {
        callback(data) {
            ls.set(g.table, data.id);
            database.get();
        },

        start() {
            if (!$permission(55)) return;

            $findModule.init({
                urn: 'clinic/register/find/findClinic',
                title: 'Busca Clínica',
                tptTexts: { 'col2': 'Clínica' },
                columnsQuantity: 2,
                width: '450px',
                callback: (y) => this.callback(y),
            });
        },
    },
};