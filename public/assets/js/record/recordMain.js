document.addEventListener("DOMContentLoaded", async () => {
    //:Importa módulos
    const [menuTop, tpt, msg] = await Promise.all([
        import(`${jsURL}patient/libraries/menuTop.js?v=${g.refresh}`),
        import(`${jsURL}record/template/recordTemplate.js?v=${g.refresh}`),
        import(`${jsURL}record/modules/_recordMessages.js?v=${g.refresh}`),
    ]);

    //:Módulos helper
    $m.menuTop = menuTop.obj;
    $m.tpt = tpt.obj;
    $m.msg = msg.obj;

    //:Módulos desse sistema
    g.modulesList = ["list", "register"];

    //:Local storage
    const isMenuTopValid = typeof ls.menuTop === "string" && g.modulesList.includes(ls.menuTop);
    ls.set("menuTop", (ls.menuTop = isMenuTopValid ? ls.menuTop : "list"));

    //:Verifica se há um prontuário pendente para abrir
    //:Se houver, abre a tela de cadastro de prontuário (register)
    const pendingRecord = +cookie.get("pendingRecord");
    if (pendingRecord) {
        ls.set("recordId", pendingRecord);
        ls.set("menuTop", "register");
    }

    //:Ativa módulo
    moduleRender(ls.menuTop);

    //:Eventos
    $event("main", "click,change,keyup", (event) => events(event));
});

//:MAIN EVENTOS
const events = (event) => {
    if ($sessionExpiration()) return;
    const target = event.target;

    //:Menu top
    if (target.closest("#menuTop .btn.tab")) return $m.menuTop.click(event);
    //:Headbar
    if (target.closest("#headerBar .btn")) return $m[ls.menuTop].headerBar(event);
};

//:Ativa o módulo selecionado
async function moduleRender(selectedModule) {
    //:Verifica se o módulo é válido
    const moduleName = !selectedModule || !g.modulesList.includes(selectedModule) ? "list" : selectedModule;

    //:Ativa sortable se for módulo que usa
    const modulesForSortable = ["register"];
    if (modulesForSortable.includes(selectedModule)) {
        if (typeof Sortable === "undefined") {
            //:Usa a função loadScript e AWAIT para esperar
            await loadScript("https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js");
        }
    }

    //:Oculta a tela do módulo anterior
    $(`#${ls.menuTop}`).classList.add("d-none");

    //:Importa o módulo dinamicamente se ainda não estiver carregado
    if (!$m[moduleName]) {
        const moduleFile = `record${moduleName.charAt(0).toUpperCase()}${moduleName.slice(1)}`;
        const importedModule = await import(`${jsURL}record/${moduleName}/${moduleFile}.js?v=${g.refresh}`);
        $m[moduleName] = importedModule.obj;

        //:Executa a função init(), se existir
        if (typeof $m[moduleName].init === "function") {
            $m[moduleName].init();
        }
    }

    //:Carrega o banco de dados do módulo, se aplicável
    if (typeof $m[moduleName].database?.get === "function") {
        const stop = await $m[moduleName].database.get();
        if (stop === "stop") {
            return cl("Módulo parado na função database.get()");
        }
    }

    //:Ativa a aba do novo módulo
    $(`#menuTop .btn.recordList`).classList.add("active");

    //:Exibe a tela do novo módulo
    $(`#${moduleName}`).classList.remove("d-none");

    //:Atualiza o valor atual do menuTop
    ls.set("menuTop", moduleName);
    return;
    //* * * * * * * * * * * * * * * * * * * *

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve; //:Resolve a promessa quando o script for carregado e executado
            script.onerror = reject; //:Rejeita se houver erro
            document.head.appendChild(script);
        });
    }
}

const findPatient = () => {
    if (!$permission("76P")) return;

    $findModule.init({
        urn: "patientLibraries/find_patient",
        title: "Busca Paciente",
        placeholder: "Digite o nome do paciente",
        tptTexts: { col2: "Nome" },
        columnsQuantity: 2,
        width: "400px",
        callback: (par) => {
            $patientId(par.id);

            //:busca dados do paciente atual
            $m[ls.menuTop].database.get();
        },
    });
};
