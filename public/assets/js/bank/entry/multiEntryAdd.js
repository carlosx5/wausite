document.addEventListener("DOMContentLoaded", () => {
    md5.init();
});

const md5 = {
    /** ///ABRE E PREPARA MODAL */
    start() {
        md5.totalCalculate();

        $showHideModal("#md5");
    },

    /** ///LIMPA CAMPOS */
    restart() {
        md5.listIn.dom.clear();

        //:LIMPA LISTAS
        $(".bank_list").innerHTML = "";
        $(".os_list").innerHTML = "";
        $(".expense_list").innerHTML = "";

        md5.totalCalculate();
    },

    /** ///CALCULA VALOR TOTAL */
    totalCalculate() {
        let bankTotal = 0,
            osTotal = 0,
            inShowTotal = false,
            outShowTotal = false;

        //:TOTAL BANCO
        $$(".bank_list .value").forEach((e) => {
            bankTotal += $numberOnly(e.value);
            inShowTotal = true;
        });
        //
        $mask.input(".f_in .total_value", bankTotal, "change");
        //
        $(".f_in .f_total").style.display = inShowTotal ? "flex" : "none";

        //:TOTAL OS
        $$(".os_list .value, .expense_list .value").forEach((e) => {
            osTotal += $numberOnly(e.value);
            outShowTotal = true;
        });
        //
        $mask.input(".f_out .total_value", osTotal, "change");
        //
        $(".f_out .f_total").style.display = outShowTotal ? "flex" : "none";
    },

    //.BODY ENTRADA
    listIn: {
        //.DOM
        dom: {
            /** ///LIMPA CAMPOS DE INSERIR NOVO BANCO */
            clear() {
                $i("dt_bank_md5").value = "";
                $i("nm_bank_md5").value = "";
                $i("id_bank_md5").value = "";
                $i("vl_bank_md5").value = "";
            },

            /** ///CRIA TEMPLATE DE NOVO BANCO NA LISTA */
            createTemplate() {
                const dt_bank = $i("dt_bank_md5").value;
                const id_bank = $i("id_bank_md5").value;
                const nm_bank = $i("nm_bank_md5").value;
                const vl_bank = mask.currency.formatNow($i("vl_bank_md5").value);

                const tpt = `
                <div class="bank_grid">
                    <div class="flex-center">
                        <i class="fas fa-money-check-alt f33 me-2" style="cursor:auto"></i>
                    </div>
                    <input type="date" class="form-control text-center date" value="${dt_bank}">
                    <input class="id" value="${id_bank}" style="display:none">
                    <input type="text" class="form-control" value="${nm_bank}">
                    <input type="text" class="form-control value" value="${vl_bank}" mask="number">
                    <div class="flex-center">
                        <i class="fas fa-trash-alt f25 ms-2 btnDel"></i>
                    </div>
                </div>`;

                let node = $("#md5 .bank_list");
                node.innerHTML = tpt + node.innerHTML;
            },
        },

        /** ///INICIA NOVO BANCO */
        newBank() {
            md5.listIn.dom.createTemplate();
            md5.listIn.dom.clear();

            $i("dt_bank_md5").focus();

            md5.totalCalculate();
        },

        /** ///EVENTOS */
        events(event) {
            const target = event.target;
            if (target.readOnly == true || target.disabled == true) return;

            //:SE FOR KEYUP MAS NÃO FOR UM ENTER
            if (event.type == "keyup" && event.key !== "Enter") return;

            //:SE FOR UM ENTER
            if (event.type == "keyup" && event.key == "Enter") {
                //:ADICIONA BANCO COM ENTER
                if (target.closest("#vl_bank_md5")) return md5.listIn.newBank();
                //:ALTERA VALOR COM ENTER
                if (target.closest(".value")) {
                    $mask.input(target, target.value, event.type);
                    return md5.totalCalculate();
                }
                return;
            }

            //:SE FOR UM CHANGE
            if (event.type == "change") {
                //:SE ALTERAR VALOR DA LISTA
                if (target.closest(".value")) {
                    $mask.input(target, target.value, event.type);
                    return md5.totalCalculate();
                }
                return;
            }

            //:SE ENTRAR OU SAIR DE UM INPUT
            if ($existIn("input", target.localName)) {
                //:EXECUTA MASK EM INPUT
                return $mask.input(target, target.value, event.type);
            }

            //:SE FOR UM CLICK
            if (event.type == "click") {
                //:ACICIONA BANCO PELO BOTÃO
                if (target.closest("#btnNewBank_md5")) return md5.listIn.newBank();
                return;
            }
        },
    },

    //.BODY SAIDA
    listOut: {
        //.NOVA OS
        newOs: {
            /** ///INICIA */
            start: async function () {
                const resp = await md5.listOut.newOs.getData();
                if (resp.status != 200) return;

                md5.listOut.newOs.createTemplate(resp.os);

                $i("idOs_md5").value = "";
                md5.totalCalculate();
            },

            /** ///BUSCA DADOS */
            getData: async function () {
                const formdata = new FormData();
                formdata.append("osId", $i("idOs_md5").value);

                const resp = await $fetch({
                    url: "tools/teste/teste/get_os",
                    par: formdata,
                    fnName: "BUSCA OS #609",
                });

                return resp;
            },

            /** ///CRIA TEMPLATE */
            createTemplate({ id, name, month, vl_reimbursement }) {
                vl_reimbursement = mask.currency.formatNow(vl_reimbursement);

                const tpt = `
                <div class="os_grid">
                    <div class="flex-center">
                        <i class="fa-light fa-clipboard-medical f33"></i>
                    </div>
                    <input type="hidden" class="month" value="${month}">
                    <input type="text" class="form-control text-center id" value="${id}" Readonly>
                    <input type="text" class="form-control" value="${name}" Readonly>
                    <input type="text" class="form-control value" value="${vl_reimbursement}" mask="number">
                    <div class="flex-center">
                        <i class="fas fa-trash-alt btnDel f25"></i>
                    </div>
                </div>
            `;

                $(".os_list").innerHTML = tpt + $(".os_list").innerHTML;
            },
        },

        //.NOVA DESPESA
        newExpense: {
            /** ///INICIA */
            start: async function () {
                md5.listOut.newExpense.createTemplate();

                $i("id_expense_md5").value = "";
                $i("nm_expense_md5").value = "";
                $i("description_md5").value = "";
                $i("val_md5").value = "";
                //
                $i("nm_expense_md5").focus();

                md5.totalCalculate();
            },

            /** ///CRIA TEMPLATE */
            createTemplate() {
                const id_expense = $i("id_expense_md5").value;
                const nm_expense = $i("nm_expense_md5").value;
                const description = $i("description_md5").value;
                const val = mask.currency.formatNow($numberOnly($i("val_md5").value) * -1);

                const tpt = `
                <div class="expense_grid">
                    <div class="flex-center">
                        <i class="fas fa-receipt f33"></i>
                    </div>
                    <input class="id" value="${id_expense}" style="display:none">
                    <input type="text" class="form-control text-center" value="${nm_expense}" Readonly>
                    <input type="text" class="form-control description" value="${description}">
                    <input type="text" class="form-control value" value="${val}" mask="number">
                    <div class="flex-center">
                        <i class="fas fa-trash-alt btnDel f25"></i>
                    </div>
                </div>
            `;

                $(".expense_list").innerHTML = tpt + $(".expense_list").innerHTML;
            },
        },

        /** ///DELETA OS OU DESPESA DA LISTA */
        deleteList(el) {
            //:DELETA OS
            if (el.closest(".os_grid")) el.closest(".os_grid").remove();
            //:DELETA DESPESA
            if (el.closest(".expense_grid")) el.closest(".expense_grid").remove();

            md5.totalCalculate();
        },

        /** ///TROCA OS|DESPESA */
        toggleMethod() {
            $(".os_input").classList.toggle("add_on");
            $(".expense_input").classList.toggle("add_on");
            //
            $(".title_link_os").classList.toggle("link_on");
            $(".title_link_expense").classList.toggle("link_on");
        },

        /** ///MÉTODO DE OS */
        osMethodOn() {
            $(".os_input").classList.add("add_on");
            $(".expense_input").classList.remove("add_on");
            //
            $(".title_link_os").classList.add("link_on");
            $(".title_link_expense").classList.remove("link_on");
        },

        /** ///MÉTODO DE DESPESA */
        expenseMethodOn() {
            $(".os_input").classList.remove("add_on");
            $(".expense_input").classList.add("add_on");
            //
            $(".title_link_os").classList.remove("link_on");
            $(".title_link_expense").classList.add("link_on");
        },

        /** ///EVENTOS */
        events(event) {
            const target = event.target;
            if (target.readOnly == true || target.disabled == true) return;

            //:SE FOR KEYUP MAS NÃO FOR UM ENTER
            if (event.type == "keyup" && event.key !== "Enter") return;

            //:SE FOR UM ENTER
            if (event.type == "keyup" && event.key == "Enter") {
                //:ADICIONA OS COM ENTER
                if (target.closest("#idOs_md5")) return md5.listOut.newOs.start();
                //:ADICIONA DESPESA COM ENTER
                if (target.closest("#val_md5")) return md5.listOut.newExpense.start();
                return;
            }

            //:SE FOR UM CHANGE
            if (event.type == "change") {
                //:SE ALTERAR VALOR DA LISTA
                if (target.closest(".value")) {
                    $mask.input(target, target.value, event.type);
                    return md5.totalCalculate();
                }
                return;
            }

            //:SE ENTRAR OU SAIR DE UM INPUT
            if ($existIn("input", target.localName)) {
                //:EXECUTA MASK EM INPUT
                return $mask.input(target, target.value, event.type);
            }

            //:SE FOR UM CLICK
            if (event.type == "click") {
                //:DELETA ITEM DA LISTA
                if (target.closest(".btnDel")) return md5.listOut.deleteList(target);
                //:ACICIONA OS NA LISTA
                if (target.closest("#btnNewOs_md5")) return md5.listOut.newOs.start();
                //:ADICIONA DESPESA NA LISTA
                if (target.closest("#btnNewExpense_md5")) return md5.listOut.newExpense.start();
                //:MUDA MÉTODO LISTA|DESPESA
                if (target.closest(".btnToggleSelect")) return md5.listOut.toggleMethod();
                //:MUDA MÉTODO PARA OS
                if (target.closest(".title_link_os")) return md5.listOut.osMethodOn();
                //:MUDA MÉTODO PARA DESPESA
                if (target.closest(".title_link_expense")) return md5.listOut.expenseMethodOn();
                return;
            }
        },
    },

    //.BODY FOOTER
    footer: {
        /** ///SALVA */
        save() {
            const bntSaveNode = $("#md5 .btnSave");

            //:CHECA SE JÁ FOI LANÇADO
            if (bntSaveNode.classList.contains("active")) {
                //:NÃO TEM PERMISSÃO P/ EXECUTAR NOVAMENTE
                if (!$permission(9)) return alert("Esse lançamento já foi executado.");

                //:DUPLICAR LANÇAMENTOS?
                if (!confirm("Esse lançamento já foi executado. Deseja duplicar os lançamentos?")) return;
            }

            //:VALOR P/ LISTAS
            const listIn = createListIn();
            const listOut = createListOut();

            //:ATIVA BOTÃO "Lançar"
            bntSaveNode.classList.add("active");

            //:FETCH
            (async function () {
                await $fetch({
                    url: "bank/entry/MultiEntryAdd/entryAdd",
                    par: { listIn, listOut },
                    fnName: "SALVA #611",
                });
            })();

            //:CRIA DATA DE ENTRADAS
            function createListIn() {
                const list = [];
                let key = 0;

                //:BANCO
                const inBank = $$(".bank_list .bank_grid");
                for (let index = 0; index < inBank.length; index++) {
                    const e = inBank[index];
                    list[key++] = {
                        table: 10,
                        id: e.querySelector(".id").value,
                        date: e.querySelector(".date").value,
                        val: e.querySelector(".value").value,
                    };
                }

                return list;
            }

            //:CRIA DATA DE SAÍDAS
            function createListOut() {
                const list = [];
                let key = 0;

                //:OS
                const outOs = $$(".os_list .os_grid");
                for (let index = 0; index < outOs.length; index++) {
                    const e = outOs[index];
                    list[key++] = {
                        table: 9,
                        id: e.querySelector(".id").value,
                        month: e.querySelector(".month").value,
                        val: e.querySelector(".value").value,
                    };
                }

                //:DESPESA
                const outExpense = $$(".expense_list .expense_grid");
                for (let index = 0; index < outExpense.length; index++) {
                    const e = outExpense[index];
                    list[key++] = {
                        table: 1,
                        id: e.querySelector(".id").value,
                        description: e.querySelector(".description").value,
                        val: e.querySelector(".value").value,
                    };
                }

                return list;
            }
        },

        /** ///FECHA MODAL */
        exit() {
            $showHideModal("#md5");
        },

        /** ///EVENTOS */
        events(target) {
            //:BOTÃO SAIR
            if (target.closest(".btnExit")) return md5.footer.exit();
            //:BOTÃO LIMPAR
            if (target.closest(".btnRestart")) return md5.restart();
            //:BOTÃO SALVAR
            if (target.closest(".btnSave")) return md5.footer.save();
        },
    },

    /** ///EVENTOS */
    events(event) {
        const target = event.target;

        //:EVENTOS EM DIV '.f_in'
        if (target.closest(".f_in")) return md5.listIn.events(event);
        //:EVENTOS EM DIV '.f_out'
        if (target.closest(".f_out")) return md5.listOut.events(event);
        //:EVENTOS EM DIV '.f_footer'
        if (target.closest(".f_footer") && event.type == "click") return md5.footer.events(target);
    },

    /** ///INICIO */
    init() {
        //:SELECT DE BANCO
        (function as_bank() {
            if (typeof selectBank_md5 === "undefined") {
                selectBank_md5 = ajaxSelect();
            }
            selectBank_md5.init({
                div: "#md5 .as_bank",
                url: "bank/register/find/findBank",
                fields: "col1",
                callback: (e) => {
                    $i("id_bank_md5").value = e.id;
                    $i("nm_bank_md5").value = e.txt1;
                },
            });
        })();

        //:SELECT DE DESPESA
        (function as_expense() {
            if (typeof selectExpense_md5 === "undefined") {
                selectExpense_md5 = ajaxSelect();
            }
            selectExpense_md5.init({
                div: "#md5 .as_expense",
                url: "bank/entry/entryAdd/find_expense",
                fields: "name",
                callback: (e) => {
                    $i("id_expense_md5").value = e.id;
                    $i("nm_expense_md5").value = e.txt1;
                    $i("description_md5").value = e.txt1;
                },
            });
        })();

        //:EVENTOS
        $event("#md5", false, "change,keyup,click,focusout", (event) => md5.events(event), false);
    },
};
