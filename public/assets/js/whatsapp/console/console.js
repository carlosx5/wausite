const textareaNode = $("#txtSend");

document.addEventListener("DOMContentLoaded", () => {
    $n("#toolsBot txtSend").focus();

    database.get();
    sidebar.dom();
    toolsBot.dom.textarea();
    looping.run();

    //:EXECUTA INITs
    (function () {
        const initList = ["sidebar"];

        initList.forEach((el) => eval(`${el}.init`)());
    })();

    //:EVENTOS
    // $('body').addEventListener('click', event => events.click(event));

    // (function () {
    //     const str = 'Aline Fernando, bom dia. Aquela cola prineo que *temos* no estoque está com *vc?*';
    //     let resp = false;

    //     resp = proximoArray(str)
    //     cl(resp);

    //     function proximoArray(str) {
    //         //VERIFICA SE TEM MENOS DE DOIS "*"
    //         if ([...str].filter(letra => letra === '*').length < 2) return false;

    //         //ACHA O PRIMEIRO "*"
    //         const primeiro = str.indexOf("*");

    //         //ACHA O SEGUNDO "*"
    //         const aux = str.slice(primeiro + 1, str.length);
    //         const segundo = aux.indexOf("*");

    //         //RESULTADO
    //         return str.slice(primeiro, primeiro + segundo + 2);
    //     };
    // }());
});

//.BANCO DE DADOS GLOBAL
const database = {
    /** ///BUSCA DATA */
    get(par) {
        (async function () {
            const contactPhone = ls.contactPhone;
            const getChoice = $arrayForce(par ?? ["contacts", "messages"]);

            //:FETCH
            const resp = await $fetch({
                url: "whatsapp/console/console/getData",
                par: { getChoice, contactPhone },
                overlay: false,
                fnName: "BUSCA LISTA #644",
            });

            if (resp.msg) alert(resp.msg);

            //:SE BUSCOU CONTATOS
            if (getChoice.includes("contacts")) contact.database.set(resp.contactList);

            //:SE BUSCOU MENSAGENS
            if (getChoice.includes("messages")) message.database.set(resp.messageList);

            //:IMAGEM DO CONTATO
            toolsTop.database.set(resp.contactPicture);

            //:CONFIG
            sidebar.content_0.btnIaStatus = resp.config.btnIaStatus;
            sidebar.content_0.dom();
        })();
    },
};

