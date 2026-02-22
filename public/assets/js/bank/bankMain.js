document.addEventListener("DOMContentLoaded", async () => {
    //:Módulos desse sistema
    g.modulesList = ["register", "statement"];

    //:Local storage
    ls.bankId || ls.set("bankId", 0);

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
    if (target.closest("#menuTop .tab")) return menuTop.click(event);
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
    if (ls.menuTop) {
        $(`#menuTop .btn.${ls.menuTop}`).classList.remove("active"); //.Aba
        $(`#${ls.menuTop}`).classList.add("d-none"); //.Tela
    }

    //:Importa o módulo dinamicamente se ainda não estiver carregado
    if (!$m[moduleName]) {
        const moduleFile = `bank${moduleName.charAt(0).toUpperCase()}${moduleName.slice(1)}`;
        const importedModule = await import(`${jsURL}bank/${moduleName}/${moduleFile}.js?v=${g.refresh}`);
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
