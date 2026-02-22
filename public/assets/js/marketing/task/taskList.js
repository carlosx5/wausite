document.addEventListener("DOMContentLoaded", async () => {
    //*GET
    // database.get();
});

//:BANCO DE DADOS GLOBAL
const database = {
    //*BUSCA DATA
    get(par) {
        (async function () {
            const getChoice = par?.getChoice ?? ["patientRegister", "patientOs", "patientScreening", "patientRecord", "patientDocument"];
            const patientId = ls.patientId;

            //-FETCH
            const resp = await $fetch({
                url: "patient/register/register/get_data",
                par: { getChoice, patientId },
                fnName: "BUSCA PACIENTE #516",
            });

            //-SE BUSCOU CADASTRO
            if (getChoice.includes("patientRegister")) register.database.set(resp.patientRegister);

            //-SE BUSCOU OS
            if (getChoice.includes("patientOs")) os.database.set(resp.patientOs);

            //-SE BUSCOU TRIAGEM
            if (getChoice.includes("patientScreening")) screening.database.set(resp.patientScreening);

            //-SE BUSCOU PRONTUÁRIO
            if (getChoice.includes("patientRecord")) record.database.set(resp.patientRecord);

            //-SE BUSCOU DOCUMENTOS
            if (getChoice.includes("patientDocument")) documents.database.set(resp.patientDocument);
        })();
    },
};

//:BARRA LATERAL
const sidebar = {
    //*EVENTOS
    events(target) {
        //-NOVO REGISTRO
        if (target.closest(".new")) return register.dom.modal();
    },

    //*INICIO
    init: (function () {
        //-EVENTOS
        $(".sidebarTools").addEventListener("click", (event) => sidebar.events(event.target));
    })(),
};

const list = {};

const register = {
    dom: {
        modal() {
            cl("MODAL");
            $showHideModal(".modalRegister");
        },
    },
};