//-BODY BARRA LATERAL
const sidebar = {
    /** ///DOM */
    dom() {
        $classSmart(".content_1 .btnAutoRefresh", ls.autoRefresh, "active");
    },

    /** //.CONTEÚDO 0 */
    content_0: {
        btnIaStatus: false,

        /** ///ATIVA E DESATIVA RESPOSTA DE IA */
        btnIa() {
            if (!$permission(168, 0)) return;

            (async function () {
                const resp = await $fetch({
                    url: "whatsapp/console/console/setBtnIa",
                    par: { btnIaStatus: sidebar.content_0.btnIaStatus },
                    fnName: "SALVA CONTATO #659",
                });

                sidebar.content_0.btnIaStatus = resp.config.btnIaStatus;
                sidebar.content_0.dom();
            })();
        },

        btnSendTest() {
            const phone = "5511989497692";
            const senderName = "Carlos";

            const message = {
                connectedPhone: "5511952070276",
                instanceId: "3B82E7E51F51E0AEF903D210EF4E88BB",
                messageId: "XTESTE" + new Date().getTime(), //*TESTE
                phone: phone, //*TESTE
                fromMe: false,
                status: "RECEIVED",
                chatName: senderName, //*TESTE
                senderName: senderName, //*TESTE
                type: "ReceivedCallback",
                text: {
                    // "message": `Qual é o preço da prótese de mama?`
                    // "message": `qual é o endereço de vcs?`
                    message: `qual é preço da mastopexia com prótese?`,
                    // "message": `qual é o preço da mastopexia?`
                    // "message": `qual é o valor da lipoaspiração hd?`
                },
            };

            (async function () {
                await $fetch({
                    url: `api/whatsapp/webhook/upNewMessage`,
                    par: { ...message },
                    fnName: "DEV",
                });
            })();
        },

        btnSendLinkIa() {
            (async function () {
                const phone = $(".content_0 .phone").value;

                //-FETCH
                const resp = await $fetch({
                    url: "whatsapp/console/console/sendLinkIa",
                    par: { phone },
                    overlay: false,
                    fnName: "BUSCA LISTA #642",
                });
            })();
        },

        /** ///DOM */
        dom() {
            $(".sidebarTools .btnIa").classList[sidebar.content_0.btnIaStatus == 1 ? "add" : "remove"]("btn_on");
        },

        /** ///EVENTOS */
        events(event) {
            if (!$permission(9, 0)) return;

            const target = event.target;

            if (target.closest(".btnIa")) return sidebar.content_0.btnIa();
            // if (target.closest('.btnSendLinkIa')) return sidebar.content_0.btnSendLinkIa();
            // if (target.closest('.btnSendTestAsk')) return sidebar.content_0.btnSendTest();
        },
    },

    /** ///CONTEÚDO 1 */
    content_1: {
        //-EVENTOS
        events(event) {
            if (!$permission(9, 0)) return;

            const target = event.target;

            if (target.dataset.promo) {
                const promo = target.dataset.promo;
                const phone = "5511989497692";
                const senderName = "Sender Teste";

                const data = {
                    isStatusReply: false,
                    senderLid: "81896604192873@lid",
                    connectedPhone: "5511952070276",
                    waitingMessage: false,
                    isEdit: false,
                    isGroup: false,
                    isNewsletter: false,
                    instanceId: "3B82E7E51F51E0AEF903D210EF4E88BB",
                    messageId: "TESTE" + new Date().getTime(), //*TESTE
                    phone: phone, //*TESTE
                    fromMe: false,
                    momment: 1723719573018,
                    status: "RECEIVED",
                    chatName: senderName, //*TESTE
                    senderPhoto: null,
                    senderName: senderName, //*TESTE
                    photo: null,
                    broadcast: false,
                    participantLid: null,
                    messageExpirationSeconds: 0,
                    forwarded: false,
                    type: "ReceivedCallback",
                    fromApi: false,
                    text: {
                        // "message": "Bom dia, gostaria de mais informa\u00e7\u00f5es."
                        // "message": "Qual é o endereço?"
                        message: "Olá! Tenho interesse e queria mais informações, por favor.",
                    },
                };

                (async function () {
                    const resp = await $fetch({
                        url: `api/whatsapp/webhook/upNewMessage`,
                        par: { ...data },
                        fnName: "DEV",
                    });

                    console.log(resp);
                })();
            }
        },

        //-TESTE DE ENVIO DE MENSAGEM
        teste(target) {
            const phone = target.dataset.phone;
            const type = target.dataset.type;
            const link = target.dataset.link ?? false;
            ls.set("devConta", !ls.devConta ? 1 : +ls.devConta + 1);

            const senderName = "Teste";

            const data = {
                message: {
                    isStatusReply: false,
                    chatLid: "228625488031996@lid",
                    connectedPhone: "5511952070276",
                    waitingMessage: false,
                    isEdit: false,
                    isGroup: false,
                    isNewsletter: false,
                    instanceId: "3B82E7E51F51E0AEF903D210EF4E88BB",
                    messageId: "XTESTE" + new Date().getTime(), //*TESTE
                    phone: phone, //*TESTE
                    fromMe: false,
                    momment: 1717970946539,
                    status: "RECEIVED",
                    chatName: senderName, //*TESTE
                    senderPhoto: null,
                    senderName: senderName, //*TESTE
                    photo: "https://pps.whatsapp.net/v/t61.24694-24/418639166_958576169049019_6331121491863454491_n.jpg?ccb=11-4&oh=01_Q5AaIOSEkY3UQFeIRQaxEOIfD9RwrF0JRkK7kKPG_oJ5XgPZ&oe=66731FEA&_nc_sid=e6ed6c&_nc_cat=111",
                    broadcast: false,
                    participantLid: null,
                    externalAdReply: {
                        title: "# Converse conosco",
                        mediaType: 1,
                        thumbnailUrl:
                            "https://scontent.xx.fbcdn.net/v/t45.1600-4/439726507_120208403237920276_5463829524999920807_n.jpg?stp=c3.41.300.300a_dst-jpg_p306x306&_nc_cat=110&ccb=1-7&_nc_sid=567a6d&_nc_ohc=JSsxGr0czc4Q7kNvgFUnfvL&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=00_AYCk1UZaW40O29_zG7hh86EtLiIjY9O2gmA2l99Cqcg_Lw&oe=666C0624",
                        sourceType: "ad",
                        sourceId: "120208403318480276",
                        sourceUrl: "https://www.instagram.com/p/C8AD4CWtcqu/",
                        containsAutoReply: false,
                        renderLargerThumbnail: true,
                        showAdAttribution: true,
                        ctwaClid:
                            "ARD8fJSl2OYBwCzpVvmA5SN48n1n49wf6d6y1ORGX8HcBVqvPR7ekbUCLNvohKcjBv28-av15jEKf8SaNs1sXakMHC7waSDqafFpZAIB9xLIRJyn",
                    },
                    messageExpirationSeconds: 0,
                    forwarded: false,
                    type: "ReceivedCallback",
                    fromApi: false,
                    text: {
                        message: `Mensagem local ${ls.devConta}`, //*TESTE
                    },
                },

                external: {
                    isStatusReply: false,
                    senderLid: "81896604192873@lid",
                    connectedPhone: "554499999999",
                    waitingMessage: false,
                    isGroup: false,
                    isEdit: false,
                    isNewsletter: false,
                    messageId: "TESTE" + new Date().getTime(), //*TESTE
                    messageId: "A20DA9C0183A2D35A260F53F5D2B9244",
                    phone: phone, //*TESTE
                    fromMe: false,
                    momment: "NumberLong(1657209752000)",
                    status: "RECEIVED",
                    chatName: senderName, //*TESTE
                    senderPhoto: null,
                    senderName: senderName, //*TESTE
                    photo: null,
                    broadcast: false,
                    externalAdReply: {
                        title: "Titulo #",
                        body: "texto do anuncio",
                        mediaType: "NumberInt(1)",
                        thumbnailUrl: "https://",
                        sourceType: "ad",
                        sourceId: "23722824350495506",
                        sourceUrl: "https://",
                        containsAutoReply: false,
                        renderLargerThumbnail: true,
                        showAdAttribution: true,
                    },
                    messageExpirationSeconds: "NumberInt(0)",
                    forwarded: false,
                    type: "ReceivedCallback",
                    text: {
                        message: "mensagem recebida",
                        description: "texto do anuncio",
                        title: "titulo",
                        url: "https://",
                        thumbnailUrl: "https://",
                    },
                },

                sendImage: {
                    isStatusReply: false,
                    chatLid: "161782995931154@lid",
                    connectedPhone: "5511952070276",
                    waitingMessage: false,
                    isEdit: false,
                    isGroup: false,
                    isNewsletter: false,
                    instanceId: "3B82E7E51F51E0AEF903D210EF4E88BB",
                    messageId: "0FD539714431ED3CE0",
                    phone: "5511989497692",
                    fromMe: false,
                    momment: 1718133514785,
                    status: "RECEIVED",
                    chatName: "Carlos",
                    senderPhoto: null,
                    senderName: "Carlos",
                    photo: "https://pps.whatsapp.net/v/t61.24694-24/261601006_3135526473436528_67079098440197902_n.jpg?ccb=11-4&oh=01_Q5AaIOe8zjz4XrbTXPcg4MJ4Rc-78mry_nV9rTtWFbom0S64&oe=6675AF9F&_nc_sid=e6ed6c&_nc_cat=109",
                    broadcast: false,
                    participantLid: null,
                    messageExpirationSeconds: 0,
                    forwarded: false,
                    type: "ReceivedCallback",
                    fromApi: false,
                    image: {
                        imageUrl: "https://tempstorage.download/instances/3B82E7E51F51E0AEF903D210EF4E88BB/0FD539714431ED3CE0.jpeg",
                        thumbnailUrl: "https://tempstorage.download/instances/3B82E7E51F51E0AEF903D210EF4E88BB/0FD539714431ED3CE0.jpeg",
                        caption: "",
                        mimeType: "image/jpeg",
                        viewOnce: false,
                        width: 1024,
                        height: 1280,
                    },
                },
            };

            cl(link);
            const par = type ? data[type] : { phone: "5511989497692" };
            const url = link || "upNewMessage";
            cl(url);

            (async function () {
                await $fetch({
                    url: `api/whatsapp/webhook/${url}`,
                    par: { ...par },
                    fnName: "DEV",
                });
            })();
        },
    },

    /** ///CONTEÚDO 2 */
    content_2: {
        //-EVENTOS
        events(event) {
            const target = event.target;

            if (target.closest(".btnAutoRefresh")) {
                ls.set("autoRefresh", ls.autoRefresh ? false : true);

                sidebar.dom();

                return;
            }
        },
    },

    /** ///EVENTOS */
    events(event) {
        const target = event.target;

        //:VAI P/ EVENTO DO RESPECTIVO CONTEUDO
        if (target.closest(".content_0")) return sidebar.content_0.events(event);
        if (target.closest(".content_1")) return sidebar.content_1.events(event);
        if (target.closest(".content_2")) return sidebar.content_2.events(event);
    },

    /** ///INICIO */
    init() {
        //:CLICK EM SIDEBAR
        $(".sidebarTools").addEventListener("click", (event) => sidebar.events(event));
    },
};

