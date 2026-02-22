export default {
    wauSelect: { plan: null },
    saveCallback: null,
    //:Form Inputs
    objDescription: null,
    objDate: null,
    objPlanId: null,
    objPlanName: null,
    objValue: null,
    objStatusId: null,

    open(data) {
        Object.assign(this, data);

        const fields = ["objDescription", "objDate", "objPlanName", "objValue", "objStatusId"];
        fields.forEach((item) => $inputChange($(`#newPlan .${item}`), this[item], "change"));

        $modalOpen("#newPlan");
    },

    save() {
        const fields = ["objDescription", "objDate", "objPlanId", "objValue", "objStatusId"];

        //:Valida convênio
        const objPlanIdNode = $(`#newPlan .objPlanId`);
        if (!objPlanIdNode.value) return $toast("Selecione um convênio", "warning");

        //:Valida valor
        const objValueNode = $(`#newPlan .objValue`);
        if (!$numberOnly(objValueNode.value)) return $toast("Insira um valor", "warning");

        const data = {};
        fields.forEach((item) => {
            data[item] = $(`#newPlan .${item}`).value.trim();
        });

        $modalClose("#newPlan");

        this.saveCallback(data);
    },

    events(event) {
        const target = event.target;

        //:Se o evento for em ".wau-select" -> executa funções do select e retorna
        if ($wauSelect.events(this.wauSelect.plan, event, "plan")) return;

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
        const url = `${jsURL}financial/libraries/mod_patientPlan/patientPlan.html?v=${g.refresh}`;
        const modalNode = await fetch(url).then((r) => r.text());
        $("main").insertAdjacentHTML("beforeend", modalNode);

        //:Cria factory de busca de convênios
        this.wauSelect.plan = $wauSelect.factory("#newPlan", "plan", "planLibraries/find_plan");

        this.saveCallback = saveCallback;

        //:Eventos do modal
        $event("#newPlan", "change,keyup,click,focusout", (event) => this.events(event));
    },
};
