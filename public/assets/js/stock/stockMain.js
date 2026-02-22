document.addEventListener("DOMContentLoaded", async () => {
    //:Módulos desse sistema
    g.modulesList = ["list", "register"];

    //:Local storage
    ls.stockId || ls.set("stockId", 0);

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

        const tab = event.target.closest(".tab").dataset.tab;
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
            const lastUrl = `stock${module.charAt(0).toUpperCase() + module.slice(1)}`;
            const mod = await import(`${jsURL}stock/${module}/${lastUrl}.js?v=${g.refresh}`);
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

//:BUSCA ESTOQUE
const findStock = () => {
    if (!$permission(10)) return;

    $findModule.init({
        urn: "stock/stockFind/find",
        title: "Busca Estoque",
        tptTexts: { col2: "Estoque" },
        columnsQuantity: 2,
        width: "500px",
        callback: (par) => {
            ls.set("stockId", par.id);
            ls.set("stockName", par.col2);

            //:Zera dados de todos os módulos
            g.modulesList.forEach((mod) => {
                if ($m[mod]) $m[mod].data = {};
            });

            //:Busca dados do estoque atual
            $m[ls.menuTop].database.get();
        },
    });
};