//.BODY CONTATO
const contact = {
    data: {},

    //*DATABASE
    database: {
        set(data) {
            cl("CONTATO");
            //-ATUALIZA DATA
            contact.data = data || {};

            //-ATUALIZA LS COM O CONTATO EM MEMÓRIA
            let index = contact.data.findIndex((el) => el.id == ls.contactId);
            index = index < 0 ? 0 : index;

            ls.set("contactId", contact.data[index].id);
            ls.set("contactName", contact.data[index].name);
            ls.set("contactPhone", contact.data[index].phone);
            ls.set("contactLastOrd", contact.data[index].ord);

            //-ATUALIZA LISTA
            contact.dom.list();
        },
    },

    //*DOM
    dom: {
        list() {
            let index = 0;

            const tpt = contact.data
                .map(({ id, ord, name, phone, status }) => {
                    name = $mask.string(name, 3);
                    name ||= phone;

                    return `
                    <div class="btns" data-index="${index++}" data-id="${id}" data-ord="${ord}" data-name="${name}" data-phone="${phone}">
                        <button class="btn btnName">
                            <span class="${id == ls.contactId ? " active" : ""}">${name}</span>
                        </button>
                        <button class="btn btnIcon">
                            <i class="far fa-comments${status < 2 ? "" : " active"}"></i>
                        </button>
                    </div>`;
                })
                .join("");

            $("#contacts").innerHTML = tpt;
        },
    },

    //*EVENTOS
    events: {
        click(event) {
            const target = event.target;
            const father = target.closest(".btns");

            if (target.closest(".btnName")) {
                //*BOTÃO DO NOME
                //.ATUALIZA LOCALHOST ABAIXO
            } else if (target.closest(".btnIcon")) {
                //*BOTÃO DO ICONE
                if (!$permission(162, 0)) return;

                //-O ICONE DO NOME CLICADO É O MESMO DAS MENSAGENS
                if (father.dataset.id == ls.contactId) {
                    const status = contact.data[father.dataset.index].status == 2 ? 1 : 2;

                    (async function () {
                        const resp = await $fetch({
                            url: "whatsapp/console/console/updateStatus",
                            par: {
                                contactId: ls.contactId,
                                status,
                            },
                            fnName: "ALTERA STATUS #641",
                        });

                        //-ALTERAÇÃO DE STATUS OK
                        if (resp.status == 200) {
                            contact.data[father.dataset.index].status = status;

                            //-ATUALIZA LOCALHOST
                            ls.set("contactId", father.dataset.id);
                            ls.set("contactName", father.dataset.name);
                            ls.set("contactPhone", father.dataset.phone);

                            //-ATUALIZA DOM DE LISTA DE CONTATOS
                            return contact.dom.list();
                        }
                    })();
                }
            } else {
                //*NÃO LOCALIZOU NADA E RETORNA
                return;
            }

            //-ATUALIZA LOCALHOST
            ls.set("contactId", father.dataset.id);
            ls.set("contactName", father.dataset.name);
            ls.set("contactPhone", father.dataset.phone);

            //-BUSCA E ATUALIZA MENSAGENS
            database.get();
        },
    },

    //*INICIO
    init: (function () {
        $("#contacts").addEventListener("click", (event) => contact.events.click(event));
    })(),
};

