export const obj = {
    //:Clique na aba
    click(event) {
        if (event.type !== "click") return;

        //:Salvar e cancelar
        if (event.target.closest(".save")) return $m[ls.menuTop].database.save();
        if (event.target.closest(".cancel")) return $m[ls.menuTop].database.get();

        const tab = event.target.closest(".tab").dataset.tab;

        switch (tab) {
            case "patient":
                ls.set("menuTop", "register", "patient");
                window.location.href = `${baseURL}pacientes`;
                return;

            case "osList":
                ls.set("menuTop", "list", "os");
                window.location.href = `${baseURL}servicos`;
                return;

            case "archive":
                ls.set("menuTop", "document", "archive");
                window.location.href = `${baseURL}arquivos`;
                return;

            case "recordList":
                ls.set("menuTop", "list", "record");
                window.location.href = `${baseURL}prontuarios`;
                return;

            case "financial":
                ls.set("menuTop", "register", "financial");
                window.location.href = `${baseURL}pacientes-financeiro`;
                return;
        }
    },

    //:Ativar/desativar abas conforme disponibilidade dos dados
    set(data) {
        //:Habilita/desabilita abas do menu conforme dados disponíveis
        const { id, checkIdOs, checkIdRecord } = data;
        const menuItems = {
            patient: 1,
            osList: +checkIdOs,
            recordList: +checkIdRecord,
            financial: +id,
        };
        ///
        Object.entries(menuItems).forEach(([className, isEnabled]) => {
            $("#menuTop ." + className).disabled = !isEnabled;
        });

        //:Ativa/desativa aba 'Arquivos'
        const arqchiveTabNode = $("#menuTop .archive");
        arqchiveTabNode.disabled = +id > 0 ? false : true;

        //:Nome do paciente no topo
        $("#menuTop .name").value = data.name || "Nenhum paciente selecionado";
    },
};
