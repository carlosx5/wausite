document.addEventListener("DOMContentLoaded", () => {
    if (!$(".sidebar")) return;

    $event("#sidebar", "click,mouseenter,mouseleave", (event) => $sidebar.events(event));

    if (window.innerWidth <= 1500) $sidebar.toggleSidebar();

    $sidebar.adjustsMainScreen();
});

/**
 *
 * @param {string} father DIV de baixo
 * @param {string} modal DIV modal a ser centralizada
 */
const $centerModule = (modal, father = "main") => {
    const width_1 = document.querySelector(father).clientWidth ?? 0;
    const width_2 = modal.clientWidth ?? 0;
    const width_3 = (width_1 - width_2) / 2;
    const margin = "1% " + width_3 + "px 0 " + (width_3 + 250) + "px";

    modal.style.margin = margin;
};

const $sidebar = {
    clinicLogChange: {
        findClinic() {
            if (!$permission("124P", 0)) return;

            $findModule.init({
                urn: "clinic/findClinic",
                title: "Busca Clínica",
                tptTexts: { col2: "Clínica" },
                columnsQuantity: 2,
                width: "450px",
                callback: async function (par) {
                    const data = {
                        clinicId: par.id,
                        clinicName: par.col2,
                    };

                    const resp = await $fetch({
                        url: `clinic/changeLogClinic`,
                        par: data,
                        fnName: "SALVA USUÁRIO WAU-0099",
                    });

                    if (resp.status !== 200) return;

                    localStorage.clear();
                    location.reload();
                },
            });
        },
    },

    goHome() {
        window.location.href = `${baseURL}`;
    },

    goHelp: {
        open: async function () {
            const videoId = $("#sidebar .btn.help").dataset.id;
            if (!videoId) return;
            if (videoId === "wau") return; //:Usado apenas para ativar o ícone de ajuda

            const hasModal = $(".modal-help");
            if (hasModal) {
                createSrc(videoId);
                $modalOpen(".modal-help");
                return;
            }

            //:Importa modal HTML e cria nó
            const url = `${baseURL}videos/video.html?v=${g.refresh}`;
            const modalNode = await fetch(url).then((r) => r.text());
            $(".body-grid").insertAdjacentHTML("beforeend", modalNode);

            //:Eventos do modal
            $event(".modal-help", "click", (event) => this.events(event));

            //:Cria src do video
            createSrc(videoId);

            //:Abre modal
            $modalOpen(".modal-help");

            function createSrc(videoId) {
                const src = `https://player.mediadelivery.net/embed/597408/${videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;
                const iframe = document.querySelector(".modal-help iframe");
                iframe.src = src;
            }
        },

        close: function () {
            const iframe = document.querySelector(".modal-help iframe");
            iframe.src = "";

            $modalClose(".modal-help");
        },

        setIconId(videoId) {
            const icon = $("#sidebar .btn.help");

            if (videoId) {
                icon.dataset.id = videoId;
                icon.classList.add("active");
                return;
            }

            icon.dataset.id = "";
            icon.classList.remove("active");
        },

        events(event) {
            const target = event.target;

            if (target.closest(".btn.close")) return this.close();
        },
    },

    clinicNameShow() {
        if ($isVisible('.sidebar [js="clinicLogChange"]')) {
            const el = document.querySelector(".sidebar [js=clinicLogChange]");
            el.innerHTML = '<i class="fa-light fa-house-chimney-medical"></i> ' + cookie.get("log_clinicName");
        }
    },

    configBtns(target) {
        //:Muda tema
        if (target.closest(".btnConfigTheme")) {
            const theme = target.closest(".btnFather").dataset.id;

            (async function () {
                await $fetch({
                    url: `tools/config/theme/theme/toggleTheme/${theme}`,
                    fnName: "MUDA TEMA #668",
                });

                location.reload();
            })();
        }
    },

    goFast(target) {
        if (target.nodeName != "I") return;
        if (target.classList.contains("fa-caret-down")) return;

        const li_element = target.closest("li");
        const fast_element = li_element.querySelector(".fast");
        const href = fast_element.href;

        if (href) window.location.href = href;
    },

    //:EXECUTA: Abre/fecha sidebar
    toggleSidebar() {
        const sidebar = document.getElementById("sidebar");
        sidebar.classList.toggle("collapsed");
        sidebar.classList.remove("is-hovered");

        $sidebar.adjustsMainScreen();
    },

    //:EXECUTA: Ajusta layout da pagina a direita da sidebar
    adjustsMainScreen() {
        const sidebar = document.getElementById("sidebar");
        const mainContent = document.querySelector("main");
        const key = sidebar.classList.contains("collapsed") ? "add" : "remove";

        mainContent.classList[key]("sidebar-collapsed");
    },

    events(event) {
        const target = event.target;
        const sidebar = document.getElementById("sidebar");

        switch (event.type) {
            case "click":
                //:Botão de toggle do sidebar
                if (target.closest(".sidebarToggle") && window.innerWidth > 1500) return $sidebar.toggleSidebar();
                //:Botão de página principal
                if (target.closest(".btn.home")) return $sidebar.goHome();
                //:Botão de video tutorial
                if (target.closest(".btn.help")) return $sidebar.goHelp.open();
                //:Troca de clínica
                if (target.closest(".user-box .clinic")) return $sidebar.clinicLogChange.findClinic();
                //:Devmode
                if (typeof $devEvents === "function") {
                    if (target.closest(".dropdown.dev")) return $devEvents(event);
                    if (target.closest(".user-box .user")) return $devEvents(event);
                }
                return;

            case "mouseenter":
                return sidebar.classList.add("is-hovered");

            case "mouseleave":
                return sidebar.classList.remove("is-hovered");

            default:
                return;
        }
    },

    init() {
        $sidebar.navbarShow();
        $sidebar.clinicNameShow();

        //* $(".sidebar .components").addEventListener("click", (e) => $sidebar.goFast(e.target));
        if ($permission("124P", 0)) {
            $j("clinicLogChange").addEventListener("click", () => $sidebar.clinicLogChange.findClinic());
        }

        //:INICIO DE EVENTOS
        // const sidebarToggle = document.getElementById("sidebarToggle");
        const sidebarNavList = document.getElementById("sidebarNavList");
        const sidebarTools = document.querySelector(".sidebarTools");
        // const mainContent = document.querySelector("main");

        //:Ajusta largura do sidebar
        const innerWidth = window.innerWidth;
        if (innerWidth <= 1500) {
            //:Se a tela for pequena mantem sidebar fechado
            openCloseSidebar();
        } else {
            //:Se a tela for grande ativa o botão de toggle
            sidebarToggle.addEventListener("click", () => openCloseSidebar());
        }

        //:EVENTO: Mouse entra/sai da sidebar
        ["mouseenter", "mouseleave"].forEach((item) => {
            sidebarNavList.addEventListener(item, (event) => mouseInOut(event));
            // sidebarTools.addEventListener(item, (event) => mouseInOut(event));
        });

        //:EXECUTA: Abre/fecha sidebar
        // function openCloseSidebar() {
        //     sidebar.classList.toggle("collapsed");
        //     sidebar.classList.remove("is-hovered");

        //     updateLayout();
        // }

        // //:EXECUTA: Ajusta layout da pagina a direita da sidebar
        // function updateLayout() {
        //     const key = sidebar.classList.contains("collapsed") ? "add" : "remove";
        //     mainContent.classList[key]("sidebar-collapsed");
        // }

        // updateLayout();
    },
};

const $saveMode = {
    box: $("#menuTop .save-box"),
    selectors: "",
    active: false,

    enable(selectors = false) {
        if (selectors || this.selectors) {
            $classAdd(selectors || this.selectors, "disabledColor");
        }

        this.active = true;
        this.box.style.height = "44px";

        setTimeout(() => {
            $(this.box, ".save").disabled = false;
            $(this.box, ".cancel").disabled = false;
        }, 300);
    },

    disable(selectors = false) {
        if (selectors || this.selectors) {
            $classRemove(selectors || this.selectors, "disabledColor");
        }

        this.active = false;
        this.box.style.height = "0";

        $(this.box, ".save").disabled = true;
        $(this.box, ".cancel").disabled = true;
    },

    init(selectors) {
        this.selectors = selectors;
    },
};

const videos = {
    //ABRE MODAL
    showModal: async function () {
        videos.f = ".video_module";
        let src = "https://youtube.com/embed/qNMB8y0rfok";
        // getModalTemplate(videos.f, src);

        const resp = await $fetch({
            url: "modules/modules/videos",
            fnName: "#590",
        });

        $(videos.f).innerHTML = resp;

        //AJUSTA TAMANHO DO MODAL
        $(videos.f).style.width = "67%";

        //ABRE MODAL
        $showHideModal(videos.f);
        $centerModule(videos.f);

        //BUSCA TEMPLARTE DE MODAL E ADICIONA EM DOM
        async function getModalTemplate(f, src) {
            const resp = await $fetch({
                url: "modules/modules/videos",
                // par: { par1: 'par1', par2: 'par2' },
                fnName: "#590",
            });

            $(f).innerHTML = resp;

            // $.ajax({
            //     type: 'GET',
            //     url: `${baseURL}modules/modules/videos`,
            //     dataType: 'json',
            //     async: false,
            //     success: resp => {
            //         $(f).html(resp);
            //         $(f).find('iframe').attr('src', src);
            //     },
            //     error: resp => { console.log("***** ERRO *****", resp); messageErrorCI(resp); },
            // });
        }
    },

    //FECHA MODAL
    hideModal() {
        $showHideModal(videos.f);
        $(videos.f).html("");
    },

    init() {
        this.videoName = "";

        switch (ls.view) {
            case "patient_register":
                this.videoName = "qNMB8y0rfok";
                break;
        }

        if (this.videoName) {
            $(".sidebarTools .btnDevFilm").onclick = () => this.showModal();
        }
    },
};
