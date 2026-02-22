export const obj = {
    father: false,
    date: "",
    daysList: [],
    callback: false,

    /** ///INICIA MODAL DE DATA md7
     * @param {string} date data a ser setada
     * @param {array} dateList lista de dias a serem setados
     */
    start(date, dateList) {
        //:SETA DATA
        this.setDate(date, dateList);

        // $showHideModal(".md7");

        obj.dom.all();
    },

    //.DOM
    dom: {
        /** ///CRIA TEMPLATE */
        template() {
            let tpt = ""; //:TEMPLATE
            let day = 0; //:DIA DO MÊS
            let dayToday = new Date().getDate(); //:DIA DE HOJE
            let classToday = ""; //:DESTAQUE DE BORDA NO DIA DE HOJE
            let week = -1; //:SEMANA DO MÊS
            let lastDay = $date.daysInMonth(obj.date); //:ULTIMO DIA DO MÊS
            let dataDay = ""; //:DATASET DO DIA
            let dataSelected = false; //:DATASET SE ESTÁ SELECIONADO OU NÃO
            const weekStart = $date.monthStartsInWeek(obj.date); //:DIA DA SEMANA QUE INICIA O MÊS

            while (day !== lastDay) {
                week = week == 6 ? 0 : week + 1; //:VAI DE 0 À 6
                day += day > 0 || weekStart == week ? 1 : 0; //:SOMA DIA (SÓ COMEÇA A CONTAR NO DIA DA SEMANA QUE COMEÇA O MÊS)
                dataDay = day ? ` data-day="${day}"` : ""; //:COLOCA O DIA EM DATASET
                dataSelected = obj.daysList.includes(day) ? ` data-selected="1"` : ""; //:COLOCA SELECT EM DATASET
                classToday = day == dayToday ? ' class="today"' : ""; //:SE FOR DIA DE HOJE DESTACA BORDA

                tpt += `<div${classToday}${dataDay}${dataSelected}>${day > 0 ? day : ""}</div>`;
            }

            $(`${obj.father} .day`).innerHTML = tpt;
            $(`${obj.father} .year span`).innerHTML = obj.date.split("-")[0];
        },

        /** ///ESTILO DO MÊS */
        styleMonth() {
            const monthsNode = $$(`${obj.father} .month .btn`);
            const monthToday = new Date().getMonth(); //:MÊS DE HOJE
            const monthSelected = obj.date.split("-")[1];

            monthsNode.forEach((el, index) => {
                //:REMOVE SELEÇÃO DE TODOS
                el.classList.remove("selected");

                //:STYLE DO MÊS SELECIONADO
                if (index + 1 == monthSelected) {
                    el.classList.add("selected");
                }

                //:STYLE DO MÊS DE HOJE
                if (index == monthToday) el.classList.add("today");
            });
        },

        /** ///ALL */
        all() {
            this.template();
            this.styleMonth();
        },
    },

    /** ///SETA DATA */
    setDate(date, dateList = []) {
        date = date ? $date.format(date, "Sq") : $date.now("Sq");

        const split = date.split("-");

        //:SETA md7.date
        obj.date = `${split[0]}-${split[1]}-${split[2]}`;

        //:SE VIER UMA LISTA, SETA A LISTA. SE NÃO VIER, SETA O DIA EM FORMATO ARRAY
        obj.daysList = dateList[0] ? dateList : [+split[2]];
    },

    /** ///EVENTOS */
    event(event) {
        const target = event.target;

        //:CLIQUE EM DIA
        if (target.closest("[data-day]")) {
            const day = target.dataset.day;
            const split = obj.date.split("-");

            //:SETA md7.date
            obj.date = $date.format(`${split[0]}-${split[1]}-${day}`, "Sq");

            //:FECHA MODAL
            // $showHideModal("#md7");

            //:MANDA DATA P/ CALLBACK
            obj.callback(obj.date, "dayClick");
            return;
        }

        //:CLIQUE EM MÊS
        if (target.closest("[data-month]")) {
            const month = target.dataset.month.padStart(2, "0");
            const split = obj.date.split("-");

            //:SETA md7.date
            obj.date = $date.format(`${split[0]}-${month}-${split[2]}`, "Sq");

            //:FECHA MODAL
            // $showHideModal("#md7");

            //:MANDA DATA P/ CALLBACK
            obj.callback(obj.date, "monthClick");
            return;
        }

        //:CLIQUE EM ANO
        if (target.closest(".year")) {
            const split = obj.date.split("-");

            if (target.closest(".backward")) {
                //:VOLTA ANO
                split[0]--;
            } else if (target.closest(".forward")) {
                //:AVANÇA ANO
                split[0]++;
            }

            //:SETA md7.date
            obj.date = $date.format(`${split[0]}-${split[1]}-${split[2]}`, "Sq");

            //:FECHA MODAL
            // $showHideModal("#md7");

            //:MANDA DATA P/ CALLBACK
            obj.callback(obj.date, "yearClick");
            return;
        }
    },

    /** ///INICIO */
    init(father, callback) {
        obj.father = father;
        obj.callback = callback;

        //:EVENTOS
        $event(`${obj.father}`, "click", (event) => obj.event(event));
    },
};
