export const obj = {
    delete() {
        $messageModal({
            text1: "Após confirmar essa ação, não será mais possível recuperar qualquer dados já digitado.",
            text2: "Confirma deletar esse atendimento?",
            btn: [
                { text: "Deletar", color: "danger", dataset: "delete" },
                { text: "Cancelar", color: "secondary", dataset: "exit" },
            ],
            btnWidth: "150px",
            timer: false,
            callback(dtback) {
                if (dtback !== "delete") return;

                $m.register.data.record = {
                    save: 1,
                    closeRecord: 1,
                };

                $m.register.database.delete();
            },
        });
    },

    //:PDF já foi assinado
    pdfSigned(data) {
        const text1 = `O PDF <b>já foi enviado</b> para o email <b>${data.profEmail}</b>. Cheque sua caixa de entrada ou spam. Se não encontrar, verifique se o email está correto.`;

        $messageModal({
            text1: text1,
            btn: [{ text: "Sair", color: "secondary", dataset: "exit" }],
            btnWidth: "150px",
            timer: 0,
        });
    },

    //:PDF ainda não foi assinado
    pdfUnsigned() {
        $messageModal({
            text1: "PDF ainda não foi assinado.",
            btn: [{ text: "Sair", color: "secondary", dataset: "exit" }],
            btnWidth: "150px",
        });
    },

    recordNeedsFinalization() {
        $messageModal({
            text1: "O prontuário precisa ser finalizado antes de ser assinado.",
            btn: [{ text: "Sair", color: "secondary", dataset: "exit" }],
            btnWidth: "150px",
        });
    },

    editModeDisabled() {
        $messageModal({
            text1: "Não é possível acionar o modo de edição quando o prontuário já estiver finalizado.",
            btn: [{ text: "Sair", color: "secondary", dataset: "exit" }],
            btnWidth: "150px",
        });
    },

    finalizeRecord() {
        $messageModal({
            text1: "Você está prestes a finalizar este prontuário. Após a finalização, não será mais possível editar as informações.",
            text2: "Deseja realmente continuar?",
            btn: [
                { text: "Sair", color: "warning", dataset: "exit" },
                { text: "Finalizar", color: "danger", dataset: "finalize" },
            ],
            btnWidth: "150px",
            timer: false,
            callback(dtback) {
                if (dtback !== "finalize") return;

                $m.register.database.finalizeRecord();
            },
        });
    },

    teste() {
        $messageModal({
            text1: "Teste de callback.",
            btn: [
                { text: "Sair", color: "secondary", dataset: "exit" },
                { text: "Teste 1", color: "primary", dataset: "test1" },
                { text: "Teste 2", color: "success", dataset: "test2" },
            ],
            btnWidth: "150px",
            callback: (dtback) => {
                console.log("dtback: ", dtback);
            },
        });
    },
};
