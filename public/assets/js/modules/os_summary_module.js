document.addEventListener("DOMContentLoaded", () => {
    osSummary.init();
});

const osSummary = ({
    showModal: async function (id) {
        await getModalTemplate(this.f);
        this.getInfos(id);

        //AJUSTA TAMANHO DO MODAL
        $(this.f).style.width = '600px';

        $showHideModal(this.f);
        $centerModule(this.f);

        //BUSCA TEMPLARTE DE MODAL E ADICIONA EM DOM
        async function getModalTemplate(f) {
            if ($(`${f} div`)) return;

            const resp = await $fetch({
                url: 'modules/modules/os_summary',
                fnName: 'BUSCA TEMPLATE #553',
                overlay: false,
                consoleOn: false,
            });

            $(f).innerHTML = resp.template;

            $(`${f} .exit`).onclick = () => $showHideModal(f);
        };
    },

    getInfos: async function (osId) {
        let getChoice = ['osRegister', 'statusNote'];

        const resp = await $fetch({
            url: 'os/old/get_data',
            par: { getChoice, osId },
            fnName: 'BUSCA LISTA #552',
        });

        this.viewData(resp);
    },

    viewData(data) {
        const e = ['id', 'nm_patient', 'vl_invoice', 'vl_reimbursement',
            'vl_stamp', 'nm_stamp', 'vl_tax', 'nm_tax', 'pc_tax', 'vl_doctor', 'nm_doctor', 'pc_doctor', 'vl_agent', 'nm_agent',
            'pc_agent', 'vl_gloss', 'vl_clinic', 'nm_clinic'];

        e.forEach(y => { $(`[name=${y}]`).value = data.osRegister[y] });

        const vl_guiaNto = mask.currency.formatNow((+data.osRegister.vl_nto) + (+data.osRegister.vl_operational));
        document.querySelector('[name=vl_guiaNto]').value = vl_guiaNto;
    },

    init() {
        this.f = '.os_summary_module';
    },
});