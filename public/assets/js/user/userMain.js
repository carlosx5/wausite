document.addEventListener("DOMContentLoaded", async () => {
    //:Importa módulos
    const [zip, fetchSelect, tpt] = await Promise.all([
        import(`${jsURL}modules/zip.js?v=${g.refresh}`),
        import(`${jsURL}modules/fetchSelect.js?v=${g.refresh}`),
        import(`${jsURL}record/template/recordTemplate.js?v=${g.refresh}`),
    ]);

    //:Módulos helper
    $m.zip = zip.default;
    $m.fetchSelect = fetchSelect.default;
    $m.tpt = tpt.obj;

    //:Módulos desse sistema
    g.modulesList = ["register", "permission", "record", "config"];

    //:Local storage
    ls.menuTop || ls.set("menuTop", "register");
    ls.set("activityId", "");

    //:Ativa módulo
    moduleRender(ls.menuTop);

    //:Eventos
    $event("main", "change,keyup,click,focusout,show.bs.modal", (event) => events(event));
});

//:MAIN EVENTOS
const events = (event) => {
    if ($sessionExpiration()) return;
    const target = event.target;

    //:Menu top
    if (target.closest("#menuTop .btn.tab")) return menuTop.click(event);
    //:Headbar
    if (target.closest("#headerBar .btn")) return $m[ls.menuTop].headerBar(event);

    //:Direciona evento p/ o módulo atual
    for (let index = 0; index < g.modulesList.length; index++) {
        const moduleName = g.modulesList[index];
        if (target.closest(`#${moduleName}`)) return $m[moduleName].events(event);
    }
};

//:MENU DO TOPO
const menuTop = {
    //:Clique na aba
    click(event) {
        if (event.type !== "click") return;

        //:Salvar e cancelar
        if (event.target.closest(".save")) return $m[ls.menuTop].database.save();
        if (event.target.closest(".cancel")) return $m[ls.menuTop].database.get();

        ls.set("activityId", "");

        const tab = event.target.closest(".tab").dataset.tab;
        moduleRender(tab);
    },

    //:Seta nome do paciente
    name() {
        $("#menuTop .name").value = ls.userName || "";
    },
};

//:ATIVA MÓDULO
async function moduleRender(selectedModule) {
    //:Checa modulo
    if (!selectedModule || !g.modulesList.includes(selectedModule)) return;

    //:Desativa modulo anterior
    if (ls.menuTop) {
        $(`#menuTop .btn.${ls.menuTop}`).classList.remove("active"); //.Aba
        $(`#${ls.menuTop}`).classList.add("d-none"); //.Tela
    }

    //:Ativa sortable se for módulo que usa
    const modulesForSortable = ["record"];
    if (modulesForSortable.includes(selectedModule)) {
        if (typeof Sortable === "undefined") {
            //:Usa a função loadScript e AWAIT para esperar
            await loadScript("https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js");
        }
    }

    //:Checa se carregou
    if (typeof Sortable === "undefined") {
        cd("Sortable não carregou");
    }

    //:Importa módulo
    if (!$m[selectedModule]) {
        const lastUrl = `user${selectedModule.charAt(0).toUpperCase() + selectedModule.slice(1)}`;
        const mod = await import(`${jsURL}user/${selectedModule}/${lastUrl}.js?v=${g.refresh}`);
        $m[selectedModule] = mod.obj;

        //:Se a função init() existir, executa
        if (typeof $m[selectedModule].init === "function") $m[selectedModule].init();
    }

    //:Busca database
    if (typeof $m[selectedModule].database?.get === "function") $m[selectedModule].database.get();

    //:Ativa nova aba
    $(`#menuTop .btn.${selectedModule}`).classList.add("active");

    //:Mostra novo módulo
    $(`#${selectedModule}`).classList.remove("d-none");

    //:Seta menuTop
    ls.set("menuTop", selectedModule);
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

//:BUSCA USUÁRIO
const findUser = () => {
    if (!$permission(53)) return;

    $findModule.init({
        urn: "userLibraries/find_user",
        title: "Busca Usuário",
        tptTexts: { col2: "Nome" },
        columnsQuantity: 2,
        width: "500px",
        callback: (par) => {
            ls.set("activityId", "");
            ls.set("userId", par.id);
            ls.set("userName", par.col2);

            //:Zera dados de todos os módulos
            g.modulesList.forEach((mod) => {
                if ($m[mod]) $m[mod].data = {};
            });

            //:busca dados do usuário atual
            $m[ls.menuTop].database.get();
        },
    });
};
