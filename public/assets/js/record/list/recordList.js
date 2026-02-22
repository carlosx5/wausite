export const obj = {
    data: { list: [], patient: {} },

    database: {
        get: async function () {
            const patientId = $patientId();

            const resp = await $fetch({
                url: "recordList/getData",
                par: { patientId },
                fnName: "BUSCA LISTA WAU-0062",
            });

            //:Seta dados
            this.set(resp);
        },

        set(resp) {
            if (!resp?.patient?.id) return (window.location.href = `${baseURL}pacientes`);

            //:Seta dados
            $patientId(resp.patient.id);

            obj.data.list = resp.list || [];
            obj.data.patient = resp.patient || {};

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            $m.menuTop.set(obj.data.patient);

            obj.left.renderList();
        },
    },

    left: {
        //:Renderiza lista de prontuários
        renderList() {
            //:Duplica o array original 15 vezes para fins de teste
            // cl("LISTA SENDO DUPLICADA 15X PARA TESTES");
            // const repeatedList = Array(15).fill(obj.data.list).flat();
            const repeatedList = obj.data.list;

            const listItems = repeatedList.map((item, index) => {
                const collapseId = `col_${index}`;
                const formattedDate = $date.format(item.created_at, "Br/");
                const start = item.start ? $date.format(item.start, "Br/tm") : "00:00";
                const end = item.end ? $date.format(item.end, "Br/tm") : "00:00";
                const pending = item.id_pending;
                const goRegisterDisabled = pending ? "" : "disabled";
                const goRegisterText = pending ? "Edita prontuário" : "Prontuário fechado";
                const pdfOriginalDisabled = pending ? "disabled" : "";

                //:Define status do botão de assinatura
                const [signatureDisabled, signatureText] = (function () {
                    if (pending) {
                        return ["disabled", "Assinar prontuário"];
                    } else if (item.signature_status == 0) {
                        return ["", "Assinar prontuário"];
                    } else if (item.signature_status == 1) {
                        return ["disabled", "Aguardando assinatura"];
                    } else if (item.signature_status == 2) {
                        return ["disabled", "Assinar prontuário"];
                    }

                    return ["disabled", "Erro na assinatura"];
                })();

                // return `
                // <div class="list-box" data-id="${item.id}" data-pending="${pending}" data-target="${collapseId}">
                //     <div class="list-item">
                //         <div class="col-2 content">
                //             <div><span>Prontuário:</span> ${item.id}</div>
                //             <div><span>Data:</span> ${formattedDate}</div>
                //         </div>
                //         <div class="col-4 content">
                //             <div><span>Procedimento:</span> ${item.procedureName}</div>
                //             <div><span>Profissional:</span> ${item.profName}</div>
                //         </div>
                //         <div class="col-2 content">
                //             <div><span>Início:</span> ${start}</div>
                //             <div><span>Fim:</span> ${end}</div>
                //         </div>

                //         <div class="col btnMain">
                //             <button class="btn goRegister" ${goRegisterDisabled}>
                //                 <i class="fa-regular fa-clipboard-medical"></i>
                //                 <span>${goRegisterText}</span>
                //             </button>
                //             <button class="btn pdfOriginal" ${pdfOriginalDisabled}>
                //                 <i class="fa-regular fa-file-pdf"></i>
                //                 <span>Prontuário em PDF</span>
                //             </button>
                //             <button class="btn signature" ${signatureDisabled}>
                //                 <i class="fa-regular fa-file-signature"></i>
                //                 <span>${signatureText}</span>
                //             </button>
                //             <button class="btn">
                //                 <i class="fa-regular fa-eye"></i>
                //                 <span>Visualiza prontuário</span>
                //             </button>
                //         </div>

                //         <button class="btn btnCollapse" title="Abre e edita prontuário">
                //             <i class="fa-regular fa-chevron-down"></i>
                //         </button>
                //     </div>
                //     <div class="collapse" id="${collapseId}">
                //         <div class="card card-body view"></div>
                //     </div>
                // </div>`;

                return `
                <div class="list-box" data-id="${item.id}" data-pending="${pending}" data-target="${collapseId}">
                    <div class="list-item">
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span class="badge bg-light text-secondary border px-2 py-1 fw-bold">${item.id}</span>
                                <h5 class="mb-0 fw-bold text-dark">${item.procedureName}</h5>
                            </div>
                            <div class="d-flex align-items-center gap-2 text-secondary">
                                <i class="bi bi-person text-secondary opacity-75"></i>
                                <span class="small fw-medium">${item.profName}</span>
                            </div>
                        </div>
                        <div class="date-box">
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi bi-calendar-event text-primary"></i>
                                <div class="small">
                                    <span class="fw-bold text-dark">${formattedDate}</span>
                                    <span class="text-muted mx-1">&bull;</span>
                                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                                        ${start} - ${end}
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-1 text-muted" style="font-size: 0.75rem;">
                                <i class="bi bi-clock"></i>
                                <span>Criado em: ${formattedDate}</span>
                            </div>
                        </div>
                        <div class="btn-box">
                            <button class="btn action-btn goRegister" ${goRegisterDisabled}>
                                <i class="fa-light fa-clipboard-medical"></i>
                                <div class="span-box">
                                    <p>${goRegisterText}</p>
                                </div>
                            </button>
                            <button class="btn action-btn pdfOriginal" ${pdfOriginalDisabled}>
                                <i class="fa-light fa-file-pdf"></i>
                                <div class="span-box">
                                    <p>Prontuário em PDF</p>
                                </div>
                            </button>
                            <button class="btn action-btn" ${signatureDisabled}>
                                <i class="fa-light fa-file-signature"></i>
                                <div class="span-box">
                                    <p>${signatureText}</p>
                                </div>
                            </button>
                            <button class="btn action-btn">
                                <i class="fa-light fa-eye"></i>
                                <div class="span-box">
                                    <p>Visualiza prontuário</p>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div class="collapse" id="${collapseId}">
                        <div class="card card-body view scrollbar"></div>
                    </div>
                </div>`;
            });

            //:Renderiza os itens na interface
            $("#list .left").innerHTML = listItems.join("");
        },

        collapse: async (target) => {
            //:Obtém card onde o conteúdo será inserido
            const boxNode = target.closest(".list-box");
            const cardNode = boxNode.querySelector(".card-body");
            const collapseId = boxNode.dataset.target;
            const recordId = boxNode.dataset.id;

            //:Card existe -> toggle em collapse e retorna
            if (cardNode.querySelector("*")) return $collapse.toggle(`#${collapseId}`);

            //:Busca módulo PDF
            const resp = await $fetch({
                url: "recordList/getModulePdf",
                par: { recordId },
                overlay: false,
                fnName: "BUSCA MODULOS WAU-0142",
            });

            //:Se não existir módulo PDF, exibe mensagem
            if (!resp.modulePdf) {
                const content = `
                    <div class="alert alert-warning text-center" role="alert">
                        <strong>Atenção:</strong>
                        <br>
                        <strong>O prontuário precisa ser finalizado para ser visualizado</strong>
                    </div>
                `;
                cardNode.innerHTML = content;

                //:Abre o collapse
                return $collapse.show(`#${collapseId}`);
            }

            //:Transforma módulo de formato PDF p/ WEB
            //:Troca todos os <ul> e <li> por <div>
            let content = resp.modulePdf.content;
            content = content.replaceAll("<ul", "<div");
            content = content.replaceAll("</ul", "</div");
            content = content.replaceAll("<li", "<div");
            content = content.replaceAll("</li", "</div");

            //:Insere o conteúdo no card
            cardNode.innerHTML = content;

            //:Abre o collapse
            $collapse.show(`#${collapseId}`);
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    //:Abrir registro
                    if (target.closest(".goRegister")) return goRegister();
                    //:PDF original
                    if (target.closest(".pdfOriginal")) return pdfOriginal();
                    //:Assinatura
                    if (target.closest(".btn.signature")) return sendPdfForSignature();
                    //:Collapse
                    if (target.closest(".list-box")) return obj.left.collapse(target);
                    //:Collapse
                    if (target.closest(".collapse.show")) return obj.left.collapse(target);
                    return;

                default:
                    return;
            }

            function goRegister() {
                const recordId = target.closest(".list-box").dataset.id;
                if ($isEmpty(recordId)) return;
                ls.set("recordId", recordId);

                //:Se prontuário estiver pendente e for de outro usuário, não abre o registro
                const pendingId = target.closest(".list-box").dataset.pending;
                const logId = cookie.get("log_userId");
                if (pendingId && pendingId != logId) {
                    return;
                }

                moduleRender("register");
            }

            async function pdfOriginal() {
                const recordId = target.closest(".list-box").dataset.id;
                if ($isEmpty(recordId)) return;

                cookie.set("printId", recordId, 1);
                window.open(`${baseURL}print-prontuario`);
            }

            //:Envia PDF para assinatura
            async function sendPdfForSignature() {
                const recordId = target.closest(".list-box").dataset.id;
                const pending = +target.closest(".list-box").dataset.pending;

                //:Prontuário não foi finalizado -> envia mensagem
                if (pending) return $m.msg.recordNeedsFinalization();

                //:Prontuário foi finalizado -> envia PDF para assinatura
                const resp = await $fetch({
                    url: "record/pdf/PdfFetch/sendPdfForSignature",
                    par: { recordId },
                    fnName: "BUSCA DADOS #675",
                });

                //:Servidor detectou que o Pdf ja foi enviado -> envia mensagem
                if (resp.pdfId && !resp.pdfSigned) $m.msg.pdfSigned(resp);
            }
        },
    },

    headerBar(event) {
        if (event.type !== "click") return;

        //:Buscar paciente
        if (event.target.closest(".search")) return findPatient();
    },

    events(event) {
        if (event.target.closest(".left")) return obj.left.events(event);
    },

    init() {},
};
