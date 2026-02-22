const d = {
    //DATA
    chart: "",
    list: "",
};

const v = {
    //VARIAVEIS
    series: [],
    xaxis: [],
    tabs: ["graphic", "expense"], //ABAS DE MENU
    sidebarFilter: ["result", "mobilized", "all"], //BOTÕES DE FILTRO DO SIDEBAR
};

document.addEventListener("DOMContentLoaded", () => {
    if (!ls.dateIn || !ls.dateOut) {
        const dt = $date.now("Sq");
        ls.set("dateIn", dt);
        ls.set("dateOut", dt);
    }

    //:EXECUTA INITs
    (function () {
        const initList = ["list"];
        initList.forEach((el) => eval(`${el}.init`)());
    })();

    getData();

    $(".sidebarTools").addEventListener("click", (event) => sidebar.events(event.target));
});

//:BODY BARRA LATERAL
const sidebar = {
    period: {
        dateIn: $(".sidebarTools .f_period .dateIn"),
        dateOut: $(".sidebarTools .f_period .dateOut"),

        //*ATUALIZA VIEW
        view() {
            this.dateIn.value = ls.dateIn;
            this.dateOut.value = ls.dateOut;

            const method = ls.dateIn || ls.dateOut ? "add" : "remove";
            $(".sidebarTools .f_period .icon_active_indication").classList[method]("icon_on");
        },

        //*SETA VALORES
        set(dateIn, dateOut) {
            // if (dateIn > dateOut) return alert('A data de termino deve ser posterior a data de inicio.');

            if (dateIn) ls.set("dateIn", dateIn);
            if (dateOut) ls.set("dateOut", dateOut);

            sidebar.period.view();
        },

        //*SELEÇÃO DE VALORES RAPIDOS
        days(days) {
            let dateIn = "";
            let dateOut = "";

            if (days == "hoje") {
                dateIn = $date.now("Sq");
                dateOut = $date.now("Sq");
            } else if (days == "ontem") {
                dateIn = $date.moreDays($date.now("Sq"), 1, "-");
                dateOut = $date.moreDays($date.now("Sq"), 1, "-");
            } else if (days == "zera") {
                dateIn = "";
                dateOut = "";
            } else {
                dateIn = $date.moreDays($date.now("Sq"), +days - 1, "-");
                dateOut = $date.now("Sq");
            }

            //*ATUALIZA VALOR
            sidebar.period.set(dateIn, dateOut);

            //*ATUALIZA BOTÃO "Filtrar"
            sidebar.filter.view(true);
        },

        //*RESSETA VALORES
        resset(standard = true) {
            if (standard) return sidebar.period.days(7);

            sidebar.period.days("zera");
        },

        //*BOTÕES DE SOBE E DESCE DATA
        btnDateUpDown(action) {
            if (!ls.dateIn && !ls.dateOut) {
                const now = $date.now("Sq");
                this.set(now, now);
            } else if (ls.dateIn && !ls.dateOut) {
                this.set(ls.dateIn, ls.dateIn);
            } else if (!ls.dateIn && ls.dateOut) {
                this.set(ls.dateOut, ls.dateOut);
            } else {
                const dateResult = $date.moreDays(ls.dateIn, action ? 1 : -1);
                this.set(dateResult, dateResult);
            }

            //*ATUALIZA BOTÃO "Filtrar"
            sidebar.filter.view(true);
        },

        //*EVENTOS
        events: {
            change(target) {
                if (target.classList.contains("dateIn")) return sidebarFilter.period.set(target.value, 0);
                if (target.classList.contains("dateOut")) return sidebarFilter.period.set(0, target.value);

                sidebarFilter.filter.view(true);
            },

            keyEnter() {
                //*ATUALIZA VALOR
                sidebarFilter.period.set(sidebarFilter.period.dateIn.value, sidebarFilter.period.dateOut.value);

                //*RESSETA
                sidebarFilter.monthEndClosing.resset();
                sidebarFilter.unidentified.resset();

                //*ATUALIZA BOTÃO "Filtrar"
                sidebarFilter.filter.view(true);
            },
        },

        //*INICIO
        init() {
            //*SELECIONA TÍTULO (PERIODO OU FECHAMENTO)
            const sidebarContentNode = $(".sidebarTools");
            const periodNode = sidebarContentNode.querySelector(".f_period");
            const periodTitleNode = sidebarContentNode.querySelector(".title_period");
            const monthEndClosingNode = $(".sidebarTools .f_monthEndClosing");
            //
            sidebarContentNode.querySelector(".title .period").style.color = "red";
            //
            periodTitleNode.addEventListener("click", (event) => {
                const target = event.target;

                if (target.closest(".period")) {
                    periodTitleNode.querySelector(".closing").style.color = "#000";
                    periodTitleNode.querySelector(".period").style.color = "red";

                    monthEndClosingNode.style.display = "none";
                    periodNode.style.display = "block";
                    return;
                }

                if (target.closest(".closing")) {
                    periodTitleNode.querySelector(".period").style.color = "#000";
                    periodTitleNode.querySelector(".closing").style.color = "red";

                    periodNode.style.display = "none";
                    monthEndClosingNode.style.display = "block";
                    return;
                }
            });
        },
    },

    filter: {
        view(action) {
            const aux = ".sidebarTools .f_filter ";
            const method = action ? "add" : "remove";
            $(aux + ".btn_filter").classList[method]("btn_on");
        },

        filter() {
            getData();
            this.view(false);
        },

        resset() {
            //*RESSETA TUDO
            sidebar.period.resset();

            //*ATUALIZA VIEW
            this.view(true);
        },
    },

    events(target) {
        //*DIMINUI UM DIA
        if (target.closest(".btn_up")) return sidebar.period.btnDateUpDown(0);
        //*SOMA UM DIA
        if (target.closest(".btn_down")) return sidebar.period.btnDateUpDown(1);
        //*BOTÃO REFRESH
        if (target.closest(".standardDays")) return sidebar.period.days(target.dataset.days);
        //*BOTÃO FILTRA
        if (target.closest(".btn_filter")) return sidebar.filter.filter();
        //*BOTÃO RESSET
        if (target.closest(".btn_resset")) return sidebar.filter.resset();
    },
};

