document.addEventListener("DOMContentLoaded", async () => {
    //:Módulos desse sistema
    g.modulesList = ["register"];

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

    // $blur(target);

    //:Save Box
    if (target.closest("#menuTop .save-box")) return saveBox();
    //:Menu top
    if (target.closest("#menuTop .btn.tab")) return;
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
    const moduleName = !selectedModule || !g.modulesList.includes(selectedModule) ? "list" : selectedModule;

    //:Oculta a tela do módulo anterior
    $(`#${ls.menuTop}`).classList.add("d-none");

    //:Importa o módulo dinamicamente se ainda não estiver carregado
    if (!$m[moduleName]) {
        const moduleFile = `procedure${moduleName.charAt(0).toUpperCase()}${moduleName.slice(1)}`;
        const importedModule = await import(`${jsURL}procedure/${moduleName}/${moduleFile}.js?v=${g.refresh}`);
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

const findProcedure = () => {
    $findModule.init({
        urn: "procedure/find_procedure",
        title: "Busca Procedimento",
        placeholder: "Digite o nome do procedimento",
        tptTexts: { col2: "Nome" },
        columnsQuantity: 2,
        width: "400px",
        callback: (par) => {
            ls.set("procedureId", par.id);
            ls.set("procedureName", par.col2);

            //:busca dados do procedimento atual
            $m[ls.menuTop].database.get();
        },
    });
};

const DEL = () => {
    const input = $(".wau-select input");
    const list = $(".wau-select ul");

    input.addEventListener("input", () => {
        const value = input.value.toLowerCase();
        list.innerHTML = "";

        if (!value) {
            list.classList.add("d-none");
            return;
        }

        procedureListFactory(value);
    });

    // Fecha a lista ao clicar fora
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".position-relative")) {
            list.classList.add("d-none");
        }
    });

    //:Busca e cria datalist de procedimentos
    const procedureListFactory = $debounce(async (find) => {
        const resp = await $fetch({
            url: "osLibraries/find_procedure",
            par: { find },
            overlay: false,
            fnName: "BUSCA PROCEDIMENTOS WAU-0084",
        });

        const tpt = resp.list
            .map(
                ({ id, name, vl_table }) =>
                    `<li class="list-group-item list-group-item-action" data-id="${id}" data-vl_table="${vl_table}">${name}</li>`,
            )
            .join("");
        list.innerHTML = tpt;

        list.classList.toggle("d-none", resp.list.length === 0);
    });
};
