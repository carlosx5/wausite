document.addEventListener("DOMContentLoaded", async () => {
    //:Se não tiver permissão, ou não estiver em modo debugger -> retorna
    if (!$permission("9P", 0) && !cookie.get("debugger")) return cl("Sem permissão");

    //:Eventos
    document.addEventListener("keydown", (event) => $devEventsKeydown(event));

    const devmodeIcon = $("#sidebar .dev i");
    devmodeIcon.style.color = g.devmodeOn ? "red" : "#fff";
});

function $devEvents(event) {
    const target = event.target;

    //:Fecha menu DEV ao clicar dentro da div
    if (target.closest(".btn-dev")) {
        if (target.closest(".stop-close")) return;

        const dropdownToggle = document.querySelector(".dropdown.dev .dropdown-menu");
        dropdownToggle.classList.remove("show");
    }

    switch (event.type) {
        case "click":
            //:Faz refresh em todo sistema
            if (target.closest(".btnDevRefresh")) return devRefresh();
            //:Ativa/Desativa Devmode
            if (target.closest(".btnDevmodeActive")) return btnDevmodeActive();
            //:Simula login de outro usuário
            if (target.closest(".btnDevUserDebugger")) return userDebugger();
            //:Atualiza permissões
            if (target.closest(".btnDevPermRefresh")) return devPermRefresh();
            //:Simula login de outro usuário
            if (target.closest(".user-box .user")) return userDebugger();
            //:Executa teste
            if (target.closest(".btnDevTest")) return devTest();
            //:?????
            if (target.closest(".btndevEncrypt")) return devEncrypt.form();
            //:Mostra session atual
            if (target.closest(".btnDevSession")) return devSession();
            //:Executa manutenção no sistema
            if (target.closest(".btnDevMaintenance")) return devMaintenance();
            //:?????
            if (target.closest(".btnDevController")) return devController();
            //:Alterna entre Desenvolvimento e Produção
            if (target.closest(".btnDevEnvironment")) return devEnvironment();
            return;

        default:
            return;
    }
}

async function devEnvironment() {
    await $fetch({
        url: "dev/setEnvironment",
        fnName: "ENVIRONMENT WAU-0185",
    });

    location.reload();
}

function $devEventsKeydown(event) {
    if (!(event.ctrlKey && event.shiftKey)) return;
    event.preventDefault();

    const key = event.key.toUpperCase();
    switch (key) {
        //:CONTROL+1 para executar teste
        case "1":
            return teste();

        case "D":
            return userDebugger();

        case "C":
            return $devGetNemCode.get();

        default:
            break;
    }
}