//.BODY MENSAGEM
const message = {
    data: {},

    database: {
        set(data) {
            cl("MENSAGEM");
            message.data = data.slice(0).reverse() || {};
            message.dom.all();
        },
    },

    dom: {
        list() {
            const tpt = message.data
                .map(
                    ({
                        reaction,
                        fromMe,
                        text,
                        text_title,
                        text_description,
                        text_url,
                        text_thumbnailUrl,
                        image_url,
                        external_url,
                        datetime,
                    }) => {
                        const direction = fromMe == 1 ? " end" : " start";
                        const time = $date.format(datetime, "br-tm");
                        let top = "";
                        let textBody = "";

                        if (text) {
                            textBody = `
                        <div class="msg">
                            <textarea>${text}</textarea>
                            <div class="time">${time} <spam>${$unicodeToChar(reaction)}</spam></div>
                        </div>`;
                        }

                        if (text_title) {
                            top = `
                        <div class="topLink">
                            <div class="img">
                                <img src="${text_thumbnailUrl}">
                            </div>
                            <div class="text">
                                <p>${text_title}</p>
                                <p>${text_description}</p>
                                <p>${text_url}</p>
                            </div>
                        </div>`;
                        }

                        if (image_url) {
                            top = `
                        <div class="topImage">
                            <div class="img">
                                <img src="${image_url}">
                            </div>
                        </div>`;
                        }

                        if (external_url) {
                            top = `
                        <div class="topExternal">
                            <div class="img">
                                <img src="${external_url}">
                            </div>
                        </div>`;
                        }

                        if (external_url) {
                            top = `
                        <div class="topExternal">
                            <div class="img">
                                <img src="${external_url}">
                            </div>
                        </div>`;
                        }
                        return `
                    <div class="f_message${direction}">
                        <div class="content">
                            ${top}
                            ${textBody}
                        </div>
                    </div>
                `;
                    }
                )
                .join("");

            $("#table .list").innerHTML = tpt;

            //-FORMATA STYLE DE TODOS OS TEXTAREA
            $$("#table textarea").forEach((el) => {
                el.style.cssText = "height:auto; padding:0";
                el.style.cssText = "height:" + (el.scrollHeight + 9) + "px";
            });

            //-VAI PARA O FIM DO SCROLL
            const objScrDiv = document.querySelector("#table");
            objScrDiv.scrollTop = objScrDiv.scrollHeight;
        },

        all() {
            this.list();
        },
    },
};

