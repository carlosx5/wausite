export const obj = {
    data: { osList: [] },

    database: {
        get: async function () {
            const dtStart = ls.f_dtStart;
            const dtEnd = ls.f_dtEnd;
            const clinicId = ls.f_clinicId;
            const order = ls.f_order;

            //:fetch
            const resp = await $fetch({
                url: "reportPatientList/getData",
                par: { dtStart, dtEnd, clinicId, order },
                fnName: "BUSCA DADOS WAU-0183",
            });

            //:Seta dados
            this.set(resp);
        },

        set(resp) {
            //:Seta dados
            obj.data.patientList = resp.patientList || [];

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            obj.left.renderList();

            $saveMode.disable();
        },
    },

    left: {
        renderList() {
            const html = obj.data.patientList.map((item) => {
                const formatedDate = $date.format(item.date, "Br/");

                return `
                    <tr data-patient_id="${item.id}">
                        <th scope="row">${item.id}</th>
                        <td>${formatedDate}</td>
                        <td>${item.name}</td>
                        <td>
                            <div class="action-btn">
                                <button class="btn px-1 py-0 goPatient">
                                    <i class="fa-light fa-address-card fa-lg"></i>
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
