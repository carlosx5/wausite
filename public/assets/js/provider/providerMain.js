document.addEventListener("DOMContentLoaded", async () => {
    //:Importa módulos
    const [mask] = await Promise.all([import(`${jsURL}modules/mask.js?v=${g.refresh}`)]);

    //:Módulos helper
    $m.mask = mask.default;

    //:Módulos desse sistema
    g.modulesList = ["register"];

    //:Local storage
    ls.procedureId || ls.set("procedureId", 0);

    //:Ativa módulo
    ls.menuTop || ls.set("menuTop", "register");
    menuTop.activateMenuTab(ls.menuTop);

    //:Eventos
    $event("main", "click,change,keyup", (event) => events(event));
});

//:MAIN EVENTOS
const events = (event) => {
    if ($sessionExpiration()) return;
    const target = event.target;

    //:Menu top
    if (target.closest("#menuTop .tab")) return menuTop.click(event);

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

        const tab = event.target.closest("#menuTop .tab").dataset.tab;

        this.activateMenuTab(tab);
    },

    //:Ativa modulo selecionado
    activateMenuTab: async function (module) {
        //:Checa modulo
        if (!module || !g.modulesList.includes(module)) return;

        //:Desativa modulo atual
        if (ls.menuTop) {
            //:Desativa aba
            $(`#menuTop .btn.${ls.menuTop}`).classList.remove("active");

            //:Esconde tela
            $(`#${ls.menuTop}`).style.display = "none";
        }

        //:Importa módulo
        if (!$m[module]) {
            const lastUrl = `provider${module.charAt(0).toUpperCase() + module.slice(1)}`;
            const mod = await import(`${jsURL}provider/${module}/${lastUrl}.js?v=${g.refresh}`);
            $m[module] = mod.obj;

            //:Se a função init() existir, executa
            if (typeof $m[module].init === "function") $m[module].init();
        }

        //:Busca database
        if (typeof $m[module].database?.get === "function") $m[module].database.get();

        //:Ativa nova aba
        $(`#menuTop .btn.${module}`).classList.add("active");

        //:Mostra novo módulo
        $(`#${module}`).style.display = "flex";

        //:Seta menuTop
        ls.set("menuTop", module);
    },

    //:Seta nome da clínica
    name() {
        $("#menuTop .name").value = ls.stockName || "";
    },
};

//:BUSCA CLÍNICA
const searchClinic = () => {
    if (!$permission(53)) return;

    $findModule.init({
        urn: "clinic/clinicFind/find",
        title: "Busca Clínica",
        tptTexts: { col2: "Clínica" },
        columnsQuantity: 2,
        width: "500px",
        callback: (par) => {
            ls.set("clinicId", par.id);
            ls.set("clinicName", par.col2);

            //:Zera dados de todos os módulos
            g.modulesList.forEach((mod) => {
                if ($m[mod]) $m[mod].data = {};
            });

            //:busca dados da clínica atual
            $m[ls.menuTop].database.get();
        },
    });
};
