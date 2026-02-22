export const obj = {
    data: {
        list: [],
    },

    database: {
        get: async function () {
            //:Fetch
            const resp = await $fetch({
                url: "stock/list/stockList/getDataList",
                par: { stockId: ls.stockId },
                fnName: "BUSCA ESTOQUE #690",
            });

            //:Seta dados
            this.set(resp);
        },

        resset(newRegister = false) {
            cl("PARADO");
            ls.set("stockId", newRegister ? "new" : 0);
            ls.set("stockName", "");

            //:Seta dados
            obj.dataChanged = [];
            obj.data.register = {};
            obj.data.register.id = newRegister ? "new" : 0;
            obj.data.register.displayId = newRegister ? "new" : 0;

            //:Atualiza toda tela
            this.dom();
        },

        set(resp) {
            //:Erro ou vazio -> limpa dados
            // if (resp.status !== 200 || $isEmpty(resp?.register?.id)) return this.resset();

            //:Seta dados
            obj.data.list = resp.list || [];

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            obj.unicMain.dom();
        },
    },

    unicMain: {
        dom() {
            $("#menuTop .left").style.display = "none";

            const tpt = obj.data.list.map((el) => {
                return `
                    <tr data-id="${el.id}">
                        <td>${el.displayId}</td>
                        <td>${el.name}</td>
                        <td></td>
                        <td>${el.qt_stock}</td>
                        <td>${el.qt_minStock}</td>
                        <td>${el.qt_maxStock}</td>
                        <td>${el.vl_sale}</td>
                        <td>${el.vl_purchase}</td>
                    </tr>`;
            });

            $("#list .table tbody").innerHTML = tpt.join("");
        },

        events(target) {
            //:Evento em tr -> abre cadastro
            const stockId = target.closest("tr").dataset.id;
            if ($isEmpty(stockId)) return;

            ls.set("stockId", stockId);
            menuTop.activateMenuTab("register");
        },
    },

    events(event) {
        //:Evento em lista
        if (event.target.closest(".unique-main td")) return obj.unicMain.events(event.target);
    },
};