const getData = async () => {
    const dateIn = ls.dateIn;
    const dateOut = ls.dateOut;
    console.log("dateIn: ", dateIn);
    console.log("dateOut: ", dateOut);

    const resp = await $fetch({
        url: "dashboard/ads/dashAds/getList",
        par: { dateIn, dateOut },
        fnName: "BUSCA DATA #646",
    });

    list.database.set(resp);

    // d.chart = resp.chart;
    // d.list = resp.list;
    // makeData();

    // viewChart1();
    // viewList();
};

const makeData = () => {
    v.xaxis = { categories: d.chart.days }; //DIAS

    d.chart.sources.forEach((source) => {
        v.series.push({ name: source, data: d.chart[source] }); //MIDIAS E QUANTIDADES
    });
};

const viewChart1 = () => {
    let options = {
        chart: {
            height: 450,
            type: "area", //area/bar
            foreColor: "#fff",
        },
        title: {
            text: `Marketing`,
            align: "center",
        },
        series: v.series,
        xaxis: v.xaxis,
        colors: ["#00d9ff", "#ff006a", "#ff4500", "#66ff00", "#ff0000", "#ea00ff"],
        markers: {
            colors: ["#ff0000"],
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ["#006666", "#ff006a", "#ff4500", "#66ff00", "#ff0000", "#ea00ff"],
            },
        },
        // fill: {
        //     colors: ['#0a0811']
        // },
        stroke: {
            curve: "smooth",
            width: [2, 2],
        },
        grid: {
            borderColor: "#414462",
        },
    };

    var chart1 = new ApexCharts(document.querySelector("#chart1"), options);

    chart1.render();
};

