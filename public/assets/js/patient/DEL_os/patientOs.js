document.addEventListener("DOMContentLoaded", async () => {
    //:Importa módulos
    const [patientModule] = await Promise.all([import(`${jsURL}patient/modules/patientModule.js?v=${g.refresh}`)]);

    //:Módulos de paciente
    $m.menuTop = patientModule.menuTop;
    $m.findPatient = patientModule.find;
    $m.sidebar = patientModule.sidebar;

    //:Busca dados
    mainDatabase.get();

    //:Inicia
    // (function () {
    //     const initList = ["record"];
    //     initList.forEach((el) => eval(`${el} .init`)());
    // })();

    //:Ativa aba de "Os" no menu
    $(`#menuTop .btn_os`).classList.add("active");

    //:Eventos
    $event("main", "click,change,focusout,keyup", (event) => events.start(event));
    $event(".sidebarTools", "click", (event) => $m.sidebar.events(event));
});

//:BANCO DE DADOS GLOBAL
const mainDatabase = {
    get: async () => {
        //:Fetch
        const resp = await $fetch({
            url: "patient/os/patientOs/getData",
            par: { patientId: $patientId() },
            fnName: "BUSCA PACIENTE #516",
        });

        os.list = resp.osList;
        os.dom.all();
    },
};

//:MAIN EVENTOS
const events = {
    start(event) {
        const target = event.target;

        //:Menu top
        if (target.closest("#menuTop .tab")) return $m.menuTop.click(event);

        //:Direciona evento p/ o módulo atual
        for (let index = 0; index < g.modulesList.length; index++) {
            const moduleName = g.modulesList[index];
            if (target.closest(`#${moduleName}`)) return $m[moduleName].events(event);
        }
    },
};