//.BODY FERRAMENTA DE TOPO
const toolsTop = {
    picture: false,

    //*DATABASE
    database: {
        set(data) {
            toolsTop.picture = data.includes("http") ? data : false;

            toolsTop.dom();
        },
    },

    //*DOM
    dom() {
        $mask.input($n("#messages name"), ls.contactName);
        $mask.input($n("#messages phone"), ls.contactPhone);

        $("#toolsTop img").src = toolsTop.picture;
    },

    //*EVENTOS
    events(event) {
        const target = event.target;

        if (target.closest(".img")) return modalContact.dom.showModal(event);
    },

    //*INICIO
    init: (function () {
        $("#toolsTop").addEventListener("click", (event) => toolsTop.events(event));
    })(),
};

//.BODY FERRAMENTA DE BOT
const toolsBot = {
    //*DATABASE
    database: {
        //-ENVIA MENSAGEM
        send() {
            //-DATA
            const phone = ls.contactPhone;
            const msg = textareaNode.value;

            //-RETORNA SE NÃO TIVER MENSAGEM
            if (!msg) return cl("MENSAGEM VAZIA");

            //-ATUALIZA TEXTAREA DE ENVIAR MENSAGEM
            $mask.input(textareaNode, "");
            toolsBot.dom.textarea();

            //-ADICIONA MENSAGEM NA TELA
            message.data.push({
                datetime: $date.now("br-tm"),
                fromMe: "1",
                text: msg,
            });
            //
            message.dom.list();

            (async function () {
                //-FETCH
                await $fetch({
                    url: "whatsapp/console/console/sendMessage",
                    par: {
                        phone,
                        message: msg,
                    },
                    overlay: false,
                    fnName: "ENVIA MENSAGEM #643",
                });
            })();
        },
    },

    //*DOM
    dom: {
        //-FORMATA ALTURA DE TEXTAREA
        textarea() {
            if (!textareaNode.value) return (textareaNode.style.cssText = "height:30px");

            textareaNode.style.cssText = "height:" + (textareaNode.scrollHeight + 0) + "px";
        },
    },

    //*EVENTOS
    events(event) {
        if (!$permission(162, 0)) return;
        const target = event.target;

        //-EVENTOS PARA TEXTAREA DE MENSAGEM
        if (target.closest("#txtSend")) {
            //-BLOQUEIA FUNÇÃO DE ENTER
            if ($existIn("keyup,keydown", event.type) && event.key == "Enter") event.preventDefault();

            //-ENVIA MENSAGEM AO CLICAR EM ENTER
            if (!event.ctrlKey && event.key == "Enter" && event.type == "keyup") return toolsBot.database.send();

            //-EXECUTA FUNÇÃO DE ENTER QDO CLICAR EM CONTROL+ENTER
            if (event.ctrlKey && event.key == "Enter" && event.type == "keyup") {
                cl("CONTROL+ENTER");
                textareaNode.value += "\n";
                return toolsBot.dom.textarea();
            }

            //-KEYUP
            if (event.type == "keyup") return toolsBot.dom.textarea();
        }

        //-EVENTO CLICK
        if (event.type == "click") {
            if (target.closest(".btnSend")) return toolsBot.database.send();
        }
    },

    //*INICIO
    init: (function () {
        $event("#toolsBot", false, "keyup,keydown,click", (event) => toolsBot.events(event), false);
    })(),
};

