const ajaxSelect = () => ({
    getData: async function (find) {
        const resp = await $fetch({
            url: this.url,
            par: {
                find,
                parameter: this.parameter,
            },
            fnName: "FETCHSELECT #532",
            overlay: false,
        });

        //:Cria as tags "<option>"
        const tpt = resp.list.map((val) => this.optionModel(val)).join("");
        this.select.innerHTML = tpt;
    },

    iconTemplate() {
        const wrapper = {};

        //:Cria div1 que irá envolver o input
        wrapper.div1 = document.createElement("div");
        wrapper.div1.className = "input-main";

        //:Cria div2 que irá envolver os icones
        wrapper.div2 = document.createElement("div");
        wrapper.div2.className = "icon-main";

        //:Insere div1 antes do input
        this.input.parentNode.insertBefore(wrapper.div1, this.input);

        //:Cria o icone de colocar o input com a seleção "nenhuma opção"
        wrapper.icon1 = document.createElement("i");
        wrapper.icon1.className = "fa-light fa-empty-set";

        //:Coloca os elementos nos devidos lugares
        wrapper.div1.appendChild(this.input); //:Move o input para dentro da div1
        wrapper.div1.appendChild(wrapper.div2); //:Adiciona div2 após o input
        wrapper.div2.appendChild(wrapper.icon1); //:Adiciona o icon1 dentro da div2
    },

    onClickIcon() {
        this.option.style.display = "none";

        this.callback({
            id: false,
            txt1: false,
        });
    },

    onClickInput() {
        this.option.style.width = `${this.input.offsetWidth}px`; //:Ajusta a largura do select

        if (!this.input.value) this.select.innerHTML = ""; //:Limpa todos "<option>" se input estiver sem valor

        this.option.style.display = $isVisible(this.option) ? "none" : "flex"; //:Mostra area de "<option>"
    },

    onKeyupInput(e) {
        if (!$isVisible(this.option)) this.option.style.display = "flex"; //MOSTRA AREA DE SELECT
        this.getData(e);
    },

    onFocusoutInput() {
        setTimeout(() => {
            this.option.style.display = "none";
        }, 150);
    },

    onClickSelect(target) {
        this.option.style.display = "none";

        this.callback({
            id: target.dataset.id,
            txt1: target.textContent,
        });
    },

    events(event) {
        const target = event.target;

        //:Eventos no input
        if (target.closest(".input-select")) {
            if (event.type == "click") return this.onClickInput();
            if (event.type == "blur") return this.onFocusoutInput();
            if (event.type == "keyup") return this.debouncedOnKeyupInput(event.target.value);
        }

        //:Click no icone
        if (target.closest("i") && event.type == "click") return this.onClickIcon();

        //:Click na lista
        if (target.closest("option") && event.type == "click") return this.onClickSelect(target);
    },

    init(data) {
        this.node = $(data.div);

        const tpt = [
            (val) => `<option data-id="${val.id}">${val[this.field1]}</option>\n`,
            (val) => `<option data-id="${val.id}">${val[this.field1]} - ${val[this.field2]}</option>\n`,
        ];

        const split = data.fields.split(",");
        this.field1 = split[0];
        this.field2 = split[1];
        this.optionModel = tpt[split.length - 1];
        ///
        this.url = data.url;
        this.callback = data.callback;
        this.tpt = $(this.node, ".tpt");
        this.input = $(this.node, ".input-select");
        this.inputName = this.input.getAttribute("name");
        this.parameter = data.parameter ?? "";

        //:Cria DOM do select
        this.tpt.innerHTML = `
            <div class="template-select" style="display:none;position:absolute;z-index:999;">
                <select class="form-select" multiple></select>
            </div>`;

        //:Passa NODE p/ variáveis
        this.select = $(this.node, ".tpt .form-select");
        this.option = $(this.node, ".tpt .template-select");

        //:Debounce
        this.debouncedOnKeyupInput = $debounce(this.onKeyupInput.bind(this), 350); //:350ms é um valor comum

        //:Template de icones
        if (!data.noIcon) this.iconTemplate();

        //:Eventos
        $event(this.node, "click,keyup", (event) => this.events(event));
        $event(this.input, "blur", (event) => this.events(event));
    },
});

export default ajaxSelect;
