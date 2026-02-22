const d = {
    //DATA
    openai: "",
    ask: "",
};

document.addEventListener("DOMContentLoaded", () => {
    $("#ask").focus();
});

const getData = async () => {
    const resp = await $fetch({
        url: "https://api.openai.com/v1/completions",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${g.key}`,
        },
        par: {
            model: "text-davinci-003",
            prompt: d.ask,
            max_tokens: 2048,
            temperature: 0.5,
        },
        fnName: "CHATGPT #578",
    });

    const respText = resp.choices[0].text;
    const firstThreeCharacters = respText.slice(0, 2);
    const newLine = firstThreeCharacters == "\n-" || firstThreeCharacters == "\n1";
    const text = newLine ? respText : respText.slice(1, respText.length);

    d.openai += `\nResposta: ${text}`;

    viewDom.openai();
};

const viewDom = {
    openai() {
        const resp = $("#resp");
        resp.value = d.openai;
        resp.scrollTop = resp.scrollHeight;
    },
};

const ask = {
    askNow() {
        viewDom.openai();
        getData();
    },

    onkeyup(e) {
        d.ask = e.target.value;

        if (d.ask && e.key === "Enter") {
            d.openai += (d.openai ? "\n\n\n" : "") + `Eu: ${d.ask}`;
            ask.askNow();
            $("#ask").value = "";
        }
    },

    init: (function () {
        $("#ask").onkeyup = (e) => ask.onkeyup(e);
    })(),
};

// Oq é uma câmera hiperbárica?
// Quais são as contra-indicações?
