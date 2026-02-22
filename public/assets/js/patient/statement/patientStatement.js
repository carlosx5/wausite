export const obj = {
    database: {
        get: async function () {
            //:Fetch
            const resp = await $fetch({
                url: "patient/statement/patientStatement/getData",
                par: { patientId: $patientId() },
                fnName: "BUSCA DADOS #684",
            });

            //:Seta dados
            this.set(resp);
        },

        set(resp) {
            //:Erro ou vazio -> limpa dados
            if (resp.status !== 200) return this.resset();

            //:Seta dados
            $patientId(resp.localStorage.patientId);
            ls.set("patientName", resp.localStorage.patientName);
            obj.dataChanged = [];
            obj.data = resp || {};

            //:Atualiza toda tela
            obj.list.dom.all();
        },
    },

    list: {
        dom: {
            list() {
                let line = 0;
                let iconDelete = $permission(9, 0) ? '<i class="fa-light fa-trash-can ms-2"></i>' : "";

                const tpt = obj.data.list
                    .map(({ id, date, description, value, positive, available }) => {
                        const vlColor = positive == 1 ? "" : "orange ";
                        value = (positive == 1 ? "" : "-") + value;
                        const avColor = available == 1 ? "txt-c" : "txt-c orange";
                        available = available == 1 ? "disponível" : "vinculado";

                        return `
                            <tr data-id="${id}">
                                <th scope="row">${++line}</th>
                                <td>${id}</td>
                                <td>${date}</td>
                                <td>${description}</td>
                                <td class="${vlColor}text-end">${value}</td>
                                <td class="${avColor}">${available}</td>
                                <td class="text-center py-0">
                                    ${iconDelete}
                                </td>
                            </tr>`;
                    })
                    .join("");

                $("#statement .list tbody").innerHTML = tpt;
            },

            all() {
                menuTop.name();
                this.list();
            },
        },
    },
};
