document.addEventListener("DOMContentLoaded", async () => {
    //:Módulos desse sistema
    g.modulesList = ["register"];

    //:Local storage
    const isMenuTopValid = typeof ls.menuTop === "string" && g.modulesList.includes(ls.menuTop);
    ls.set("menuTop", (ls.menuTop = isMenuTopValid ? ls.menuTop : "register"));
    ls.clinicId || ls.set("clinicId", cookie.get("log_clinicId"));
    ls.set("activeDate", $date.now("Sq"));
    ls.set("start", false);
    ls.set("end", false);

    //:Ativa módulo
    await menuTop.activateMenuTab(ls.menuTop);

    //:Eventos
    $event("main", "click,change,keyup", (event) => events(event));
});

//:MAIN EVENTOS
const events = (event) => {
    if ($sessionExpiration()) return;
    const target = event.target;

    //:Menu top
    if (target.closest("#menuTop")) return menuTop.click(event);
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
        const target = event.target;

        //:Novo agendamento
        if (target.closest(".newCalendar")) return newCalendar();

        //:Filtra profissional
        if (target.closest(".filterProf")) return filter.prof();

        //:Botão .setAllProfs -> limpa filtro de médicos
        if (target.closest(".setAllProfs")) return setAllProfs();

        //:Botão "Atendimentos" -> vai p/ relatório de atendimentos
        if (target.closest(".btn.record")) return (window.location.href = "relatorio-atendimentos");
        //* * * * * * * * * * * * * * * * * * * *

        function newCalendar() {
            const date = $date.now();

            //:Seta nova data ativa
            ls.set("activeDate", $date.format(date, "Sq"));

            //:Muda a visualização do calendário p/ dia
            $m.register.left.changeView("timeGridDay", date);
        }

        function setAllProfs() {
            ls.set("profId", 0);
            $m.register.database.get();
        }
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

        //:Mostra novo módulo
        //*Exepcionalmente nesse Main é preciso exibir o módulo antes de renderizar o fullcalendar em init()
        $(`#${module}`).style.display = "flex";

        //:Importa módulo
        if (!$m[module]) {
            const lastUrl = `calendar${module.charAt(0).toUpperCase() + module.slice(1)}`;
            const mod = await import(`${jsURL}calendar/${module}/${lastUrl}.js?v=${g.refresh}`);
            $m[module] = mod.obj;

            //:Se a função init() existir, executa
            if (typeof $m[module].init === "function") $m[module].init();
        }

        //:Busca database
        if (module != "register" && typeof $m[module].database?.get === "function") $m[module].database.get();

        //:Ativa nova aba
        $(`#menuTop .btn.${module}`).classList.add("active");

        //:Seta menuTop
        ls.set("menuTop", module);
    },

    //:Seta nome da clínica e nome do médico
    name() {
        $n("#menuTop, profName").value = ls.profName || "";
    },
};

const filter = {
    prof() {
        $findModule.init({
            urn: "calendarLibraries/find_prof",
            title: "Busca Profissional",
            tptTexts: { col2: "Profissional" },
            columnsQuantity: 2,
            width: "500px",
            callback,
        });

        function callback(par) {
            ls.set("profId", par.id);
            ls.set("profName", par.col2);

            //:busca lista atualizada
            $m[ls.menuTop].database.get();
        }
    },
};
