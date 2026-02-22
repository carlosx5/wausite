//LOCALIZA E RETORNAR ELEMENTO-NODE DENTRO DO MODAL "entryAdd" - sf=SELECTOR-FIND
const sf = (selector) => document.querySelector(`#entryAdd ${selector}`);
//LOCALIZA UM SELETOR "name" E RETORNAR ELEMENTO-NODE DENTRO DO MODAL "entryAdd" - nf=NAME-FIND
const nf = (selector) =>
    document.querySelector(
        (function () {
            return `#entryAdd [name=${selector}]`;
        })()
    );

const bankModal = {
    function: "",
    params: {},
    ajaxReturn: "",
    bankId: "",
    bankNm: "",

    //:BOTÃO DE NOVO LANÇAMENTO CLICADO
    newEntry(callback) {
        if (!$permission(60)) return;

        bankModal.ajaxReturn = callback;

        (async function () {
            await bankModal.showModal();
            sf("#bankEntry").style.display = "none";
            sf("#bankMenu").style.display = "block";
        })();
    },

    //:ABRE MODAL
    showModal: async function () {
        await getModalTemplate();

        //OCULTA TODOS OS SELECTS DE LANÇAMENTO
        let hides = ["as_entry1", "as_entry2"];
        hides.forEach((hide) => ($(`#${hide}`).closest(".g-0").style.display = "none"));

        this.btnClinicSelect("");
        $showHideModal("#entryAdd");

        //BUSCA TEMPLARTE DE MODAL E ADICIONA EM DOM
        async function getModalTemplate(f) {
            if (sf(`div`)) return;

            const resp = await $fetch({
                url: "bank/entry/entryAdd/bank_entry",
                fnName: "BUSCA TEMPLATE #550",
                overlay: false,
                consoleOn: false,
            });

            $("#entryAdd").innerHTML = resp.template;

            if (!$permission([122, 60], 0)) {
                $("#entryAdd .adjustment, #entryAdd .transfer, #entryAdd .clinicEntry").remove();
            }
            cl("CHECAR");

            mask.currency.init({ element: "#entryAdd [name=modalValue]" });

            //CRIA BOTÕES DE SELEÇÃO DE CLÍNICA
            const tpt = resp.clinics
                .map(({ id, name_social }) => {
                    return `
                        <div class="col-6 px-1 m-0 mt-2">
                            <button class="clinicSelect btn btn-secondary w-100" data-id="${id}">${name_social}</button>
                        </div>`;
                })
                .join(" ");
            //
            $("#bankMenu .clinics_btns").innerHTML = tpt;
        }
    },

    //:INICIALIZA TELA DE LANÇAMENTO TODA VEZ QUE CLICAR EM UMA OPÇÃO DO MENU
    start() {
        bankModal.bankId = $("#menuTop .id").value;
        bankModal.bankNm = $("#menuTop .name").value;

        //CRIA TODOS SELECT
        this.createSelectFactory();

        //BOTÃO SALVAR DESABILITADO
        $(".btnSave").disabled = true;

        //CHECA SELEÇÃO DE CLÍNICA
        if (!this.clinicId) return $messageDiv({ message: "Selecione uma clínica!" });

        //FECHA MENU
        sf("#bankMenu").style.display = "none";
        sf("#bankEntry").style.display = "block";

        if (!this.getParamsValues()) return $showHideModal("#entryAdd");
        this.setParamsValues();
        if (!this.setSelectFactory()) return $showHideModal("#entryAdd");
    },

    //.DA VALOR AOS PARÂMETROS CONFORME FUNÇÃO SELECIONADA
    getParamsValues() {
        this.params = {
            title: "",
            description: "",
            lable1: "",
            lable2: "",
            nm_clinic: "",
            id_clinic: "",
            entry1Name: "",
            entry1Id: "",
            entry2Name: "",
            entry2Id: "",
            value: 0,
            valueDisabled: false,
            valueGetValue: true,
            entry2NameDisabled: false,
        };

        this.params.date = (function autoDateSetting() {
            const dt1 = $(".sidebarTools .dateIn").value;
            const dt2 = $(".sidebarTools .dateOut").value;

            return dt1 && dt1 == dt2 ? dt1 : dateNow("US");
        })();

        switch (this.function) {
            case "cooperatorOut": //*COLABORADOR
                this.params.title = "Pagamento Colaborador";
                this.params.lable1 = "Colaborador";
                this.params.lable2 = "Banco";
                this.params.entry2Name = bankModal.bankNm;
                this.params.entry2Id = bankModal.bankId;
                break;

            case "providerOut": //*FORNECEDOR
                this.params.title = "Pagamento de Fornecedor";
                this.params.lable1 = "Fornecedor";
                this.params.lable2 = "Banco";
                this.params.entry2Name = bankModal.bankNm;
                this.params.entry2Id = bankModal.bankId;
                break;

            case "loanOut": //*FORNECEDOR
                this.params.title = "Pagamento de Empréstimo";
                this.params.lable1 = "Empréstimo";
                this.params.lable2 = "Banco";
                this.params.entry2Name = bankModal.bankNm;
                this.params.entry2Id = bankModal.bankId;
                break;

            case "employeeOut": //*FUNCIONÁRIO
                this.params.title = "Pagamento Funcionário";
                this.params.lable1 = "Funcionário";
                this.params.lable2 = "Banco";
                this.params.entry2Name = bankModal.bankNm;
                this.params.entry2Id = bankModal.bankId;
                break;

            //DESPESAS
            case "clinicEntryEmployee": //*FUNCIONÁRIO
                this.params.title = "Clínica -> Funcionário";
                this.params.lable1 = "Despesa";
                this.params.lable2 = "Funcionário";
                break;

            case "expenseOut": //*OUTRAS
                this.params.title = "Lançamento de Despesa";
                this.params.lable1 = "Despesa";
                this.params.lable2 = "Banco";
                this.params.entry2Name = bankModal.bankNm;
                this.params.entry2Id = bankModal.bankId;
                break;

            //CRÉDITOS
            case "applicationsIn": //*APLICAÇÃO
                this.params.title = "Crédito de Aplicação";
                this.params.description = "Crédito de Aplicação";
                // this.params.lable1 = 'Banco';
                this.params.lable2 = "Banco";
                // this.params.entry1Name = bankModal.bankNm;
                // this.params.entry1Id = bankModal.bankId;
                this.params.entry2Name = bankModal.bankNm;
                this.params.entry2Id = bankModal.bankId;
                break;

            //TRANSFERENCIA
            case "paymentVoucher": //*COMPROVAÇÃO DE DEPÓSITO
                this.params.title = "Comprovação de depósito";
                this.params.description = "Comprovação de Depósito";
                this.params.lable1 = "Banco";
                this.params.lable2 = "Banco";
                this.params.entry1Name = bankModal.bankNm;
                this.params.entry1Id = bankModal.bankId;
                this.params.entry2Name = bankModal.bankNm;
                this.params.entry2Id = bankModal.bankId;
                break;

            case "transferBankBank": //*BANCO/BANCO
                this.params.title = "Transferência de banco";
                this.params.lable1 = "Banco";
                this.params.lable2 = "Banco";
                break;

            //AJUSTES
            case "adjustmentBank": //*BANCO
                this.params.title = "Ajuste de banco";
                this.params.lable2 = "Banco";
                this.params.entry1Id = 3;
                break;

            case "adjustmentCooperator": //*COLABORADOR
                this.params.title = "Ajuste de colaborador";
                this.params.lable1 = "Colaborador";
                this.params.entry2Id = 3;
                break;

            case "adjustmentClinic": //*CLINICA
                this.params.title = "Ajuste de clínica";
                this.params.lable1 = "Clínica";
                this.params.entry2Id = 3;
                break;

            case "adjustmentNotIdentified": //*NÃO IDENTIFICADO
                this.params.title = "Não identificado";
                this.params.description = `Não identificado: ${bankModal.bankNm}`;
                this.params.lable1 = "Banco";
                this.params.entry1Name = bankModal.bankNm;
                this.params.entry1Id = bankModal.bankId;
                break;

            case "userEntry": //*DEPÓSITO USUÁRIO
                this.params.title = "Crédito Usuário";
                this.params.description = "";
                this.params.lable1 = "Usuário";
                this.params.lable2 = "Banco";
                this.params.entry2Name = bankModal.bankNm;
                this.params.entry2Id = bankModal.bankId;
                break;

            //ERRO
            default:
                cl("ERRO!");
                return false;
        }

        return true;
    },

    //:PREENCHE DADOS DO MODAL
    setParamsValues() {
        const propValue = this.params.valueDisabled ?? false;
        const propEntry1 = this.params.entry1NameDisabled ?? false;
        const propEntry2 = this.params.entry2NameDisabled ?? false;
        const cssValueGetValue = this.params.valueGetValue ? { color: "#067F8C", cursor: "pointer" } : { color: "#6e6e6e" };

        sf(`#bankEntry .form-hr label`).textContent = this.params.title;
        nf("modalDescription").value = this.params.description;
        nf("modalDate").value = this.params.date;
        const modalValue = nf("modalValue");
        $change(modalValue, this.params.value);
        modalValue.disabled = propValue;

        $style(`#entryAdd .fa-calculator`, cssValueGetValue);
        nf("modalCurrency").disabled = true;
        nf("month").value = this.params.month;

        sf(`#as_entry1 label`).textContent = this.params.lable1;
        sf(`#as_entry2 label`).textContent = this.params.lable2;

        nf("nm_clinic").value = this.clinicNm;
        nf("id_clinic").value = this.clinicId;

        const entry1Name = nf("entry1Name");
        entry1Name.value = this.params.entry1Name;
        entry1Name.disabled = propEntry1;
        nf("entry1Id").value = this.params.entry1Id;

        const entry2Name = nf("entry2Name");
        entry2Name.value = this.params.entry2Name;
        entry2Name.disabled = propEntry2;
        nf("entry2Id").value = this.params.entry2Id;
    },

    //:CRIA TODOS SELECT (APENAS SE JÁ NÃO FORAM CRIADOS)
    createSelectFactory() {
        if (typeof bankModal.select1 === "undefined") {
            bankModal.select1 = ajaxSelect();
            bankModal.select2 = ajaxSelect();
        }
    },

    //.PASSA PARAMETROS E INICIA SELECT
    setSelectFactory() {
        switch (this.function) {
            //PAGAMENTOS
            case "cooperatorOut": //*COLABORADOR
                setSelectParams(1, "bank/entry/entryAdd/get_cooperator_find", "name_social");
                setSelectParams(2, "bank/register/find/findBank", "col1");
                break;

            case "providerOut": //*FORNECEDOR
                setSelectParams(1, "bank/entry/entryAdd/find_provider", "name");
                setSelectParams(2, "bank/register/find/findBank", "col1");
                break;

            case "loanOut": //*EMPRESTIMO
                setSelectParams(1, "bank/loan/find/findLoan", "col1");
                setSelectParams(2, "bank/register/find/findBank", "col1");
                break;

            //DESPESA
            case "employeeOut": //*FUNCIONÁRIO
                setSelectParams(1, "bank/entry/entryAdd/get_employee_find", "name");
                setSelectParams(2, "bank/register/find/findBank", "col1");
                break;

            case "expenseOut": //*OUTRAS
                setSelectParams(1, "bank/entry/entryAdd/find_expense", "name");
                setSelectParams(2, "bank/register/find/findBank", "col1");
                break;

            //CRÉDITOS
            case "applicationsIn": //*APLICAÇÃO
                setSelectParams(2, "bank/register/find/findBank", "col1");
                break;

            //TRANSFERENCIA DE CLÍNICA
            case "clinicEntryEmployee": //*FUNCIONÁRIO
                break;
                return clRed("PARADO AKI!");
                expenseOut();
                // employeeOut2();
                setSelectParams(2, "bank/entry/entryAdd/get_employee_find", "name");
                return;

            //TRANSFERENCIA BANCO/BANCO
            case "paymentVoucher": //*COMPROVANTE
                setSelectParams(1, "bank/register/find/findBank", "col1");
                setSelectParams(2, "bank/register/find/findBank", "col1");
                break;

            case "transferBankBank": //*BANCO/BANCO
                setSelectParams(1, "bank/register/find/findBank", "col1");
                setSelectParams(2, "bank/register/find/findBank", "col1");
                break;

            //AJUSTES
            case "adjustmentBank": //*BANCO
                setSelectParams(2, "bank/register/find/findBank", "col1");
                break;

            case "adjustmentCooperator": //*COLABORADOR
                setSelectParams(1, "bank/entry/entryAdd/get_cooperator_find", "name_social");
                break;

            case "adjustmentClinic": //*CLINICA
                setSelectParams(1, "clinic/register/find/findClinic", "col1");
                break;

            case "adjustmentNotIdentified": //*NÃO IDENTIFICADO
                setSelectParams(1, "bank/register/find/findBank", "col1");
                break;

            case "userEntry": //*ENTRADA DE VALOR P/ SER CREDITADO EM USUÁRIO
                setSelectParams(1, "bank/entry/entryAdd/get_cooperator_find", "name_social");
                setSelectParams(2, "bank/register/find/findBank", "col1");
                break;

            //ERRO
            default:
                cl("ERRO!");
                return false;
        }

        return true;

        function setSelectParams(x, url, fields) {
            $(`#as_entry${x}`).closest(".g-0").style.display = "flex";
            bankModal[`select${x}`].init({
                div: `#as_entry${x}`,
                url,
                fields,
                callback: (e) => bankModal.callback(e, `entry${x}`),
            });
        }
    },

    //:EXECUÇÕES DE CALLBACK
    callback(e, entry) {
        const entry1 = (e) => {
            if (this.function == "adjustmentNotIdentified") {
                let modalDescription = e.txt1;
                $change("[name=modalDescription]", `Não Identificado: ${modalDescription}`);
            } else if (this.function == "paymentVoucher") {
                $("[name=entry2Name]").value = e.txt1;
                $change("[name=entry2Id]", e.id);
            } else if (this.function == "userEntry") {
                $change("[name=modalDescription]", `Depósito Usuário: ${e.txt1}`);
            } else if (this.function == "loanOut") {
                $change("[name=modalDescription]", `Empréstimo: ${e.txt1}`);
            } else if (this.function != "expenseOut") {
                let modalDescription = e.txt1;
                $change("[name=modalDescription]", modalDescription);
            }

            $("[name=entry1Name]").value = e.txt1;
            $change("[name=entry1Id]", e.id);

            return bankModal.btnSaveProp();
        };

        const entry2 = (e) => {
            $("[name=entry2Name]").value = e.txt1;
            $change("[name=entry2Id]", e.id);

            return bankModal.btnSaveProp();
        };

        eval(entry)(e);
    },

    //.SALVA VIA FETCH
    save() {
        let table1 = 0,
            table2 = 0,
            positive1 = 0,
            positive2 = 0,
            id_source = 0,
            source_category = 0;

        const id_clinic = this.clinicId;
        const description = nf("modalDescription").value;
        const date = nf("modalDate").value;
        const pn = nf("modalValue").value.includes("-") ? "-" : "+"; //VALOR POSITIVO OU NEGATIVO
        const value = nf("modalValue").value.replace("-", "");
        const available = nf("modalAvailable").value;
        let entry1Id = nf("entry1Id").value;
        let entry2Id = nf("entry2Id").value;
        const month = nf("month").value;

        switch (this.function) {
            //LANÇAMENTOS
            case "cooperatorOut": //*COLABORADOR
                if (!entry1Id) {
                    this.message("Colaborador");
                    return;
                }
                if (!entry2Id) {
                    this.message("Banco");
                    return;
                }

                table1 = 11;
                table2 = 10;
                positive1 = 2;
                positive2 = 2;
                id_source = 6;
                break;

            case "providerOut": //*FORNECEDOR
                if (!entry1Id) {
                    this.message("Fornecedor");
                    return;
                }
                if (!entry2Id) {
                    this.message("Banco");
                    return;
                }

                table1 = 7;
                table2 = 10;
                positive1 = 2;
                positive2 = 2;
                id_source = 3;
                break;

            case "loanOut": //*EMPRESTIMO
                if (!entry1Id) {
                    this.message("Empréstimo");
                    return;
                }
                if (!entry2Id) {
                    this.message("Banco");
                    return;
                }

                table1 = 13;
                table2 = 10;
                positive1 = 1;
                positive2 = 2;
                id_source = 20;
                break;

            //DESPESAS
            case "employeeOut": //*FUNCIONÁRIO
                if (!entry1Id) {
                    this.message("Funcionário");
                    return;
                }
                if (!entry2Id) {
                    this.message("Banco");
                    return;
                }

                table1 = 11;
                table2 = 10;
                positive1 = 2;
                positive2 = 2;
                id_source = 4;
                source_category = 8;
                break;

            case "expenseOut": //*OUTRAS
                if (!entry1Id) {
                    this.message("Despesa");
                    return;
                }
                if (!entry2Id) {
                    this.message("Banco");
                    return;
                }

                source_category = entry1Id; //PASSA "entry1Id" P/ CATEGORIA
                entry1Id = this.clinicId; //PASSA O ID DA CLINICA P/ "entry1Id"

                table1 = 1;
                table2 = 10;
                positive1 = 2;
                positive2 = 2;
                id_source = 4;
                break;

            //CRÉDITOS
            case "applicationsIn": //*APLICAÇÃO
                entry1Id = this.clinicId; //PASSA O ID DA CLINICA P/ "entry1Id"

                if (!entry1Id) {
                    this.message("Clínica");
                    return;
                }
                if (!entry2Id) {
                    this.message("Banco");
                    return;
                }

                table1 = 1;
                table2 = 10;
                positive1 = 1;
                positive2 = 1;
                id_source = 21;
                break;

            //LANÇAMENTOS EM CLINICA
            case "clinicEntryEmployee": //*FUNCIONÁRIO
                if (!entry1Id) {
                    this.message("Despesa");
                    return;
                }
                if (!entry2Id) {
                    this.message("Funcionário");
                    return;
                }

                source_category = entry1Id; //PASSA "entry1Id" P/ CATEGORIA
                entry1Id = this.clinicId; //PASSA O ID DA CLINICA P/ "entry1Id"

                table1 = 1;
                table2 = 11;
                positive1 = 2;
                positive2 = 1;
                id_source = 13;
                break;

            //TRANSFERENCIA
            case "transferBankBank": //*BANCO/BANCO
                if (!entry2Id) {
                    this.message("Banco");
                    return;
                }

                table1 = 10;
                table2 = 10;
                positive1 = 2;
                positive2 = 1;
                id_source = 12;
                break;

            case "paymentVoucher": //*COMPROVAÇÃO DE DEPÓSITO
                if (!entry2Id) {
                    this.message("Banco");
                    return;
                }

                table1 = 10;
                table2 = 10;
                positive1 = 2;
                positive2 = 1;
                id_source = 15;
                break;

            //AJUSTES
            case "adjustmentBank": //*BANCO
                if (!entry2Id) {
                    this.message("Banco");
                    return;
                }

                table1 = 10;
                table2 = 10;
                positive1 = pn == "-" ? 1 : 2;
                positive2 = pn == "+" ? 1 : 2;
                id_source = 2;
                break;

            case "adjustmentCooperator": //*COLABORADOR
                if (!entry1Id) {
                    this.message("Colaborador");
                    return;
                }

                table1 = 11;
                table2 = 10;
                positive1 = pn == "+" ? 1 : 2;
                positive2 = pn == "+" ? 1 : 2;
                id_source = 2;
                break;

            case "adjustmentClinic": //*CLINICA
                if (!entry1Id) {
                    this.message("Clínica");
                    return;
                }

                table1 = 1;
                table2 = 10;
                positive1 = pn == "+" ? 1 : 2;
                positive2 = pn == "+" ? 1 : 2;
                id_source = 2;
                break;

            case "adjustmentNotIdentified": //*NAÕ IDENTIFICADO
                if (!entry1Id) {
                    this.message("Clínica");
                    return;
                }

                table1 = 10;
                table2 = 996;
                positive1 = pn == "+" ? 1 : 2;
                positive2 = pn == "+" ? 1 : 2;
                entry2Id = entry1Id;
                id_source = 14;
                break;

            case "userEntry": //*DEPÓSITO USUÁRIO
                if (!entry1Id) {
                    this.message("Usuário");
                    return;
                }
                if (!entry2Id) {
                    this.message("Banco");
                    return;
                }

                table1 = 11;
                table2 = 10;
                positive1 = 1;
                positive2 = 1;
                id_source = 19;
                break;

            default:
                console.log("Erro");
                return;
        }

        const data = {
            id_clinic,
            description,
            date,
            value,
            available,
            id_source,
            source_category,
            month,
            links: [
                {
                    destination: entry1Id,
                    table: table1,
                    positive: positive1,
                },
                {
                    destination: entry2Id,
                    table: table2,
                    positive: positive2,
                },
            ],
        };

        (async function () {
            await $fetch({
                url: "bank/entry/entryAdd/add_entry",
                par: { data },
                messageType: 1,
                fnName: "SALVA BANK #551",
            });

            $showHideModal("#entryAdd");
            bankModal.ajaxReturn(entry1Id, entry2Id);
        })();
    },

    //:ABILITA BOTÃO "SALVAR" QDO DADOS ESTIVEREM OK
    btnSaveProp() {
        let True = 0;

        //SE NÃO TIVER CLÍNICA
        if (!parseFloat($("[name=id_clinic]").value)) True++;

        //SE NÃO TIVER DESCRIÇÃO
        if (!$("[name=modalDescription]").value) True++;

        //SE NÃO TIVER VALOR
        if ($numberOnly($("#modalValue").value) == 0) True++;

        //SE "entry1Id" NÃO TIVER VALOR
        if (this.params.lable1 && !parseFloat($("[name=entry1Id]").value)) True++;

        //SE "entry2Id" NÃO TIVER VALOR
        if (this.params.lable2 && !parseFloat($("[name=entry2Id]").value)) True++;

        $(".btnSave").disabled = True ? true : false;
    },

    //:BOTÃO DE SELEÇÃO DE CLÍNICA
    btnClinicSelect(e) {
        this.clinicId = e ? e.dataset.id : "";
        this.clinicNm = e ? e.textContent : "";

        //CSS
        $$(`#entryAdd .clinicSelect`).forEach((e) => $classToggle(e, "btn-primary", "btn-secondary"));

        if (e) $classToggle(e, "btn-secondary", "btn-primary");
    },

    //:MENSAGENS DE ALERTA
    message(msg) {
        $showHideModal("#entryAdd");
        messageModal.start({ msg1: { msg: `O campo "${msg}" deve estar preenchido.` }, timer: 3000 });
    },

    events: {
        click(target) {
            //TELA DE MENU
            if (target.closest("#bankMenu button")) {
                //SELEÇÃO DE CLÍNICA
                if (target.closest(".clinicSelect")) return bankModal.btnClinicSelect(target);

                //SALVAR|CANCELAR
                if (target.closest(".exit")) return $showHideModal("#entryAdd");

                //-TODOS OS OUTROS BOTÕES
                let id = target.id.replace("btn", "");
                bankModal.function = id.charAt(0).toLowerCase() + id.slice(1);
                bankModal.start();
                return;
            }

            //TELA DE LANÇAMENTO
            if (target.closest("#bankEntry button")) {
                if (target.closest(".exit")) return $showHideModal("#entryAdd");
                if (target.closest(".btnSave")) return bankModal.save();
                return;
            }
        },

        keyup(target) {
            //VALOR
            if (target.closest("#modalValue")) return bankModal.btnSaveProp();
            //DESCRIÇÃO
            if (target.closest("#modalDescription")) return bankModal.btnSaveProp();
        },
    },

    init: (function () {
        $("#entryAdd").addEventListener("click", (event) => bankModal.events.click(event.target));
        $("#entryAdd").addEventListener("keyup", (event) => bankModal.events.keyup(event.target));
    })(),
};