async function teste() {
    return;
    cl("Teste executado!");
    $toast("Executando função de teste...", "warning");

    const debug = {
        id: "MjIyNXxmNGJlNWU5ZS01MDNmLTQ0NzMtYjUxNy1hNGMxM2NlMGIzOTQ=",
        object: "webhook",
        name: "Padr\u00e3o",
        format: "json",
        url: "https://wausaude.com.br/api/autentique/webhook/rest",
        event: {
            id: "f4be5e9e-503f-4473-b517-a4c13ce0b394",
            object: "event",
            organization: 15351553,
            type: "document.finished",
            data: {
                id: "ff0be2f206b49569681e2761715a1e92668a74a61574fdd8b",
                object: "document",
                name: "Prontu\u00e1rio",
                message: null,
                refusable: false,
                author: {
                    name: "WAU Sa\u00fade",
                    company: null,
                    email: "wausaudeadm@gmail.com",
                    phone: null,
                    cpf: null,
                    cnpj: null,
                    birthday: null,
                },
                signatures: [
                    {
                        public_id: "c52f18ec-bcd9-11f0-aebc-42010a2b601e",
                        object: "signature",
                        user: {
                            name: "WAU Sa\u00fade",
                            company: null,
                            email: "wausaudeadm@gmail.com",
                            phone: null,
                            cpf: null,
                            cnpj: null,
                            birthday: null,
                        },
                        document: "ff0be2f206b49569681e2761715a1e92668a74a61574fdd8b",
                        events: [],
                        mail: { sent: null, opened: null, refused: null, delivered: null, reason: null },
                        action: null,
                        viewed: null,
                        signed: null,
                        rejected: null,
                        reason: null,
                        biometric_unapproved: null,
                        biometric_approved: null,
                        biometric_rejected: null,
                        created_at: "2025-11-08T19:33:15.000000Z",
                        archived_at: null,
                    },
                    {
                        public_id: "c5371bb6-bcd9-11f0-aebc-42010a2b601e",
                        object: "signature",
                        user: {
                            name: "Carlos Alberto Henriques Vieira",
                            company: null,
                            email: "carlosvieirax5@gmail.com",
                            phone: null,
                            cpf: "08215141803",
                            cnpj: null,
                            birthday: "1967-11-21",
                        },
                        document: "ff0be2f206b49569681e2761715a1e92668a74a61574fdd8b",
                        events: [
                            {
                                type: "viewed",
                                document: "ff0be2f206b49569681e2761715a1e92668a74a61574fdd8b",
                                user: {
                                    uuid: "dc927b64a21589039c8b8f38b30989f02be70859",
                                    name: "Carlos Alberto Henriques Vieira",
                                    email: "carlosvieirax5@gmail.com",
                                    cpf: "08215141803",
                                    cnpj: null,
                                    birthday: "1967-11-21",
                                },
                                geolocation: {
                                    country: "Brazil",
                                    countryISO: "BR",
                                    state: "S\u00e3o Paulo",
                                    stateISO: "SP",
                                    city: "S\u00e3o Paulo",
                                    zipcode: "01000",
                                    latitude: -23.5475,
                                    longitude: -46.6361,
                                },
                                reason: null,
                                ip: "191.9.101.47",
                                port: 38192,
                                created_at: "2025-11-08T19:36:00.000000Z",
                            },
                            {
                                type: "signed",
                                document: "ff0be2f206b49569681e2761715a1e92668a74a61574fdd8b",
                                user: {
                                    uuid: "dc927b64a21589039c8b8f38b30989f02be70859",
                                    name: "Carlos Alberto Henriques Vieira",
                                    email: "carlosvieirax5@gmail.com",
                                    cpf: "08215141803",
                                    cnpj: null,
                                    birthday: "1967-11-21",
                                },
                                geolocation: {
                                    country: "Brazil",
                                    countryISO: "BR",
                                    state: "S\u00e3o Paulo",
                                    stateISO: "SP",
                                    city: "S\u00e3o Paulo",
                                    zipcode: "01000",
                                    latitude: -23.5475,
                                    longitude: -46.6361,
                                },
                                reason: null,
                                ip: "191.9.101.47",
                                port: 38212,
                                created_at: "2025-11-08T19:36:04.000000Z",
                            },
                        ],
                        mail: {
                            sent: "2025-11-08 16:33:15",
                            opened: null,
                            refused: null,
                            delivered: "2025-11-08 16:33:18",
                            reason: null,
                        },
                        action: "Sign",
                        viewed: "2025-11-08T19:36:00.000000Z",
                        signed: "2025-11-08T19:36:04.000000Z",
                        rejected: null,
                        reason: null,
                        biometric_unapproved: null,
                        biometric_approved: null,
                        biometric_rejected: null,
                        created_at: "2025-11-08T19:33:15.000000Z",
                        archived_at: null,
                    },
                ],
                stop_on_rejected: true,
                qualified: false,
                ignore_cpf: false,
                ignore_birthdate: false,
                sortable: false,
                is_blocked: false,
                sandbox: true,
                api: true,
                scrolling_required: false,
                locale: { country: "BR", language: "pt-BR", timezone: "America/Sao_Paulo", date_format: "d/m/Y" },
                email_template_id: null,
                expiration_at: null,
                notify_in: null,
                reminder: null,
                reply_to: null,
                signatures_count: 1,
                signed_count: 1,
                rejected_count: 0,
                files: {
                    original:
                        "https://storage.googleapis.com/d6e/1d0ec544535808c16d41554974f38de5/BERfSXPdEos38ZAH62lEokwhpKZ6Gakch7GMvD6h.original.pdf",
                    signed: "https://api.autentique.com.br/documentos/ff0be2f206b49569681e2761715a1e92668a74a61574fdd8b/assinado.pdf",
                },
                created_at: "2025-11-08T19:33:14.000000Z",
                updated_at: "2025-11-08T19:36:04.000000Z",
                deleted_at: null,
                deadline_at: null,
                lifecycle_in: "2030-11-08T03:00:00.000000Z",
                author_folder_id: null,
            },
            previous_attributes: { signed_count: 1 },
            created_at: "2025-11-08T19:36:04.873683Z",
        },
    };

    const resp = await $fetch({
        url: "api/autentique/webhook/rest",
        par: { debug },
        fnName: "DEBUG WEBHOOK",
    });

    console.log("resp: ", resp);
}

