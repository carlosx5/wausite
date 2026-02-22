export const obj = {
    data: { clinic: {}, urlImage: "", optLock: null },

    database: {
        get: async function () {
            const clinicId = ls.clinicId;

            const resp = await $fetch({
                url: "clinicImage/getData",
                par: { clinicId },
                fnName: "BUSCA IMAGEM WAU-0172",
            });

            //:Seta dados
            this.set(resp);
        },

        deleteLogo: async function () {
            //:Fetch
            const resp = await $fetch({
                url: "clinic/image/clinicImage/deleteLogo",
                par: { clinicId: ls.clinicId },
                fnName: "DELETA LOGO #693",
            });

            //:Seta dados
            this.set(resp);
        },

        resset() {
            cl("DATABASE RESSET");
        },

        set(resp) {
            //:Erro -> limpa dados
            if (resp.status !== 200) return this.resset();

            //:Seta dados
            obj.data.clinic = resp.clinic;
            obj.data.urlImage = `${baseURL}${resp.image.url}`;
            obj.data.optLock = resp.clinic.optLock;

            ls.set("clinicId", resp.clinic.id);
            ls.set("clinicName", resp.clinic.name);

            //:Atualiza toda tela
            this.dom();
        },

        dom() {
            $("#menuTop .left .name").value = obj.data.clinic.name_social;

            obj.dom.form();
        },
    },

    dom: {
        form() {
            const logo = $("#image .logo");

            fetch(obj.data.urlImage)
                .then((response) => {
                    $(logo, "i").style.display = response.ok ? "none" : "block";
                    $(logo, "img").style.display = response.ok ? "block" : "none";
                    $(logo, "img").src = response.ok ? obj.data.urlImage : "";
                })
                .catch((error) => {
                    console.log("Erro ao verificar o arquivo:", error);
                });
        },

        all() {
            obj.dom.form();
        },
    },

    btnNewLogo(target) {
        //:Abre Cropper
        $("#image .content").style.display = "none";
        $("#image .cropper").style.display = "block";

        const file = target.files[0];
        const image = $("#cropperImage");
        if (file) {
            const url = URL.createObjectURL(file);
            image.src = url;
            image.style.display = "block";

            //:Remove "factory" atual
            if (obj.cropper.factory) {
                obj.cropper.factory.destroy();
            }

            //:Cria "factory" com imagem atual
            image.onload = () => {
                obj.cropper.factory = new Cropper(image, {
                    aspectRatio: NaN,
                    viewMode: 2,
                });
            };
        }
    },

    cropper: {
        par_aspectRatio: NaN,
        par_viewMode: 2,
        factory: new Cropper($("#cropperImage"), {
            aspectRatio: NaN,
            viewMode: 2,
        }),

        btnSaveNewImage: async function () {
            try {
                const optLock = obj.data.optLock;
                const clinicId = ls.clinicId;
                const canvas = obj.cropper.factory.getCroppedCanvas();
                if (!canvas) {
                    throw new Error("Não foi possível obter o canvas da imagem.");
                }

                const croppedBase64 = canvas.toDataURL("image/png");

                //:Fetch
                const resp = await $fetch({
                    url: g.callback,
                    par: {
                        optLock,
                        clinicId,
                        image: croppedBase64,
                    },
                    fnName: "SALVA LOGO WAU-0173",
                });

                //:Sai do Cropper
                $("#image .cropper").style.display = "none";
                $("#image .content").style.display = "flex";

                obj.database.set(resp);
            } catch (error) {
                console.error("Erro ao enviar a imagem:", error);
            }
        },

        events(event) {
            const target = event.target;

            //:Click
            if (event.type == "click") {
                //:Salva nova imagem
                if (target.closest("#sendImage")) return this.btnSaveNewImage();
            }
        },
    },

    headerBar(event) {
        if (event.type !== "click") return;

        //:Botão buscar clínica
        if (event.target.closest(".search")) return findClinic();
    },

    //:EVENTOS
    events(event) {
        const target = event.target;

        //:Change
        if (event.type == "change") {
            //:Imagem alterada
            if (target.closest("#cropperInputImage")) return this.btnNewLogo(target);
            return;
        }

        //:Click
        if (event.type == "click") {
            //:Botões na barra de cabeçalho
            if (target.closest(".headerBar")) return this.headerBar(target);

            //:Deleta logo
            if (target.closest(".content .btn.delete")) return obj.database.deleteLogo();
            //:Cropper
            if (target.closest(".cropper")) return this.cropper.events(event);
        }
    },

    init() {},
};
