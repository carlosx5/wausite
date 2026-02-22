document.addEventListener("DOMContentLoaded", () => {
    database.get();
});

//+BANCO DE DADOS GLOBAL
const database = {
    get() {
        (async function () {
            const resp = await $fetch({
                url: "bank/config/balance/getData",
                par: {},
                fnName: "BUSCA REGISTRO #639",
            });

            list.database.set(resp.list);
            list.dom.all();
        })();
    },
};

//+BODY LIST
const list = {
    data: {},

    database: {
        saveRefresh(target) {
            const father = target.closest("tr");

            const balanceId = list.data[father.dataset.key].id;
            const sourceId = list.data[father.dataset.key].sourceId;
            const tableId = list.data[father.dataset.key].tableId;
            const refreshCount = list.data[father.dataset.key].blCount;
            const refreshValue = list.data[father.dataset.key].blValue;

            (async function () {
                const resp = await $fetch({
                    url: "bank/config/balance/refresh",
                    par: { balanceId, sourceId, tableId, refreshCount, refreshValue },
                    fnName: "SALVA ATUALIZAÇÃO #640",
                });

                list.database.set(resp.list);
                list.dom.all();
            })();
        },

        set(data) {
            list.data = data ?? [];
        },
    },

    dom: {
        all() {
            let line = 0;

            let tpt = list.data
                .map(({ id, sourceId, tableId, sourceNm, count, value, blCount, blValue }) => {
                    const colorCount = count == blCount ? " color1" : " color2";
                    const colorValue = value == blValue ? " color1" : " color2";

                    value = $mask.number.format(value);
                    blValue = $mask.number.format(blValue);

                    return `
                    <tr data-id="${id}" data-key="${++line - 1}" style="color:${colorCount}">
                        <th scope="row">${line}</th>
                        <td>${id}</td>
                        <td>${tableId}</td>
                        <td>${sourceId}</td>
                        <td>${sourceNm}</td>
                        <td class="text-end${colorCount}">${count}</td>
                        <td class="text-end${colorValue}">${value}</td>
                        <td class="text-end${colorCount}">${blCount}</td>
                        <td class="text-end${colorValue}">${blValue}</td>
                        <td class="text-center btnRefresh"><i class="fa-light fa-arrows-rotate"></i></td>
                    </tr>`;
                })
                .join("");

            $("#list tbody").innerHTML = tpt;
        },
    },

    events: {
        click(target) {
            //BOTÃO ATUALIZAR
            if (target.closest(".btnRefresh")) return list.database.saveRefresh(target);
        },
    },

    init: (function () {
        //*EVENTOS NA LISTA
        $("#list").addEventListener("click", (event) => list.events.click(event.target));
    })(),
};
