export const obj = {
    dom: {
        procedure() {
            const os = $m.register.data.os;
            const node = $("#register .right-main .procedure-main");

            //:Accordion show/hide
            $m.register.accordionToggle(node, ls.accordionProcedureShow);

            //:Cabeçalho
            $(node, ".accordion-header h6").innerHTML = $valFormat(os.vl_procedureTotal);

            //:Campos
            $inputChange($n(node, "vl_procedureTable"), os.vl_procedureTable);
            $inputChange($n(node, "vl_procedureDiscount"), os.vl_procedureDiscount);
            $inputChange($n(node, "vl_procedureTax"), os.vl_procedureTax);
            $inputChange($n(node, "vl_procedureTotal"), os.vl_procedureTotal);
            $inputChange($n(node, "vl_procedureMargin"), os.vl_procedureMargin);
            $inputChange($n(node, "pc_procedureDiscount"), os.pc_procedureDiscount);
            $inputChange($n(node, "pc_procedureTax"), os.pc_procedureTax);

            //:Borda em desconto
            const typeDiscount = os.tp_procedureDiscount == 0;
            $n(node, "vl_procedureDiscount").classList.toggle("active", typeDiscount);
            $n(node, "pc_procedureDiscount").classList.toggle("active", !typeDiscount);

            //:Borda em imposto
            const typeTax = os.tp_procedureTax == 0;
            $n(node, "vl_procedureTax").classList.toggle("active", typeTax);
            $n(node, "pc_procedureTax").classList.toggle("active", !typeTax);
        },

        stock() {
            const os = $m.register.data.os;
            const node = $("#register .right-main .stock-main");

            //:Accordion show/hide
            $m.register.accordionToggle(node, ls.accordionStockShow);

            //:Cabeçalho
            $(node, ".accordion-header h6").innerHTML = $valFormat(os.vl_stockTotal);

            //:Campos
            $inputChange($n(node, "vl_stockTable"), os.vl_stockTable);
            $inputChange($n(node, "vl_stockDiscount"), os.vl_stockDiscount);
            $inputChange($n(node, "vl_stockTotal"), os.vl_stockTotal);
            $inputChange($n(node, "vl_stockTax"), os.vl_stockTax);
            $inputChange($n(node, "vl_stockCost"), os.vl_stockCost);
            $inputChange($n(node, "vl_stockMargin"), os.vl_stockMargin);
            $inputChange($n(node, "pc_stockDiscount"), os.pc_stockDiscount);
            $inputChange($n(node, "pc_stockTax"), os.pc_stockTax);

            //:Borda em desconto
            const typeDiscount = os.tp_stockDiscount == 0;
            $n(node, "vl_stockDiscount").classList.toggle("active", typeDiscount);
            $n(node, "pc_stockDiscount").classList.toggle("active", !typeDiscount);

            //:Borda em imposto
            const typeTax = os.tp_stockTax == 0;
            $n(node, "vl_stockTax").classList.toggle("active", typeTax);
            $n(node, "pc_stockTax").classList.toggle("active", !typeTax);
        },

        comiss() {
            const os = $m.register.data.os;
            const node = $("#register .right-main .comiss-main");

            //:Accordion show/hide
            $m.register.accordionToggle(node, ls.accordionComissShow);

            $inputChange($n(node, "vl_comissTotal"), os.vl_comissTotal);
        },

        partner() {
            const os = $m.register.data.os;
            const node = $("#register .right-main .partner-main");

            //:Accordion show/hide
            $m.register.accordionToggle(node, ls.accordionPartnerShow);

            $inputChange($n(node, "vl_partnerTotal"), os.vl_partnerTotal);
        },

        financial() {
            const os = $m.register.data.os;
            const node = $("#register .right-main .financial-main");

            //:Accordion show/hide
            $m.register.accordionToggle(node, ls.accordionFinancialShow);

            //:Cabeçalho
            $(node, ".accordion-header h6").innerHTML = $valFormat(os.vl_invoiceTotal);

            $inputChange($n(node, "vl_financialTotal"), os.vl_invoiceTotal);
        },

        all() {
            this.procedure();
            this.stock();
            this.comiss();
            this.partner();
            this.financial();
        },
    },

    changeStockValue() {
        const val = $numberOnly($("#register .stock-main .accordion-button h6").textContent.trim());

        $inputChange($("#register input[name='vl_stock']"), val, "change", $m.register.data.os);
    },

    events(event) {
        const target = event.target;
        const db = $m.register.database;
        const dataObj = $m.register.data.os;

        //:Target inativo
        if ($check.ch1(target)) return;

        //:Valida tecla precionada
        if ($check.ch2(event)) return;

        //:Alteração em Input|Textarea
        if (event.type === "change") {
            $inputChange(target, target.value, event.type, dataObj);
            db.refresh();
            return;
        }

        //:Clique em botão
        if (event.type === "click" && target.closest(".btn")) {
            $saveMode.enable();

            //:Botão desconto
            if (target.closest(".procedure-main .btn.discount")) return procedureTypeDiscount();

            //:Botão imposto
            if (target.closest(".procedure-main .btn.tax")) return procedureTypeTax();

            //:Botão desconto
            if (target.closest(".stock-main .btn.discount")) return stockTypeDiscount();

            //:Botão imposto
            if (target.closest(".stock-main .btn.tax")) return stockTypeTax();

            function procedureTypeDiscount() {
                const newType = dataObj.tp_procedureDiscount == 0 ? 1 : 0;
                $dataChange(dataObj, "tp_procedureDiscount", newType);
                db.refresh();
            }

            function procedureTypeTax() {
                const newType = dataObj.tp_procedureTax == 0 ? 1 : 0;
                $dataChange(dataObj, "tp_procedureTax", newType);
                db.refresh();
            }

            function stockTypeDiscount() {
                const newType = dataObj.tp_stockDiscount == 0 ? 1 : 0;
                $dataChange(dataObj, "tp_stockDiscount", newType);
                db.refresh();
            }

            function stockTypeTax() {
                const newType = dataObj.tp_stockTax == 0 ? 1 : 0;
                $dataChange(dataObj, "tp_stockTax", newType);
                db.refresh();
            }
        }
    },

    init() {
        cl("Right Main initialized");
    },
};
