export default {
    //:Busca CEP
    search: async function () {
        let resp = "";
        const zip = $numberOnly(this.zipNode.value) ? this.zipNode.value : false;

        if (zip) {
            //:Fetch "https://viacep.com.br/"
            resp = await $fetch({
                method: "get",
                url: `https://viacep.com.br/ws/${zip}/json/`,
                fnName: "BUSCA CEP #518",
                consoleOn: false,
            });

            //:CEP não existe
            if (resp.erro) return this.zipNode.style.setProperty("border-color", "red", "important");
        }

        this.response(resp);
    },

    //:Processa resposta da API
    response(data) {
        this.zipNode.style.border = this.borderMemo;

        if (this.callback) {
            //:Preenchimento personalizado
            this.callback(data);
        } else {
            //:Preenchimento padrão
            const ad = document.querySelector(this.address);
            const an = document.querySelector(this.address_neighb);
            const ac = document.querySelector(this.address_city);
            const as = document.querySelector(this.address_state);
            const au = document.querySelector(this.address_number);

            const database = eval(this.database);
            $inputChange(ad, data.logradouro, "change", database);
            $inputChange(an, data.bairro, "change", database);
            $inputChange(ac, data.localidade, "change", database);
            $inputChange(as, data.uf, "change", database);

            au.focus();
        }
    },

    //:Inicio
    init(data) {
        this.zipNode = document.querySelector(data.zipInput);
        this.callback = data.callback; //:Não executa atualização e manda resposta para um callback
        this.borderMemo = window.getComputedStyle(this.zipNode).border;
        this.database = data.database ?? false; //:Objeto "data" que receberá as alterações na key "z_set"

        //:Campos a serem preenchidos. Se não for enviado usará um valor padrão.
        this.address = data.address ?? "[name=address]";
        this.address_neighb = data.address_neighb ?? "[name=address_neighb]";
        this.address_city = data.address_city ?? "[name=address_city]";
        this.address_state = data.address_state ?? "[name=address_state]";
        this.address_zip = data.address_zip ?? "[name=address_zip]";
        this.address_number = data.address_number ?? "[name=address_number]";

        this.zipNode.onchange = () => this.search();
    },
};
