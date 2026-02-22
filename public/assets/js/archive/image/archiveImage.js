export const obj = {
    data: { patient: {}, imageList: [], optLock: null },

    database: {
        get: async function () {
            const patientId = $patientId();
            const header = ls.header;

            //:fetch
            const resp = await $fetch({
                url: `${img.url}/getData`,
                par: { header, patientId },
                fnName: "BUSCA DADOS WAU-0103",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function () {
            if (!$permission(img.permSave)) return;

            const file = $("#loadImage").files;
            const fileName = file[0].name;
            const header = ls.header;

            //:Checa extenção dos arquivos
            if (!/\.(jpeg|jpg|png|pdf)$/i.test(fileName)) {
                return console.log("Extensão do arquivo não suportada.");
            }

            //:Data
            const data = new FormData();
            data.append("optLock", obj.data.optLock);
            data.append("header", header);
            data.append("patientId", $patientId());
            data.append("fotos[]", file[0]);

            //:Fetch
            const resp = await $fetch({
                url: `${img.url}/setByPc`,
                par: data,
                method: "FORMDATA",
                fnName: "SALVA IMAGEM WAU-0117",
            });

            //:Zera input
            $("#loadImage").value = "";

            //:Se erro -> resgata dados
            if (resp.status !== 200) return this.get();

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        delete: async function (imageId) {
            if (!imageId || !$permission([img.permDelMy, img.permDelAll])) return;

            const optLock = obj.data.optLock;
            const header = ls.header;
            const patientId = $patientId();

            const resp = await $fetch({
                url: `${img.url}/delImage`,
                par: { optLock, header, patientId, imageId },
                fnName: "DELETA DOCUMENTO WAU-0113",
            });

            //:Mensagens de erro específicas
            if (resp.status == 468) {
                $toast(
                    "Erro ao deletar o documento|Você não está autorizado a deletar documentos que não sejam de sua autoria.",
                    "danger",
                );
            }

            //:Se erro -> resgata dados
            if (resp.status !== 200) return this.get();

            $toast("Alterações salvas com sucesso!");
            this.set(resp);
        },

        resset() {
            // obj.data.patient = {};
            obj.data.imageList = [];

            this.dom();
        },

        set(resp) {
            if (resp.status != 200) return this.resset();

            $patientId(resp.patient.id);

            ls.patientName = resp.patient.name;

            obj.data.patient = resp.patient;
            obj.data.imageList = resp.imageList;
            obj.data.optLock = resp.patient.optLock;

            this.dom();
        },

        dom() {
            $m.menuTop.set(obj.data.patient);

            obj.left.renderList();
        },
    },

    left: {
        renderList() {
            const clinicFolder = $padWithZeros(obj.data.patient.id_clinic);

            const html = obj.data.imageList.map(({ id, name, extension, profName, date }) => {
                const dtBr = $date.format(date, "Br/");

                const imgBox =
                    extension == "pdf"
                        ? `<iframe src="${baseURL}data/clinics/${clinicFolder}/${img.folder}/${name}.${extension}" width="100%" height="100%"></iframe>`
                        : `<img src="${baseURL}data/clinics/${clinicFolder}/${img.folder}/${name}_t.${extension}">`;

                return `
                    <div class="image-box border p-2">
                        <button class="btn icon-box delete" data-document_id="${id}">
                            <i class="fa-light fa-trash-can"></i>
                        </button>
                        <div class="span-box">
                            <span>${profName}</span>
                            <span> - ${dtBr}</span>
                        </div>
                        ${imgBox}
                    </div>`;
            });

            const listBox = $("#image .left .list");
            listBox.innerHTML = html.join("");
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    //:Deleta imagem
                    if (target.closest(".btn.delete")) return delImage();
                    //:Abre imagem no modal
                    if (target.closest(".image-box")) return openCarousel();
                    return;

                default:
                    return;
            }

            function delImage() {
                const imageId = target.closest(".btn.delete").dataset.document_id;
                if (!imageId) return;

                obj.database.delete(imageId);
            }

            function openCarousel() {
                const imgBox = $("#modalCarousel .modal-body .image");
                const modalDialog = $("#modalCarousel .modal-dialog");

                const srcIframe = target.querySelector("iframe")?.src;
                if (srcIframe) {
                    modalDialog.classList.add("pdf");

                    const html = `<iframe src="${srcIframe}" width="100%" height="100%"></iframe>`;
                    imgBox.innerHTML = html;

                    return $modalOpen("#modalCarousel");
                }

                const srcImg = target.src;
                if (srcImg) {
                    modalDialog.classList.remove("pdf");

                    const src = srcImg.replace("_t.", ".");
                    const html = `<img src="${src}">`;
                    imgBox.innerHTML = html;

                    return $modalOpen("#modalCarousel");
                }
            }
        },
    },

    modalQrCode: async function () {
        //:Limpa QRCode antigo
        $("#modalQrCode .image").innerHTML = "";

        //:Importa arquivo que renderiza QRCode apenas uma vez
        $m.qrCode ||= (await import(`${baseURL}plugins/js/qrCodeWau.js`)).default;

        //:Busca key p/ gerar QRCode
        const header = ls.header;
        const patientId = $patientId();
        const resp = await $fetch({
            url: `${img.url}/getQrKey`,
            par: { header, patientId },
            fnName: "BUSCA KEY WAU-0120",
        });
        const qrKey = resp.qrKey;

        //:Prepara QRCode
        const typeNumber = 10;
        const errorCorrectionLevel = "Q";
        const qr = $m.qrCode(typeNumber, errorCorrectionLevel);

        //:Cria QRCode
        qr.addData(`https://wausaude.com.br/docUpdate/${qrKey}`);
        qr.make();

        //:Imprime QRCode
        const imageBox = $("#modalQrCode .image");
        imageBox.dataset.qrKey = qrKey;
        imageBox.innerHTML = qr.createImgTag();

        $modalOpen("#modalQrCode");
    },

    modalClose() {
        $modalClose("#modalQrCode");

        obj.database.get();
    },

    headerBar(event) {
        const target = event.target;

        //:Botão de seleção de novo método
        const method = target.closest(".btn")?.dataset.method;
        if (method) return setImageType(method);

        //:Modal QRCode
        if (target.closest(".modalQrCode")) return obj.modalQrCode();

        return;
        //* * * * * * * * * * * * * * * * * * * *

        function setImageType(method) {
            ls.set("header", method);

            obj.headerBarDom();
            obj.imgData();
            obj.database.get();
        }
    },

    //:Valida e retorna módulo do header ativo ou o primeiro com permissão
    headerBarValidate(find) {
        if (!find) return getFirstModule();

        for (let index = 0; index < g.headerList.length; index++) {
            const element = g.headerList[index];

            if (element.name == find) {
                if (!$permission(element.perm, 0)) {
                    return getFirstModule();
                }

                return { name: element.name, perm: element.perm };
            }
        }

        return false;
        //* * * * * * * * * * * * * * * * * * * *

        //:Retorna o primeiro módulo com permissão
        function getFirstModule() {
            for (let index = 0; index < g.headerList.length; index++) {
                const element = g.headerList[index];

                if ($permission(element.perm, 0)) {
                    return { name: element.name, perm: element.perm };
                }
            }
        }
    },

    headerBarDom() {
        const module = ls.module;
        const header = ls.header;

        //:Muda título do header
        const titleNode = $("#headerBar .title span");
        let titleTxt = "";
        switch (header) {
            case "document":
                titleTxt = "Documentos Pessoais";
                break;

            case "exam":
                titleTxt = "Imagens de Exames";
                break;

            case "photo":
                titleTxt = "Fotos Corporais";
                break;
        }
        titleNode.innerHTML = titleTxt;

        //:Desativa abas do header com exceção da aba atual
        g.headerList.forEach((val) => {
            console.log("val:", val.name);
            console.log("header:", header);

            const event = val.name == header ? "add" : "remove";
            $(`#${module} #headerBar .tab.${val.name}`).classList[event]("active");
        });
    },

    imgData() {
        switch (ls.header) {
            case "document":
                img.url = "archiveImage";
                img.folder = "patientDocument";
                img.permSave = "160P";
                img.permDelMy = "13P";
                img.permDelAll = "57P";
                return;

            case "exam":
                img.url = "archiveImage";
                img.folder = "patientExam";
                img.permSave = "75P";
                img.permDelMy = "70P";
                img.permDelAll = "101P";
                return;

            case "photo":
                img.url = "archiveImage";
                img.folder = "patientPhoto";
                img.permSave = "110P";
                img.permDelMy = "111P";
                img.permDelAll = "109P";
                return;

            default:
                return;
        }
    },

    events(event) {
        const target = event.target;

        //:Click
        if (event.type == "click") {
            if (target.closest(".left")) return obj.left.events(event);
            if (target.closest(".right")) return;
        }
    },

    init() {
        //:Módulos desse sistema
        g.headerList = [
            { name: "document", perm: "159P" },
            { name: "exam", perm: "102P" },
            { name: "photo", perm: "107P" },
        ];

        //:Desativa abas do header sem permissão
        for (let index = 0; index < g.headerList.length; index++) {
            const element = g.headerList[index];

            const action = $permission(element.perm, 0) ? false : true;
            const node = $(`#image #headerBar .tab.${element.name}`);
            node.disabled = action;
        }

        //:Local storage
        const header = obj.headerBarValidate(ls.header).name;
        ls.set("header", header);

        obj.headerBarDom();
        obj.imgData();
    },
};
