const d = {//DATA
    chart: '',
    list: '',
};

const v = {//VARIAVEIS
    series: [],
    xaxis: [],
    tabs: ['graphic', 'expense'],//ABAS DE MENU
    sidebarFilter: ['result', 'mobilized', 'all'],//BOTÕES DE FILTRO DO SIDEBAR
};

document.addEventListener("DOMContentLoaded", () => {
    getData();
});

const getData = async () => {
    const month = ls.month;
    const filterExpenseType = ls.filterExpenseType;

    const resp = await $fetch({
        url: 'dashboard/marketing/get',
        par: { month, filterExpenseType },
        fnName: 'BUSCA DATA #566',
    });

    d.chart = resp.chart;
    d.list = resp.list;
    makeData();

    viewChart1();
    viewList();
};

const makeData = () => {
    v.xaxis = { categories: d.chart.days };//DIAS

    d.chart.sources.forEach(source => {
        v.series.push({ name: source, data: d.chart[source] });//MIDIAS E QUANTIDADES
    });
};

const viewChart1 = () => {
    let options = {
        chart: {
            height: 450,
            type: 'area', //area/bar
            foreColor: '#fff',
        },
        title: {
            text: `Marketing`,
            align: 'center',
        },
        series: v.series,
        xaxis: v.xaxis,
        colors: [
            '#00d9ff', '#ff006a', '#ff4500', '#66ff00', '#ff0000', '#ea00ff',
        ],
        markers: {
            colors: ['#ff0000']
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#006666', '#ff006a', '#ff4500', '#66ff00', '#ff0000', '#ea00ff']
            }
        },
        // fill: {
        //     colors: ['#0a0811']
        // },
        stroke: {
            curve: 'smooth',
            width: [2, 2]
        },
        grid: {
            borderColor: '#414462',
        },
    };

    var chart1 = new ApexCharts(document.querySelector("#chart1"), options);

    chart1.render();
};

const viewList = () => {
    const len = d.list.length;
    let tptList = '';
    let tptZap = '';

    for (let i = len - 1; i > -1; i--) {
        let el = d.list[i];
        let color;
        el.day = $date.format(el.day, 'Br');

        switch (el.name) {
            case 'Organico':
                color = '#BD00FC';
                break;
            case 'Google':
                color = '#4082ed';
                break;
            default:
                color = '#777';
                break;
        };

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
        };
    };

    $('.f_list .left tbody').innerHTML = tptList;
    $('.f_list .right tbody').innerHTML = tptZap;
};