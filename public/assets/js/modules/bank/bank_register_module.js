const bankRegister = {
    view: async function (data) {
        //BUSCA TEMPLATE
        const fSelector = ".bank_register_module";
        const f = $(`${fSelector} .modal-box`) ?? (await getModalTemplate());

        bankRegister.ressetData();

        //PREENCHE CAMPOS
        f.querySelector("[name=id]").value = data.bank.id;
        f.querySelector("[name=id_source]").value = data.bank.id_source;

        f.querySelector("[name=nm_clinic]").value = data.bank.clinic_name;
        f.querySelector("[name=id_clinic]").value = data.bank.clinic_id;
        f.querySelector("[name=nm_login]").value = data.bank.nm_login;
        f.querySelector("[name=id_login]").value = data.bank.id_login;

        f.querySelector("[name=modalDescription]").value = data.bank.description;
        f.querySelector("[name=modalDate]").value = data.bank.date_original;
        f.querySelector("[name=month]").value = data.bank.month;
        f.querySelector("[name=modalValue]").value = data.bank.value;

        //ESCONDE DIVS
        f.querySelector(".f_source").style.display = "none";

        //DESABILITA BOTÃO SALVAR
        f.querySelector(".save").disabled = true;

        //VALORES PARA DIV input1
        input1();
        input2();
        if (data.bank.id_source == 4) expenceMethod(); //SE FOR DESPESA

        $showHideModal(fSelector);

        //METODO PARA DIV "input1"
        function input1() {
            f.querySelector(".f_input1").style.display = "flex";
            f.querySelector(".f_input1 [name=id]").value = data.bankLink[0].id;
            f.querySelector(".f_input1 .nm_input1_category").textContent = data.bankLink[0].entry;
            f.querySelector(".f_input1 [name=id_input1]").value = data.bankLink[0].id_destination;

            //CRIA TAGS "OPTION" DO "SELECT"
            const tpt = data.bankLink[0].entryList.map(({ id, name }) => {
                const selected = id == data.bankLink[0].id_destination ? " selected" : "";
                return `<option value="${id}"${selected}>${name}</option>`;
            });
            f.querySelector(".f_input1 select").innerHTML = tpt;

            //ATUALIZA VALORES AO FAZER MUDANÇA
            f.querySelector(".f_input1 select").onchange = (e) => {
                f.querySelector("[name=id_input1]").value = e.target.value;
                bankRegister.input1Changed = true;
            };
        }

        //METODO PARA DIV "input2"
        function input2() {
            f.querySelector(".f_input2").style.display = "flex";
            f.querySelector(".f_input2 [name=id]").value = data.bankLink[1].id;
            f.querySelector(".f_input2 .nm_input2_category").textContent = data.bankLink[1].entry;
            f.querySelector(".f_input2 [name=id_input2]").value = data.bankLink[1].id_destination;

            //CRIA TAGS "OPTION" DO "SELECT"
            const tpt = data.bankLink[1].entryList.map(({ id, name }) => {
                const selected = id == data.bankLink[1].id_destination ? " selected" : "";
                return `<option value="${id}"${selected}>${name}</option>`;
            });
            f.querySelector(".f_input2 select").innerHTML = tpt;

            //ATUALIZA VALORES AO FAZER MUDANÇA
            f.querySelector(".f_input2 select").onchange = (e) => {
                f.querySelector("[name=id_input2]").value = e.target.value;
                bankRegister.input2Changed = true;
            };
        }

        //METODO DE DESPESA
        function expenceMethod() {
            f.querySelector(".f_source").style.display = "flex";
            f.querySelector(".nm_source_category").textContent = "Despesa";
            f.querySelector("[name=id_source_category]").value = data.bank.id_source_category;

            //CRIA TAGS "OPTION" DO "SELECT"
            const tpt = data.expenseList.map(({ id, name }) => {
                const selected = id == data.bank.id_source_category ? " selected" : "";
                return `<option value="${id}"${selected}>${name}</option>`;
            });
            f.querySelector(".f_source select").innerHTML = tpt;

            //ATUALIZA VALORES AO FAZER MUDANÇA
            f.querySelector(".f_source select").onchange = (e) => (f.querySelector("[name=id_source_category]").value = e.target.value);
        }

        //BUSTA TEMPLATE DO MODAL
        async function getModalTemplate() {
            const resp = await $fetch({
                url: "modules/modules/bank_register",
                par: { data },
                fnName: "BUSCA TEMPLATE #548",
                method: "get",
                overlay: false,
                consoleOn: false,
            });

            $(fSelector).innerHTML = resp.template;
            const f = $(fSelector);

            f.querySelector(".save").disabled = $permission([9], 0) ? false : true;
            f.querySelector(".save").onclick = (e) => bankRegister.setData();
            f.querySelector(".exit").onclick = () => $showHideModal(fSelector);

            //SE TIVER ALTERAÇÕES HABILITA BOTÃO "SALVAR"
            const inputList = $(".modal-box input,.modal-box select");
            inputList.forEach((e) => {
                e.addEventListener("keyup", inputFunction);
                e.addEventListener("change", inputFunction);
            });
            function inputFunction() {
                if ($permission([9], 0)) $(".bank_register_module .save").disabled = false;
            }

            return f;
        }
    },

    getData: async function (e) {
        if (!$permission(129)) return;
        const bankId = e.closest("tr").dataset.id;

        const resp = await $fetch({
            url: `modules/bank/bank_register_module/get_register`,
            par: { bankId },
            fnName: "BUSCA BANCO #547",
        });

        bankRegister.view(resp.registers);
    },

    setData: async function () {
        if (!$permission([9])) return;

        const f = $(".bank_register_module");

        const bankId = f.querySelector("[name=id]").value;
        const data = {
            date: f.querySelector("[name=modalDate]").value,
            month: f.querySelector("[name=month]").value,
            description: f.querySelector("[name=modalDescription]").value,
            value: f.querySelector("[name=modalValue]").value,

            id_source: f.querySelector("[name=id_source]").value,
            id_source_category: f.querySelector("[name=id_source_category]").value,
        };

        if (bankRegister.input1Changed) {
            data.id_bankLink1 = f.querySelector(".f_input1 [name=id]").value;
            data.id_destination_bankLink1 = f.querySelector(".f_input1 [name=id_input1]").value;
        }
        if (bankRegister.input2Changed) {
            data.id_bankLink2 = f.querySelector(".f_input2 [name=id]").value;
            data.id_destination_bankLink2 = f.querySelector(".f_input2 [name=id_input2]").value;
        }

        await $fetch({
            url: `modules/bank/bank_register_module/set_register`,
            par: { bankId, data },
            fnName: "SALVA BANCO #570",
        });

        $showHideModal(".bank_register_module");

        bankRegister.callback();
    },

    ressetData() {
        $$(`.bank_register_module input`).forEach((e) => (e.value = ""));
        $$(`.bank_register_module select`).forEach((e) => (e.value = ""));
    },

    init(data) {
        bankRegister.callback = data.callback;
    },
};
