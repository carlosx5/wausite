export default {
    wauSelect: { bank: null },
    saveCallback: null,
    //:Form Inputs
    objDescription: null,
    objDate: null,
    objBankId: null,
    objBankName: null,
    objValue: null,
    objStatusId: null,

    open(data) {
        Object.assign(this, data);

        const fields = ["objDescription", "objDate", "objBankName", "objValue", "objStatusId"];
        fields.forEach((item) => $inputChange($(`#newBank .${item}`), this[item], "change"));

        $modalOpen("#newBank");
    },

    save() {
        const fields = ["objDescription", "objDate", "objBankId", "objValue", "objStatusId"];

        //:Valida banco
        const objBankIdNode = $(`#newBank .objBankId`);
        if (!objBankIdNode.value) return $toast("Selecione um banco", "warning");

        //:Valida valor
        const objValueNode = $(`#newBank .objValue`);
        if (!$numberOnly(objValueNode.value)) return $toast("Insira um valor", "warning");

        const data = {};
        fields.forEach((item) => {
            data[item] = $(`#newBank .${item}`).value.trim();
        });

        $modalClose("#newBank");

        this.saveCallback(data);
    },

    events(event) {
        const target = event.target;

        //:Se o evento for em ".wau-select" -> executa funções do select e retorna
        if ($wauSelect.events(this.wauSelect.bank, event, "bank")) return;

        switch (event.type) {
            case "click":
                if (target.closest(".btn.save")) return this.save();
                break;

            default:
                break;
        }

        //:Target inativo
        if ($check.ch1(target)) return;

        //:Valida tecla
        if ($check.ch2(event)) return;

        //:Alteração em Input|Textarea
        if ($check.ch3(event)) return $inputChange(target, target.value, event.type);
    },

    init: async function (saveCallback) {
        //:Importa modal HTML e cria nó
        const url = `${jsURL}financial/libraries/mod_patientBank/patientBank.html?v=${g.refresh}`;
        const modalNode = await fetch(url).then((r) => r.text());
        $("main").insertAdjacentHTML("beforeend", modalNode);

        //:Cria factory de busca de bancos
        this.wauSelect.bank = $wauSelect.factory("#newBank", "bank", "bankLibraries/find_bank");

        this.saveCallback = saveCallback;

        //:Eventos do modal
        $event("#newBank", "change,keyup,click,focusout", (event) => this.events(event));
    },
};
