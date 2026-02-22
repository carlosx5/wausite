export const obj = {
    data: { osList: [], checkPendingRecord: null },

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
                url: "reportServiceList/getData",
                par: { dtTarget, dtStart, dtEnd, statusId, profId, clinicId, order },
                fnName: "BUSCA DADOS WAU-0149",
            });

            //:Seta dados
            this.set(resp);
        },

        set(resp) {
            //:Seta dados
            obj.data.osList = resp.osList;
            obj.data.checkPendingRecord = resp.checkPendingRecord;

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
            const html = { 0: "", 1: "", 2: "", 3: "" };

            obj.data.osList.map((item) => {
                let btnClass = "";
                let btnText = "";
                let btnDisabled = "";

                const profId = +cookie.get("log_userId");
                const itemLocked = obj.checkPendingRecord || +item.profId !== profId ? true : false;

                const date = (ls.f_dtTarget = "calendar") ? item.calendarStart : item.createdAt;
                const formattedDate = $date.format(date, "Br/");
                const time = item.calendarStart.split(" ")[1];

                const statusMap = { 10: 0, 20: 0, 30: 0, 40: 0, 50: 1, 70: 2 };
                const status = statusMap[+item.recordStatus] ?? 3;

                switch (status) {
                    case 0: //:Prontuário pendente
                        btnClass = "color-wau1";
                        btnText = "Iniciar atendimento";
                        btnDisabled = itemLocked ? " disabled" : "";
                        break;

                    case 1: //:Prontuário ativo
                        btnClass = "btn-danger backRecord";
                        btnText = "Retornar ao atendimento";
                        btnDisabled = "";
                        break;

                    case 2: //:Prontuário encerrado
                        btnClass = "btn-outline-secondary";
                        btnText = "Atendimento finalizado";
                        btnDisabled = " disabled";
                        break;

                    case 3: //:Outros
                        btnClass = "d-none";
                        break;
                }

                const newRow = `
                    <tr data-patient_id="${item.patientId}" data-os_id="${item.osId}">
                        <th scope="row">${item.osId}</th>
                        <td>${formattedDate} - ${time}</td>
                        <td>${item.patientName}</td>
                        <td>${item.procedureName}</td>
                        <td>${item.profName}</td>
                        <td>${item.clinicName}</td>
                        <td>${item.statusName}</td>
                        <td>
                            <div class="action-btn">
                                <button class="btn ${btnClass} startRecord"${btnDisabled} title="Iniciar/Continuar Prontuário">
                                    <i class="fa-light fa-clipboard-medical fa-lg"></i>
                                    <span>${btnText}</span>
                                </button>
                            </div>
                        </td>
                        <td>
                            <div class="action-btn">
                                <button class="btn px-1 py-0 goPatient" title="Vai p/ cadastro de Paciente">
                                    <i class="fa-light fa-address-card fa-lg"></i>
                                </button>
                                <button class="btn px-1 py-0 goService" title="Vai p/ cadastro de Serviço">
                                    <i class="fa-light fa-files-medical fa-lg"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;

                html[status] += newRow;
            });

            //:Renderiza os itens na interface
            $("#list .left tbody").innerHTML = html[1] + html[0] + html[2] + html[3];
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    //:Retornar ao prontuário
                    if (target.closest(".btn.backRecord")) return backRecord();
                    //:Iniciar prontuário
                    if (target.closest(".btn.startRecord")) return startRecord();
                    //:Vai p/ cadastro do paciente
                    if (target.closest(".goPatient")) return goPatient();
                    //:Vai p/ cadastro do serviço
                    if (target.closest(".goService")) return goService();
                    return;

                default:
                    return;
            }

            //:Iniciar prontuário
            function startRecord() {
                const tr = target.closest("tr");
                console.log("tr: ", tr);
                const recordId = $numberOnly(tr.dataset.record_id);
                $patientId(tr.dataset.patient_id);

                //:Seta página de origem no prontuário
                //:Caso o prontuário seja deletado, o sistema retorna para essa página
                ls.set("sourcePage", "serviceList", "record");

                //:Existe prontuário -> redireciona para o prontuário
                if (recordId) {
                    cl("Existe prontuário, redirecionando...");
                    // ls.set("menuTop", "register", "record");
                    // return (window.location.href = `${baseURL}prontuarios`);
                }

                //:Não existe prontuário -> cria novo prontuário
                if (tr) return obj.left.createNewRecord(tr);
            }

            //:Vai p/ cadastro do paciente
            function goPatient() {
                if (!$permission("69P")) return;

                const patientId = target.closest("tr").dataset.patient_id;
                if (!patientId) return;

                $patientId(patientId);
                window.location.href = `${baseURL}pacientes`;
            }

            //:Vai p/ cadastro do serviço
            function goService() {
                if (!$permission("76P")) return;

                const osId = target.closest("tr").dataset.os_id;
                if (!osId) return;

                ls.set("osId", osId, "os");
                ls.set("menuTop", "register", "os");
                window.location.href = `${baseURL}servicos`;
            }

            //:Retornar ao prontuário
            function backRecord() {
                ls.set("menuTop", "register", "record");
                window.location.href = `${baseURL}prontuarios`;
            }
        },

        createNewRecord: async (tr) => {
            const osId = tr?.dataset?.os_id;
            const patientId = tr?.dataset?.patient_id;

            if (!osId || !patientId) return console.error("Parâmetros obrigatórios ausentes: osId ou patientId.");

            //:Seta paciente no localStorage
            $patientId(patientId);
            const resp = await $fetch({
                url: "recordRegister/newRecord",
                par: { osId },
                fnName: "CRIA PRONTUARIO WAU-0148",
            });

            if (resp.status !== 200) return pendingRecord(resp);

            //:Redireciona para o prontuário
            ls.set("menuTop", "register", "record");
            window.location.href = `${baseURL}prontuarios`;
            return;
            //* * * * * * * * * * * * * * * * * * * *

            function pendingRecord(resp) {
                if (!resp.pendingRecord) return;

                $messageModal({
                    text1: "Você possui um prontuário em aberto. Finalize ou delete o prontuário antes de criar um novo.",
                    btn: [
                        { text: "Visualizar prontuário", color: "success", dataset: "go" },
                        { text: "Sair", color: "warning", dataset: "exit" },
                    ],
                    btnWidth: "180px",
                    timer: false,
                    callback(dtback) {
                        if (dtback === "exit") return;

                        //:Redireciona para o prontuário pendente
                        ls.set("menuTop", "register", "record");
                        window.location.href = `${baseURL}prontuarios`;
                    },
                });
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
