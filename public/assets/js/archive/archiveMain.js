const img = {};

document.addEventListener("DOMContentLoaded", async () => {
    //:Ativa aba "Arquivos" no menu top
    $("#menuTop .right .tab.archive").classList.add("active");
    ls.set("menuTop", "archive");

    //:Importa módulos
    [{ obj: $m.menuTop }] = await Promise.all([import(`${jsURL}patient/libraries/menuTop.js?v=${g.refresh}`)]);

    g.modulesList = ["image"];
    ls.set("module", ls.module || "image");

    //:Renderiza módulo ativo
    moduleRender();

    //:Botão de ajuda
    const videoId = g.video.archive;
    $sidebar.goHelp.setIconId(videoId);

    //:Eventos
    $event("main", "click,change", (event) => events(event));
});

//:MAIN EVENTOS
const events = (event) => {
    if ($sessionExpiration()) return;
    const target = event.target;

    //:Menu top
    if (target.closest("#menuTop .btn.tab")) return $m.menuTop.click(event);
    //:headerBar
    if (target.closest("#headerBar")) return $m[ls.module].headerBar(event);
    //:Carrega nova imagem
    if (target.closest("#loadImage") && event.type == "change") return $m.image.database.save();
    //:Modal QRCode
    if (target.closest("#modalQrCode img")) return setClipboard();
    //:Modal close
    if (target.closest("#modalQrCode .close")) return $m.image.modalClose();

    //:Direciona evento p/ o módulo atual
    for (let index = 0; index < g.modulesList.length; index++) {
        const moduleName = g.modulesList[index];
        if (target.closest(`#${moduleName}`)) return $m[moduleName].events(event);
    }
};

//:Ativa o módulo selecionado
async function moduleRender() {
    const module = ls.module;
    console.log("module: ", module);

    //:Importa o módulo dinamicamente se ainda não estiver carregado
    if (!$m[module]) {
        const moduleFile = `archive${module.charAt(0).toUpperCase()}${module.slice(1)}`;
        const importedModule = await import(`${jsURL}archive/${module}/${moduleFile}.js?v=${g.refresh}`);
        $m[module] = importedModule.obj;

        //:Executa a função init(), se existir
        if (typeof $m[module].init === "function") {
            $m[module].init();
        }
    }

    //:Carrega o banco de dados do módulo, se aplicável
    if (typeof $m[module].database?.get === "function") {
        $m[module].database.get();
    }

    //:Desativa modulos com exceção do módulo atual
    g.modulesList.forEach((val) => {
        const event = val == module ? "remove" : "add";
        $(`#${val}`).classList[event]("d-none");
    });
}

function setClipboard() {
    const imageBox = $("#modalQrCode .image");
    const qrKey = imageBox.dataset.qrKey;
    console.log("qrKey: ", qrKey);

    $setClipboard(qrKey);
}
