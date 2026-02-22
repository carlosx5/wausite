export const obj = {
    data: { osList: [] },

    database: {
        get: async function () {
            const dtTarget = ls.f_dtTarget;
            const dtStart = ls.f_dtStart;
            const dtEnd = ls.f_dtEnd;
            const statusId = ls.f_statusId;
            const profId = ls.f_profId;
            const clinicId = ls.f_clinicId;
            const order = ls.f_order;

            //:fetch
            const resp = await $fetch({
                url: "reportOsList/getData",
                par: { dtTarget, dtStart, dtEnd, statusId, profId, clinicId, order },
                fnName: "BUSCA DADOS WAU-0089",
            });

            //:Seta dados
            this.set(resp);
        },

        set(resp) {
            //:Seta dados
            obj.data.osList = resp.osList || [];

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            obj.left.renderList();

            $saveMode.disable();
        },
    },

    left: {
        //:Renderiza lista de serviços
        renderList() {
            const html = obj.data.osList.map((item) => {
                const date = (ls.f_dtTarget = "calendar") ? item.calendarStart : item.createdAt;
                const formatedDate = $date.format(date, "Br/");

                return `
                    <tr data-patient_id="${item.patientId}" data-os_id="${item.id}">
                        <th scope="row">${item.id}</th>
                        <td>${formatedDate}</td>
                        <td>${item.patientName}</td>
                        <td>${item.procedureName}</td>
                        <td>${item.profName}</td>
                        <td>${item.clinicName}</td>
                        <td>${item.statusName}</td>
                        <td>
                            <div class="action-btn">
                                <button class="btn px-1 py-0 goPatient">
                                    <i class="fa-light fa-address-card fa-lg"></i>
                                </button>
                                <button class="btn px-1 py-0 goService">
                                    <i class="fa-light fa-files-medical fa-lg"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            //:Renderiza os itens na interface
            $("#list .left tbody").innerHTML = html.join("");
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    //:Vai p/ cadastro do paciente
                    if (target.closest(".goPatient")) return goPatient();
                    //:Vai p/ cadastro do serviço
                    if (target.closest(".goService")) return goService();
                    return;

                default:
                    return;
            }

            function goPatient() {
                if (!$permission("69P")) return;

                const patientId = target.closest("tr").dataset.patient_id;
                if (!patientId) return;

                $patientId(patientId);
                window.location.href = `${baseURL}pacientes`;
            }

            function goService() {
                if (!$permission("76P")) return;

                const osId = target.closest("tr").dataset.os_id;
                if (!osId) return;

                ls.set("osId", osId, "os");
                ls.set("menuTop", "register", "os");
                window.location.href = `${baseURL}servicos`;
            }
        },
    },

    events(event) {
        const target = event.target;

        //:Eventos da esquerda
        if (target.closest(".left")) return obj.left.events(event);
    },

    init() {
        $saveMode.init(false);
    },
};
