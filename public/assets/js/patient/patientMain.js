document.addEventListener("DOMContentLoaded", async () => {
    //:Importa módulos
    const [menuTop, zip, fetchSelect] = await Promise.all([
        import(`${jsURL}patient/libraries/menuTop.js?v=${g.refresh}`),
        import(`${jsURL}modules/zip.js?v=${g.refresh}`),
        import(`${jsURL}modules/fetchSelect.js?v=${g.refresh}`),
    ]);

    //:Módulos
    $m.menuTop = menuTop.obj;
    $m.zip = zip.default;
    $m.fetchSelect = fetchSelect.default;

    //:Módulos desse sistema
    g.modulesList = ["register"];

    //:Local storage
    const isMenuTopValid = typeof ls.menuTop === "string" && g.modulesList.includes(ls.menuTop);
    ls.set("menuTop", (ls.menuTop = isMenuTopValid ? ls.menuTop : "register"));

    //:Ativa módulo
    moduleRender(ls.menuTop);

    //:Eventos
    $event("main", "change,keyup,click,focusout", (event) => events(event));
});

//:MAIN EVENTOS
const events = (event) => {
    if ($sessionExpiration()) return;
    const target = event.target;

    //:Menu top
    if (target.closest("#menuTop .btn.tab")) return $m.menuTop.click(event);
    //:Headbar
    if (target.closest("#headerBar .btn")) return $m[ls.menuTop].headerBar(event);

    //:Direciona evento p/ o módulo atual
    for (let index = 0; index < g.modulesList.length; index++) {
        const moduleName = g.modulesList[index];
        if (target.closest(`#${moduleName}`)) return $m[moduleName].events(event);
    }
};

//:Ativa o módulo selecionado
async function moduleRender(selectedModule) {
    //:Verifica se o módulo é válido
    const moduleName = !selectedModule || !g.modulesList.includes(selectedModule) ? "register" : selectedModule;

    //:Oculta a tela do módulo anterior
    $(`#${ls.menuTop}`).classList.add("d-none");

    //:Importa o módulo dinamicamente se ainda não estiver carregado
    if (!$m[moduleName]) {
        const moduleFile = `patient${moduleName.charAt(0).toUpperCase()}${moduleName.slice(1)}`;
        const importedModule = await import(`${jsURL}patient/${moduleName}/${moduleFile}.js?v=${g.refresh}`);
        $m[moduleName] = importedModule.obj;

        //:Executa a função init(), se existir
        if (typeof $m[moduleName].init === "function") {
            $m[moduleName].init();
        }
    }

    //:Carrega o banco de dados do módulo, se aplicável
    if (typeof $m[moduleName].database?.get === "function") {
        $m[moduleName].database.get();
    }

    //:Ativa a aba do novo módulo
    $(`#menuTop .btn.patient`).classList.add("active");

    //:Exibe a tela do novo módulo
    $(`#${moduleName}`).classList.remove("d-none");

    //:Atualiza o valor atual do menuTop
    ls.set("menuTop", moduleName);

    //:Botão de ajuda
    const videoId = g.video[moduleName];
    $sidebar.goHelp.setIconId(videoId);
}

const findPatient = () => {
    if (!$permission(69)) return;

    $findModule.init({
        urn: "patientLibraries/find_patient",
        title: "Busca Paciente",
        placeholder: "Digite o nome do paciente",
        tptTexts: { col2: "Nome" },
        columnsQuantity: 2,
        width: "400px",
        callback: (par) => {
            $patientId(par.id);
            ls.set("patientName", par.col2);

            //:busca dados do paciente atual
            $m[ls.menuTop].database.get();
        },
    });
};