function teste2() {
    // 1. Seu array de objetos (com um item extra que não está na ordem)
    const modules = [
        { id: "1", title: "Anamnese" },
        { id: "7", title: "Teste-1" },
        { id: "99", title: "Item Novo Sem Ordem" }, // <-- Item fora da ordem
        { id: "6", title: "Teste radio" },
        { id: "2", title: "Anamnese Padrão" },
        { id: "4", title: "Medicamentos em uso" },
        { id: "3", title: "Alergias e Intolerâncias" },
    ];

    // 2. A sequência de IDs desejada
    const customOrder = [4, 6, 7];

    // 3. Ordena o array com a nova lógica
    modules.sort((a, b) => {
        const idA = parseInt(a.id);
        const idB = parseInt(b.id);

        const indexA = customOrder.indexOf(idA);
        const indexB = customOrder.indexOf(idB);

        const aIsInOrder = indexA !== -1;
        const bIsInOrder = indexB !== -1;

        // Caso 1: 'a' não está na ordem, mas 'b' está. 'a' vai para o fim.
        if (!aIsInOrder && bIsInOrder) {
            return 1;
        }

        // Caso 2: 'a' está na ordem, mas 'b' não. 'b' vai para o fim.
        if (aIsInOrder && !bIsInOrder) {
            return -1;
        }

        // Caso 3: Ambos estão na ordem. Usa a lógica original.
        if (aIsInOrder && bIsInOrder) {
            return indexA - indexB;
        }

        // Caso 4 (Opcional): Nenhum está na ordem. Ordena por ID numérico.
        // Se não precisar disso, pode retornar 0.
        return idA - idB;
    });

    // 4. Exibe o resultado no console
    // console.log(modules.map((m) => m.title).join(", "));
    cl(modules);
    // Saída esperada: Teste-1, Alergias e Intolerâncias, Anamnese, Medicamentos em uso, Teste radio, Anamnese Padrão, Item Novo Sem Ordem
}

async function devPermRefresh() {
    const resp = await $fetch({
        url: "dev/devPermRefresh",
        fnName: "DEVMODE WAU-0095",
    });

    if (resp.status == 200) {
        g.perm = resp.newPermissions;

        cl("Permissões atualizadas:", g.perm);
        $toast("Permissões atualizadas com sucesso!", "success");
    } else {
        cl("Erro ao atualizar permissões");
        $toast("Erro ao atualizar permissões!", "danger");
    }
}

const btnDevmodeActive = async () => {
    const resp = await $fetch({
        url: "dev/runDevmode",
        fnName: "DEVMODE WAU-0003",
    });

    if (resp.status == 200) location.reload();
};

//Mostra valores contidos em formData
const $formdataShow = (formData) => {
    for (const data of formData.entries()) {
        console.log(`${data[0]} = ${data[1]}`);
    }
};

const devRefresh = async () => {
    const resp = await $fetch({
        url: "dev/refresh",
        fnName: "REFRESH WAU-0004",
    });

    if (resp.status == 200) location.reload();
};

const devTest = () => {
    return;

    // $addValue('1,2,3', '4,3');
    // cl($addValue('1,2,3', '4,3,2,6', { returnAs: 1 }));
    // cl($addValue('1,2,3', '4,3,2,6', { returnAs: 2 }));
    cl($addValue("6,1,2,3,", ",4,,2,6,1", { returnAs: 3 }));

    return;

    // (async function () {
    //     const resp = await $fetch({
    //         url: 'calendar/register/register/getCalendar',
    //         par: {
    //             calendarId: 4349,
    //         },
    //         fnName: 'TESTE',
    //     });

    //     cl(resp);

    // }());

    cl(calendar.getEvents());

    // calendar.events = [
    //     {
    //         title: 'Titulo 1',
    //         start: '2024-04-11'
    //     },
    // ];
    // calendar.render();

    // const novoEvento = {
    //     id: '111222',
    //     title: 'Novo Título',
    //     color: 'orangered',
    //     start: '2024-04-11 10:50',
    //     end: '2024-04-11 12:50',
    // };
    // calendar.addEvent(novoEvento);

    // const eventId = v.event_id;
    // const event = calendar.getEventById(eventId);
    // event.setStart('2024-04-08 10:30', true);

    cl("TESTE");
    return;

    (async function () {
        const data = {
            isStatusReply: false,
            senderLid: "81896604192873@lid",
            connectedPhone: "554499999999",
            waitingMessage: false,
            isEdit: false,
            isGroup: false,
            isNewsletter: false,
            instanceId: "A20DA9C0183A2D35A260F53F5D2B9244",
            messageId: "A20DA9C0183A2D35A260F53F5D2B9244",
            phone: "5511989497692",
            fromMe: false,
            momment: 1632228955000,
            status: "RECEIVED",
            chatName: "name",
            senderPhoto: "https://",
            senderName: "name",
            participantPhone: null,
            participantLid: null,
            photo: "https://",
            broadcast: false,
            type: "ReceivedCallback",
            reaction: {
                value: "❤️",
                time: 1651878681150,
                reactionBy: "554499999999",
                referencedMessage: {
                    messageId: "56",
                    fromMe: true,
                    phone: "5544999999999",
                    participant: null,
                },
            },
        };

        cl(data);

        const resp = await $fetch({
            url: "api/whatsapp/webhook/update",
            par: { ...data },
            fnName: "BUSCA DADOS",
        });
    })();

    return;

    window.history.back();
    return;

    const x = $$("#chart1 .apexcharts-xaxis-label");
    x.forEach(
        (e) =>
            (e.onclick = (e) => {
                cl(e);
                cl(e.target.innerHTML);
            }),
    );
    return;

    let text = document;
    console.log(text);
    // print(text);
    return;
};

