export const obj = {
    database: {
        get(event) {
            cl("TESTE");
            console.log("target: ", event.target);
        },
    },

    dom: {
        all(event) {
            console.log("target: ", event.target);
        },
    },

    events(event) {
        const target = event.target;

        //:Click
        if (event.type === "click") {
            //:Botão de gerar PDF
            // if (target.closest(".btnCreatePdf")) return this.createPdf(this.data.content);
        }
    },
};
