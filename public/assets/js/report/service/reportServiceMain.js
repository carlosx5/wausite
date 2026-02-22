document.addEventListener("DOMContentLoaded", async () => {
    //:Importa módulos
    [{ obj: $m.fPeriod }, { obj: $m.fStatus }, { obj: $m.fProf }, { obj: $m.fClinic }] = await Promise.all([
        import(`${jsURL}report/libraries/filter_period.js?v=${g.refresh}`),
        import(`${jsURL}report/libraries/filter_status.js?v=${g.refresh}`),
        import(`${jsURL}report/libraries/filter_prof.js?v=${g.refresh}`),
        import(`${jsURL}report/libraries/filter_clinic.js?v=${g.refresh}`),
    ]);

    //:Local storage
    ls.set("menuTop", "list");

    //:Ordenação
    orderFilters.init();

    //:Ativa módulo
    moduleRender(ls.menuTop);

    //:Inicializa filtros
    g.filterList = ["period", "status", "prof", "clinic"];
    g.filterList.forEach((filter) => {
        const fn = "f" + filter.charAt(0).toUpperCase() + filter.slice(1);

        $m[fn].fatherNode = $(`#menuTop .filter-box.${filter}`);
        $m[fn].dom();
    });

    //:Eventos
    $event("main", "click,keyup,change", (event) => events(event));
});

//:MAIN EVENTOS
const events = (event) => {
    if ($sessionExpiration()) return;
    const target = event.target;

    //:Save Box
    if (target.closest("#menuTop .save-box")) return saveBox();
    //:Filter Box
    if (target.closest("#menuTop .filter-box")) return filters();
    //:Ordena filtros
    if (target.closest("#menuTop .btn.order")) return orderFilters.set();
    //:Resseta filtros
    if (target.closest("#menuTop .btn.resset")) return ressetFilters();
    //:Lista
    if (target.closest("#list")) return $m.list.left.events(event);

    function saveBox() {
        //:Ataliza e cancelar
        if (event.target.closest(".save")) return $m[ls.menuTop].database.get();
        if (event.target.closest(".cancel")) return ressetFilters();
    }

    function filters() {
        const fatherNode = target.closest(".filter-box");
        const x = fatherNode.dataset.target;
        const fn = "f" + x.charAt(0).toUpperCase() + x.slice(1);

        $m[fn].events(event, fatherNode);
    }
};

const orderFilters = {
    set() {
        const newOrder = ls.f_order === "asc" ? "desc" : "asc";
        ls.set("f_order", newOrder);

        this.dom();
        $m.list.database.get();
    },

    dom() {
        const iconNode = $("#menuTop .right .order i");
        const order = ls.f_order;

        iconNode.classList.toggle("fa-arrows-up-to-line", order === "desc");
        iconNode.classList.toggle("fa-arrows-down-to-line", order === "asc");
    },

    init() {
        ls.f_order || ls.set("f_order", "desc");
        this.dom();
    },
};

function ressetFilters() {
    g.filterList.forEach((filter) => {
        const fn = "f" + filter.charAt(0).toUpperCase() + filter.slice(1);
        $m[fn].resset();
    });

    ls.set("f_order", "desc");

    orderFilters.dom();
    $m.list.database.get();
}

//:ATIVA MÓDULO
async function moduleRender(selectedModule) {
    //:Importa módulo
    if (!$m[selectedModule]) {
        const lastUrl = `reportService${selectedModule.charAt(0).toUpperCase() + selectedModule.slice(1)}`;
        const mod = await import(`${jsURL}report/service/${selectedModule}/${lastUrl}.js?v=${g.refresh}`);
        $m[selectedModule] = mod.obj;

        //:Se a função init() existir, executa
        if (typeof $m[selectedModule].init === "function") $m[selectedModule].init();
    }

    //:Busca database
    if (typeof $m[selectedModule].database?.get === "function") $m[selectedModule].database.get();

    //:Mostra novo módulo
    $(`#${selectedModule}`).classList.remove("d-none");
}
