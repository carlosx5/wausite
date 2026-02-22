//-HTML LOADED
document.addEventListener("DOMContentLoaded", () => {
    if (!$permission(9)) return;

    //:BUSCA DADOS
    check.database.get();

    //:INICIO
    init();
});

//-BODY CHECK
const check = {
    fields: [
        { name: 'lastId', audit: 0, new: 0, sum: 0 },
        { name: 'collector', audit: 0, new: 0, sum: 0 },
        { name: 'provider', audit: 0, new: 0, sum: 0 },
        { name: 'stamp', audit: 0, new: 0, sum: 0 },
        { name: 'doctor', audit: 0, new: 0, sum: 0 },
        { name: 'agent', audit: 0, new: 0, sum: 0 },
        { name: 'os', audit: 0, new: 0, sum: 0 },
        { name: 'clinic', audit: 0, new: 0, sum: 0 },
        { name: 'loan', audit: 0, new: 0, sum: 0 },
        { name: 'bankEntries', audit: 0, new: 0, sum: 0 },
        { name: 'user', audit: 0, new: 0, sum: 0 },
        { name: 'notIdentified', audit: 0, new: 0, sum: 0 },
    ],
    lastId: false,
    lastIdDate: false,

    //.DATABASE
    database: {
        /** ///BUSCA DADOS */
        get() {
            (async function () {
                const resp = await $fetch({
                    url: 'bank/audit/bankAudit/get',
                    fnName: 'BUSCA #549',
                });

                check.database.set(resp);
                check.view.all();
            }());
        },

        /** ///SETA */
        set(resp) {
            check.fields.forEach(field => {
                //:ULTIMO REGISTRO A SER CONSULTADO
                check.lastId = resp.audit.id;
                check.lastIdDate = resp.audit.date;

                //:SETA NEW
                const nameNew = `${field.name}New`;
                field.new = $numberOnly(resp.new[nameNew]);

                //:SETA AUDIT
                const nameAudit = `${field.name}Audit`;
                field.audit = $numberOnly(resp.audit[nameAudit]);

                //:SETA SUM
                field.sum = $numberOnly(field.new + field.audit);
            });
        },

        /** ///SALVAR */
        save() {
            const fields = {};
            check.fields.forEach(field => fields[`${field.name}Audit`] = $numberOnly(field.sum));

            //:FETCH
            (async function () {
                await $fetch({
                    url: 'bank/audit/bankAudit/saveNewAudit',
                    par: { fields },
                    fnName: 'BUSCA #654',
                });

                check.database.get();
            }());
        },

        /** ///DELETAR */
        delete() {
            //:FETCH
            (async function () {
                const auditId = check.lastId;

                await $fetch({
                    url: 'bank/audit/bankAudit/deleteAudit',
                    par: { auditId },
                    fnName: 'DELETA #655',
                });

                check.database.get();
            }());
        },
    },

    //.VIEW
    view: {
        /** ///ATUALIZA VIEW DE INPUTS */
        inputs() {
            let totalAudit = 0;
            let totalNew = 0;

            //:ULTIMO ID
            $mask.input($n('id'), check.lastId);
            $mask.input($n('lastDateAudit'), check.lastIdDate);

            //:DÁ VALOR AOS INPUT
            check.fields.forEach(field => {
                //:AUDIT
                const nameAudit = `${field.name}Audit`;
                const valAudit = $numberOnly(field.audit);
                $mask.input($n(nameAudit), valAudit);

                //:NEW
                const nameNew = `${field.name}New`;
                const valNew = $numberOnly(field.new);
                $mask.input($n(nameNew), valNew);

                //:SUM
                if (field.name != 'lastId') {
                    const nameSum = `${field.name}Sum`;
                    const valSum = $numberOnly(field.sum);
                    $mask.input($n(nameSum), valSum);

                    //:TOTAL AUDIT
                    totalAudit += $numberOnly(valAudit);

                    //:TOTAL NEW
                    totalNew += valNew;

                    //:TOTAL SUM
                    totalSum = totalAudit + totalNew;
                };
            });

            //:TOTAL AUDIT
            $mask.input($n('totalAudit'), totalAudit);

            //:TOTAL NEW
            $mask.input($n('totalNew'), totalNew);

            //:TOTAL SUM
            $mask.input($n('totalSum'), totalSum);
        },

        /** ///ATUALIZA VIEW DE BOTÕES LISTA */
        buttons(tableId) {
            //:DESATIVA TODOS OS BOTÕES
            $$('#check .btnList').forEach(btn => btn.classList.remove('active'));

            //:ATIVA BOTÃO SELECIONADO
            $(`#check .btnList[data-table="${tableId}"]`)?.classList.add('active');
        },

        /** ///ATUALIZA VIEW TUDO */
        all() {
            this.inputs();
            this.buttons();
        },
    },

    /** ///EVENTOS */
    events(target) {
        //:BOTÃO ATUALIZAR
        if (target.closest('.btnRefresh')) return check.database.get();
        //:BOTÃO ATUALIZAR
        if (target.closest('.btnDelete')) return check.database.delete();
        //:BOTÃO SALVAR
        if (target.closest('.btnSave')) return check.database.save();
        //:BOTÃO LISTA
        if (target.closest('.btnList')) {
            const tableId = target.closest('.btnList').dataset.table;
            list.database.get(tableId);
            check.view.buttons(tableId);
        };
    },
};

//-BODY LIST
const list = {
    //.DATABASE
    database: {
        /** ///BUSCA DADOS */
        get(tableId) {
            (async function () {
                const resp = await $fetch({
                    url: 'bank/audit/bankAudit/getListByTable',
                    par: { tableId: tableId },
                    fnName: 'BUSCA #653',
                });

                list.view(resp.list);
            }());
        },
    },

    /** ///VIEW */
    view(list) {
        let line = 0;

        //:CRIA TEMPLATE
        const tpt = list.map(({ id, date, value, positive }) => `
            <tr data-id="${id}">
                <th scope="row">${++line}</th>
                <td>${id}</td>
                <td>${date}</td>
                <td>${value}</td>
                <td>${positive}</td>
            </tr>`
        ).join('');

        $('#list tbody').innerHTML = tpt;
    },

    /** ///EVENTOS */
    events(target) {
        cl('LIST');
    },
};

/** ///INICIO */
const init = () => {
    //:EVENTOS
    $event('main', false, 'click', target => {
        if (target.closest('#check')) return check.events(target);
        if (target.closest('#list')) return list.events(target);
    });
};