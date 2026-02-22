document.addEventListener("DOMContentLoaded", async () => {
    //:Importa módulos
    [{ default: $m.zip }] = await Promise.all([import(`${jsURL}modules/zip.js?v=${g.refresh}`)]);

    //:Módulos desse sistema
    g.modulesList = ["register", "image", "branch", "finance"];

    //:Local storage
    ls.clinicId || ls.set("clinicId", cookie.get("log_clinicId"));

    //:Local storage
    const isMenuTopValid = typeof ls.menuTop === "string" && g.modulesList.includes(ls.menuTop);
    ls.set("menuTop", (ls.menuTop = isMenuTopValid ? ls.menuTop : "register"));

    //:Ativa módulo
    moduleRender(ls.menuTop);

    //:Eventos
    $event("main", "click,change,keyup", (event) => events(event));
});

//:MAIN EVENTOS
const events = (event) => {
    if ($sessionExpiration()) return;
    const target = event.target;

    //:Save Box
    if (target.closest("#menuTop .save-box")) return saveBox();
    //:Menu top
    if (target.closest("#menuTop .btn.tab")) return menuTop.click(event);
    //:Headbar
    if (target.closest("#headerBar .btn")) return $m[ls.menuTop].headerBar(event);

    //:Direciona evento p/ o módulo atual
    for (let index = 0; index < g.modulesList.length; index++) {
        const moduleName = g.modulesList[index];
        if (target.closest(`#${moduleName}`)) return $m[moduleName].events(event);
    }

    function saveBox() {
        //:Ataliza e cancelar
        if (target.closest(".save")) return $m[ls.menuTop].database.save();
        if (target.closest(".cancel")) return $m[ls.menuTop].database.get();
    }
};

//:Ativa o módulo selecionado
async function moduleRender(selectedModule) {
    //:Verifica se o módulo é válido
    const moduleName = !selectedModule || !g.modulesList.includes(selectedModule) ? "register" : selectedModule;

    //:Desativa modulo anterior
    $(`#menuTop .btn.${ls.menuTop}`).classList.remove("active"); //.Aba
    $(`#${ls.menuTop}`).classList.add("d-none"); //.Tela

    //:Importa o módulo dinamicamente se ainda não estiver carregado
    if (!$m[moduleName]) {
        const moduleFile = `clinic${moduleName.charAt(0).toUpperCase()}${moduleName.slice(1)}`;
        const importedModule = await import(`${jsURL}clinic/${moduleName}/${moduleFile}.js?v=${g.refresh}`);
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
    $(`#menuTop .btn.${moduleName}`).classList.add("active");

    //:Exibe a tela do novo módulo
    $(`#${moduleName}`).classList.remove("d-none");

    //:Atualiza o valor atual do menuTop
    ls.set("menuTop", moduleName);
}

//:MENU DO TOPO
const menuTop = {
    //:Clique na aba
    click(event) {
        if (event.type !== "click") return;

        const tab = event.target.closest(".tab").dataset.tab;

        //:Ativa módulo
        moduleRender(tab);
    },
};

//:BUSCA CLÍNICA
const findClinic = () => {
    if (!$permission(55)) return;

    $findModule.init({
        urn: "clinic/findClinic",
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
