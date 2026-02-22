//+
///
//:
//-
//.
//*
//!
//=

document.addEventListener("DOMContentLoaded", async () => {
    //:Importa módulos
    const [find, servicesModule] = await Promise.all([
        import(`${jsURL}modules/find.js?v=${g.refresh}`),
        import(`${jsURL}services/modules/servicesModule.js?v=${g.refresh}`),
    ]);

    //:Importa módulos
    [{ obj: $m.fPeriod }, { obj: $m.fStatus }, { obj: $m.fProf }, { obj: $m.fClinic }] = await Promise.all([
        import(`${jsURL}report/libraries/filter_period.js?v=${g.refresh}`),
        import(`${jsURL}report/libraries/filter_status.js?v=${g.refresh}`),
        import(`${jsURL}report/libraries/filter_prof.js?v=${g.refresh}`),
        import(`${jsURL}report/libraries/filter_clinic.js?v=${g.refresh}`),
    ]);

    //:Importa modal HTML e cria nó
    const hasModal = $(".modal-help");
    if (hasModal) return; //:Se já existir, não cria novamente
    const url = `${baseURL}videos/video.html?v=${g.refresh}`;
    const modalNode = await fetch(url).then((r) => r.text());
    $("main").insertAdjacentHTML("beforeend", modalNode);

    //:Módulos helper
    $m.find = find.default;

    //:Módulos de services
    $m.menuTop = servicesModule.menuTop;
    $m.sidebar = servicesModule.sidebar;

    //:Importar arquivos JS e HTML apenas uma vez
    $m.qrCode ||= (await import(`${baseURL}plugins/js/qrCodeNew.js`)).default;
    $m.newFinancial ||= (await import(`${jsURL}financial/libraries/newFinancial.js`)).default;
    $m.modalNode ||= await fetch(`${jsURL}financial/libraries/html/modalSingle.html`).then((r) => r.text());

    //:Busca database
    mainDatabase.get();

    //:Eventos
    $event("main", "click", (event) => events(event));
    $event(".sidebarTools", "click", (event) => $m.sidebar.events(event));

    ls.menuTop || ls.set("menuTop", "dashboard");

    $m.menuTop.activateMenuTab(ls.menuTop);
});

const alertas = () => {
    function myFunction() {
        let text;
        let person = prompt("Digite seu nome:", "Carlito Brigante");
        if (person == null || person == "") {
            text = "Vc clicou em cancelar.";
        } else {
            text = "Fala " + person + "! Como vai?";
        }
        cl(text);
    }

    function myFunction() {
        if (!confirm("Deseja deletar?")) return;

        // OU

        if (confirm("Deseja deletar?")) {
            cl("OK");
        } else {
            cl("CANCELAR");
        }
    }

    function myFunction() {
        alert("Alerta ativado!");
    }
};

const notificacoes = () => {
    if (Notification.permission !== "granted") {
        alert("As notificações devem estar ativas!");
    }

    function notificacao(message) {
        if (!("Notification" in window)) {
            cl("OPT-1");
            // Check if the browser supports notifications
            alert("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
            cl("OPT-2");
            // Check whether notification permissions have already been granted;
            // if so, create a notification
            const notification = new Notification(message);
            // …
        } else if (Notification.permission !== "denied") {
            cl("OPT-3");
            // We need to ask the user for permission
            Notification.requestPermission().then((permission) => {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    const notification = new Notification(message);
                    // …
                }
            });
        }

        // At last, if the user has denied notifications, and you
        // want to be respectful there is no need to bother them anymore.
    }
};

// IDENTIFICA SE É UM iPhone, iPad, Mac, etc...
const deviceDetection = () => {
    if (navigator.userAgent.match(/iPhone/i)) {
        cl("iPhone!");
    } else if (navigator.userAgent.match(/iPad/i)) {
        cl("iPad!");
    } else if (screen.width <= 699) {
        cl("Mobile!");
    } else if (navigator.userAgent.match(/Mac OS X/i)) {
        cl("Mac!");
    } else {
        cl("PC!");
    }
};

const pegaMedidasDeUmObjeto = () => {
    return $("seletor").getBoundingClientRect();
};