const devController = () => {
    const txt = $(".sidebarTools .btnDevController").textContent.trim();
    $setClipboard(txt);
};

//:CRIPTOGRAFIA
const devEncrypt = {
    node: false,

    form: async () => {
        const hasModal = $("body .modal-encrypt") ? true : false;

        //:Fetch
        const resp = await $fetch({
            url: "dev/devEncrypt/get",
            method: "get",
            par: {},
            fnName: "BUSCA DADOS WAU-0005",
        });

        //:Cria modal pela primeira vez
        if (!hasModal) {
            $("body").insertAdjacentHTML("beforeend", resp.template);

            devEncrypt.node = $("body .modal-encrypt");

            $(devEncrypt.node, ".btnRefresh").addEventListener("click", () => devEncrypt.refresh());
        }

        //:Modal visivel
        $(".modal-encrypt").style.display = "flex";
    },

    refresh: async () => {
        const encodeIn = $n(devEncrypt.node, "encodeIn").value;
        const decodeIn = $n(devEncrypt.node, "decodeIn").value;

        //:Fetch
        const resp = await $fetch({
            url: "dev/devEncrypt/refresh",
            par: { encodeIn, decodeIn },
            fnName: "BUSCA DADOS WAU-0006",
        });

        //:Atualiza input
        ["encodeOut", "encodeCheck", "decodeOut", "decodeCheck"].forEach((el) => ($n(devEncrypt.node, el).value = resp[el]));
    },
};

//:BUSCA SESSION E MOSTRA NO FRONT-END
const devSession = async () => {
    //:Fetch
    const resp = await $fetch({
        url: "dev/getSession",
        par: {},
        fnName: "BUSCA SESSION WAU-0007",
    });

    //:Cria modal pela primeira vez
    const hasModal = $("body .modal-session") ? true : false;
    if (!hasModal) $("body").insertAdjacentHTML("beforeend", resp.template);

    //:Valor em textarea
    $(".modal-session textarea").value = JSON.stringify(resp.session, null, 2);

    //:Modal visivel
    $(".modal-session").style.display = "block";
};

const $devGetNemCode = {
    async get() {
        const resp = await $fetch({
            url: "dev/getNemCode",
            fnName: "GET WAU-0001",
        });

        //:Cria modal pela primeira vez
        const hasModal = $("body .modal-lastcode") ? true : false;
        if (!hasModal) $("body").insertAdjacentHTML("beforeend", resp.template);

        const lastCode = +resp.lastCode.value.replace("WAU-", "");
        const newCode = $padWithZeros((lastCode + 1).toString(), 4);

        //:Valor em input
        $n(".modal-lastcode, lastCode").value = `WAU-${lastCode}`;
        $n(".modal-lastcode, newCode").value = `WAU-${newCode}`;

        $modalOpen(".modal-lastcode");
    },

    async copy() {
        const newCode = $n(".modal-lastcode, newCode").value;

        $setClipboard(newCode);

        const resp = await $fetch({
            url: "dev/setNemCode",
            par: { newCode },
            fnName: "SET WAU-0002",
        });
    },
};

const devMaintenance = async () => {
    //:Fetch
    const resp = await $fetch({
        url: "tools/tools/systemMaintenance/run",
        fnName: "MANUTENCAO WAU-0008",
    });
};

const userDebugger = () => {
    const debuggerIsOn = cookie.get("debugger");

    if (!debuggerIsOn) {
        window.location.href = `${baseURL}loginDebugger`;
    } else {
        (async function () {
            const resp = await $fetch({
                url: `loginDebugger/stopDebugger`,
                fnName: "PARA DEBUGGER WAU-0009",
            });

            if (resp.status == 200) location.reload();
        })();
    }
};
