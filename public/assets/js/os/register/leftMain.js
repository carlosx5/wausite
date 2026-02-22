export const obj = {
    procedureListFactory: null,
    stockListFactory: null,
    profListFactory: null,
    partnerListFactory: null,
    financialListFactory: null,

    dom: {
        newProcedureEnable: false,
        newStockEnable: false,
        newComissEnable: false,
        newParttnerEnable: false,
        newFinancialEnable: false,

        procedure() {
            const node = $("#register .left-main .procedure-main");
            const purchaseVisible = $permission("98P", 0);
            let procedureName = "";
            let sumVlTotal = 0;

            //:Cria linhas da tabela
            const tpt = $m.register.data.procedureList.map((d, index) => renderNewObject(d, index));
            node.querySelector("tbody").innerHTML = tpt.join("");
            node.querySelector(".accordion-button h6").innerHTML = $valFormat(sumVlTotal);
            ///
            function renderNewObject(d, index) {
                if (d.z_del) return; //:Excluir -> retorna

                sumVlTotal += +d.vl_total;
                const idProcedure = d.id === "new" ? "Novo" : +d.id_procedure || "Externo";
                const valSale = $valFormat(d.vl_sale);
                const valTotal = $valFormat(d.vl_total);
                const name = +d.id_procedure == 0 ? d.external : d.name;
                const main = +d.id_procedure == +$m.register.data.os.id_procedureMain ? " active" : "";
                const deleteDisable = purchaseVisible && !+d.status ? "" : " disabled";
                procedureName = +d.id_procedure == +$m.register.data.os.id_procedureMain ? name : procedureName;

                return `
                    <tr data-id="${d.id}" data-index="${index}">
                        <td>${idProcedure}</td>
                        <td>${name}</td>
                        <td>
                            <div class="dropdown">
                                <button class="btn py-0 dropdown-toggle" data-bs-toggle="dropdown">
                                    ${d.qt}
                                </button>
                                <div class="dropdown-menu p-0">
                                    <input class="form-control newQt" placeholder="quantidade" />
                                </div>
                            </div>  
                        </td>
                        <td>${valSale}</td>
                        <td>${valTotal}</td>
                        <td class="actions">
                            <div>
                                <button class="btn main${main}"><i class="fa-classic fa-star-of-life"></i></button>
                                <button class="btn delete"${deleteDisable}><i class="fa-classic fa-trash-can"></i></button>
                            </div>
                        </td>
                    </tr>`;
            }

            //:Botões e inputs de novo procedimento
            const x = this.newProcedureEnable;
            const list = [".addExternalProcedure", ".addSystemProcedure"];
            list.forEach((el) => node.querySelector(el).classList.toggle("d-none", x));
            node.querySelector(".cancel").classList.toggle("d-none", !x);
            node.querySelector(".external-box").classList.toggle("d-none", x !== "external");
            node.querySelector(".sistem-box").classList.toggle("d-none", x !== "sistem");

            //:Seta nome do procedimento na direita
            // $j(`#register .right-main, procedureName`).value = procedureName;

            //:Accordion show/hide
            $m.register.accordionToggle(node, ls.accordionProcedureShow);
        },

        stock() {
            const node = $("#register .left-main .stock-main");
            const purchaseVisible = $permission("98P", 0);
            const moveStockPermis = $permission("100P", 0);

            let sumVlTotal = 0;
            let sbc = 0; //:Contagem de estoque para retornar (StockBackCount)
            let soc = 0; //:Contagem de estoque para sair (StockOutCount)

            //:Cria linhas da tabela
            const tpt = $m.register.data.stockList.map((d, index) => renderNewObject(d, index));
            node.querySelector("tbody").innerHTML = tpt.join("");
            node.querySelector(".accordion-button h6").innerHTML = $valFormat(sumVlTotal);
            ///
            function renderNewObject(d, index) {
                if (d.z_del) return; //:Excluir -> retorna

                sumVlTotal += +d.vl_total;
                const idStock = d.id === "new" ? "Novo" : +d.id_stock || "Externo";
                const valSale = $valFormat(d.vl_sale);
                const valTotal = $valFormat(d.vl_total);
                const name = d.id_stock == 0 ? d.external : d.name;
                const deleteDisable = purchaseVisible && !+d.status ? "" : " disabled";
                const noBalance = d.qt_stock - d.qt < 0 ? " no-balance" : "";
                const moveStockIcon = +d.status ? "fa-backward" : "fa-forward";
                const moveStockDisable = !moveStockPermis || !$numberOnly(idStock) || $saveMode.active ? " disabled" : "";
                const purchaseIcon = purchaseVisible
                    ? `<i class="fa-light fa-circle-dollar fa-xl" title="Custo: ${d.vl_purchase}"></i>`
                    : "";

                //:Se estoque não for externo executa contagem
                if ($numberOnly(idStock)) {
                    sbc += +d.status ? 1 : 0;
                    soc += +d.status ? 0 : 1;
                }

                return `
                    <tr data-id="${d.id}" data-index="${index}">
                        <td>${idStock}</td>
                        <td>${name}</td>
                        <td>
                            <div class="dropdown">
                                <button class="btn py-0 dropdown-toggle${noBalance}" data-bs-toggle="dropdown">
                                    ${d.qt}
                                </button>
                                <div class="dropdown-menu p-0">
                                    <input class="form-control newQt" placeholder="quantidade" />
                                </div>
                            </div>  
                        </td>
                        <td>${valSale}</td>
                        <td>${valTotal}</td>
                        <td class="actions">
                            <div>
                                ${purchaseIcon}
                                <button class="btn stockMove"${moveStockDisable}><i class="fa-classic ${moveStockIcon}"></i></button>
                                <button class="btn delete"${deleteDisable}><i class="fa-classic fa-trash-can"></i></button>
                            </div>
                        </td>
                    </tr>`;
            }

            //:Botões e inputs de novo estoque
            const x = this.newStockEnable;
            const list = [".addExternalStock", ".addSystemStock", ".allStockBack", ".allStockOut"];
            list.forEach((el) => node.querySelector(el).classList.toggle("d-none", x));
            node.querySelector(".cancel").classList.toggle("d-none", !x);
            node.querySelector(".external-box").classList.toggle("d-none", x !== "external");
            node.querySelector(".sistem-box").classList.toggle("d-none", x !== "sistem");

            //:Botão de movimentação de estoque (todos)
            const asb = node.querySelector(".allStockBack");
            const aso = node.querySelector(".allStockOut");
            ///
            asb.disabled = !sbc || !moveStockPermis || $saveMode.active;
            aso.disabled = !soc || !moveStockPermis || $saveMode.active;
            ///
            asb.classList.toggle("btn-secondary", !sbc || !moveStockPermis || $saveMode.active);
            asb.classList.toggle("color-wau2", sbc && moveStockPermis && !$saveMode.active);
            aso.classList.toggle("btn-secondary", !soc || !moveStockPermis || $saveMode.active);
            aso.classList.toggle("color-wau2", soc && moveStockPermis && !$saveMode.active);

            //:Accordion show/hide
            $m.register.accordionToggle(node, ls.accordionStockShow);
        },

        comiss() {
            const node = $("#register .left-main .comiss-main");
            let sumVlTotal = 0;

            //:Cria linhas da tabela
            const tpt = $m.register.data.comissList.map((d, index) => renderNewObject(d, index));
            node.querySelector("tbody").innerHTML = tpt.join("");
            node.querySelector(".accordion-button h6").innerHTML = $valFormat(sumVlTotal);
            ///
            function renderNewObject(d, index) {
                if (d.z_del) return; //:Excluir -> retorna

                sumVlTotal += +d.value;
                const value = $valFormat(d.value);
                const idProf = d.id === "new" ? "Novo" : +d.id_prof || "Externo";
                const name = d.id_prof == 0 ? d.external : d.profName;
                const comissType = $comisType[d.id_type] || "Nenhum";

                return `
                    <tr data-id="${d.id}" data-index="${index}">
                        <td>${idProf}</td>
                        <td>${name}</td>
                        <td>
                            <div class="dropdown type">
                                <button class="btn py-0 dropdown-toggle" data-bs-toggle="dropdown">
                                    ${comissType}
                                </button>
                                <ul class="dropdown-menu">
                                    <li><button class="dropdown-item" data-id_type="1">Fixo ($)</button></li>
                                    <li><button class="dropdown-item" data-id_type="2">Lucro (%)</button></li>
                                </ul>
                            </div>
                        </td>
                        <td>
                            <div class="dropdown percent">
                                <button class="btn py-0 dropdown-toggle" data-bs-toggle="dropdown">
                                    ${d.percent}
                                </button>
                                <div class="dropdown-menu p-0">
                                    <input class="form-control percent" placeholder="porcentagem" />
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="dropdown value">
                                <button class="btn py-0 dropdown-toggle" data-bs-toggle="dropdown">
                                    ${value}
                                </button>
                                <div class="dropdown-menu p-0">
                                    <input class="form-control value" placeholder="valor fixo" />
                                </div>
                            </div>  
                        </td>
                        <td class="actions">
                            <div>
                                <button class="btn p-0 delete"><i class="fa-classic fa-trash-can"></i></button>
                            </div>
                        </td>
                    </tr>`;
            }

            //:Botões e inputs de novo profissional
            const x = obj.dom.newComissEnable;
            const list = [".addExternalProfessional", ".addSystemProfessional"];
            list.forEach((el) => node.querySelector(el).classList.toggle("d-none", x));
            node.querySelector(".cancel").classList.toggle("d-none", !x);
            node.querySelector(".external-box").classList.toggle("d-none", x !== "external");
            node.querySelector(".sistem-box").classList.toggle("d-none", x !== "sistem");

            //:Accordion show/hide
            $m.register.accordionToggle(node, ls.accordionComissShow);
        },

        partner() {
            const node = $("#register .left-main .partner-main");
            let sumVlTotal = 0;

            //:Cria linhas da tabela
            const tpt = $m.register.data.partnerList.map((d, index) => renderNewObject(d, index));
            node.querySelector("tbody").innerHTML = tpt.join("");
            node.querySelector(".accordion-button h6").innerHTML = $valFormat(sumVlTotal);
            ///
            function renderNewObject(d, index) {
                if (d.z_del) return; //:Excluir -> retorna

                sumVlTotal += +d.value;
                const value = $valFormat(d.value);
                const idClinic = d.id === "new" ? "Novo" : +d.id_clinic || "Externo";
                const name = d.id_clinic == 0 ? d.external : d.clinicName;
                const comissType = $comisType[d.id_type] || "Nenhum";

                return `
                    <tr data-id="${d.id}" data-index="${index}">
                        <td>${idClinic}</td>
                        <td>${name}</td>
                        <td>
                            <div class="dropdown type">
                                <button class="btn py-0 dropdown-toggle" data-bs-toggle="dropdown">
                                    ${comissType}
                                </button>
                                <ul class="dropdown-menu">
                                    <li><button class="dropdown-item" data-id_type="1">Fixo ($)</button></li>
                                    <li><button class="dropdown-item" data-id_type="2">Lucro (%)</button></li>
                                </ul>
                            </div>
                        </td>
                        <td>
                            <div class="dropdown percent">
                                <button class="btn py-0 dropdown-toggle" data-bs-toggle="dropdown">
                                    ${d.percent}
                                </button>
                                <div class="dropdown-menu p-0">
                                    <input class="form-control percent" placeholder="porcentagem" />
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="dropdown value">
                                <button class="btn py-0 dropdown-toggle" data-bs-toggle="dropdown">
                                    ${value}
                                </button>
                                <div class="dropdown-menu p-0">
                                    <input class="form-control value" placeholder="valor fixo" />
                                </div>
                            </div>
                        </td>
                        <td class="actions">
                            <div>
                                <button class="btn p-0 delete"><i class="fa-classic fa-trash-can"></i></button>
                            </div>
                        </td>
                    </tr>`;
            }

            //:Botões e inputs de novo participante
            const x = obj.dom.newPartnerEnable;
            const list = [".addExternalPartner", ".addSystemPartner"];

            list.forEach((el) => node.querySelector(el).classList.toggle("d-none", x));
            node.querySelector(".cancel").classList.toggle("d-none", !x);
            node.querySelector(".external-box").classList.toggle("d-none", x !== "external");
            node.querySelector(".sistem-box").classList.toggle("d-none", x !== "sistem");

            //:Accordion show/hide
            $m.register.accordionToggle(node, ls.accordionPartnerShow);
        },

        financial() {
            const node = $("#register .left-main .financial-main");

            const procedureTotal = +$m.register.data.os.vl_procedureTotal;
            const stockTotal = +$m.register.data.os.vl_stockTotal;
            const financialTotal = procedureTotal + stockTotal;

            node.querySelector(".accordion-button h6").innerHTML = $valFormat(financialTotal);

            const html = `
                    <tr>
                        <td>Procedimentos</td>
                        <td>${$valFormat(procedureTotal)}</td>
                    </tr>
                    <tr>
                        <td>Estoque</td>
                        <td>${$valFormat(stockTotal)}</td>
                    </tr>
                    <tr>
                        <td>Total</td>
                        <td>${$valFormat(financialTotal)}</td>
                    </tr>
                `;

            node.querySelector("tbody").innerHTML = html;

            //:Accordion show/hide
            $m.register.accordionToggle(node, ls.accordionFinancialShow);
        },

        all() {
            this.procedure();
            this.stock();
            this.comiss();
            this.partner();
            this.financial();
        },
    },

    events(event) {
        const target = event.target;
        const db = $m.register.database;
        const data = $m.register.data;

        //:Eventos em procedimento
        if (target.closest(".procedure-main")) return procedure();

        //:Eventos em estoque
        if (target.closest(".stock-main")) return stock();

        //:Eventos em comissão
        if (target.closest(".comiss-main")) return comiss();

        //:Eventos em partner
        if (target.closest(".partner-main")) return comiss();

        function procedure() {
            if (target.closest(`tr`)) return tr();
            if (target.closest(`.procedure-new`)) return neww();

            function tr() {
                if (!$permission("98P")) return;

                const tr = target.closest("tr");
                if (!tr) return;
                const index = tr.dataset.index;
                const dataList = data.procedureList;
                const dataItem = dataList[index];

                //:Clique na quantidade p/ alterar -> focus no input
                if (target.closest("button.dropdown-toggle")) {
                    const newQt = target.closest("td").querySelector("input.newQt");
                    setTimeout(() => newQt.focus(), 100);
                    return;
                }

                //:Altera quantidade de procedimento
                if (target.closest("input.newQt") && event.key === "Enter") {
                    const qt = parseInt(target.value);

                    if (qt > 0) {
                        $dataChange(dataItem, "qt", qt, 2);
                        $dataChange(dataItem, "vl_total", $calculator(dataItem.vl_sale, qt, "*", true), 2);
                        return exit();
                    }

                    return;
                }

                //:Botão definir procedimento principal
                if (target.closest("button.main")) {
                    const newId = +dataItem.id_procedure;
                    const os = data.os;

                    if (!+newId) {
                        const bodyText = `Procedimentos externos não podem ser definidos como principais.`;
                        $toast(bodyText, "warning");
                        return;
                    }

                    $dataChange(os, "id_procedureMain", newId);

                    return exit();
                }

                //:Botão deletar
                if (target.closest("button.delete")) {
                    const len = dataList.length;

                    if (len < 2) {
                        const bodyText = `O cadastro deve conter ao menos um procedimento na lista. Adicione um novo antes de deletar.`;
                        $toast(bodyText, "warning");
                        return;
                    }

                    if (dataItem.id_procedure == data.os.id_procedureMain) {
                        const bodyText = `O procedimento principal não pode ser deletado. Altere o procedimento principal antes de deletar.`;
                        $toast(bodyText, "warning");
                        return;
                    }

                    if (dataItem.id === "new") {
                        dataList.splice(index, 1);
                    } else {
                        dataItem.z_del = true;
                    }

                    return exit();
                }

                function exit() {
                    $saveMode.enable();
                    db.refresh();
                }
            }

            function neww() {
                if (!$permission("103P")) return;

                //:Botão adicionar procedimento externo
                if (target.closest("button.addExternalProcedure")) return exit("external");

                //:Botão adicionar procedimento do sistema
                if (target.closest("button.addSystemProcedure")) return exit("sistem");

                //:Botão sair
                if (target.closest("button.cancel")) return exit(false);

                //:Exit de funcções dos botões acima
                function exit(newProcedureEnable) {
                    if (newProcedureEnable)
                        setTimeout(() => $(`#register .procedure-main .${newProcedureEnable}-box input`).focus(), 200);
                    obj.dom.newProcedureEnable = newProcedureEnable;
                    obj.dom.procedure();
                    return;
                }

                /**
                 * * Abaixo apenas eventos de input
                 *
                 * * Entrada de procedimentos cadastrados
                 * * Entrada de procedimentos externos
                 * */
                //:Adicionando novo procedimento cadastrado no sistema
                const boxSistem = target.closest(".sistem-box");
                if (boxSistem) {
                    if (event.key && (event.key.length === 1 || event.key === "Backspace")) {
                        return obj.procedureListFactory(event.target.value.trim());
                    }

                    //:Se pressionar enter ou clicar na lista -> adiciona item
                    if (event.type === "change") {
                        const datalistProcedure = $("#datalistProcedure");
                        const selectedValue = target.value;
                        const selectedOption = datalistProcedure.querySelector(`option[value="${selectedValue}"]`);
                        if (!selectedOption) return;

                        //:Push na lista
                        data.procedureList.push({
                            id: "new",
                            id_procedure: selectedOption.dataset.id,
                            name: selectedOption.value,
                            qt: 1,
                            vl_sale: selectedOption.dataset.vl_table,
                            vl_total: selectedOption.dataset.vl_table,
                        });

                        //:Reset datalist
                        datalistProcedure.innerHTML = "";

                        //:Reset inputs
                        event.target.value = "";

                        $saveMode.enable();
                        obj.dom.newProcedureEnable = false;
                        db.refresh();
                        return;
                    }

                    return;
                }

                //:Adicionando novo procedimento externo
                const btnSend = target.closest("button.send") && event.type === "click";
                const boxExternal = target.closest(".external-box");
                if (boxExternal && (event.key === "Enter" || btnSend)) {
                    const description = boxExternal.querySelector("input.procedureExternal");
                    const sale = boxExternal.querySelector("input.procedureExternalSale");

                    //:Focus no próximo input
                    if (target.classList.contains("procedureExternal")) return sale.focus();

                    //:Pega valores e valida
                    const descriptionVal = description.value.trim();
                    const saleVal = $numberOnly(sale.value.trim());
                    if (!descriptionVal || !saleVal) return cl("ERRO!");

                    //:Push na lista
                    data.procedureList.push({
                        id: "new",
                        id_procedure: "0",
                        name: descriptionVal,
                        external: descriptionVal,
                        qt: "1",
                        vl_sale: saleVal,
                        vl_total: saleVal,
                    });

                    //:Reset inputs
                    description.value = "";
                    sale.value = "";

                    $saveMode.enable();
                    obj.dom.newProcedureEnable = false;
                    db.refresh();
                    return;
                }
            }
        }

        function stock() {
            if (target.closest(`tr`)) return tr();
            if (target.closest(`.stock-new .allStockOut`)) return stockMove(0);
            if (target.closest(`.stock-new .allStockBack`)) return stockMove(1);
            if (target.closest(`.stock-new`)) return neww();

            function tr() {
                if (!$permission("98P")) return;

                const tr = target.closest("tr");
                if (!tr) return;
                const index = tr.dataset.index;
                const dataItem = data.stockList[index];

                //:Clique na quantidade p/ alterar -> focus no input
                if (target.closest("button.dropdown-toggle")) {
                    const newQt = target.closest("td").querySelector("input.newQt");
                    setTimeout(() => newQt.focus(), 100);
                    return;
                }

                //:Clique na movimentação de estoque
                if (target.closest("button.stockMove")) return stockMove(dataItem.status, dataItem);

                //:Altera quantidade de estoque
                if (target.closest("input.newQt") && event.key === "Enter") {
                    const qt = parseInt(target.value);

                    if (qt > 0) {
                        $dataChange(dataItem, "qt", qt, 2);
                        $dataChange(dataItem, "vl_total", $calculator(dataItem.vl_sale, qt, "*", true), 2);

                        return exit();
                    }

                    return;
                }

                //:Botão deletar
                if (target.closest("button.delete")) {
                    if (dataItem.id === "new") {
                        data.stockList.splice(index, 1);
                    } else {
                        dataItem.z_del = true;
                    }

                    return exit();
                }

                function exit() {
                    $saveMode.enable();
                    db.refresh();
                }
            }

            function neww() {
                if (!$permission("98P")) return;

                //:Botão adicionar estoque externo
                if (target.closest("button.addExternalStock")) return exit("external");

                //:Botão adicionar estoque do sistema
                if (target.closest("button.addSystemStock")) return exit("sistem");

                //:Botão sair
                if (target.closest("button.cancel")) return exit(false);

                //:Exit de funcções dos botões acima
                function exit(newStockEnable) {
                    if (newStockEnable)
                        setTimeout(() => $(`#register .stock-main .${newStockEnable}-box input`).focus(), 200);
                    obj.dom.newStockEnable = newStockEnable;
                    obj.dom.stock();
                    return;
                }

                /**
                 * * Abaixo apenas eventos de input
                 *
                 * * Entrada de profissionais cadastrados
                 * * Entrada de profissionais externos
                 * */
                //:Adicionando novo estoque cadastrado no sistema
                const boxSistem = target.closest(".sistem-box");
                if (boxSistem) {
                    if (event.key && (event.key.length === 1 || event.key === "Backspace")) {
                        return obj.stockListFactory(event.target.value.trim());
                    }

                    //:Se pressionar enter ou clicar na lista -> adiciona item
                    if (event.type === "change") {
                        const datalistStock = $("#datalistStock");
                        const selectedValue = target.value;
                        const selectedOption = datalistStock.querySelector(`option[value="${selectedValue}"]`);
                        if (!selectedOption) return;

                        //:Push na lista
                        data.stockList.push({
                            id: "new",
                            id_stock: selectedOption.dataset.id,
                            name: selectedOption.value,
                            qt: 1,
                            vl_purchase: selectedOption.dataset.vl_purchase,
                            vl_sale: selectedOption.dataset.vl_sale,
                            vl_total: selectedOption.dataset.vl_sale,
                        });

                        //:Reset datalist
                        datalistStock.innerHTML = "";

                        //:Reset inputs
                        event.target.value = "";

                        $saveMode.enable();
                        obj.dom.newStockEnable = false;
                        db.refresh();
                        return;
                    }

                    return;
                }

                //:Adicionando novo estoque externo
                const btnSend = target.closest("button.send") && event.type === "click";
                const boxExternal = target.closest(".external-box");
                if (boxExternal && (event.key === "Enter" || btnSend)) {
                    const description = boxExternal.querySelector("input.stockExternal");
                    const purchase = boxExternal.querySelector("input.stockExternalPurchase");
                    const sale = boxExternal.querySelector("input.stockExternalSale");

                    //:Focus no próximo input
                    if (target.classList.contains("stockExternal")) return purchase.focus();
                    if (target.classList.contains("stockExternalPurchase")) return sale.focus();

                    //:Pega valores e valida
                    const descriptionVal = description.value.trim();
                    const purchaseVal = $numberOnly(purchase.value.trim());
                    const saleVal = $numberOnly(sale.value.trim());
                    if (!descriptionVal || !purchaseVal || !saleVal) return cl("ERRO!");

                    //:Push na lista
                    data.stockList.push({
                        id: "new",
                        id_stock: "0",
                        name: descriptionVal,
                        external: descriptionVal,
                        qt: "1",
                        vl_purchase: purchaseVal,
                        vl_sale: saleVal,
                        vl_total: saleVal,
                    });

                    //:Reset inputs
                    description.value = "";
                    purchase.value = "";
                    sale.value = "";

                    $saveMode.enable();
                    obj.dom.newStockEnable = false;
                    db.refresh();
                    return;
                }
            }

            function stockMove(status, elData = null) {
                if (!$permission("100P")) return;

                const data = {
                    status,
                    list: [],
                };

                if (elData) {
                    //:Movimenta um item
                    data.list.push(elData.id);
                } else {
                    //:Movimenta todos os itens
                    $m.register.data.stockList.forEach((el) => {
                        if (+el.id_stock > 0 && el.status == status) data.list.push(el.id);
                    });
                }

                db.stockMove(data);
                return;
            }
        }

        function comiss() {
            if (target.closest("#register .comiss-main tr")) return comissTr();
            if (target.closest("#register .comiss-main .comiss-new")) return comissNew();

            function comissTr() {
                if (!$permission("99P")) return;

                const tr = target.closest("tr");
                if (!tr) return;
                const index = tr.dataset.index;
                const dataItem = data.comissList[index];

                //:Clique no valor|porcentagem p/ alterar -> focus no input
                const isDropdown = target.closest(".dropdown.percent") || target.closest(".dropdown.value") ? true : false;
                if (isDropdown && event.type === "click") {
                    const input = target.closest("td").querySelector("input");
                    setTimeout(() => input.focus(), 100);
                    return;
                }

                //:Altera valor da comissão
                if (target.closest("input.value") && event.key === "Enter") {
                    $dataChange(dataItem, "value", target.value, 2);
                    $dataChange(dataItem, "percent", 0, 2);
                    $dataChange(dataItem, "id_type", 1);

                    return exit();
                }

                //:Altera valor da porcentagem
                if (target.closest("input.percent") && event.key === "Enter") {
                    $dataChange(dataItem, "percent", target.value, 2);
                    $dataChange(dataItem, "id_type", 2);
                    return exit();
                }

                //:Altera tipo da comissão
                if (target.closest(".dropdown.type .dropdown-item")) {
                    const typeId = +target.dataset.id_type;
                    dataItem.id_type = typeId;
                    return exit();
                }

                //:Botão deletar
                if (target.closest("button.delete")) {
                    if (dataItem.id === "new") {
                        obj.data.comissList.splice(index, 1);
                    } else {
                        dataItem.z_del = true;
                    }

                    db.refresh();
                    $saveMode.enable();
                    return;
                }

                function exit() {
                    db.refresh();
                    $saveMode.enable();
                }
            }

            function comissNew() {
                if (!$permission("99P")) return;

                //:Botão adicionar prof externo
                if (target.closest("button.addExternalProfessional")) return btnsExit("external");

                //:Botão adicionar prof do sistema
                if (target.closest("button.addSystemProfessional")) return btnsExit("sistem");

                //:Botão sair
                if (target.closest("button.cancel")) return btnsExit(false);

                //:Exit de funcções dos botões acima
                function btnsExit(newComissEnable) {
                    if (newComissEnable)
                        setTimeout(() => $(`#register .stock-main .${newComissEnable}-box input`).focus(), 200);
                    obj.dom.newComissEnable = newComissEnable;
                    obj.dom.comiss();
                    return;
                }

                /**
                 * * Abaixo apenas eventos de input
                 *
                 * * Entrada de profissionais cadastrados
                 * * Entrada de profissionais externos
                 * */
                //:Adicionando nova comissão p/ profissionais cadastrados no sistema
                if (target.closest("input.datalistComiss") && event.type === "keyup") {
                    const datalistComiss = $("#datalistComiss");
                    const find = event.target.value.trim();
                    if (!find) return (datalistComiss.innerHTML = "");

                    //:Se pressionar enter ou clicar na lista -> adiciona item
                    if (event.key === "Enter" || !event.key) {
                        const selectedValue = target.value;
                        const selectedOption = datalistComiss.querySelector(`option[value="${selectedValue}"]`);
                        if (!selectedOption) return;

                        data.comissList.push({
                            id: "new",
                            id_prof: selectedOption.dataset.id,
                            id_type: "1",
                            percent: "0",
                            profName: selectedOption.value,
                            value: "0",
                        });

                        event.target.value = ""; //:Limpa input

                        db.refresh();
                        $saveMode.enable();
                        return;
                    }

                    obj.profListFactory(find);
                    return;
                }

                //:Adicionando nova comissão p/ profissionais externos
                if (target.closest("input.comissProfExternal") && event.key === "Enter") {
                    const name = event.target.value.trim();
                    if (!name) return;

                    data.comissList.push({
                        id: "new",
                        id_prof: 0,
                        id_type: "1",
                        percent: "0",
                        profName: name,
                        external: name,
                        value: "0",
                    });

                    event.target.value = ""; //:Limpa input

                    db.refresh();
                    $saveMode.enable();
                    return;
                }
            }
        }
    },

    init() {
        //:Busca e cria datalist de procedimentos
        obj.procedureListFactory = $debounce(async (find) => {
            const resp = await $fetch({
                url: "osLibraries/find_procedure",
                par: { find },
                overlay: false,
                fnName: "BUSCA PROCEDIMENTOS WAU-0084",
            });

            const tpt = resp.list
                .map(({ id, name, vl_table }) => `<option value="${name}" data-id="${id}" data-vl_table="${vl_table}">`)
                .join("");
            $(`#datalistProcedure`).innerHTML = tpt;
        });

        //:Busca e cria datalist de estoque
        obj.stockListFactory = $debounce(async (find) => {
            const resp = await $fetch({
                url: "osLibraries/find_stock",
                par: { find },
                overlay: false,
                fnName: "BUSCA ESTOQUE WAU-0086",
            });

            const tpt = resp.list
                .map(
                    ({ id, name, vl_purchase, vl_sale }) =>
                        `<option value="${name}" data-id="${id}" data-vl_purchase="${vl_purchase}" data-vl_sale="${vl_sale}">`,
                )
                .join("");
            $(`#datalistStock`).innerHTML = tpt;
        });

        //:Busca e cria datalist de profissional
        obj.profListFactory = $debounce(async (find) => {
            const resp = await $fetch({
                url: "osLibraries/find_prof",
                par: { find },
                overlay: false,
                fnName: "BUSCA PROFISSIONAL WAU-0087",
            });

            const tpt = resp.list
                .map(({ id, name, val }) => `<option value="${name}" data-id="${id}" data-val="${val}">`)
                .join("");
            $(`#datalistComiss`).innerHTML = tpt;
        });
    },
};
