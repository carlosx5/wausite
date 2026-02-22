const d = {//DATA
    list: '',
    expense: '',
};

const v = {//VARIAVEIS
    dt: [],
    months: [],
    vlInvoice: [],
    vlInvoiceSum: 0,
    vlReimbursement: [],
    vlReimbursementSum: 0,
    vlClosed: [],
    vlClosedSum: 0,
    vlClinic: [],
    vlClinicSum: 0,
    vlNetEarning: [],
    vlNetEarningSum: 0,
    vlExpense: [],
    vlExpenseSum: 0,
    tabs: ['graphic', 'expense'],//ABAS DE MENU
    sidebarFilter: ['result', 'mobilized', 'all'],//BOTÕES DE FILTRO DO SIDEBAR
};

document.addEventListener("DOMContentLoaded", () => {
    expense.months.init();
    sidebarFilter.init();
    menuTop.set(ls.menu);

    bankRegister.init({ callback: (y) => expense.getExpenseResultList(y) });
    if ($permission(152, 0)) btnCheckStatement.init((y) => expense.getExpenseResultList(y));
});

const getData = async () => {
    const month = ls.month;
    const filterExpenseType = ls.filterExpenseType;

    const resp = await $fetch({
        url: 'dashboard/dashboard/getGraphic',
        par: { month, filterExpenseType },
        fnName: 'BUSCA DATA #566',
    });

    d.list = resp.list;
    d.list_filterExpenseType = resp.filterExpenseType;
    makeData();
};

const makeData = () => {
    d.list.map(({ vlInvoice, vlReimbursement, vlClosed, vlClinic, vlExpense, vlNetEarning, dt }) => {
        vlInvoice = parseInt(vlInvoice) || 0;
        vlReimbursement = parseInt(vlReimbursement) || 0;
        vlClosed = parseInt(vlClosed) || 0;
        vlClinic = parseInt(vlClinic) || 0;
        vlExpense = parseInt(vlExpense) || 0;
        vlNetEarning = parseInt(vlNetEarning) || 0;

        //viewChart1
        v.dt.push(dt);//HORIZONTAL
        v.vlInvoice.push(vlInvoice);//VERTICAL-1
        v.vlReimbursement.push(vlReimbursement);//VERTICAL-2
        v.vlClosed.push(vlClosed);//VERTICAL-3
        v.vlClinic.push(vlClinic);//VERTICAL-4
        v.vlExpense.push(vlExpense);//VERTICAL-5
        v.vlNetEarning.push(vlNetEarning);//VERTICAL-6

        //viewChart2
        v.vlInvoiceSum += vlInvoice;
        v.vlReimbursementSum += vlReimbursement;
        v.vlClosedSum += vlClosed;
        v.vlClinicSum += vlClinic;
        v.vlExpenseSum += vlExpense;
        v.vlNetEarningSum += vlNetEarning;
    });

    viewChart1();
    viewChart2();
};

