export const obj = {
    data: {},
    event: {},
    saveModeSelectors: `.navbar, #menuTop .left-calendar, .left, .right .list`,
    DbStart: $date.now(),
    DbEnd: $date.now(),
    colors: [
        { id: 10, cl: "#373737", bg: "#ffc107ff" },
        { id: 20, cl: "#ffffff", bg: "#28a745ff" },
        { id: 30, cl: "#ffffff", bg: "#ff4500ff" },
        { id: 40, cl: "#ffffff", bg: "#6f42c1ff" },
        { id: 50, cl: "#ffffff", bg: "#0026ffff" },
        { id: 70, cl: "#ffffff", bg: "#55bd00ff" },
    ],

    database: {
        get: async function () {
            const [profId, profName, start, end] = this.createFilterParams();
            const resp = await $fetch({
                url: "calendarRegister/getData",
                par: { profId, profName, start, end },
                fnName: "BUSCA DADOS WAU-0184",
            });

            //:Seta dados
            this.set(resp);
        },

        save: async function (optLock, data) {
            if (!$permission("12P")) return;

            $patientId(data.id_patient);

            const [profId, profName, start, end] = this.createFilterParams();
            const resp = await $fetch({
                url: "calendarRegister/setCalendar",
                par: { optLock, profId, profName, start, end, data },
                fnName: "SALVA DADOS #682",
            });

            //:Seta dados
            this.set(resp);
        },

        //:Arrasta um agendamento -> salva apenas data/hora
        saveNewDate: async function (optLock, id, newStart, newEnd) {
            if (!$permission("12P")) return this.get();

            const data = {
                id,
                id_status: 10,
                message_count: 0,
                calendar_start: newStart,
                calendar_end: newEnd,
                dateChanged: 1,
            };

            const [profId, profName, start, end] = this.createFilterParams();
            const resp = await $fetch({
                url: "calendarRegister/setCalendar",
                par: { optLock, profId, profName, start, end, data },
                fnName: "SALVA DADOS #713",
            });

            if (resp.status !== 200) return this.get();

            $toast("Salvo com sucesso.");

            //:Seta dados
            this.set(resp);
        },

        sendConfirmation: async function () {
            if (!$permission("153P")) return;

            $modalClose("#modalEdit");

            //:Data
            const mod = $("#modalEdit");
            const optLock = $(mod, ".optLock").value;
            const data = {
                id: $(mod, ".osId").value,
            };

            const [profId, profName, start, end] = this.createFilterParams();
            const resp = await $fetch({
                url: "calendarRegister/sendScheduleConfirmation",
                par: { optLock, profId, profName, start, end, data },
                fnName: "ENVIA ZAP WAU-0146",
            });

            //:Se erro -> resgata dados
            if (resp.status !== 200) return this.get();

            //:Seta dados
            this.set(resp);
        },

        createFilterParams() {
            return [ls.profId, ls.profName, obj.DbStart, obj.DbEnd];
        },

        delete() {
            if (!$permission("135P")) return;

            //:Data
            const mod = $("#modalEdit");
            const optLock = $(mod, ".optLock").value;
            const osId = $(mod, ".osId").value;

            $messageModal({
                text1: "Deseja realmente excluir esse agendamento?",
                btn: [
                    { text: "Excluir", color: "danger", dataset: "delete" },
                    { text: "Sair", color: "secondary", dataset: "exit" },
                ],
                timer: false,
                callback: async (dtback) => {
                    if (dtback !== "delete") return;

                    //:Fetch
                    const [profId, profName, start, end] = this.createFilterParams();
                    await $fetch({
                        url: "calendarRegister/delCalendar",
                        par: { optLock, osId, profId, profName, start, end },
                        fnName: "DELETA AGENDA WAU-0143",
                    });

                    this.get();
                },
            });
        },

        set(resp) {
            if (!resp.calendarList) return cl("PARADO!");

            setColorsInCalendar(resp.calendarList);
            obj.left.removeAllEvents(); //:Remove todos agendamentos
            obj.left.addEventSource(resp.calendarList); //:Adiciona novos agendamentos

            //:Seta dados
            ls.set("profId", resp.prof.profId);
            ls.set("profName", resp.prof.profName);

            //:Atualiza toda tela
            obj.dom.all();
            return;
            //* * * * * * * * * * * * * * * * * * * *

            function setColorsInCalendar() {
                obj.data.calendarList = resp.calendarList;
                obj.data.calendarList.forEach((el) => {
                    const color = obj.colors.find((cl) => cl.id == el.statusId);

                    el.backgroundColor = color.bg;
                    el.borderColor = color.bg;
                    el.textColor = color.cl;
                });
            }
        },
    },

    left: new FullCalendar.Calendar($(".calendar"), {
        headerToolbar: {
            start: "prev,next today",
            center: "title",
            end: "timeGridDay,timeGridWeek,dayGridMonth,listWeek",
        },

        locale: "pt-br",

        initialDate: ls.activeDate,

        //:Permite clicar nos nomes dos dias
        navLinks: true,

        //:Mostra visualmente a area selecionada antes de soltar o botão do mouse
        selectMirror: true,

        //:Permite arrastar agendamento com mouse na plataforma
        editable: true,

        //:Textos dos botões em português
        buttonText: { today: "hoje", month: "mês", week: "semana", day: "dia", list: "lista" },

        //:Inicia no formato de exibição de Mês
        initialView: "timeGridDay", //:Opções: dayGridMonth | timeGridWeek | timeGridDay | listWeek

        //:Limita lista no formato Mês
        dayMaxEventRows: true,

        //:Ativa uma linha indicando o horário atual
        nowIndicator: true,

        //:Dá cor a linha toda (background)
        eventDisplay: "block",

        //:Executa ao clicar no modo de visualização ("dia", "mês", "semana", "lista")
        viewDidMount: function (arg) {
            cl("viewDidMount");
        },

        //:Executa qdo clica em um box de data
        dateClick: async function (info) {
            cl("dateClick");
            if (obj.left.view.type === "timeGridDay") {
                const date = $date.format(info.dateStr, "Sq");
                const time = $date.format(info.dateStr, "tm");
                //!obj.right.editMain.show("new", date, time);

                obj.modalOs.show(true, date, time);
            }

            //:Seta nova data ativa
            ls.set("activeDate", $date.format(info.dateStr, "Sq"));

            //!Está na tela de "mês" | fecha box de edição
            // if (obj.left.view.type === "dayGridMonth") obj.right.editMain.hide();

            //:Atualiza lista de hoje
            obj.right.domList();

            //:Seleciona calendario p/ data clicada
            obj.left.gotoDate(info.dateStr);
        },

        navLinkDayClick: function (date, jsEvent) {
            cl("navLinkDayClick");

            //:Seta nova data ativa
            ls.set("activeDate", $date.format(date, "Sq"));

            //:Está na tela de "mês" | fecha box de edição
            // if (obj.left.view.type === "dayGridMonth") obj.right.editMain.hide();

            //:Muda a visualização do calendário p/ dia
            obj.left.changeView("timeGridDay", date);

            //!Atualiza lista de hoje
            // obj.dom.todayList();

            //:Seleciona calendario p/ data clicada
            obj.left.gotoDate(date);
        },

        //:Executa qdo clica em um agendamento
        eventClick(info) {
            cl("eventClick");

            const primary = info.event;
            const extended = info.event.extendedProps;
            obj.event = {
                id: primary.id,
                title: primary.title,
                startDatetime: $date.format(primary.start),
                endDatetime: $date.format(primary.end),

                idDisplay: extended.id_display,
                patientId: extended.patientId,
                patientName: extended.patientName,
                clinicId: extended.id_clinic,
                clinicName: extended.clinicName,
                profId: extended.id_prof,
                profName: extended.profName,
                procedureId: extended.id_procedureMain,
                procedureName: extended.procedureName,
                notes: extended.notes,
                messageCount: extended.message_count,
                optLock: extended.optLock,
            };

            obj.modalOs.show(false);

            // const collapseId = `col_${info.event.id}`;
            // obj.right.toggleCollapseList(collapseId, true);
        },

        //:Executa qdo arrasta um agendamento
        eventDrop: function (info) {
            cl("eventDrop");
            const osId = info.event.id;
            const newStart = $date.format(info.event.start);
            const newEnd = info.event.end ? $date.format(info.event.end) : newStart;
            const optLock = info.event.extendedProps.optLock;

            obj.database.saveNewDate(optLock, osId, newStart, newEnd);
        },

        //:Executa quando redimensiona a duração do evento
        eventResize: function (info) {
            const osId = info.event.id;
            const newStart = $date.format(info.event.start);
            const newEnd = info.event.end ? $date.format(info.event.end) : newStart;
            const optLock = info.event.extendedProps.optLock;

            obj.database.saveNewDate(optLock, osId, newStart, newEnd);
        },

        //:Mostra todos agendamentos impressos na tela
        eventDidMount: function (info) {
            // cl("eventDidMount");
            // console.log("info: ", info);
            // console.log("Valor de teste:", info.event.extendedProps.teste);
        },

        //:Executa toda vez que altera a data
        datesSet(info) {
            cl("datesSet");

            //:Mostra ou esconde botão newCalendar
            const viewType = obj.left.view.type;
            const btnNode = $("#menuTop .btn.newCalendar");
            if (viewType !== "timeGridDay") {
                btnNode.classList.remove("d-none");
            } else {
                btnNode.classList.add("d-none");
            }

            let getDatabase = false;
            const startDatetime = $date.format(info.start);
            const endDatetime = $date.format(info.end);

            if (obj.DbStart > startDatetime) {
                obj.DbStart = startDatetime;
                getDatabase = true;
                // cn(`ALTEROU START -> ${obj.DbStart}`);
            }

            if (obj.DbEnd < endDatetime) {
                obj.DbEnd = endDatetime;
                getDatabase = true;
                // cn(`ALTEROU END -> ${obj.DbEnd}`);
            }

            ls.set("activeDate", $date.format(obj.left.getDate(), "Sq"));

            //:Busca dados no banco atualizando lista a direita
            if (getDatabase) return obj.database.get();

            //:Apenas atualiza lista a direita
            obj.right.domList();
        },
    }),

    right: {
        //:Renderiza uma lista do dia selecionado a direita
        domList() {
            const tpt = obj.data.calendarList
                .filter((el) => el.start.split(" ")[0] === ls.activeDate)
                .map((el) => {
                    const [date, startTime] = el.start.split(" ");
                    const [, endTime] = el.end.split(" ");
                    const start = startTime.substring(0, 5);
                    const end = endTime.substring(0, 5);
                    const collapseId = `col_${el.id}`;

                    return renderList(el, start, end, collapseId);
                });
            ///
            function renderList(el, start, end, colId) {
                return `
                <div class="box" data-id="${el.id}" data-patient_id="${el.id_patient}" data-collapse_id="${colId}">
                    <div class="col1">
                        <div class="name">
                            ${el.title}
                        </div>
                        <div class="date">
                            ${start} às ${end}
                        </div>
                        <div class="down">
                            <i class="fa-regular fa-chevron-down"></i>
                        </div>
                    </div>
                    <div class="bot">
                        <div class="prof" data-id="${el.id_prof}">
                            <button class="btn color-wau1 outline setProf" data-bs-toggle="tooltip" data-bs-title="Filtra apenas ${el.profName}"><i class="fa-light fa-user-doctor"></i></button>
                            <p>${el.profName}</p>
                        </div>
                        <div class="icons">
                            <button class="btn color-wau1 outline"><i class="fa-brands fa-whatsapp"></i></button>
                            <button class="btn color-wau1 outline goPatient"><i class="fa-light fa-address-card"></i></button>
                            <button class="btn color-wau1 outline msg"><i class="fa-light fa-message-sms"></i><span>2</span></button>
                        </div>
                    </div>

                    <div class="collapse" id="${colId}">
                        <div class="card card-body"></div>
                    </div>
                </div>`;
            }

            const listNode = $("#register .right .list");
            listNode.innerHTML = tpt.join("");
        },

        toggleCollapseList(collapseId, scrollToCenter = false) {
            const colNode = $(`#${collapseId}`);
            const cardNode = $(colNode, ".card-body");

            cardNode.innerHTML = renderCardContent();

            $collapse.toggle(colNode);

            if (scrollToCenter) {
                setTimeout(() => {
                    colNode.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 300);
            }

            return;
            //* * * * * * * * * * * * * * * * * * * *

            function renderCardContent() {
                return `
                <div class="col-12 mt-1">
                    <div class="input-group">
                        <span class="input-group-text">Procedim.:</span>
                        <input type="text" class="form-control" name="procedureName" readonly />
                    </div>
                </div>
                <div class="col-12 mt-1">
                    <div class="d-flex">
                        <div class="input-group">
                            <span class="input-group-text">Vl. Tabela:</span>
                            <input type="text" class="form-control" name="" mask="number" readonly />
                        </div>
                        <div class="input-group ms-1">
                            <span class="input-group-text ps-2" style="max-width: 95px">Vl. Serviço:</span>
                            <input type="text" class="form-control" name="vl_procedure" mask="number" />
                        </div>
                    </div>
                </div>
                <div class="col-12 mt-1 notes disabled">
                    <textarea class="form-control" name="notes"></textarea>
                </div>
                <div class="footer mt-3">
                    <button class="btn btn-primary save"><i class="fa-light fa-floppy-disk"></i>Salvar</button>
                    <button class="btn btn-danger delete"><i class="fa-light fa-trash-can"></i>Deletar</button>
                    <button class="btn btn-warning cancel"><i class="fa-light fa-circle-xmark"></i>Fechar</button>
                </div>`;
            }
        },

        colorTags() {
            const tagsNode = $("#register .right .tags");
            let color = {};

            color = obj.colors.find((el) => el.id === 20);
            $(tagsNode, ".tag-2").style.backgroundColor = color.bg;
            $(tagsNode, ".tag-2").style.color = color.cl;

            color = obj.colors.find((el) => el.id === 30);
            $(tagsNode, ".tag-3").style.backgroundColor = color.bg;
            $(tagsNode, ".tag-3").style.color = color.cl;

            color = obj.colors.find((el) => el.id === 40);
            $(tagsNode, ".tag-4").style.backgroundColor = color.bg;
            $(tagsNode, ".tag-4").style.color = color.cl;

            color = obj.colors.find((el) => el.id === 50);
            $(tagsNode, ".tag-5").style.backgroundColor = color.bg;
            $(tagsNode, ".tag-5").style.color = color.cl;
        },

        events(event) {
            const target = event.target;

            switch (event.type) {
                case "click":
                    //:Clique em icone de expandir/collapse
                    if (target.closest(".box")) return collapse();
                    return;

                default:
                    return;
            }

            function collapse() {
                const collapseId = target.closest(".box").dataset.collapse_id;

                obj.right.toggleCollapseList(collapseId);
            }
        },
    },

    modalOs: {
        isNew: false,

        show(isNew = false, dateInit, timeInit) {
            this.isNew = isNew;

            //:Extrai data/hora inicial e final
            const [startDate, startTime, endDate, endTime] = (() => {
                if (isNew) {
                    //:Obtém a data/hora final somando 30 minutos à inicial
                    const dateTimeEnd = $date.moreTimes(`${dateInit} ${timeInit}`, 30, "+");
                    const [derivedFinalDate, derivedFinalTime] = dateTimeEnd.split(" ");
                    return [dateInit, timeInit, derivedFinalDate, derivedFinalTime];
                }

                //:Extrai data/hora inicial e final do objeto do evento
                const [extractedInitialDate, extractedInitialTime] = obj.event.startDatetime.split(" ");
                const [extractedFinalDate, extractedFinalTime] = obj.event.endDatetime.split(" ");
                return [extractedInitialDate, extractedInitialTime, extractedFinalDate, extractedFinalTime];
            })();

            const mod = $("#modalEdit");
            $displayId(this.isNew ? "new" : obj.event.idDisplay, obj.event.id, $(mod, ".displayId"));
            ///
            $(mod, ".osId").value = this.isNew ? "new" : obj.event.id;
            $(mod, ".patientId").value = this.isNew ? "" : obj.event.patientId;
            $(mod, ".patientName").value = this.isNew ? "" : obj.event.patientName;
            $(mod, ".profId").value = this.isNew ? "" : obj.event.profId;
            $(mod, ".profName").value = this.isNew ? "" : obj.event.profName;
            $(mod, ".procedureId").value = this.isNew ? "" : obj.event.procedureId;
            $(mod, ".procedureName").value = this.isNew ? "" : obj.event.procedureName;
            $(mod, ".notes").value = this.isNew ? "" : obj.event.notes;
            $(mod, ".optLock").value = this.isNew ? "new" : obj.event.optLock;
            $(mod, ".dateInit").value = startDate;
            $(mod, ".timeInit").value = startTime;
            $(mod, ".dateEnd").value = endDate;
            $(mod, ".timeEnd").value = endTime;
            $(mod, ".box-confirmation span").textContent = this.isNew ? "0" : obj.event.messageCount;
            ///
            $(mod, ".box-confirmation .btn").disabled = this.isNew || !$permission("153P", 0) ? true : false;
            $(mod, ".btn.delete").disabled = this.isNew ? true : false;
            $(mod, ".btn.findPatient").disabled = this.isNew ? false : true;
            $(mod, ".btn.findProf").disabled = this.isNew ? false : true;
            $(mod, ".btn.findProcedure").disabled = this.isNew ? false : true;
            $(mod, ".btn.save").classList[this.isNew ? "remove" : "add"];
            $(mod, ".btn.save span").textContent = [this.isNew ? "Salvar" : "Alterar"];

            $requiredMark.unset(mod);

            $modalOpen("#modalEdit");
        },

        events(event) {
            const target = event.target;
            const modalNode = $("#modalEdit");

            switch (event.type) {
                case "click":
                    //:Busca paciente
                    if (target.closest(".findPatient")) return $findPatient(findPatientCallback);
                    //:Busca profissional
                    if (target.closest(".findProf")) return findProf();
                    //:Busca procedimento
                    if (target.closest(".findProcedure")) return $findProcedure(findProcedureCallback);
                    //:Envia zap de confirmação
                    if (target.closest(".box-confirmation .btn")) return obj.database.sendConfirmation();
                    //:Vai p/ tela de paciente
                    if (target.closest(".btn.goPatient")) return goPatient();
                    //:Vai p/ tela de os
                    if (target.closest(".btn.goOs")) return goOs();
                    //:Salvar
                    if (target.closest(".btn.save")) return save();
                    //:Deletar
                    if (target.closest(".btn.delete")) return obj.database.delete();
                    return;

                default:
                    return;
            }

            function findPatientCallback(data) {
                if (!data) return;

                $(modalNode, ".patientId").value = data.id;
                $(modalNode, ".patientName").value = data.col2;

                $patientId(data.id);
            }

            function findProf() {
                $findModule.init({
                    urn: "calendarLibraries/find_prof",
                    title: "Busca Profissional",
                    tptTexts: { col2: "Profissional" },
                    columnsQuantity: 2,
                    width: "500px",
                    callback,
                });

                function callback(par) {
                    $(modalNode, ".profId").value = par.id;
                    $(modalNode, ".profName").value = par.col2;
                }
            }

            function findProcedureCallback(data) {
                if (!data) return;

                $(modalNode, ".procedureId").value = data.id;
                $(modalNode, ".procedureName").value = data.col2;
            }

            function save() {
                const mod = $("#modalEdit");
                const optLock = $(mod, ".optLock").value;
                const data = {
                    id: $(mod, ".osId").value,
                    id_prof: $(mod, ".profId").value,
                    id_patient: $(mod, ".patientId").value,
                    id_procedureMain: $(mod, ".procedureId").value,
                    value: $(mod, ".value").value,
                    notes: $(mod, ".notes").value,
                    calendar_start: $(mod, ".dateInit").value + " " + $(mod, ".timeInit").value,
                    calendar_end: $(mod, ".dateEnd").value + " " + $(mod, ".timeEnd").value,
                };

                const firstRequired = $requiredMark.set(mod, true);
                if (firstRequired) return ce(firstRequired);

                $modalClose("#modalEdit");

                obj.database.save(optLock, data);
            }

            function goPatient() {
                const patientId = $(modalNode, ".patientId").value;
                $patientId(patientId);

                window.location.href = `${baseURL}pacientes`;
            }

            function goOs() {
                const patientId = $(modalNode, ".patientId").value;
                $patientId(patientId);

                const osId = $(modalNode, ".osId").value;
                ls.set("osId", osId, "os");
                ls.set("menuTop", "register", "os");

                window.location.href = `${baseURL}servicos`;
            }
        },
    },

    ModalFindPatient: {
        show() {
            $modalOpen("#modalFindPatient");
        },
    },

    dom: {
        calendar() {
            obj.left.refetchEvents();
        },

        all() {
            menuTop.name();
            this.calendar();
            // this.todayList();
            obj.right.domList();
            obj.right.colorTags();
        },
    },

    adicionaEventosNaAgenda() {
        cl("TESTE");

        obj.left.addEventSource([
            {
                id: 111,
                title: "Evento 1",
                start: "2025-06-17 10:30",
                end: "2025-06-17 11:30",
                color: "#ff00c8",
            },
            {
                id: 112,
                teste: "teste ok",
                sala: "sala 5",
                retorno: false,
                title: "Evento 2",
                start: "2025-06-17 10:30",
                end: "2025-06-17 11:30",
                color: "red",
            },
        ]);
        obj.left.refetchEvents();

        let evento;
        evento = obj.left.getEventById(111);
        console.log(evento.extendedProps);
        evento = obj.left.getEventById(112);
        console.log(evento.extendedProps);
    },

    events(event) {
        const target = event.target;

        //:Modal editar OS
        if (target.closest("#modalEdit")) return obj.modalOs.events(event);

        //:Main de editar (direita)
        if (target.closest(".edit-main") || target.closest(".top")) return obj.right.editMain.events(event);

        //:Main de lista (direita)
        if (target.closest(".right")) return obj.right.events(event);
    },

    init: async function () {
        //:Renderiza Fullcalendar
        obj.left.render();
    },
};