//:MODAL CONTATOS
const modalContact = {
    dom: {
        showModal(event) {
            $showHideModal(".modalContact");

            $mask.input($n(".modalContact name"), ls.contactName, "change");

            const modalNode = $(".modalContact");
            modalNode.style.marginTop = `${event.clientY + 30}px`;
            modalNode.style.marginLeft = `${event.clientX + 30}px`;
        },
    },

    database: {
        save() {
            const contactId = ls.contactId;

            const data = {
                name: $mask.string($n(".modalContact name").value, 3),
            };

            (async function () {
                await $fetch({
                    url: "whatsapp/console/console/saveContact",
                    par: { contactId, ...data },
                    fnName: "SALVA CONTATO #645",
                });

                //-FECHA MODAL
                $showHideModal(".modalContact");

                //-ATUALIZA LISTA DE CONTATO
                database.get("contacts");
            })();
        },
    },

    //*EVENTOS
    events(event) {
        const target = event.target;

        if (event.type == "click") {
            if (target.closest(".btnSave")) return modalContact.database.save();
            if (target.closest(".btnCancel")) return $showHideModal(".modalContact");
        }
    },

    //*INICIO
    init: (function () {
        $event(".modalContact", false, "keyup,click", (event) => modalContact.events(event), false);
    })(),
};

//:LOOPING DE ATUALIZAÇÃO DE TELA
const looping = {
    count: 0,
    timeToFetch: 2,

    run() {
        setTimeout(() => getRefresh(), 500);
        looping.count++;

        async function getRefresh() {
            if (looping.count / 2 < looping.timeToFetch) return looping.run();
            looping.count = 0;
            looping.timeToFetch = 2;

            const contactLastOrd = ls.contactLastOrd;

            const resp = await $fetch({
                url: "whatsapp/console/console/checkIfThereIsNewMessage",
                par: { contactLastOrd },
                overlay: false,
                consoleOn: false,
                fnName: "BUSCA DADOS #645",
            });

            cl("LS  -CL= " + ls.contactLastOrd);
            // cl('RESP-CL= ' + resp.contactLastOrd);
            // cl('-- --');
            // cl('LS  -LO= ' + ls.lastOrd);
            // cl('RESP-LO= ' + resp.lastOrd);
            // cl('');

            if (ls.autoRefresh) {
                //*SE FOR AUTO-REFRESH
                if (resp.lastOrd != ls.lastOrd) database.get(); //-ATUALIZA TUDO
            } else {
                //*SE NÃO FOR AUTO-REFRESH
                if (resp.contactLastOrd != ls.contactLastOrd) {
                    //.MENSAGEM ENVIADA P/ CONTATO ATIVO
                    database.get(); //-ATUALIZA TUDO
                } else if (resp.lastOrd != ls.lastOrd) {
                    //.MENSAGEM ENVIADA P/ OUTROS CONTATOS
                    database.get("contacts"); //-ATUALIZA CONTATOS
                }
            }

            ls.set("lastOrd", resp.lastOrd);

            looping.run();
        }
    },
};
