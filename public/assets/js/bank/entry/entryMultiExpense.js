document.addEventListener("DOMContentLoaded", () => {
    md8.init();
});

const md8 = {
    factor: 0,//:1 ou -1

    /** ///ABRE E PREPARA MODAL */
    start(type, modeListEnable) {
        md8.factor = type === 'credito' ? 1 : -1;
        md8.listOut.modeListEnable = modeListEnable.split(',');

        //:SETA O PRIMEIRO DA LISTA
        md8.listOut.setMode(md8.listOut.modeListEnable[0]);

        md8.totalCalculate();

        $showHideModal('#md8');
    },

    /** ///LIMPA CAMPOS */
    restart() {
        md8.listIn.bank.resset.all();
        md8.listOut.expense.resset.all();
    },

    /** ///CALCULA VALOR TOTAL */
    totalCalculate() {
        cl('PARADO AKI');
    },

    //.BODY ENTRADA
    listIn: {
        bank: {
            data: [],
            total: 0,

            /** ///NOVO BANCO */
            new() {
                let value = +$i('vl_bank_md8').value;
                value = value * (value < 0 ? -1 : 1);
                value = value * md8.factor;

                md8.listIn.bank.data.push({
                    table: 10,
                    id: $i('id_bank_md8').value,
                    name: $i('nm_bank_md8').value,
                    date: $i('dt_bank_md8').value,
                    value,
                });

                md8.listIn.bank.totalSum();
                md8.listIn.bank.dom();
                md8.listIn.bank.resset.add();
                return;

                md8.totalCalculate();
            },

            //.RESSETA
            resset: {
                /** ///RESSETA CAMPOS DE ADD */
                add() {
                    $i('id_bank_md8').value = '';
                    $i('nm_bank_md8').value = '';
                    $i('dt_bank_md8').value = '';
                    $i('vl_bank_md8').value = '';

                    $i('dt_bank_md8').focus();
                },

                /** ///RESSETA LISTA */
                list() {
                    md8.listIn.bank.data = [];
                    md8.listIn.bank.total = 0;

                    md8.listIn.bank.totalSum();
                    md8.listIn.bank.dom();
                },

                /** ///RESSETA TUDO */
                all() {
                    md8.listIn.bank.resset.add();
                    md8.listIn.bank.resset.list();
                },
            },

            /** ///TOTAL DESPESAS */
            totalSum() {
                md8.listIn.bank.total = md8.listIn.bank.data.reduce((accumulator, { value }) => accumulator + value, 0);
            },

            //.DOM
            dom() {
                let row = 0;

                const tpt = md8.listIn.bank.data.map(({ id, name, date, value }) => {
                    const val = mask.currency.formatNow($numberOnly(value));

                    return `
                        <div class="grid gridBank" data-row="${row++}">
                            <div></div>
                            <input type="date" class="form-control text-center date" value="${date}">
                            <input class="id" value="${id}" style="display:none">
                            <input type="text" class="form-control" value="${name}">
                            <input type="text" class="form-control value" value="${val}" mask="number">
                            <div class="flex-center">
                                <i class="fas fa-trash-alt f25 ms-2 btnDel"></i>
                            </div>
                        </div>`;
                });

                //:innerHTML
                $('#md8 .f_in .listBank').innerHTML = tpt.join('');

                //:TOTAL
                $('#md8 .f_in .total').style.display = md8.listIn.bank.data.length > 0 ? 'grid' : 'none';
                $('#md8 .f_in .total .value input').value = mask.currency.formatNow($numberOnly(md8.listIn.bank.total));
            },
        },

        /** ///DELETA BANCO DA LISTA */
        deleteList(el) {
            //:DELETA DESPESA
            if (el.closest('.gridBank')) {
                const row = el.closest('.gridBank').dataset.row;
                md8.listIn.bank.data.splice(row, 1);

                md8.listIn.bank.totalSum();
                md8.listIn.bank.dom();
            };

            md8.totalCalculate();
        },

        /** ///EVENTOS */
        events(event) {
            const target = event.target;
            if (target.readOnly == true || target.disabled == true) return;

            //:SE FOR KEYUP MAS NÃO FOR UM ENTER
            if (event.type == 'keyup' && event.key !== 'Enter') return;

            //:SE FOR UM ENTER
            if (event.type == 'keyup' && event.key == 'Enter') {
                //:ADICIONA BANCO COM ENTER
                if (target.closest('#vl_bank_md8')) return md8.listIn.bank.new();
                //:ALTERA VALOR COM ENTER
                if (target.closest('.value')) {
                    $mask.input(target, target.value, event.type);
                    return md8.totalCalculate();
                };
                return;
            };

            //:SE FOR UM CHANGE
            if (event.type == 'change') {
                //:SE ALTERAR VALOR DA LISTA
                if (target.closest('.value')) {
                    $mask.input(target, target.value, event.type);
                    return md8.totalCalculate();
                };
                return;
            };

            //:SE ENTRAR OU SAIR DE UM INPUT
            if ($existIn('input', target.localName)) {
                //:EXECUTA MASK EM INPUT
                return $mask.input(target, target.value, event.type);
            };

            //:SE FOR UM CLICK
            if (event.type == 'click') {
                //:DELETA ITEM DA LISTA
                if (target.closest('.btnDel')) return md8.listIn.deleteList(target);
                //:ACICIONA BANCO PELO BOTÃO
                if (target.closest('#btnNewBank_md8')) return md8.listIn.bank.new();
                return;
            };
        },
    },

    //.BODY SAIDA
    listOut: {
        modeList: ['os', 'expense', 'supplier'],//:LISTA
        modeListEnable: [],//:LISTA ATIVA
        modeActive: false,//:OS, Despesa, Fornecedor

        //.NOVA OS
        os: {
            data: [],
            total: 0,

            /** ///NOVA OS */
            new() {
                (async function () {
                    const osId = $i('idOs_md8').value;

                    //:FETCH
                    const resp = await $fetch({
                        url: 'bank/entry/entryMultiExpense/getOs',
                        par: { osId },
                        fnName: 'BUSCA OS #609'
                    });

                    if (resp.status != 200) return;

                    //:VALOR
                    let value = resp.os.vl_reimbursement;
                    value = value * (value < 0 ? -1 : 1);
                    value = value * md8.factor;

                    //:NOVO OS DATA
                    md8.listOut.os.data.push({
                        table: 9,
                        id: resp.os.id,
                        description: `Os ${resp.os.id}`,
                        value,
                        month: resp.os.month,
                    });

                    cl(md8.listOut.os.data);
                    //! PAREI AKI

                    // md8.listOut.os.totalSum();
                    md8.listOut.os.dom();
                    return;

                    md8.listOut.os.resset.add();
                }());
            },

            /** ///CRIA TEMPLATE */
            dom() {
                let row = 0;

                const tpt = md8.listOut.os.data.map(({ table, id, description, value, month }) => {
                    const val = mask.currency.formatNow($numberOnly(value));

                    return `
                        <div class="grid gridOs" data-row="${row++}">
                            <div class="flex-center">
                                <i class="fa-light fa-clipboard-medical f33"></i>
                            </div>
                            <input type="hidden" class="month" value="${month}">
                            <input type="text" class="form-control text-center id" value="${id}" Readonly>
                            <input type="text" class="form-control" value="${description}" Readonly>
                            <input type="text" class="form-control value" value="${val}" mask="number">
                            <div class="flex-center">
                                <i class="fas fa-trash-alt btnDel f25"></i>
                            </div>
                        </div>`;
                });

                //:innerHTML
                $('#md8 .f_out .listOs').innerHTML = tpt.join('');

                //:TOTAL
                // $('#md8 .f_out .total').style.display = md8.listOut.expense.data.length > 0 ? 'grid' : 'none';
                // $('#md8 .f_out .total .value input').value = mask.currency.formatNow($numberOnly(md8.listOut.expense.total));
            },
        },

        //.DESPESA
        expense: {
            data: [],
            total: 0,

            /** ///NOVA DESPESA */
            new() {
                let value = +$i('val_md8').value;
                value = value * (value < 0 ? -1 : 1);
                value = value * md8.factor;

                md8.listOut.expense.data.push({
                    table: 1,
                    id: $i('id_expense_md8').value,
                    name: $i('nm_expense_md8').value,
                    description: $i('description_md8').value,
                    value,
                });

                md8.listOut.expense.totalSum();
                md8.listOut.expense.dom();
                md8.listOut.expense.resset.add();
            },

            //.RESSETA
            resset: {
                /** ///RESSETA CAMPOS DE ADD */
                add() {
                    $i('id_expense_md8').value = '';
                    $i('nm_expense_md8').value = '';
                    $i('description_md8').value = '';
                    $i('val_md8').value = '';

                    $i('nm_expense_md8').focus();
                },

                /** ///RESSETA LISTA */
                list() {
                    md8.listOut.expense.data = [];
                    md8.listOut.expense.total = 0;

                    md8.listOut.expense.totalSum();
                    md8.listOut.expense.dom();
                },

                /** ///RESSETA TUDO */
                all() {
                    md8.listOut.expense.resset.add();
                    md8.listOut.expense.resset.list();
                },
            },

            /** ///TOTAL DESPESAS */
            totalSum() {
                md8.listOut.expense.total = md8.listOut.expense.data.reduce((accumulator, { value }) => accumulator + value, 0);
            },

            /** ///CRIA TEMPLATE */
            dom() {
                let row = 0;

                const tpt = md8.listOut.expense.data.map(({ id, name, description, value }) => {
                    const val = mask.currency.formatNow($numberOnly(value));

                    return `
                        <div class="grid gridExpense" data-row="${row++}">
                            <div class="flex-center">
                                <i class="fas fa-receipt f33"></i>
                            </div>
                            <input class="id" value="${id}" style="display:none">
                            <input type="text" class="form-control text-center" value="${name}" Readonly>
                            <input type="text" class="form-control description" value="${description}">
                            <input type="text" class="form-control value" value="${val}" mask="number">
                            <div class="flex-center">
                                <i class="fas fa-trash-alt btnDel f25"></i>
                            </div>
                        </div>`;
                });

                //:innerHTML
                $('#md8 .f_out .listExpense').innerHTML = tpt.join('');

                //:TOTAL
                $('#md8 .f_out .total').style.display = md8.listOut.expense.data.length > 0 ? 'grid' : 'none';
                $('#md8 .f_out .total .value input').value = mask.currency.formatNow($numberOnly(md8.listOut.expense.total));
            },
        },

        /** ///DELETA OS OU DESPESA DA LISTA */
        deleteList(el) {
            //:DELETA OS
            // if (el.closest('.gridOs')) {
            //     const row = el.closest('.gridOs').dataset.row;
            //     md8.listIn.bank.data.splice(row, 1);

            //     md8.listIn.bank.totalSum();
            //     md8.listIn.bank.dom();
            // };
            //:DELETA DESPESA
            if (el.closest('.gridExpense')) {
                const row = el.closest('.gridExpense').dataset.row;
                md8.listOut.expense.data.splice(row, 1);

                md8.listOut.expense.totalSum();
                md8.listOut.expense.dom();
            };

            md8.totalCalculate();
        },

        /** ///SETA MODO - OS|DESPESA|FORNECEDOR */
        setMode(el = false) {
            const mode = el.nodeType ? el.dataset.mode : el;

            if (!mode) return cl('RETURN');

            //:SETA NOVO MODE ATIVO
            md8.listOut.modeActive = mode;

            //:ATIVA BOTÕES E DIVS
            md8.listOut.modeList.forEach(y => {
                const yUpper = y[0].toUpperCase() + y.substring(1);
                const action = y == mode ? 'add' : 'remove';
                const btnNode = $(`#md8 .f_out .top .btn.${y}`);

                //:BOTÃO
                btnNode.classList[action]('on');
                btnNode.disabled = md8.listOut.modeListEnable.includes(y) ? false : true;

                //:DIV ADD
                $(`#md8 .f_out .add${yUpper}`).classList[action]('on');
            });
        },

        /** ///EVENTOS */
        events(event) {
            const target = event.target;
            if (target.readOnly == true || target.disabled == true) return;

            //:SE FOR KEYUP MAS NÃO FOR UM ENTER
            if (event.type == 'keyup' && event.key !== 'Enter') return;

            //:SE FOR UM ENTER
            if (event.type == 'keyup' && event.key == 'Enter') {
                //:ADICIONA OS COM ENTER
                if (target.closest('#idOs_md8')) return md8.listOut.os.new();
                //:ADICIONA DESPESA COM ENTER
                if (target.closest('#val_md8')) return md8.listOut.expense.new();
                return;
            };

            //:SE FOR UM CHANGE
            if (event.type == 'change') {
                //:SE ALTERAR VALOR DA LISTA
                if (target.closest('.value')) {
                    const row = target.closest('.gridExpense').dataset.row;
                    if (!row) return;

                    const y = md8.listOut.modeActive;
                    md8.listOut[y].data[row].value = target.value * md8.factor;
                    md8.listOut[y].totalSum();
                    md8.listOut[y].dom();

                    return md8.totalCalculate();
                };
                return;
            };

            //:SE ENTRAR OU SAIR DE UM INPUT
            if ($existIn('input', target.localName)) {
                //:EXECUTA MASK EM INPUT
                return $mask.input(target, target.value, event.type);
            };

            //:SE FOR UM CLICK
            if (event.type == 'click') {
                //:DELETA ITEM DA LISTA
                if (target.closest('.btnDel')) return md8.listOut.deleteList(target);
                //:ACICIONA OS NA LISTA
                if (target.closest('.btnNewOs')) return md8.listOut.os.new();
                //:ADICIONA DESPESA NA LISTA
                if (target.closest('.btnNewExpense')) return md8.listOut.expense.new();
                //:MUDA MODO
                if (target.closest('.top')) return md8.listOut.setMode(target);

                return;
            };
        },
    },

    //.BODY FOOTER
    footer: {
        /** ///SALVA */
        save() {
            const bntSaveNode = $('#md8 .btnSave');

            //:CHECA SE JÁ FOI LANÇADO
            if (bntSaveNode.classList.contains('active')) {
                //:NÃO TEM PERMISSÃO P/ EXECUTAR NOVAMENTE
                if (!$permission(9)) return alert('Esse lançamento já foi executado.');

                //:DUPLICAR LANÇAMENTOS?
                if (!confirm("Esse lançamento já foi executado. Deseja duplicar os lançamentos?")) return;
            };

            //:VALOR P/ LISTAS
            const listIn = md8.listIn.bank.data;
            const listOut = [...md8.listOut.os.data, ...md8.listOut.expense.data];

            console.log('listIn: ', listIn);
            console.log('listOut: ', listOut);
            // return;//TODO PAREI AKI

            //:ATIVA BOTÃO "Lançar"
            bntSaveNode.classList.add('active');

            //:FETCH
            (async function () {
                await $fetch({
                    url: 'bank/entry/MultiEntryAdd/entryAdd',
                    par: { listIn, listOut },
                    fnName: 'SALVA #611'
                });
            }());
        },

        /** ///FECHA MODAL */
        exit() {
            $showHideModal('#md8');
        },

        /** ///EVENTOS */
        events(target) {
            //:BOTÃO SAIR
            if (target.closest('.btnExit')) return md8.footer.exit();
            //:BOTÃO LIMPAR
            if (target.closest('.btnRestart')) return md8.restart();
            //:BOTÃO SALVAR
            if (target.closest('.btnSave')) return md8.footer.save();
        },
    },

    /** ///EVENTOS */
    events(event) {
        const target = event.target;

        //:EVENTOS EM DIV '.f_in'
        if (target.closest('.f_in')) return md8.listIn.events(event);
        //:EVENTOS EM DIV '.f_out'
        if (target.closest('.f_out')) return md8.listOut.events(event);
        //:EVENTOS EM DIV '.f_footer'
        if (target.closest('.f_footer') && event.type == 'click') return md8.footer.events(target);
    },

    /** ///INICIO */
    init() {
        //:SELECT DE BANCO
        (function as_bank() {
            if (typeof selectBank_md8 === 'undefined') { selectBank_md8 = ajaxSelect() };
            selectBank_md8.init({
                div: '#md8 .as_bank',
                url: 'bank/register/find/findBank',
                fields: 'col1',
                callback: (e) => {
                    $i('id_bank_md8').value = e.id;
                    $i('nm_bank_md8').value = e.txt1;
                },
            });
        }());

        //:SELECT DE DESPESA
        (function as_expense() {
            if (typeof selectExpense_md8 === 'undefined') { selectExpense_md8 = ajaxSelect() };
            selectExpense_md8.init({
                div: '#md8 .as_expense',
                url: 'bank/entry/entryAdd/find_expense',
                fields: 'name',
                callback: (e) => {
                    $i('id_expense_md8').value = e.id;
                    $i('nm_expense_md8').value = e.txt1;
                    $i('description_md8').value = e.txt1;
                },
            });
        }());

        //:EVENTOS
        $event('#md8', false, 'change,keyup,click,focusout', event => md8.events(event), false);
    },
}