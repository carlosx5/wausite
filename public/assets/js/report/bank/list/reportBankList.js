export const obj = {
    data: { bankList: [] },

    database: {
        get: async function () {
            const dtStart = ls.f_dtStart;
            const dtEnd = ls.f_dtEnd;
            const bankId = ls.f_bankId;
            const order = ls.f_order;

            //:fetch
            const resp = await $fetch({
                url: "reportBankList/getData",
                par: { dtStart, dtEnd, bankId, order },
                fnName: "BUSCA DADOS WAU-0179",
            });

            //:Seta dados
            this.set(resp);
        },

        set(resp) {
            //:Seta dados
            obj.data.bankList = resp.bankList || [];

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            obj.left.renderList();

            $saveMode.disable();
        },
    },

    left: {
        //:Renderiza lista de serviços
        renderList() {
            const html = obj.data.bankList.map((item) => {
                const formatedDate = $date.format(item.date, "Br/");
                const value = $valFormat(item.value);

                return `
                    <tr>
                        <th scope="row">${item.id}</th>
                        <td>${formatedDate}</td>
                        <td>${item.text}</td>
                        <td class="text-end">${value}</td>
                    </tr>
                `;
            });

            //:Renderiza os itens na interface
            $("#list .left tbody").innerHTML = html.join("");
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    return;

                default:
                    return;
            }
        },
    },

    events(event) {
        const target = event.target;

        //:Eventos da esquerda
        if (target.closest(".left")) return obj.left.events(event);
    },

    init() {
        $saveMode.init(false);
    },
};