const viewList = () => {
    const len = d.list.length;
    let tptList = "";
    let tptZap = "";

    for (let i = len - 1; i > -1; i--) {
        let el = d.list[i];
        let color;
        el.day = $date.format(el.day, "Br");

        switch (el.name) {
            case "Organico":
                color = "#BD00FC";
                break;
            case "Google":
                color = "#4082ed";
                break;
            default:
                color = "#777";
                break;
        }

        tptList += `
            <tr style="color:${color}">
                <th scope="row">${el.id}</th>
                <td>${el.day}</td>
                <td>${el.time}</td>
                <td style="color:${color}">${el.name}</td>
                <td>${el.zap}</td>
            </tr>`;

        if (el.zap == 1) {
            tptZap += `
            <tr>
                <th scope="row">${el.id}</th>
                <td>${el.day}</td>
                <td>${el.time}</td>
                <td style="color:${color}">${el.name}</td>
                <td>${el.zap}</td>
            </tr>`;
        }
    }

    $(".f_list .left tbody").innerHTML = tptList;
    $(".f_list .right tbody").innerHTML = tptZap;
};

const list = {
    data: [],

    database: {
        get() {},

        save() {},

        delete(listId) {
            (async function () {
                await $fetch({
                    url: "dashboard/ads/dashAds/delList",
                    par: { listId },
                    fnName: "DELETA #656",
                });

                getData();
            })();
        },

        resset() {},

        set(resp) {
            if (!resp.list) return list.database.resset();

            list.data = resp.list;
            list.dom();
        },
    },

    eventClick(target) {
        const tr = target.closest("tr");
        const listId = tr.dataset.id;
        if (!listId) return;

        if (target.closest(".btnName")) return focusName(listId);
        if (target.closest(".btnDel")) return list.database.delete(listId);

        function focusName() {
            const inputNode = tr.querySelector("input");
            const iconNameNode = tr.querySelector(".btnName");

            iconNameNode.style.display = "none";
            inputNode.type = "text";
            inputNode.focus();
        }
    },

    eventChange(target) {
        if (target.tagName.toLowerCase() === "input") {
            const listId = target.closest("tr").dataset.id;
            const listName = target.value;

            (async function () {
                await $fetch({
                    url: "dashboard/ads/dashAds/setName",
                    par: { listId, listName },
                    fnName: "ALTERA NOME #657",
                });

                getData();
            })();
        }
    },

    eventKeydown(event) {
        if (event.key === "Enter") {
            console.log("Enter foi pressionado!");
            // Aqui você pode executar o que desejar
        }
    },

    dom() {
        let line = list.data.length;
        let iconName = $permission(9, 0) ? '<i class="fa-light fa-address-card ms-2 btnName"></i>' : "";
        let iconDelete = $permission(9, 0) ? '<i class="fa-light fa-trash-can ms-2 btnDel"></i>' : "";

        const tpt = list.data
            .map(
                ({
                    id,
                    ads,
                    section_count,
                    timer,
                    zap_count,
                    video_count,
                    screen,
                    ip,
                    name,
                    os,
                    city,
                    state,
                    country,
                    updated_at,
                    triggerName,
                }) => {
                    const icon1 = name ? "" : iconName;
                    const inputType = name ? "text" : "hidden";

                    return `
                <tr data-id="${id}">
                    <th scope="row">${line--}</th>
                    <td>${id}</td>
                    <td title="ID:${ads}">${triggerName}</td>
                    <td>${section_count}</td>
                    <td>${timer}</td>
                    <td>${zap_count}</td>
                    <td>${video_count}</td>
                    <td title="IP:${ip}">${screen}</td>
                    <td><input type="${inputType}" value="${name}">${icon1}</td>
                    <td>${os}</td>
                    <td>${city}</td>
                    <td>${state}</td>
                    <td>${country}</td>
                    <td>${updated_at}</td>
                    <td class="text-center py-0">
                        ${iconDelete}
                    </td>
                </tr>`;
                }
            )
            .join("");

        $("#list tbody").innerHTML = tpt;
    },

    init() {
        //:EVENTO CLICK
        const listNode = $("#list");
        listNode.addEventListener("click", (event) => list.eventClick(event.target));
        listNode.addEventListener("change", (event) => list.eventChange(event.target));
        // listNode.addEventListener('keydown', event => list.eventKeydown(event));
    },
};