const numeros = () => {
    result = parseFloat(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const outros = () => {
    tamanhoTelaHorizontal = parseInt(window.innerWidth);
    tamanhoTelaVertical = parseInt(window.innerHeight);

    console.log(`Largura total da tela: ${window.screen.width}px`);
    console.log(`Largura do viewport da janela (inclui scrollbar): ${window.innerWidth}px`);
    console.log(`Largura do documento (exclui scrollbar): ${document.documentElement.clientWidth}px`);
};

const data = () => {
    //. new Date(milissegundos)
    //. new Date(string_de_data)
    //. new Date(ano, mes, dia)
    //. new Date(ano, mes, dia, hora, minuto, segundo, milissegundo)
    //: getDate(): devolve o dia do mês, um inteiro entre 1 e 31. Não confundir com getDay que retorna o dia da semana.
    //: getDay() : devolve o dia da semana, inteiro entre 0 e 6 (0 para Domingo).
    //: getHours(): retorna a hora, inteiro entre 0 e 23.
    //: getMinutes(): devolve os minutos, inteiro entre 0 e 59.
    //: getSeconds(): devolve os segundos, inteiro entre 0 e 59.
    //: getMonth(): devolve o mês, um inteiro entre 0 e 11 (0 para Janeiro).
    //: getTime(): devolve os segundos transcorridos entre o dia 1 de janeiro de 1970 e a data correspondente ao objeto ao que se passa a mensagem.
    //: getYear(): retorna o ano, os últimos dois números do ano. Por exemplo, para o 2006 retorna 06. Este método está obsoleto em Netscape a partir da versão 1.3 de Javascript e agora se utiliza getFullYear().
    //: getFullYear(): retorna o ano com todos os dígitos. Funciona com datas posteriores ao ano 2000.
    //: setDate(d): atualiza o dia do mês.
    //: setHours(h): atualiza a hora.
    //: setMinutes(m): muda os minutos.
    //: setMonth(m): muda o mês (atenção ao mês que começa por 0).
    //: setSeconds(s): muda os segundos.
    //: setTime(t): atualiza a data completa. Recebe um número de segundos desde 1 de janeiro de 1970.
    //: setYear(y): Muda o ano, recebe um número, ao que lhe soma 1900 antes de colocá//:lo como ano data. Por exemplo, se receber 95 colocará o ano 1995. Este método está obsoleto a partir de Javascript 1.3 em Netscape. Agora se utiliza setFullYear(), indicando o ano com todos os dígitos.
    //: setFullYear(): muda o ano da data ao número que recebe por parâmetro. O número se indica completo ex: 2005 ou 1995. Utilizar este método para estar certo de que tudo funciona para datas posteriores a 2000.
    //: getimezoneOffset(): Devolva a diferença entre a hora local e a hora GMT (Greenwich, UK Mean Time) sob a forma de um inteiro representando o número de minutos (e não em horas).
    //: toGMTString(): devolva o valor do atual em hora GMT (Greenwich Mean Time)
    /// http://www.linhadecodigo.com.br/artigo/1003/entendendo-o-objeto-date-do-javascript.aspx#ixzz8rO7S7p6a
};

const adicionaEmHtml = () => {
    const html = "<p>Adicionando HTML</p>";
    $("#teste").innerHTML = html;
    $("#teste").insertAdjacentHTML("beforeend", html);

    //: 'beforebegin': Insere o HTML antes do elemento de referência.
    //: 'afterbegin': Insere o HTML dentro do elemento de referência, mas no início.
    //: 'beforeend': Insere o HTML dentro do elemento de referência, mas no final.
    //: 'afterend': Insere o HTML depois do elemento de referência.
};

const examples = {
    string: {
        // verifica se existe "Blue" na variavel
        result_indexOf() {
            console.log("Blue Whale".indexOf("Blue") !== -1);
        },
        // verifica se existe "Blue" na variavel
        result_includes() {
            console.log("Blue Whale".includes("Blue"));
        },
        // pega o 3 caractere
        result_charAt() {
            console.log("mariadasilva".charAt(2));
        },
        // pega a posição do ultimo "a"
        result_lastIndexOf() {
            console.log("mariadasilva".lastIndexOf("a"));
        },
        // pega a posição entre o 4 caractere até o 7
        result_slice() {
            console.log("mariadasilva".slice(4, 8));
        },
        // pega a posição até o ultimo "."
        result_slice() {
            cl("www.teste.com.br".slice(0, "www.teste.com.br".lastIndexOf(".")));
        },
        // pega a posição do ultimo "." em diante
        result_slice() {
            cl("www.teste.com.br".slice("www.teste.com.br".lastIndexOf(".")));
        },
        // troca todas as letras "a" por "B"
        result_replace() {
            console.log("mariadasilva".replace(/[a]+/g, "B")); //TROCA TODOS "A" POR "B"
            console.log("mariadasilva".replace(/[^a-zA-Z0-9@#_]/g, "")); //TIRA TUDO MENOS: "a-z", "A-Z", "0-9", "@", "#", "_"
        },
        // remove todo espaço em branco
        result_replace() {
            console.log("remove todos    os espaços".replace(/\s/g, ""));
        },
        // retorna valor 3
        result_parseInt() {
            console.log(parseInt("3.99999more non-digit characters"));
        },
        // retorna valor 3.1479
        result_parseFloat() {
            console.log(parseFloat("3.1479more non-digit characters"));
        },
        // retorna string "3.15"
        result_toFixed() {
            console.log((3.1479).toFixed(2));
        },
        // retorna string "005", "XXXXA"
        result_padStart() {
            console.log("5".padStart(3, "0"));
            console.log("A".padStart(5, "X"));
        },
    },

    array: {
        remove_valor_da_array() {
            //:Resultado em uma nova array
            const array1 = ["1", "2", "7", "6"];
            const novaArray = array1.filter((item) => item !== "7");

            //:Resultado na própria array
            const array2 = ["1", "2", "7", "6"];
            const index = array2.indexOf(7);
            if (index > -1) array2.splice(index, 1);
        },
        remove_vazio() {
            result = ["1", "", "2", "3", "", "4"].filter((i) => i);
            // retorna ['1', '2', '3', '4']
        },
        result_join() {
            minhaArray = [10, 15, 20, 30];
            console.log(minhaArray.join("-"));
            // retorna "10-15-20-30"
        },
        result_split() {
            string = "Amo minha mãe";
            resultado = string.split(" ");
            console.log(resultado[1]);
            // retorna "minha";
            console.log(resultado[2]);
            // retorna "mãe";
        },
        result_includes() {
            minhaArray = [10, 15, 20, 30];
            console.log(minhaArray.includes(20));
            // retorna true
        },
        result_indexOf() {
            minhaArray = [10, 15, 20, 30];
            console.log(minhaArray.indexOf(20));
            // retorna 2
        },
        result_concat() {
            minhaArray = [10, 15, 20, 30];
            outraArray = [35, 40];
            console.log(minhaArray.concat(outraArray));
            // retorna [10, 15, 20, 30, 35, 40]
        },
        result_push() {
            minhaArray = [10, 15, 20, 30];
            minhaArray.push(99, 100);
            console.log(minhaArray);
            // retorna [10, 15, 20, 30, 99, 100]
        },
        result_splice() {
            const minhaArray = [10, 15, 33, 30, 39, 40, 50];

            minhaArray.splice(2, 1);
            console.log(minhaArray);
            // retorna [10, 15, 30, 39, 40, 50];

            minhaArray.splice(2, 3);
            console.log(minhaArray);
            // retorna [10, 15, 40, 50]

            minhaArray.splice(2, 0, 20, 21, 22, 23);
            console.log(minhaArray);
            // retorna [10, 15, 20, 21, 22, 23, 33, 30, 39, 40, 50];
        },
        result_pop() {
            minhaArray = [10, 15, 20, 30];
            valorPop = minhaArray.pop();
            console.log(minhaArray);
            console.log(valorPop);
            // remove o ultimo valor do array
        },
        remove_repeated_value_in_array() {
            let array = [1, 2, 3, 3, 3, 4, 1];
            let result = [...new Set(array)];
            console.log(result);
        },
        ordena_array() {
            let result = [5, 2, 4, 3, 1].sort();
            cl(result);
        },
        busca_key_onde_contem_o_valor() {
            const array = [
                { id: 1, name: "Carlos" },
                { id: 2, name: "Maria" },
                { id: 3, name: "Paulo" },
                { id: 4, name: "Marcos" },
            ];

            const key = array.findIndex((el) => el.name == "Paulo");
            cl(array[key]);
        },
    },

    obj: {
        passa_objeto_para_array() {
            obj = { id1: "id numero 1", id2: "id numero 2", id3: "id numero 3", id4: "id numero 4", id5: "id numero 5" };

            const array = Object.entries(obj);
        },

        keys_e_values() {
            const carro = {
                marca: "Toyota",
                modelo: "Corolla",
                ano: 2023,
                cor: "Prata",
            };

            const chaves = Object.keys(carro); //:Saída: ["marca", "modelo", "ano", "cor"]
            const valores = Object.values(carro); //:Saída: ["Toyota", "Corolla", 2023, "Prata"],
        },
    },
};

//: exemplo.funcao?.(); EXECUTA A FUNÇÃO SOMENTE SE EXISTIR
//: const valor = exemplo.array?.[0]; ACESSA O VALOR SOMENTE SE EXISTIR
//: const valor = exemplo.obj?.chave; ACESSA O VALOR SOMENTE SE EXISTIR
//: await new Promise((resolve) => setTimeout(resolve, 500)); PAUSA DE 500 MILISSEGUNDOS
//: console.log(Date.now()); NUMERO UNICO
//: console.log(Array.from(listNode).map((input) => input.value.trim())); PASSA UMA LISTA DE NÓS PARA ARRAY
//: window.location.href = `${baseURL}tools/images`;
//: window.open(`${baseURL}tools/images`);
//: location.reload();
//: window.history.back(); VOLTA TELA
//: var newURL =
//:   window.location.protocol + "//" +
//:   window.location.host + "/" +
//:   window.location.pathname;
//: result = umaArray.filter(i => i); REMOVE CAMPOS VAZIOS DA ARRAY
//: if ($("div#elemento").length) {alert('elemento já existe')}
//: if ($._data($("#elemento")[0], "events")) {alert('já existe evento para esse elemento')}
//: e.parentNode.dataset.id
//: string.replace(/[A]/g, 'B')
//: x = x || 2 (false: 'NULL' e 'undefined')
//: x = x ?? 2 (false: 0, '', 'NULL' e 'undefined')
//: document.write("Irá imprimir no navegador");
//: x = prompt("Digite algo:"); INPUT + OK/CANCELAR
//: x = confirm("Você confirma?"); OK/CANCELAR
//: alert("Mensagem enviada!"); OK
//: let respostaDoAjaxVindoDaFuncaoDeleteData = deleteData().responseJSON.endereco;
//: event.stopPropagation(); PARA A PROPAGAÇÃO DE EVENTO FILHO PARA EVENTO PAI