//:BODY OS
const os = {
    list: [],

    modal: {
        //-INICIA NOVA OS
        start() {
            if (!$permission(151)) return;
            if (!$patientId()) return;

            //-MODAL
            $$(".modal-newOs input").forEach((e) => (e.value = ""));
            $showHideModal(".modal-newOs");

            //-DEFINE PROCEDIMENTO
            as_procedure();

            //-DEFINE MÉDICO
            if (!$permission("C2", 0)) {
                $n(".modal-newOs id_doctor").value = 11;
                //
                const el = $n(".modal-newOs nm_doctor");
                el.value = "Indisponível";
                el.disabled = true;
            } else {
                as_doctor();
            }

            //-DEFINE AGENTE
            if (!$permission("C3", 0)) {
                $n(".modal-newOs id_agent").value = 11;
                //
                const el = $n(".modal-newOs nm_agent");
                el.value = "Indisponível";
                el.disabled = true;
            } else {
                as_agent();
            }

            //-SELECT DE PROCEDIMENTO
            function as_procedure() {
                if (typeof select_procedure_md1 === "undefined") {
                    select_procedure_md1 = ajaxSelect();
                }
                select_procedure_md1.init({
                    div: ".modal-newOs #as_procedure",
                    url: "procedure/register/find/findProcedure",
                    fields: "col1",
                    callback: (e) => {
                        $(".modal-newOs #id_procedure").value = e.id;
                        $(".modal-newOs #nm_procedure").value = e.txt1;
                    },
                });
            }

            //-SELECT DE MÉDICO
            function as_doctor() {
                if (!$permission(85, 0)) return;

                if (typeof select_doctor_md1 === "undefined") {
                    select_doctor_md1 = ajaxSelect();
                }
                select_doctor_md1.init({
                    div: ".modal-newOs #as_doctor",
                    url: "user/doctor/find/findDoctor",
                    fields: "col1",
                    callback: (e) => {
                        $(".modal-newOs #id_doctor").value = e.id;
                        $(".modal-newOs #nm_doctor").value = e.txt1;
                    },
                });
            }

            //-SELECT DE AGENTE
            function as_agent() {
                if (!$permission(82, 0)) return;

                if (typeof select_agent_md1 === "undefined") {
                    select_agent_md1 = ajaxSelect();
                }
                select_agent_md1.init({
                    div: ".modal-newOs #as_agent",
                    url: "user/agent/find/findAgent",
                    fields: "col1",
                    callback: (e) => {
                        $(".modal-newOs #id_agent").value = e.id;
                        $(".modal-newOs #nm_agent").value = e.txt1;
                    },
                });
            }
        },

        //-BOTÃO FONFIRMAR
        confirm: async function () {
            let id_procedure, id_doctor, id_agent;

            //-PEGA VALORES DO MODAL
            id_procedure = $(".modal-newOs #id_procedure").value;
            id_doctor = $(".modal-newOs #id_doctor").value;
            id_agent = $(".modal-newOs #id_agent").value;

            //-VALIDAÇÃO
            if ($validate(id_procedure, "procedimento", "alert")) return;

            //-DATA
            const formdata = new FormData();
            formdata.append("id_patient", $patientId());
            formdata.append("id_clinic", $n("#register id_clinic").value);
            formdata.append("id_procedure", id_procedure);
            formdata.append("id_doctor", id_doctor);
            formdata.append("id_agent", id_agent);

            //-FETCH
            await $fetch({
                url: "osOld/old/new_register",
                par: formdata,
                fnName: "NOVA OS #571",
            });

            $showHideModal(".modal-newOs");
            mainDatabase.get();
        },

        //-BOTÃO CANCELAR
        cancel() {
            $showHideModal(".modal-newOs");
        },

        //-EVENTOS
        events(event) {
            const target = event.target;

            if (event.type == "click") {
                //-BOTÃO CONFIRMA
                if (target.closest(".btnConfirm")) return this.confirm();
                //-BOTÃO CANCELA
                if (target.closest(".btn-close")) return this.cancel();
            }

            //-VALIDAÇÃO
            const complete =
                $(".modal-newOs #id_procedure").value &&
                $(".modal-newOs #id_doctor").value &&
                $(".modal-newOs #id_agent").value
                    ? false
                    : true;

            //-PROPRIEDADES DO BOTÃO CONFIRMAR
            $(".modal-newOs .btnConfirm").disabled = complete;
        },

        init: (function () {
            //-EVENTOS EM MODAL
            $event(".modal-newOs", "change,click", (event) => os.modal.events(event));
        })(),
    },

    dom: {
        list() {
            const iconGoOsStatus = $permission(76, 0) ? " active" : "";
            const iconDeleteStatus = $permission(111, 0) ? " active" : "";

            const tpt = os.list
                .map(({ id, procedure, created_at, vl_invoice, nm_doctor }) => {
                    vl_invoice = mask.currency.formatNow(vl_invoice);

                    return `
                        <tr data-id="${id}">
                            <th scope="row">${id}</th>
                            <td>${created_at}</td>
                            <td>${procedure}</td>
                            <td>${nm_doctor}</td>
                            <td>${vl_invoice}</td>
                            <td class="text-center py-0">
                                <i class="fa-light fa-clipboard-medical goOs${iconGoOsStatus}" title="Vai p/ tela de OS"></i>
                                <i class="fa-light fa-trash-can ms-2 delete${iconDeleteStatus}" title="Deleta OS"></i>
                            </td>
                        </tr>`;
                })
                .join("");

            $("#os tbody").innerHTML = tpt;
        },

        all() {
            $m.menuTop.setName();
            this.list();
        },
    },

    events(event) {
        if (event.type !== "click") return;

        const target = event.target;

        //:Nova OS
        if (target.closest(".btnNew")) return os.modal.start();
        //:Deleta OS
        if (target.closest(".delete")) {
            if (!$permission(111)) return;

            const osId = target.closest("tr").dataset.id;

            if (!confirm(`Confirma deletar a OS ${osId}?`)) return;

            //FETCH
            (async function () {
                await $fetch({
                    url: "osOld/old/delete_osRegister",
                    par: { osId },
                    fnName: "DELETA OS #571",
                });

                mainDatabase.get();
            })();
        }
        //:Vai para tela de OS
        if (target.closest(".goOs")) {
            const id = target.closest("tr").dataset.id;

            ls.set("osId", id, "os_register");
            ls.set("menu", "finance", "os_register");
            window.location.href = `${baseURL}osOld/old`;
            return;
        }
    },
};