const viewChart1 = () => {
    let options = {
        chart: {
            height: 450,
            type: 'area', //area/bar
            foreColor: '#fff',
        },
        title: {
            text: `Faturamento`,
            align: 'center',
        },
        series: [
            {
                name: 'Nota',
                data: v.vlInvoice
            },
            {
                name: 'Reembolso',
                data: v.vlReimbursement
            },
            {
                name: 'Receita Bruta',
                data: v.vlClosed
            },
            {
                name: 'Lucro Bruto',
                data: v.vlClinic
            },
            {
                name: 'Despesa',
                data: v.vlExpense
            },
            {
                name: 'Lucro Líquido',
                data: v.vlNetEarning
            },
        ],
        xaxis: {
            categories: v.dt
        },
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

const viewChart2 = () => {
    let options = {
        chart: {
            type: 'pie',
            foreColor: '#fff',
        },
        series: [v.vlInvoiceSum, v.vlReimbursementSum, v.vlReimbursementSum, v.vlClinicSum, v.vlExpenseSum, v.vlNetEarningSum],
        labels: ['Nota', 'Reembolso', 'Receita Bruta', 'Lucro Bruto', 'Despesa', 'Lucro Líquido'],
        colors: ['#00d9ff', '#ff006a', '#ff4500', '#66ff00', '#ff0000', '#ea00ff'],
    };

    var chart2 = new ApexCharts(document.querySelector("#chart2"), options);

    chart2.render();
};

const expense = {
    getExpenseResultList: async function () {
        const month = ls.month;
        const user = cookie.get('log_userId');
        const filterExpenseId = ls.filterExpenseId;

        const resp = await $fetch({
            url: 'dashboard/dashboard/getExpenseResultList',
            par: { month, user, filterExpenseId },
            fnName: 'BUSCA DESPESAS #601',
        });

        d.expense = resp.list;
        this.viewExpenseResultList();
    },

    viewExpenseResultList() {
        let filterExpenseType = ls.filterExpenseType;
        let line = 0;
        let total = 0;
        let checkOn = $permission([152], 0);
        let iconCheck = '';
        let checkColor = '';
        let iconExpenseColor = ls.filterExpenseId ? ' style="color:#48ff00"' : '';
        let iconRegister = $permission([129], 0) ? '<i class="far fa-copy ms-2" data-target="register"></i>' : '';

        let tpt = d.expense.map(({ id, month, date, description, value, positive, nm_source, id_expense, nm_expense, mobilized, check }) => {
            if (filterExpenseType == 'result' && +mobilized == 0) return;
            if (filterExpenseType == 'mobilized' && +mobilized == 1) return;

            line++;
            value = (positive == 1 ? '' : '-') + value;
            total += $numberOnly(value);

            if (checkOn) {//ICONE CHECK
                checkColor = check ? ' style="color:#48ff00"' : '';
                iconCheck = `<i class="far fa-calendar-check me-2" data-target="check"${checkColor}></i>`;
            };

            return `
                <tr data-id="${id}" data-id_expense="${id_expense}">
                    <th scope="row">${line}</th>
                    <td>${id}</td>
                    <td>${date}</td>
                    <td>${month}</td>
                    <td>${nm_source}/${nm_expense}<i class="fas fa-expand-arrows-alt" data-target="expense"${iconExpenseColor}></i></td>
                    <td>${description}</td>
                    <td>${mobilized}</td>
                    <td class="text-end">${value}</td>
                    <td class="text-center py-0">
                        ${iconCheck}
                        ${iconRegister}
                    </td>
                </tr>`
        }).join('');

        tpt += `
            <tr>
                <td colspan="7" class="text-end">
                    <b>Saldo: ${$mask.number(total)}</b>
                </td>
                <td></td>
            </tr>`;

        $('.f_expense tbody').innerHTML = tpt;
    },

    months: {
        change(e) {
            ls.set('month', e.value);
            expense.getExpenseResultList();
        },

        init() {
            v.months = gMonths();
            const tpt = v.months.map((m) => `<option value="${m}">${m}</option>`).join('');
            const el = $('.btn_sidebar.month .form-select');
            el.innerHTML = tpt;

            if (!ls.month) ls.set('month', v.months[0]);
            el.value = ls.month;
            el.onchange = function () { expense.months.change(this) };
        },
    },
};

const events = {
    expense(e) {
        const id = e.target.closest('tr').dataset.id_expense;
        ls.set('filterExpenseId', ls.filterExpenseId ? 0 : id);
        expense.getExpenseResultList();
    },

    check(e) {
        const id = e.target.closest('tr').dataset.id;
        btnCheckStatement.check(id, 10);
    },

    register(e) {
        bankRegister.getData(e.target);
    },

    init: (function () {
        $('.table').onclick = e => {
            const target = e.target.dataset.target;
            if (target) eval(events[target])(e);
        };
    }()),
};

const sidebarFilter = {
    onclick(btn) {
        ls.set('filterExpenseType', btn);
        this.css();

        if (ls.menu == 'graphic') { location.reload(); return };
        menuTop.set(ls.menu);
    },

    css() {
        v.sidebarFilter.forEach(e => {
            const active = ls.filterExpenseType == e ? 'add' : 'remove';

            // e = '.btn' + e.charAt(0).toUpperCase() + e.slice(1);
            const icon = `.f_${e} i`;
            const btn = `.f_${e} .btn_sidebar`;
            $(icon).classList[active]('active');
            $(btn).classList[active]('active');
        });
    },

    init() {
        if (!ls.filterExpenseType) ls.set('filterExpenseType', 'all');

        v.sidebarFilter.forEach(e => {
            const btn = '.btn' + e.charAt(0).toUpperCase() + e.slice(1);
            $(btn).onclick = () => this.onclick(e);
        });

        this.css();
    },
};

const menuTop = {
    set(select) {
        //DESABILITA TODAS TAB
        v.tabs.forEach(e => {
            e = e.includes('exp_') ? 'expense' : e;
            $(`.f_${e}`).style.display = 'none';
        });
        $$('.f_menuTop .tab').forEach(e => e.classList.remove('active'));

        //ATIVA TAB SELECIONADA
        $(`.f_${select.includes('exp_') ? 'expense' : select}`).style.display = 'flex';
        $(`.btn_${select}`).classList.add('active');
        ls.set('menu', select);

        if (select == 'graphic') {
            if (!d.list_filterExpenseType) {
                getData();
            } else if (d.list_filterExpenseType == ls.filterExpenseType) {
                return;
            } else {
                location.reload();
            };
        };

        if (select == 'expense' && !d.expense) {
            expense.getExpenseResultList();
        } else if (select == 'expense') {
            expense.viewExpenseResultList();
        };
    },

    init: (function () {
        if (!ls.menu) ls.set('menu', 'graphic');
        v.tabs.forEach(e => $(`.f_menuTop .btn_${e}`).onclick = e => menuTop.set(e.currentTarget.dataset.tab));
    }()),
};