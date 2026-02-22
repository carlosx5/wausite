export const obj = {
    fatherNode: "",
    dataMemo: { f_dtTarget: null, f_dtStart: null, f_dtEnd: null },

    events(event) {
        const target = event.target;

        switch (event.type) {
            case "click":
                //:Quando clica no toggle do dropdown
                if (target.closest(".dropdown-toggle")) return obj.setMemo();
                //:Seta período
                if (target.closest(".set")) return obj.set();
                //:Fecha dropdown
                if (target.closest(".cancel")) return obj.close(true);
                //:Período por agendamento
                if (target.closest(".calendar")) return obj.dtTarget("calendar");
                //:Período por cadastro
                if (target.closest(".register")) return obj.dtTarget("register");
                return;

            case "change":
                //:Mês alterado
                if (target.name === "month") return obj.changeMonth();
                return;

            default:
                return;
        }
    },

    dtTarget(opt) {
        ls.set("f_dtTarget", opt);

        obj.dom();
    },

    changeMonth() {
        const month = $n(obj.fatherNode, "month")?.value;

        const [year, monthNum] = month.split("-");
        const firstDay = new Date(year, monthNum - 1, 1);
        $n(obj.fatherNode, "dtStart").value = firstDay.toISOString().split("T")[0];
        const lastDay = new Date(year, monthNum, 0);
        $n(obj.fatherNode, "dtEnd").value = lastDay.toISOString().split("T")[0];
    },

    set() {
        const dtStart = $n(obj.fatherNode, "dtStart")?.value;
        const dtEnd = $n(obj.fatherNode, "dtEnd")?.value;

        if (!dtStart || !dtEnd) {
            return $toast("Período inválido!|As datas de início e fim devem ser preenchidas.", "warning");
        }

        if (dtStart > dtEnd) {
            return $toast("Período inválido!|A data de início deve ser anterior a do fim.", "warning");
        }

        //:Salva no local storage
        ls.set("f_dtStart", dtStart);
        ls.set("f_dtEnd", dtEnd);

        //:Atualiza interface
        obj.dom();

        //:Fecha menu
        obj.close();

        //:Atualiza lista
        $m.list.database.get();
    },

    setMemo() {
        const { f_dtTarget, f_dtStart, f_dtEnd } = ls;

        obj.dataMemo = { f_dtTarget, f_dtStart, f_dtEnd };
    },

    resset() {
        cl("Resseta filtro período. Não está sendo usado.");
        ["f_dtTarget", "f_dtStart", "f_dtEnd"].forEach((k) => ls.set(k, ""));

        obj.dom();
    },

    close(isCancel = false) {
        if (isCancel) {
            ls.set("f_dtTarget", obj.dataMemo.f_dtTarget);
            ls.set("f_dtStart", obj.dataMemo.f_dtStart);
            ls.set("f_dtEnd", obj.dataMemo.f_dtEnd);

            obj.dom();
        }

        const menu = obj.fatherNode.querySelector(".dropdown-menu");
        menu.classList.remove("show");
    },

    dom() {
        //:Target padrão
        ls.f_dtTarget ?? ls.set("f_dtTarget", "calendar");

        //:Período padrão: mês atual
        if (!ls.f_dtStart || !ls.f_dtEnd) {
            const now = new Date();

            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

            ls.set("f_dtStart", firstDay);
            ls.set("f_dtEnd", lastDay);
        }

        //:Desestruturação para evitar acessos repetidos
        const { f_dtTarget, f_dtStart, f_dtEnd } = ls;

        //:Labels centralizados
        const labels = {
            calendar: "Agendamento",
            register: "Cadastro",
            period: "Período",
        };

        const dtTargetLabel = labels[f_dtTarget] ?? labels.calendar;

        //:Se "f_dtTarget" for "calendar" ou "register" -> habilita botões do topo
        if (["calendar", "register"].includes(ls.f_dtTarget)) {
            $(obj.fatherNode, ".btn-top").classList.remove("d-none");

            //:Botões Agendamento / Cadastro
            ["calendar", "register"].forEach((type) => {
                const btn = $(obj.fatherNode, `.btn.${type}`);
                if (btn) btn.classList.toggle("active", f_dtTarget === type);
            });
        }

        //:Inputs de data
        const dtStartInput = $n(obj.fatherNode, "dtStart");
        const dtEndInput = $n(obj.fatherNode, "dtEnd");

        if (dtStartInput) dtStartInput.value = f_dtStart;
        if (dtEndInput) dtEndInput.value = f_dtEnd;

        //:Label do dropdown
        const dropdownLabel = $(obj.fatherNode, ".dropdown-toggle p");
        if (dropdownLabel) {
            dropdownLabel.innerText = `${dtTargetLabel}: ${$date.format(f_dtStart, "Br/")} - ${$date.format(f_dtEnd, "Br/")}`;
        }

        //:Label da coluna data na tabela
        const thDate = $(".content-main .table tr th.date");
        if (thDate) thDate.innerText = dtTargetLabel;
    },
};
