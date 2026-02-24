const baseURL = location.hostname == "localhost" ? `http://localhost/wauclinic/public/` : `https://${location.hostname}/`;
const jsURL = `${baseURL}assets/js/`;

if (window.innerWidth < 1000) {
    if (!window.location.href.includes("pass-recover")) {
        window.location.href = `${baseURL}mensagem/apenas-desktop`;
    }
}

const dw = document.write.bind(document);
const cl = console.log.bind(console);
const ce = console.error.bind(console);
const cd = console.dir.bind(console);
const ca = console.assert.bind(console);
const ct = console.table.bind(console);
const cn = console.warn.bind(console);

//:GLOBAIS
const $m = {}; //:Módulos
const g = varJS; //:Mix
g.consoleOn = 1;
g.debugger = 0;
g.week = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
delete window.varJS;

const cookie = {
    get(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                let result = c.substring(name.length, c.length);
                return decodeURIComponent(result).replace(/[+]+/g, " "); //REMOVE CARACTERES ESPECIAIS
            }
        }
        return "";
    },

    set(cname, cvalue, exdays, path = "") {
        var d = new Date();
        var exdays = exdays ? exdays : 365;
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/" + path;
    },

    del(cname) {
        var d = new Date();
        d.setTime(d.getTime() + -1 * 24 * 60 * 60 * 1000);
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + "xxx" + ";" + expires + ";path=/";
    },

    delAll() {
        var c = document.cookie.split("; ");
        for (i in c) document.cookie = /^[^=]+/.exec(c[i])[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    },
};

//:HTML LOADED
document.addEventListener("DOMContentLoaded", async () => {
    $sessionExpiration();

    if (g.localhost == undefined) {
        return alert('ATENÇÃO: Informação de "localhost" não definido.\n\nComunique o suporte imediatamente!');
    }
    ls.init(g.localhost);

    cookie.set("screenSize", `${window.innerWidth}x${window.innerHeight}`);

    //:Inicializa tooltip
    // setTimeout(() => $tooltipActivate("section"), 1500);

    //:Seta nome do usuário
    const userNode = $("#sidebar .user-box h6.user");
    if (userNode) {
        const userName = cookie.get("log_userName");
        if (userName.length > 10) {
            userNode.style.fontSize = "14px";
        }
        userNode.textContent = userName;
    }

    //:Seta nome da clínica
    const clinicNode = $("#sidebar .clinic-box h6.clinic");
    if (clinicNode) {
        const clinicName = cookie.get("log_clinicName");
        if (clinicName.length > 20) {
            clinicNode.style.fontSize = "14px";
        }
        clinicNode.textContent = clinicName;
    }

    $sessionExpirationLooping.init();
});

/**
 * @param {node|string} selector
 * @param {string} selector2
 * @returns {node}
 */
const $ = (selector, selector2 = false) => {
    //:Se "selector" for node
    if (selector.nodeType) {
        if (!selector2) return selector; //:Se "selector2" for false retorna o node

        return selector.querySelector(selector2); //:Retorna o objeto do "selector2"
    }

    //:Se for mais de um seletor
    if (selector.includes(",")) return document.querySelectorAll(selector);

    //:Retorna padrão
    return document.querySelector(selector);
};

const $$ = (selector, selector2 = false) => {
    //:Se "selector" for node
    if (selector.nodeType) {
        if (!selector2) return selector; //:Se "selector2" for false retorna o node

        return selector.querySelectorAll(selector2); //:Retorna o objeto do "selector2"
    }

    if (!selector) return [];
    return document.querySelectorAll(selector);
};

/**
 * document.getElementById(selector)
 *
 * @param {string} selector
 * @returns Node
 */
const $i = (selector) => {
    return document.getElementById(selector);
};

/**
 * busca elemento pelo atributo [name]
 *
 * @param {string} selector
 * @returns Node
 */
const $n = (selector, selector2 = false) => {
    //:Se "selector" for node
    if (selector.nodeType) {
        if (!selector2) return false; //:Se "selector2" for false retorna false

        return selector.querySelector(`[name=${selector2}`); //:Retorna o objeto do "selector2"
    }

    const split = selector.split(",");
    const sel = split[1] ? `${split[0].trim()} [name=${split[1].trim()}]` : `[name=${split[0].trim()}]`;

    return document.querySelector(sel);
};

/**
 * busca elemento pelo atributo [name]
 *
 * @param {string} selector
 * @returns Node
 */
const $d = (selector, dataset, value) => {
    if (selector.nodeType) return selector.querySelector(`[data-${dataset}="${value}"]`);

    return document.querySelector(`${selector} [data-${dataset}="${value}"]`);
};

const $w = (element = false, selector) => {
    if (element) {
        return element.querySelector(`[wau=${selector}]`);
    } else {
        return document.querySelector(`[wau=${selector}]`);
    }
};

/**
 * busca elemento pelo atributo [js]
 *
 * @param {string} selector
 * @returns Node
 */
const $j = (data) => {
    const split = data.split(",");
    const selector = split[1] ? `${split[0].trim()} [js=${split[1].trim()}]` : `[js=${split[0].trim()}]`;

    return document.querySelector(selector);
};

//:Looping de 1 em 1 minuto para verificar a expiração da sessão
const $sessionExpirationLooping = {
    check() {
        cl("check");
        $sessionExpiration();
    },

    init() {
        setInterval(() => {
            this.check();
        }, 60000);
    },
};

//* * * * * * * * * * * * * * * * * * * *
//* HELPERS ESPECÍFICOS P/ ESSE SISTEMA
//* * * * * * * * * * * * * * * * * * * *

//* * * * * * * * * * * * * * * * * * * *
//* MENSAGENS
//* * * * * * * * * * * * * * * * * * * *

/** //:PEGA OU SETA O ID DO PACIENTE DE USO GLOBAL
 *
 * @param {*} idForSet - Novo valor a ser setado como id
 * @returns - Retorna o id do paciente
 */
function $patientId(idForSet = false) {
    if (!$isEmpty(idForSet)) ls.set("patientId", idForSet, "patient");

    return ls.get("patient").patientId;
}

/** //:DIVIDE UMA STRING DE SELECTORS E RETORNA UMA LISTA DE NODES
 *
 * @param {string} selectors
 * @returns {array} lista de nodes
 */
function $splitSelectors(selectors) {
    return selectors
        .split(",")
        .map((s) => document.querySelector(s.trim()))
        .filter(Boolean);
}

const $displayId = (idDisplay, idTable, displayIdNode = false) => {
    const id = idDisplay ? idDisplay.split("-")[0] : 0;
    const idClinic = idDisplay ? idDisplay.split("-")[1] : 0;
    displayIdNode ||= $j(`#${ls.menuTop}, displayId`);
    displayIdNode.value = id === "new" ? "Novo" : +id > 0 ? id : "";

    if (g.devmodeOn) {
        displayIdNode.title = `Id = ${idTable} - Cli = ${idClinic}`;
    }
};

/** //:ORDENA ARRAY CONFORME A SEQUENCIA INFORMADA
 *
 * @param {array} arr array de objetos a ser ordenado
 * @param {string} sequence sequência de ids separados por ";"
 * @param {string} key chave do objeto que contém o id, padrão "id"
 * @return {array} array ordenado conforme a sequência informada
 *
 * / ex: arr = [ {id:1, name:'maria'}, {id:2, name:'joão'}, {id:3, name:'ana'}, {id:4, name:'carlos'} ]
 * / ex: sequence = '3,1,2'
 */
function $sortArrayBySequence(arr, sequence, key = "id") {
    sequence = sequence.split(";") || [];

    return [
        //:primeiro os que estão na sequence
        ...sequence.map((seqId) => arr.find((item) => item[key] === seqId)).filter(Boolean),
        //:depois os que não estão na sequence
        ...arr.filter((item) => !sequence.includes(item[key])).sort((a, b) => a[key].localeCompare(b[key])),
    ];
}

/** //:CONVERTE ARRAY DE NÚMEROS EM STRING ORDENADA
 *
 * @param {array|string} arr - Array de números ou string com números separados por "separator"
 * @param {string} separator - Separador utilizado na string (padrão: ",")
 * @param {boolean} startAndEndeComma - Se true, adiciona o separador no início e no fim da string resultante (padrão: true)
 * @returns {string} - String com os números ordenados e separados por "separator"
 */
function $arrayToString(arr, separator = ",", startAndEndeComma = true) {
    //:Se não for array -> converte p/ array
    if (!Array.isArray(arr)) arr = arr.split(separator);
    arr = arr.filter((i) => i);

    //:Converte p/ numeros e ordena
    const arrayNumerico = arr
        .map((str) => parseInt(str, 10))
        .filter((num) => !isNaN(num))
        .sort((a, b) => a - b);

    //:Adiciona vírgula no início e no fim se solicitado (startAndEndeComma = true)
    startAndEndeComma = startAndEndeComma ? separator : "";

    //:junta novamente em string
    const idsOrdenados = startAndEndeComma + arrayNumerico.join(",") + startAndEndeComma;

    return idsOrdenados;
}

/** //:VERIFICA SE EXISTE PALAVRA NA STRING
 * @param {string} str palavras separadas por virgula, ex: 'maria,sabonete,parafuso'
 * @param {string} find palavra a ser buscada, ex: 'sabonete'
 */
const $existIn = (str, find) => {
    if (!str || !find) return false;

    return str.toString().split(",").includes(find.toString());
};

/** //:PEGA MEDIDAS DE UM OBJETO OCULTO
 * @param {string} selector
 */
const $ocutObjectMeasurements = (selector) => {
    const el = $(selector);
    el.style.opacity = "0";
    el.style.display = "block";

    const result = el.getBoundingClientRect();

    el.style.display = "none";
    el.style.opacity = "1";

    return result;
};

/** //:FAZ UM CONTROL-C
 * @param {mix} value - valor a ser copiado
 */
const $setClipboard = async (value) => {
    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch (err) {
        console.error("Erro ao copiar:", err);
        return false;
    }
};

/** //:HELPER DE VALIDAÇÃO
 * @param {*} check
 * @param {*} msg
 * @param {*} opt
 * @returns
 */
const $validate = (check, msg = false, opt = "") => {
    let data, len, Alert;
    check = typeof check === "string" ? check.trim() : check;
    opt = `,${opt},`;
    if (opt.includes("alert")) {
        Alert = 1;
        opt = opt.replace("alert", "");
        if (!msg.replace("*", "")) alert("Alerta solicitado sem mensagem!");
    }

    if (check && opt.includes("null")) {
        //:SE NÃO FOR VAZIO
        data = msgHelp("*duplicado", "");
    } else if (!check && opt.includes("true")) {
        //:SE NÃO FOR VERDADEIRO
        data = msgHelp(`*${msg}`, "");
    } else if (check && opt.includes("false")) {
        //:SE NÃO FOR FALSO
        data = msgHelp(`*${msg}`, "");
    } else if (!check && opt == ",,") {
        //:SE FOR VAZIO
        data = msgHelp(msg, `O campo "${msg}" deve estar preenchido.`);
    } else if (+check == 0 && !opt.includes("zero")) {
        //:SE VALOR FOR "0"
        data = msgHelp(msg, `O campo "${msg}" não pode ser zero.`);
    } else if (opt.includes("cpf")) {
        //:SE CPF INCORRETO
        if (!$m.checkCpf(check)) {
            data = msgHelp(msg, `CPF inválido.`);
        }
    } else if (opt.includes("cel")) {
        //:SE CELULAR INCORRETO
        if (check.length != 13) {
            data = msgHelp(msg, `O campo "${msg}" deve estar preenchido corretamente.`);
        }
    } else if (opt.includes("len")) {
        //:SE TAMANHO INCORRETO
        len = +$valueHelp(opt, "len");
        if (check.length < len) {
            data = msgHelp(msg, `O campo "${msg}" deve ter ${len} caracteres.`);
        }
    }

    // RETORNA SE HOUVE ERRO: true=teve erro | false=não teve erro
    if (data) {
        cl(data);
        if (Alert) alert(data);
        return true;
    }

    return false;

    function msgHelp(msg, template) {
        if (!msg || msg == "*") {
            return true;
        } else if (msg.includes("*")) {
            return msg.replace(/[*]+/g, "");
        }

        return template;
    }
};

/** //:RETORNA STRING COM UM TOTAL DE CARACTERES A FRENTE
 * @param {string|int} str Variavel a ser alterada
 * @param {int} totalLength Quantidade total de caracteres
 * @param {string} padChar Caracter p/ preenchimento na frente
 * @returns ex: 00000000005
 */
const $padWithZeros = (str, totalLength = 11, padChar = "0") => {
    return str.padStart(totalLength, padChar);
};

/** //:VERIFICA SE ELEMENTO ESTÁ VAZIO
 * @param {*} val
 * @returns {true|false}
 */
const $isEmpty = (val) => {
    //:null, undefined, false, 0, '', [], NaN
    if (!val) return true;

    //:objeto vazio
    if (typeof val === "object" && !Array.isArray(val)) {
        return Object.keys(val).length === 0;
    }

    //:array vazia
    if (Array.isArray(val)) {
        return Object.keys(val).length === 0;
    }

    return false;
};

//:SINALIZA INPUTs COM PREENCHIMENTO OBGRIGATORIO "required"
const $requiredMark = {
    on: getComputedStyle(document.documentElement).getPropertyValue("--input-borderRequired"),
    off: "",

    /** //:Marca todos os elementos "required" que não tiverem valor
     *
     * @param {string} selector
     */
    set(selector, unsetFirst = false) {
        const father = typeof selector === "string" ? document.querySelector(selector) : selector;
        let firstRequired = false;

        //:Se solicitado, desmarca todos os elementos "required" antes de marcar
        if (unsetFirst) this.unset(father);

        const list = father.querySelectorAll("[required]");
        list.forEach((el) => {
            if (!el.value && el.required) {
                el.style.borderColor = $requiredMark.on;

                if (!firstRequired) firstRequired = el;
            }
        });

        return firstRequired;
    },

    /** //:Desmarca todos os elementos "required"
     *
     * @param {string} selector
     */
    unset(selector) {
        const father = typeof selector === "string" ? document.querySelector(selector) : selector;

        const list = father.querySelectorAll("[required]");
        list.forEach((el) => {
            if (el.required) el.style.borderColor = $requiredMark.off;
        });
    },

    /** //:Marca ou desmarca o elemento "el" conforme o valor "val"
     *
     * @param {node} el elemento a ser alterado
     * @param {number|string} val valor a ser verificado
     */
    toggle(el, val) {
        el.style.borderColor = $requiredMark[val ? "off" : "on"];
    },
};

/** //:ABRE MODAL
 * @param {string} selector
 */
const $modalOpen = (selector) => {
    const modalInstance = bootstrap.Modal.getOrCreateInstance($(selector));
    modalInstance.show();

    // const meuModal = new bootstrap.Modal(document.getElementById(modalId));
    // meuModal.show();
};

/** //:FECHA MODAL
 * @param {string} selector
 */
const $modalClose = (selector) => {
    const modalInstance = bootstrap.Modal.getOrCreateInstance($(selector));
    modalInstance.hide();
};

/** //:ABRE, FECHA OU ALTERNA UM COLLAPSE
 *
 * @param {string|Node} selector - Seletor CSS ou elemento DOM
 */
const $collapse = {
    show: (selector) => {
        //:Exibe o collapse correspondente ao seletor
        const instance = $collapse._getInstance(selector);
        instance.show();
    },

    hide: (selector) => {
        //:Oculta o collapse correspondente ao seletor
        const instance = $collapse._getInstance(selector);
        instance.hide();
    },

    toggle: (selector) => {
        //:Alterna o estado do collapse correspondente ao seletor
        const instance = $collapse._getInstance(selector);
        instance.toggle();
    },

    _getInstance: (selector) => {
        //:Retorna a instância do Bootstrap Collapse para o seletor informado
        const element = typeof selector === "string" ? document.querySelector(selector) : selector;
        return new bootstrap.Collapse(element, { toggle: false });
    },
};

/** //:ATIVA TOOLTIP
 * @param {string} father se for false ativa em todo o documento
 */
const $tooltipActivate = (father = false) => {
    const selector = father ? `${father} [data-bs-toggle="tooltip"]` : '[data-bs-toggle="tooltip"]';
    const tooltipTriggerList = document.querySelectorAll(selector);
    [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
};

/** //:MENSAGEM VIA TOAST BOOTSTRAP
 *
 * @param {string} text - Texto da toast (para quebra de linha use "|")
 * @param {string} color - Cor da toast (success, warning, danger, etc)
 */
const $toast = (text, color) => {
    const father = $(".toast-container");
    const toast = bootstrap.Toast.getOrCreateInstance($(father, "div"));
    const classRemoveList = ["success", "warning", "danger"];
    classRemoveList.forEach((cls) => father.classList.remove(cls));

    //:Elemanto pai
    const position = "bottom-0 end-0 p-3";
    const fatherClass = color ? `${position} ${color}` : `${position} success`;
    father.classList.add(...fatherClass.split(" "));

    //:Define se a mensagem terá duas linhas
    text = text.split("|");
    const txt1 = text[0] || "";
    const txt2 = text[1] ? `<br>${text[1]}` : "";
    //:Inserir mensagem
    $(father, ".toast-body").innerHTML = `${txt1}${txt2}` || "";

    toast.show();
};

/** //:MODAL DE MENSAGEM
 * @param {object} opt
 */
const $messageModal = (opt = {}) => {
    //:Configurações Padrão (Destructuring com defaults)
    const {
        color = "primary",
        title = cookie.get("log_clinicName"),
        text1 = "",
        text1Color = "#2e2e2eff",
        text2 = "",
        text2Color = "#2e2e2eff",
        html = "",
        btn: buttons = [], //.Renomeando para buttons e garantindo array vazio
        btnWidth = "120px",
        callback = null,
        timer = 4000,
    } = opt;

    const modalEl = document.querySelector("#messageModal");

    //:Cache de seletores (Evita buscar no DOM repetidamente)
    const ui = {
        header: modalEl.querySelector(".modal-header"),
        title: modalEl.querySelector(".modal-title"),
        h1: modalEl.querySelector(".modal-header h1"),
        text1: modalEl.querySelector(".text1"),
        text2: modalEl.querySelector(".text2"),
        htmlContainer: modalEl.querySelector(".html"),
        footer: modalEl.querySelector(".modal-footer"),
    };

    //:Mapa de Cores (Configuração separada da lógica)
    const styleMap = {
        primary: { bg: "#0d6dfdad", text: "#fff" },
        warning: { bg: "#ffc107bb", text: "#282828ff" },
        danger: { bg: "#ff00009d", text: "#fff" },
        //:Fallback
        default: { bg: "#0d6dfdad", text: "#fff" },
    };

    const currentStyle = styleMap[color] || styleMap.default;

    //:Aplicação de Estilos e Conteúdo
    ui.header.style.backgroundColor = currentStyle.bg;
    if (ui.h1) ui.h1.style.color = currentStyle.text;

    ui.title.textContent = title;

    //:Tratamento de exibição condicional (Display vs Visibility)
    ui.text1.innerHTML = text1;
    ui.text1.style.display = text1 ? "block" : "none";
    ui.text1.style.color = text1Color;
    ui.text1.style.marginBottom = text2 ? "0" : "20px";

    ui.text2.innerHTML = text2;
    ui.text2.style.display = text2 ? "block" : "none";
    ui.text2.style.color = text2Color;
    ui.text2.style.marginTop = text2 ? "20px" : "0";

    ui.htmlContainer.innerHTML = html;

    //:Renderização dos Botões (Sem Event Delegation Global)
    ui.footer.innerHTML = ""; //.Limpa botões antigos

    buttons.forEach((btnConfig) => {
        const btnElement = document.createElement("button");
        btnElement.textContent = btnConfig.text;
        btnElement.className = `btn btn-${btnConfig.color}`;
        btnElement.style.width = btnWidth;
        btnElement.setAttribute("data-bs-dismiss", "modal"); //.Mantém comportamento do Bootstrap

        //:Adiciona evento direto ao elemento (Closure segura)
        btnElement.onclick = () => {
            if (typeof callback === "function") {
                callback(btnConfig.dataset);
            }
        };

        ui.footer.appendChild(btnElement);
    });

    //:Abre o Modal
    $modalOpen("#messageModal");

    //:Gerenciamento do Timer (Resetando timer anterior se existir)
    //:Armazena o timer no próprio elemento DOM para evitar variáveis globais
    if (modalEl._autoCloseTimer) clearTimeout(modalEl._autoCloseTimer);

    if (timer !== 0 && timer !== false) {
        modalEl._autoCloseTimer = setTimeout(() => {
            $modalClose("#messageModal");
        }, timer);

        // Cancelar timer ao interagir
        const cancelTimer = () => {
            clearTimeout(modalEl._autoCloseTimer);
            modalEl.removeEventListener("click", cancelTimer); // Limpeza
        };
        modalEl.addEventListener("click", cancelTimer);
    }
};

/** //:DESTAQUE PISCANTE EM BOTÕES
 *
 * @param {string} selectors - Seletores dos elementos a serem destacados
 * @param {number} flashes - Número de piscadas
 * @param {number} flashDuration - Duração de cada piscada em milissegundos
 * @param {number} highlightDuration - Duração do último destaque em milissegundos
 */
function $destackButtons(selectors, flashes = 3, flashDuration = 250, highlightDuration = 1000) {
    if (!selectors) return;

    const elementList = $splitSelectors(selectors);
    const flashInterval = setInterval(toggleFlash, flashDuration);
    const totalFlashes = flashes * 2 - 1;
    let flashCounter = 0;

    //:Função principal para alternância da classe de destaque
    function toggleFlash() {
        updateClass();

        //:Após piscar totalFlashes vezes, limpa o intervalo e remove a classe após highlightDuration
        if (flashCounter++ >= totalFlashes) {
            clearInterval(flashInterval);

            //:Se houver tempo para manter o último destaque
            if (highlightDuration) {
                updateClass("add");

                //:Se highlightDuration for menor que 9000ms, remove a classe "destack" após esse tempo
                //:Caso contrário, mantém o destaque ativo
                if (highlightDuration < 9000) {
                    setTimeout(() => updateClass("remove"), highlightDuration);
                }
            }
        }

        //:Alterna, adiciona ou remove a classe 'destack' em cada elemento
        function updateClass(action = "toggle") {
            elementList.forEach((element) => element.classList[action]("destack"));
        }
    }
}

/** //:BLOQUEIA UM FORMULARIO USANDO CRITÉRIOS: "form sem dados" e "login sem permissão"
 *
 * @param {string} formSelector - Seletor do elemento de formulário a ser bloqueado
 * @param {string|array} buttonsSelectors - Seletor(es) dos botões que devem piscar
 * @param {*} value - Se valor for vazio|zero|false, bloqueia o formulário
 * @param {int|array} permission - Não boqueia para quem tem essa permissão
 */
function $disableForm(formSelector, buttonsSelectors = false, value, permission = false) {
    const isValueEmpty = value === false ? false : $isEmpty(value);
    const hasNewPermission = permission === false ? true : $permission(permission, 0);
    const shouldDisable = isValueEmpty || !hasNewPermission;

    //:Desativa ou ativa o formulário
    $(formSelector).classList.toggle("disabled", shouldDisable);

    //:Sai se o formulário estiver ativado
    if (!shouldDisable) return;

    //:Sai se o formulário não estiver vazio
    if (!isValueEmpty) return;

    //:Botões pistantes
    $destackButtons(buttonsSelectors);
}

/** //:ELIMINAÇÃO DE REPETIÇÕES RÁPIDAS
 * @param {function} fn função que será executada
 * @param {int} delay tempo em milissegundos para aguardar antes de executar a função novamente
 */
const $debounce = (fn, delay = 300) => {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
};

/** //:MODULO DE BUSCA */
const $findModule = {
    data: [],
    debounce: $debounce(async (url, inputFind, parameter) => {
        $findModule.data = await $fetch({
            url: url,
            par: {
                find: inputFind,
                parameter: parameter,
            },
            fnName: "BUSCA #502",
            overlay: false,
            consoleOn: false,
        });

        $findModule.render();
    }, 300),

    start: async function () {
        this.inputFind.value = "";
        this.tbody.innerHTML = "";
        this.getList();

        //:Abre modal
        $modalOpen("#modalFind");
        setTimeout(() => this.inputFind.focus(), 500);
    },

    getList: async function () {
        const parameter = this.parameter ?? "";
        this.debounce(this.url, this.inputFind.value, parameter);
    },

    render() {
        const tpt = this.data.list
            .map(({ id, col2, col3 }, index) => {
                const display2 = this.columnsQuantity > 2 ? "" : "d-none";

                return `
                <tr class="click" data-row="${index}" data-id="${id}" data-col2="${col2}" data-col3="${col3}">
                    <td>${id}</td>
                    <td class="link_td pointer">${col2}</td>
                    <td class="link_td pointer ${display2}">${col3}</td>
                </tr>`;
            })
            .join("");

        this.tbody.innerHTML = tpt;
    },

    btnSearchMain() {
        const active = +cookie.get("mainClinicActive");
        cookie.set("mainClinicActive", active ? 0 : 1);

        this.getList();
    },

    clickLink(event) {
        const trTag = event.target.closest("tr");

        this.callbackExit = false;
        this.exit();

        this.callback({
            id: trTag.dataset.id,
            col2: trTag.dataset.col2,
            col3: trTag.dataset.col3,
            data: this.data.list[trTag.dataset.row],
        });
    },

    exit() {
        if (this.callbackExit) this.callback("exit");
        $modalClose("#modalFind");
    },

    events(event) {
        //:Keyup em input
        if (event.type === "keyup" && event.target.closest(".inputFind")) return this.getList();

        if (event.target.closest(".click")) return this.clickLink(event);
        if (event.target.closest(".exit")) return this.exit();
        if (event.target.closest(".bnt-SearchMain")) return this.btnSearchMain();
        if (event.target.closest(".btn1")) return this.clickLink("btn1");
        if (event.target.closest(".btn2")) return this.clickLink("btn2");
    },

    init(data) {
        this.tbody = $("#modalFind tbody");
        this.inputFind = $("#modalFind .inputFind");
        this.columnsQuantity = data.columnsQuantity ?? 3; //:Quantidade de colunas

        this.url = `${data.urn}`;
        this.callback = data.callback;
        this.callbackExit = data.callbackExit ? "exit" : false; //:Retorna data="exit" se estiver ativo
        this.parameter = data.parameter ?? {};
        this.zIndex = 30;
        this.btn1 = data.btn1 ?? "";

        $("#modalFind .modal-content").style.minWidth = data.width;
        $("#modalFind .modal-title").textContent = data.title;
        $("#modalFind .inputFind").placeholder = data.placeholder || "Digite o termo de busca";
        $("#modalFind .col2").textContent = data.tptTexts.col2;

        this.start();
    },

    makeEvent: (() => {
        ["keyup", "click"].forEach((evt) => $("#modalFind").addEventListener(evt, (event) => $findModule.events(event)));
    })(),
};

//:BUSCA CLÍNICA
function $findClinic(callback) {
    $findModule.init({
        urn: "calendarLibraries/find_clinic",
        title: "Busca Clínica",
        tptTexts: { col2: "Clinica" },
        columnsQuantity: 2,
        width: "500px",
        callback,
    });
}

//:BUSCA PROFISSIONAL
function $findProf(callback, parameter) {
    $findModule.init({
        urn: "calendar/libraries/find_prof/find",
        title: "Busca Profissional",
        tptTexts: { col2: "Profissional" },
        columnsQuantity: 2,
        width: "500px",
        parameter,
        callback,
    });
}

//:BUSCA PACIENTE
function $findPatient(callback) {
    if (!$permission("140P")) return;

    $findModule.init({
        urn: "patientLibraries/find_patient",
        title: "Busca Paciente",
        tptTexts: { col2: "Paciente" },
        columnsQuantity: 2,
        width: "500px",
        callback,
    });
}

//:BUSCA PROCEDIMENTO
function $findProcedure(callback) {
    if (!$permission("140P")) return;

    $findModule.init({
        urn: "procedure/find_procedure",
        title: "Busca Profissional",
        tptTexts: { col2: "Profissional" },
        columnsQuantity: 2,
        width: "500px",
        parameter: { allProfs: true },
        callback,
    });
}

const $check = {
    /** ///Checa se é "readOnly" ou "disabled"
     * @param {object} target
     * @returns {true|false}
     */
    ch1(target) {
        return target.readOnly == true || target.disabled == true ? true : false;
    },

    /** ///Valida tecla precionada (control, shift, etc.)
     * @param {object} event
     * @returns {true|false}
     */
    ch2(event) {
        if (",Control,Shift,CapsLock,Alt,AltGraph,Escape,".includes(`,${event.key},`)) return true; //:Botões
        if (event.ctrlKey && event.key.toLowerCase() != "v") return true; //:Se não for Control+v

        return false;
    },

    /** ///Checa se Input ou Textarea foi alterada
     * @param {object} event
     * @returns {true|false}
     */
    ch3(event) {
        return "input,textarea,select".includes(event.target.localName) && "keyup,change,click".includes(event.type)
            ? true
            : false;
    },
};

/** //:CALCULADORA ACEITANDO NUMERO OU STRING NA ENTRADA
 * @param {any} val1
 * @param {any} val2
 * @param {string} action | + | - | * | / | % | %+ | %-
 * @param {boolean} returnAsNumber false=string | true=numero
 * @returns {string|number}
 */
const $calculator = (val1, val2, action, returnAsNumber = false) => {
    val1 = $numberOnly(val1);
    val2 = $numberOnly(val2);
    let resp = 0;
    let pc = 0;

    if (action === "/" && val2 === 0) return "Erro: Não é possível dividir por zero.";

    switch (action) {
        case "+":
            resp = val1 + val2;
            break;
        case "-":
            resp = val1 - val2;
            break;
        case "*":
            resp = val1 * val2;
            break;
        case "/":
            resp = val1 / val2;
            break;
        case "%":
            resp = (val1 * val2) / 100;
            break;
        case "%+":
            pc = (val1 * val2) / 100;
            resp = val1 + pc;
            break;
        case "%-":
            pc = (val1 * val2) / 100;
            resp = val1 - pc;
            break;
        default:
            return "Sinal inválido. Use '+', '-', '*' ou '/'.";
    }

    return returnAsNumber ? resp : $valFormat(resp);
};

/** //:EXTRAI APENAS NÚMEROS DE UMA STRING E RETORNA COMO NÚMERO
 * @param {string|number} val
 * @param {number} decimal
 * @returns {number}
 */
const $numberOnly = (val, decimal = 5) => {
    val = val ?? 0;
    val = typeof val === "number" ? (val = val.toFixed(decimal)) : val; //FORÇA STRING

    if (val.includes(",")) val = val.replace(/[.]/g, "").replace(",", ".");
    if (val.includes(";")) val = val.replace(/[.]/g, "").replace(";", ".");

    let result = val.replace(/([^-.0-9])/g, "");
    result = parseFloat((result ||= 0), decimal);
    result = result.toFixed(decimal);

    return parseFloat(`${result}`, decimal);
};

/** //:FORMATA VALOR COM SAÍDA DIRETA P/ "input.value" OU RETORNO EM FORMATO STRING
 * @param {HTMLInputElement|string|number} input O valor ou elemento a ser formatado.
 * @param {number} [casasDecimais=2] O número de casas decimais para a formatação.
 * @param {string} [prefixo=''] Uma string para adicionar no início do valor formatado.
 * @param {string} [sufixo=''] Uma string para adicionar no final do valor formatado.
 * @returns {string|void} A string formatada, ou nada se um elemento de input for passado.
 */
const $valFormat = (input, casasDecimais = 2, prefixo = "", sufixo = "") => {
    // Verifica se a entrada é um elemento de input
    const isElemento = input instanceof Element && input.tagName === "INPUT";
    let valor = isElemento ? input.value : input;

    // Limpa o valor para ser um número (assumindo que $numberOnly é uma função válida)
    const valorLimpo = $numberOnly(valor);
    const valorNumerico = parseFloat(valorLimpo);

    // Lida com valores não numéricos de forma segura
    if (isNaN(valorNumerico)) {
        if (isElemento) {
            input.value = `${prefixo}${valorLimpo}${sufixo}`;
        }
        return `${prefixo}${valorLimpo}${sufixo}`;
    }

    // Formata o número com base no número de casas decimais
    let valorFormatado;
    if (casasDecimais === 0) {
        // Arredonda o número para garantir um resultado correto
        valorFormatado = Math.round(valorNumerico).toString();
    } else {
        // Usa Intl.NumberFormat para formatação localizada mais confiável
        valorFormatado = new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: casasDecimais,
            maximumFractionDigits: casasDecimais,
        }).format(valorNumerico);
    }

    const valorFinal = `${prefixo}${valorFormatado}${sufixo}`;

    // Atualiza o valor do elemento ou retorna a string formatada
    if (isElemento) {
        input.value = valorFinal;
        return;
    }

    return valorFinal;
};

const $wauSelect = {
    /** //:SELEÇÃO DE ITEM EM WAU-SELECT
     * @param {object} select - objeto com objetos {debounce, id, input, ul, ulActive}
     * @param {string} event - Evento disparado
     * @param {string} name - Nome do select
     * @param {string|false} db - Banco de dados a ser atualizado
     */
    events(select, event, name, db = false) {
        const target = event.target;
        const wrapper = target.closest(`.wau-select-${name}`);

        //:Função interna para validar e fechar o select
        const exit = () => {
            if (!select.ulActive) return false;

            const { ul, input, id } = select;
            //:Busca opção exata na lista
            const option = Array.from(ul.children).find((el) => el.textContent === input.value);

            //:Fecha lista
            select.ulActive = false;
            ul.classList.add("d-none");

            //:Define valores (limpa se não encontrar correspondência)
            const value = option ? option.textContent : "";
            const dataId = option ? option.dataset.id : "";

            //:Atualiza Input e ID
            $inputChange(input, value, "change", db);
            if (id) $inputChange(id, dataId, "change", db);

            return true;
        };

        //:1. Clicou fora -> Valida e fecha
        if (!wrapper) return exit();

        //:2. Focusout -> Ignora (dá tempo de clicar na lista)
        if (event.type === "focusout") return true;

        //:3. Interação com Input (Digitação/Foco)
        const input = target.closest("input");
        if (input && event.type !== "change") {
            select.debounce(input.value);
            //:Limpa ID enquanto digita
            if (select.id) $inputChange(select.id, "", "change", db);
            return true;
        }

        //:4. Seleção na lista
        const li = target.closest("li");
        if (li) {
            select.input.value = li.textContent;
            return exit();
        }
    },

    factory(module, selectorName, url) {
        const factory = {};
        factory.id = $(`${module} .wau-select-${selectorName} .id`);
        factory.input = $(`${module} .wau-select-${selectorName} .form-control`);
        factory.ul = $(`${module} .wau-select-${selectorName} ul`);
        factory.debounce = $debounce(async (find) => {
            const resp = await $fetch({
                url: url,
                par: { find },
                overlay: false,
                fnName: "WAU-SELECT WAU-0084",
            });

            const tpt = resp.list
                .map(({ id, name }) => `<li class="list-group-item list-group-item-action" data-id="${id}">${name}</li>`)
                .join("");
            factory.ul.innerHTML = tpt;

            factory.ul.classList.remove("d-none");
            factory.ulActive = true;
        });

        return factory;
    },
};

const $maskLib = {
    //:Numero
    number: {
        onClick(e) {
            if (!$numberOnly(e.value)) {
                e.value = "";
                return;
            }

            e.value = $numberOnly(e.value);
            e.value = e.value.replace(".", ",");
        },
    },

    //:Telefone
    phone(e, mask) {
        const isString = typeof e == "string";

        const numbers = (isString ? e : e.value).replace(/\D/g, "");
        const arrNumbers = numbers.split("");
        const arrMask = mask.split("");

        let y = 0,
            result = "";
        for (const char of arrMask) {
            if (y >= arrNumbers.length) break;
            result += char === "#" ? arrNumbers[y++] : char;
        }

        if (isString) return result;
        e.value = result;
    },

    //:Email
    email(value) {
        return value.replace(/[^a-zA-Z0-9#%$@!&*._]/g, "").toLowerCase();
    },

    //:CPF
    cpf(value) {
        let val, point;

        val = value.replace(/[^0-9]/g, "");
        if (!val) return "";
        val = val.toString();

        const resp = [...val].reduce((prevVal, val) => {
            if (prevVal.length >= 14) {
                val = "";
                point = "";
            } else if (prevVal.length == 3 || prevVal.length == 7) {
                point = ".";
            } else if (prevVal.length == 11) {
                point = "-";
            } else {
                point = "";
            }
            return prevVal + point + val;
        });

        return resp ?? "";
    },

    /** //:String
     * @param {string} value
     * @param {string} type
     *
     * type = 1 - tudo maiúsculo
     * type = 2 - tudo minusculo
     * type = 3 - primeira letra de cada palavra em maiúsculo
     * type = 4 - primeira letra da frase em maiúsculo
     * type = 5 - pega apenas a primeira e ultima palavra da frase
     * type = 10 - não remove "."
     * type = 11 - não remove "@"
     */
    string(value, type = false) {
        const arr = ["do", "da", "dos", "das", "de", "e"];

        let str = value;
        str = str.toLowerCase(); //:PASSA TUDO P/ MINÚSCULO
        str = str.replace(/\s+/g, " "); //:REMOVE ESPAÇO FAKE "ascii(160)"
        str = str.replace(/dra\.|dr\.|sra\.|sr\.+/g, ""); //:REMOVE TRATAMENTO
        str = str.replace(/[^a-z0-9ãáéíóç@\.\s]+/g, ""); //:REMOVE CARACTERES ESPECIAIS
        str = str.replace(/\s{2,}/g, " "); //:REMOVE ESPAÇO DUPLO
        str = str.trim(); //:REMOVE ESPAÇOS START/END
        str = str.split(" "); //:TRANSFORMA EM ARRAY

        if (!str[0]) return "";

        //:PASSA PRIMEIRA LETRA DE CADA PALAVRA P/ MAIÚSCULA
        if ($existIn(type, 3)) {
            for (var i = 0, x = str.length; i < x; i++) {
                if (arr.includes(str[i].toLowerCase())) {
                    str[i] = str[i].toLowerCase();
                } else {
                    str[i] = str[i][0].toUpperCase() + str[i].substr(1).toLowerCase();
                }
            }
        }

        //:PASSA ARRAY P/ STRING
        let result = str.join(" ").trim();

        //:NÃO REMOVE "."
        if (!$existIn(type, 10)) result = result.replace(/\.+/g, "");

        //:NÃO REMOVE "@"
        if (!$existIn(type, 11)) result = result.replace(/@+/g, "");

        //:PASSA TUDO P/ MAIÚSCULA
        if ($existIn(type, 1)) result = result.toUpperCase();

        //:APENAS PRIMEIRA E ULTIMA PALAVRA
        if ($existIn(type, 5)) {
            const split = result.split(" ");
            const last = split.length > 1 ? split[split.length - 1] : "";
            result = `${split[0]} ${last}`.trim();
        }

        //:RETORNA REMOVENDO ESPAÇOS START/END
        return result.trim();
    },

    username(str) {
        return str.replace(/[^a-zA-Z0-9#%$._]/g, "").toLowerCase();
    },

    password(str) {
        return str.replace(/[^a-zA-Z0-9@#%$._]/g, "").toLowerCase();
    },

    //:CEP
    zip(value) {
        value = value.replace(/[-]+/g, "");

        return value ? `${value.substr(0, 5)}-${value.substr(5, 3)}` : "";
    },
};

function $inputChange(el, val, event = false, db = false, saveMode = true) {
    el = el.nodeType ? el : document.querySelector(el);

    //:Retorna se o node for (type="data") com e o evento for "keyup"
    if (el.type == "date" && event == "keyup") return;

    //:Da valor p/ node
    val = el.type === "date" && val === "0000-00-00" ? "" : val; //:Se for data e valor for "0000-00-00" retorna vazio
    el.value = val ?? "";

    //:Se node contem atributo "mask"
    if (el.getAttribute("mask")) {
        const maskFunctions = { number, string, phone, cpf, zip, email };
        const maskAttr = el.getAttribute("mask");
        if (maskFunctions[maskAttr]) maskFunctions[maskAttr]();
    }

    //:Se for atualizar database
    if (db) {
        let decimal = false;

        const isNumber = el.getAttribute("mask") === "number";
        if (isNumber) {
            const array = el.getAttribute("mask-type")?.split(",") || [];
            decimal = array[0] ?? 2;
        }

        $dataChange(db, el.name, el.value, decimal);

        if (saveMode && "keyup,change".includes(event)) $saveMode.enable();
    }

    //:Remove marcação de elementos "required"
    if (el.required) $requiredMark.toggle(el, el.value);

    //:RETORNA ELEMENTO NO FORMATO NODE
    return el;

    function number() {
        let typeArray = el.getAttribute("mask-type")?.split(",") || [];
        if (event == "keyup") return;
        if (event == "click") return $maskLib.number.onClick(el);
        $valFormat(el, typeArray[0] ?? 2, typeArray[1] ?? "", typeArray[2] ?? "");
    }

    function string() {
        if (!$existIn("change", event)) return;
        const type = el.getAttribute("mask-type");
        el.value = $maskLib.string(el.value, type);
    }

    function phone() {
        if (!$existIn("focusout,change", event)) return;

        //:Se for DDI
        if (el.getAttribute("mask-type") === "ddi") return $valFormat(el, 0);

        const previousInput = el.previousElementSibling;
        const ddi = previousInput.getAttribute("mask-type") === "ddi" ? previousInput.value : "55"; //:Se não tiver DDI, assume 55

        const maskList = {
            1: "### ### ####",
            55: "## #####-####",
            351: "### ### ###",
        };

        el.value = $maskLib.phone(el.value, maskList[ddi] ?? "####################");
    }

    function cpf() {
        if (!$existIn("focusout,change,keyup", event)) return;
        el.value = $maskLib.cpf(el.value);
    }

    function zip() {
        if (!$existIn("focusout,change", event)) return;
        el.value = $maskLib.zip(el.value);
    }

    function email() {
        if (!$existIn("change", event)) return;

        el.value = $maskLib.email(el.value);
    }
}

/** //:Atualiza a propriedade de um objeto alterado
 *
 * @param {object} object O objeto a ser modificado.
 * @param {string} key A chave da propriedade a ser atualizada.
 * @param {*} value O novo valor para a propriedade.
 * @param {boolean|number} [decimalNumber=false] Se true/número, processa o valor com $numberOnly.
 * @return {boolean} Retorna true se houve alteração, false caso contrário.
 */
function $dataChange(object, key, value, decimalNumber = false) {
    const oldValue = object[key];
    const newValue = decimalNumber ? $numberOnly(value, decimalNumber) : value;

    //:Determina se a comparação deve ser numérica ou estrita.
    const isNumericComparison = (!Number.isNaN(+oldValue) || !Number.isNaN(+newValue)) && oldValue !== "" && newValue !== "";

    //:1. VERIFICAÇÃO: Sai da função se o valor não mudou.
    if (isNumericComparison) {
        //:Extrai apenas números de oldValue e newValue para comparação
        const oldValueNumeric = String(oldValue).replace(/[^0-9-]/g, "");
        const newValueNumeric = String(newValue).replace(/[^0-9-]/g, "");

        if (oldValueNumeric === newValueNumeric) return false;
    } else {
        if (oldValue === newValue) return false;
    }

    //:2. ATRIBUIÇÃO: Atualiza o valor no objeto.
    object[key] = newValue;

    //:3. RASTREAMENTO: Registra a chave que foi alterada.
    if (object.id !== "new") {
        //:Inicializa 'z_set' de forma concisa se não existir.
        object.z_set ??= [];

        if (!object.z_set.includes(key)) {
            object.z_set.push(key);
        }
    }

    return true; //:Retorna true indicando que houve uma alteração.
}

/** //:Helper que retorna apenas as chaves alteradas
 *
 * @param {json} el json com os dados
 * @returns {object|false} retorna "objeto com valores alterados", "delete" ou "false" se estiver vazio
 */
function $dataFetchRender(el) {
    if (el.id === "new") {
        if (el.displayId) delete el.displayId; //:Não precisa de displayId
        if (el.z_set) delete el.z_set; //:Não precisa de z_set
        return el; //:Retorna tudo
    }

    if (!el.z_set && !el.z_del) return false; //:Se não tiver alteração, retorna false
    if (el.z_del) return { delete: true, id: el.id }; //:Se for delete, retorna delete

    const data = {};
    el.z_set.forEach((key) => {
        if (key) data[key] = el[key];
    });

    if (!$isEmpty(data)) data.id = el.id;

    return $isEmpty(data) ? false : data;
}

const $comisType = {
    1: "Fixo ($)",
    2: "Lucro (%)",
};

/** //:Retorna o valor da string após sinal de "=" Ex: "nome=carlos,idade=40"
 * @param {string} str string a ser comparada
 * @param {string} find parametro a ser encontrado
 * @param {string} separator separador padrão ","
 * @returns {string|false} valor contido no parametro
 */
const $valueHelp = (str, find, separator = ",") => {
    //:SE NÃO IXISTIR "=" RETORNA false
    if (str.indexOf("=") < 0) return false;

    //:LOCALIZA "find"
    const strArray = str.split(separator);
    for (let index = 0; index < strArray.length; index++) {
        const elArray = strArray[index].split("=");
        if (elArray[0] == find) return elArray[1];
        break;
    }

    //:NÃO LOCALIZADO
    return false;
};

/**
 * Verifica se elemento está visivel
 * @param {string} selector
 * @returns
 */
const $isVisible = (selector) => {
    const el = typeof selector !== "string" ? selector : $(selector);
    if (!el) return false;

    const style = window.getComputedStyle(el);
    return style.display !== "none";
};

/**
 * Verifica se parametro é json
 * @param {string|json} str
 * @return {true|false}
 */
const $isJson = (str) => {
    return JSON.stringify(str).includes(":");
};

const $hide = (selector) => {
    $(selector).style.transition = `height .3s ease-out`;
    $(selector).style.height = 0;
};

const $show = (selector) => {
    $(selector).style.transition = `height .3s ease-out`;
    $(selector).style.height = `${div}px`;
};

const $uppercaseFirstCharacter = (e) => {
    return e.charAt(0).toUpperCase() + e.slice(1);
};

/** //:CRIADOR DE EVENTOS
 * @param {string|node} selector
 * @param {string} event 'click,change,focusout,keyup'
 * @param {function} callback
 */
const $event = (selector, event, callback) => {
    const node = selector.nodeType ? selector : document.querySelector(selector);

    const eventArray = event.split(",");
    eventArray.forEach((event) => {
        node.addEventListener(event, (e) => {
            callback(e);
        });
    });
};

function $blur(target) {
    //:Nova funcionalidade p/
    if (g.lastInput) {
        $inputChange(g.lastInput, g.lastInput.value, "change");
    }

    const isInput = target.tagName === "INPUT";
    const hasMask = isInput && target.hasAttribute("mask");
    g.lastInput = hasMask ? target : false;
}

/**
 * Cria atributo para um seletor
 * @param {string} selector
 * @param {string} name
 * @param {string} value
 */
const $attr = (selector, name, value) => {
    const elements = document.querySelectorAll(selector);
    if (!elements) return;

    for (const e of elements) e.setAttribute(name, value);
};

/** //:PASSA STRING P/ ARRAY REMOVENDO VAZIOS
 *
 * @param {string} string
 * @param {string} separator
 */
const $split = (string, separator = ",") => {
    return string.split(separator).filter(Boolean);
};

/**
 * Adiciona template em um elemento
 * @param {string} selector seletor alvo
 * @param {string} template template a ser inserido
 * @param {string|bollean} before adiciona template antes do seletor before
 */
const $append = (selector, template, before = false) => {
    selector = $(selector);
    template = template.trim();

    //LOCALIZA A PRIMEIRA TAG DO TEMPLATE
    const tag1 = template.slice(1, template.indexOf(">"));
    const tag = tag1.indexOf(" ") < 0 ? tag1 : tag1.slice(0, tag1.indexOf(" "));

    //PASSA TEMPLATE PARA FORMATO HTML
    const parser = new DOMParser();
    const html = parser.parseFromString(template, "text/html");
    const templateHtml = html.querySelector(tag);

    //INSERE ANTES OU DEPOIS
    if (before) {
        selector.insertBefore(templateHtml, selector.querySelector(before));
    } else {
        selector.appendChild(templateHtml);
    }
};

/**
 * dispara evento já declarado no elemento
 * @param {string} selector
 * @param {method} event
 */
const $trigger = (selector, event) => {
    $(selector).dispatchEvent(new Event(event));
};

/**
 * Dá valor para "input" e dispara evento "change"
 * @param {string} selector
 * @param {number} value
 */
const $change = (selector, value, event = "change") => {
    const el = typeof selector == "string" ? document.querySelector(selector) : selector;

    el.value = value ?? "";
    if (event) el.dispatchEvent(new Event(event));
};

/**
 * Adiciona css
 * @param {string} selector
 * @param {object} objects
 */
const $style = (selector, objects) => {
    const el = typeof selector !== "string" ? $arrayForce(selector) : $$(selector);

    el.forEach((e) => Object.entries(objects).forEach((style) => (e.style[style[0]] = style[1])));
};

/** //!EXCLUI SELETORES DA LISTA wau-verificar oq é
 * @param {string} selectors seletores na lista ex: '.sidebarTools, .navbar, .f_procedures .content'
 * @param {string} exclude seletores para excluir ex: '.navbar, .f_procedures .content'
 */
const $excludeSelectors = (selectors, exclude) => {
    const list = exclude.split(",");

    list.forEach((e) => {
        e = e.trim();
        selectors = selectors.replace(e, "");
        selectors = selectors.replace(", ,", ",").trim();

        if (selectors.slice(-1) == ",") selectors = selectors.slice(0, -1).trim();
        if (selectors.charAt(0) == ",") selectors = selectors.substring(1).trim();
    });

    return selectors;
};

/**
 * Adiciona classe
 * @param {string} selector seletores de busca ex: '.sidebarTools, .navbar, .f_procedures .content'
 * @param {string} remove seletores p/ remover ex: 'disabled, enabled, active'
 * @param {string} exclude seletores de exclusão ex: '.navbar, .f_procedures .content'
 */
const $classAdd = (selector, add, exclude = false) => {
    if (!add) return;

    // SE FOR NODE
    if (typeof selector !== "string") {
        selector.classList.add(add);
        return;
    }

    if (exclude) selector = $excludeSelectors(selector, exclude);

    const elements = document.querySelectorAll(selector);
    const addList = add.split(",");
    elements.forEach((e) => addList.forEach((a) => e.classList.add(a)));
};

/**
 * Remove classe
 * @param {string} selector seletores de busca ex: '.sidebarTools, .navbar, .f_procedures .content'
 * @param {string} remove seletores p/ remover ex: 'disabled, enabled, active'
 * @param {string} exclude seletores de exclusão ex: '.navbar, .f_procedures .content'
 */
const $classRemove = (selector, remove, exclude = false) => {
    if (!remove) return;

    // SE FOR NODE
    if (typeof selector !== "string") {
        selector.classList.remove(remove);
        return;
    }

    if (exclude) selector = $excludeSelectors(selector, exclude);

    const elements = document.querySelectorAll(selector);
    const removeList = remove.split(",");
    elements.forEach((e) => removeList.forEach((a) => e.classList.remove(a)));

    return elements;
};

/**
 * Troca um seletor por outro em class
 * @param {string} selector seletor de busca
 * @param {string} sel1 remove
 * @param {string} sel2 add
 * @return {array} lista de elementos encontrados
 */
const $classToggle = (selector, sel1, sel2) => {
    const selectorList = $classRemove(selector, sel1);
    $classAdd(selector, sel2);

    return selectorList;
};

//-ADICIONA OU REMOVE SELETOR EM CLASSE
/**
 * @param {string|array} node seletor ou array de seletores
 * @param {boolean} rules true ou false
 * @param {string} selector nome do seletor a ser adicionado ou removido
 */
const $classSmart = (node, rules, selector) => {
    $$(node).forEach((node) => node.classList[rules ? "add" : "remove"](selector));

    return node;
};

/**
 * Força retorno de elemento(s) em formato array
 * @param {any} el
 * @returns {array}
 */
const $arrayForce = (el) => {
    if (!el) return [];

    return Array.isArray(el) ? el : [el];
};

//-ADICIONA UM NOVO VALOR NA ARRAY|STRING E RETORNA EM VÁRIOS FORMATOS
/**
 * @param {array|string} y valor principal
 * @param {array|string} x valor a ser adicionado | se não tiver valor o método irá apenas organizar "y"
 * @param {object} more.spliter separador - padrão=","
 * @param {object} more.add adiciona x | remove x - padrão=""
 * @param {object} more.repeat repete ou não os valores - padrão=false
 * @param {object} more.returnAs 1-array | 2-string | 3-string com virgula antes e depois - padrão=3
 * @returns {array|string}
 */
const $addValue = (y = [], x = [], more = {}) => {
    const spliter = more.spliter ?? ","; //:SEPARADOR
    const add = more.add ?? true; //:ADICIONA OU REMOVE
    const repeat = more.repeat ?? false; //:REPETE OU NÃO
    const returnAs = more.returnAs ?? 3; //:1-ARRAY|2-STRING|3-STRING COM VIRGULA ANTES E DEPOIS

    //:CRIA "w" EM FORMATO ARRAY
    let w = Array.isArray(y) ? y : y.split(spliter);

    //:CRIA "k" EM FORMATO ARRAY
    let k = Array.isArray(x) ? x : x.split(spliter);

    //:REMOVE VALORES VAZIOS
    w = w.filter((i) => i);
    k = k.filter((i) => i);

    //:ADICIONA OU REMOVE K EM W
    w = add ? w.concat(k) : $array.remove(w, k);

    //:SE FOR P/ REMOVE VALORES REPETIDOS
    if (!repeat) w = [...new Set(w)];

    //:ORDENA ARRAY
    w.sort();

    //:RETORNA COMO ARRAY
    if (returnAs == 1) return w;

    //:RETORNA COMO STRING SEM VIRGULA NO INICIO E FIM
    if (returnAs == 2) return w.toString();

    //:RETORNA COMO STRING COM VIRGULA NO INICIO E FIM
    if (returnAs == 3) {
        return w[0] ? `${spliter}${w.toString()}${spliter}` : "";
    }

    //:NENHUMA ALTERAÇÃO FOI FEITA
    return y;
};

//:CHECA SE A SESSÃO EXPIROU
function $sessionExpiration() {
    return false;

    const sessionExpiration = cookie.get("sessionExpiration");
    const now = $date.now();
    const expired = now > sessionExpiration;

    if (!expired) return false;

    window.location.href = `${baseURL}login`;
    return true;
}

/** //:FETCH
 *
 * @param {json} config - ({url:'',par:{par1:'par1',par2:'par2'},fnName:'#590'});
 * @url url destino
 * @method get/post (post não obrigatório)
 * @par parametros a serem enviados
 * @overlay bloqueia tela até ter resposta
 * @consoleOn mostra valores no console
 * @messageType 0=não mostra|1=mostra em modal|2=mostra em template-div
 * @fnName mostra nome da função no console
 */
const $fetch = async (config) => {
    const overlay = config.overlay === false ? false : true;
    const consoleOn = config.consoleOn === false ? false : true;
    const messageType = config.messageType ?? 1;
    const fnName = config.fnName ?? false;
    const externalUrl = config.url.includes("http") ? true : false;
    const fetchURL = externalUrl ? config.url : baseURL + config.url;
    const method = config.method?.toUpperCase();
    const parameters = config.par ?? "";
    const parametersIsJoson = $isJson(parameters);
    let init = "",
        data = "",
        resp = "";

    const headers = new Headers();
    if (parametersIsJoson) headers.append("Content-Type", "application/json");
    headers.append("token", cookie.get("token"));

    // --- [INICIO DO CSRF] ---
    // Verifica se temos o token global e se NÃO é uma url externa
    // if (window.CSRF_TOKEN && !externalUrl) {
    if (!externalUrl) {
        headers.append("X-CSRF-TOKEN", window.CSRF_TOKEN);
    }
    // --- [FIM DO CSRF] ---

    if (method == "FORMDATA") {
        //ARQUIVO FORMDATA
        headers.delete("Content-Type");
        init = {
            method: "POST",
            headers: headers,
            body: parameters,
        };
    } else if (method == "GET") {
        //GET
        if (externalUrl) {
            init = "";
        } else {
            const par = ""; //SE FOR ENVIAR PARAMETROS VIA GET PRECISA RESOLVER ISSO
            init = `?${par}`;
        }
    } else {
        //POST
        init = {
            method: "POST",
            headers: headers,
            body: parametersIsJoson ? JSON.stringify(parameters) : parameters,
            redirect: "follow",
        };
    }

    //FETCH INICIO
    waiting(1);
    try {
        resp = method == "GET" ? await fetch(`${fetchURL}${init}`) : await fetch(fetchURL, init);
        data = await resp.json();
    } catch (error) {
        cl(`%c ERRO EM FETCH: ${fnName} -> ${error} `, "background: red; color: #fff");
    }

    //:RESPOSTA DE DESENVOLVIMENTO
    if (data.dev) {
        console.log(
            `%c ${typeof data.dev === "object" ? JSON.stringify(data.dev, null, 2) : data.dev} `,
            "background: orange; color: black; padding: 2px",
        );
        return waiting(false);
    }

    //CONSOLE LOG
    if (g.consoleOn && consoleOn && fnName) cl(`%c ${fnName} `, "background: #26ff00; color: #000", data);

    //:ERRO
    if (data?.status && data?.status != 200) {
        statusError(data);
        return data;
    }

    if (!resp.ok) {
        //:Token "CSRF" expirou no servidor
        if (resp.status == 403) {
            window.location.href = `${baseURL}login`;
            return;
        }

        console.log(
            `%c ${resp.status} -> ${resp.statusText} \n ${data.message} \n LINHA: ${data.line} - CÓDIGO: ${data.code} `,
            "background: red; color: #FFF",
        );
        if (fnName) alert(`ERRO: ${fnName}`);
    } else if (data?.status != 200 && !externalUrl) {
        if (data.msg) {
            cl(`%c ${data.msg} `, "background: #ff4500; color: #fff");
            alert(data.msg);
        } else {
            cl(`%c STATUS NÃO RETORNADO -> ${data} `, "background: red; color: #fff");
        }
    }

    waiting();
    return data;
    //* * * * * * * * * * * * * * * * * * * *

    //:FUNÇÃO DE TRATAMENTO DE ERRO
    function statusError(data) {
        waiting();

        const status = data.status;
        const msg = data.msg;
        const background1 = "background: #ff4500; color: #fff";

        if (msg) {
            const td = msg.split("||");
            td.forEach((item) => {
                let resp = "";
                if (item.includes("TS:")) {
                    resp = item.replace("TS:", "");
                    $toast(resp);
                } else if (item.includes("TD:")) {
                    resp = item.replace("TD:", "");
                    $toast(resp, "danger");
                } else if (item.includes("CL:")) {
                    resp = item.replace("CL:", "");
                    cl(`%c ${resp} `, background1);
                }
            });
        }

        //:MENSAGEM DE ERRO VIA CONSOLE
        const msgConsole = msg ? ` - ${msg}` : " ";
        switch (status) {
            case 401: //:SESSÃO EXPIRADA -> REDIRECIONA P/ LOGIN
                window.location.href = `${baseURL}login`;
                return;
            case 451: //:TOKEN INVALIDO -> REDIRECIONA P/ LOGIN
                window.location.href = `${baseURL}login`;
                return;
            case 452: //:optLock não enviado
                cl(`%c STATUS ${status} - "optLock" não enviado${msgConsole}`, background1);
                break;
            case 453: //:Update bloqueado por optLock
                cl(`%c STATUS ${status} - Update bloqueado por "optLock"${msgConsole}`, background1);
                $toast("Este registro foi alterado por outro usuário.|A tela foi atualizada!", "danger");
                break;
            case 454: //:Id zerado
                cl(`%c STATUS ${status} - ID ZERADO${msgConsole}`, background1);
                break;
            case 455: //:Id invalido
                cl(`%c STATUS ${status} - ID INVALIDO${msgConsole}`, background1);
                break;
            case 456: //:Registro não localizado com o id enviado
                cl(`%c STATUS ${status} - REGISTRO NAO LOCALIZADO${msgConsole}`, background1);
                break;
            case 458: //:Erro de validação
                cl(`%c STATUS ${status} - ERRO DE VALIDACAO${msgConsole}`, background1);
                break;
            case 460: //:CAMPO DEVE ESTAR PREENCHIDO
                cl(`%c STATUS ${status} - CAMPO DEVE ESTAR PREENCHIDO${msgConsole}`, background1);
                break;
            case 461: //:CADASTRO JÁ EXISTE
                cl(`%c STATUS ${status} - CADASTRO JÁ EXISTE${msgConsole}`, background1);
                break;
            case 465: //:ERRO EM BUSCA DE REGISTRO NO BD
                cl(`%c STATUS ${status} - ERRO AO BUSCAR REGISTRO NO BANCO DE DADOS${msgConsole}`, background1);
                break;
            case 468: //:Sem permissão
                cl(`%c STATUS ${status} - SEM PREMISSÃO${msgConsole}`, background1);
                break;
            case 469: //:Login bloqueado
                cl(`%c STATUS ${status} - LOGIN BLOQUEADO${msgConsole}`, background1);
                break;
            case 899: //:Mensagem de debug
                const j = JSON.stringify(data.dev, null, 2);
                if (!j) break;
                cl(`%c${j}`, "background:#a3fff0;color:#000;padding:5px");
                break;
            default:
                cl(`%c STATUS ${status}${msgConsole} `, background1);
                break;
        }
    }

    //:OVERLAY COM WAITING
    function waiting(action) {
        if (!overlay) return;

        $i("waitingOverlay").style.display = action ? "flex" : "none";
    }
};

/** //:CHECA PERMISSÕES
 * @param {string|array} data - permissões a serem consultadas. ex: '57P' | ['57P','58P','59P']
 * @param {int|true|false} sendMessage - false=não mostra mensagem | true=mostra mensagem (default)
 * @returns {true|false}
 */
const $permission = (data, sendMessage = true) => {
    data = Array.isArray(data) ? data : (data = [data]);

    //*Temporário para checar "P"
    data.forEach((item) => {
        item = item.toString();
        if (!item.includes("P")) cl(`PERMISSÃO NÃO POSSUE "P": ${item}`);
    });

    const resp = data.some((item) => g.perm.includes(`,${parseInt(item)},`));

    if (!resp) {
        cl(data);
        if (sendMessage) $toast("Você não tem permição para executar esta ação.", "warning");
    }

    return resp;
};

const $sendZap = (phone, message, sendByApi = true) => {
    phone = mask.phone.formatNow(phone);
    phone = "55" + phone.replace(/[^0-9]+/g, "");

    if (sendByApi) {
        const resp = $fetch({
            url: "tools/message/zap/send_text",
            par: { phone, message },
            fnName: "#590",
        });

        cl(resp);
    } else {
        message = message ? `&text=${message}` : "";
        window.open(`https://api.whatsapp.com/send?phone=${numberZap}${text}`);
    }
};

/** ///BUSCA OBJETO NA ARRAY ATRAVES DE UMA DE SUAS PROPRIEDADES
 * @param {array} array array a ser consultada
 * @param {string} property nome da propriedade a ser consultada na array
 * @param {string} val valor que deve estar na propriedade
 * @returns {object} retorna todo objeto com todas as propriedades
 */
const $findArray = (array, property, val) => {
    const index = array.findIndex((el) => el[property] == val);

    if (index < 0) return false;

    result = { ...array[index] };
    result.index = index;

    return result;
};

const gMonths = (param) => {
    let Length = param?.lenght ?? 12;
    let allOption = param?.allOption ?? 0;
    let mesF = 0;
    let months = [];

    var data = new Date(),
        mes = data.getMonth(),
        ano = data.getFullYear();

    //ADICIONA "TODOS"
    if (allOption) months.push(allOption);

    for (let i = 0; i < Length; i++) {
        mesF = String(mes + 1).padStart(2, "0");
        months.push(ano + "-" + mesF);

        if (mes + 1 == 1) {
            mes = 11;
            ano--;
        } else {
            mes--;
        }
    }

    return months;
};

/** ///RETORNA CUMPRIMENTO */
const $bomDia = () => {
    let hour = new Date().getHours();

    if (hour < 5) {
        return "Boa noite";
    } else if (hour < 12) {
        return "Bom dia";
    } else if (hour < 18) {
        return "Boa tarde";
    } else {
        return "Boa noite";
    }
};

const $unicodeToChar = (data) => {
    if (!data) return "";
    return data
        .replace(/\\u[\dA-F]{4}/gi, function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16));
        })
        .replace(/["]+/g, "");
};

//-Manipula DDI
const $ddi = {
    data: {},

    /** ///Inicio */
    start(data) {
        this.data = data;

        $findModule.init({
            urn: "tools/tools/country/find",
            title: "Busca País",
            tptTexts: { col2: "Nome" },
            columnsQuantity: 3,
            width: "400px",
            callback: (y) => this.callback(y),
        });
    },

    /** ///Callback */
    callback(y) {
        //:Busca elementos contidos em "container-phone"
        const container = this.data.closest(".container-phone");
        const id = $w(container, "id");
        const ddi = $w(container, "ddi");
        const flag = $w(container, "img");

        //:Atualiza view
        $maskInput(id, y.id, "change", "register");
        $maskInput(ddi, y.col2, "change", "register");
        this.domFlag(flag, y.data.phone_flag1, y.data.phone_flag2);
    },

    /** ///Seta URL da bandeira
     * @param {node} flagNode
     * @param {string} phone_flag1
     * @param {string} phone_flag2
     */
    domFlag(flagNode, phone_flag1, phone_flag2) {
        const url = phone_flag1
            ? `https://flagcdn.com/w40/${phone_flag1}.webp`
            : `https://upload.wikimedia.org/wikipedia/commons/thumb/${phone_flag2}`;

        //:Seta url da bandeira
        flagNode.src = url;
    },
};

//-DATA
const $date = {
    now(formatType) {
        return this.format(Date(), formatType);
    },

    /** ///TIMESTAMP
     * @param {string} date 2024-11-21 10:01:15 | Default=false
     * @returns {timestamp }
     */
    timestamp(date = false) {
        const d = date ? new Date(date) : new Date();
        return d.getTime();
    },

    moreTimes(dateTime, minutes, type = "+") {
        // Formata a string para o padrão aceito pelo construtor Date do JS
        const formattedDateTime = dateTime.replace(" ", "T");

        // Cria o objeto Date para manipulação
        const dateObject = new Date(formattedDateTime);

        // Define o valor final dos minutos conforme o tipo de operação
        const finalMinutes = type === "+" ? minutes : -minutes;

        // Atualiza os minutos do objeto Date
        dateObject.setMinutes(dateObject.getMinutes() + finalMinutes);

        // Função auxiliar para garantir dois dígitos
        const padZero = (num) => String(num).padStart(2, "0");

        // Formata a data e hora para o padrão original
        return (
            `${dateObject.getFullYear()}-${padZero(dateObject.getMonth() + 1)}-${padZero(dateObject.getDate())} ` +
            `${padZero(dateObject.getHours())}:${padZero(dateObject.getMinutes())}:${padZero(dateObject.getSeconds())}`
        );
    },

    /**
     * Adiciona ou subtrai dias na data
     * @param {string} dt data a ser modificada
     * @param {value} days dias a mais ou a menos
     * @returns retorna como:  .dt / .tm / .dttm
     */
    moreDays(dt, days, type = "+") {
        const date = new Date(dt);

        if (type == "+") {
            date.setDate(date.getDate() + days + 1, "");
        } else {
            date.setDate(date.getDate() - days + 1, "");
        }

        return this.format(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(), "Sq");
    },

    /**
     * Soma ou subtrai meses na data
     * @param {string} dt data a ser modificada no formato '2024-12'
     * @param {numeral} months quantidade de meses
     * @param {true|false} deduct tira mês
     * @returns '2025-01'
     */
    moreMonths(dt, months, deduct = false) {
        if (!dt) return "";

        const dtArray = dt.split("-");
        dtArray[0] = parseInt(dtArray[0]);
        dtArray[1] = parseInt(dtArray[1]);

        if (deduct) {
            for (let x = 0; x < months; x++) {
                dtArray[1] = dtArray[1] - 1;

                if (dtArray[1] < 1) {
                    dtArray[0] -= 1;
                    dtArray[1] = 12;
                }
            }
        } else {
            for (let x = 0; x < months; x++) {
                dtArray[1] = dtArray[1] + 1;

                if (dtArray[1] > 12) {
                    dtArray[0] += 1;
                    dtArray[1] = 1;
                }
            }
        }

        return `${dtArray[0]}-${dtArray[1].toString().padStart(2, "0")}`;
    },

    /** ///QUANTOS DIAS TEM NO MÊS
     * @param {string} date 2024-11-21 | 2024-11
     * @returns {int} 28-31
     */
    daysInMonth(date) {
        if (!date) date = $date.now("Sq");

        const explode = date.split("-");
        const year = parseInt(explode[0]);
        const month = parseInt(explode[1]);

        var data = new Date(year, month, 0);
        return data.getDate();
    },

    /** ///DIA DA SEMANA
     * @param {string} date 2024-11-21
     * @returns {int} 0-6
     */
    dayOfWeek(date) {
        const d = date ? new Date($date.format(date, "Us")) : new Date();

        return d.getDay();
    },

    /** ///EM QUE DIA DA SEMANA COMEÇA O MÊS
     * @param {string} date 2024-11-21 | 2024-11
     * @returns {int} 0-6
     */
    monthStartsInWeek(date) {
        const d = date ? new Date($date.format(date, "Us")) : new Date();

        return new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    },

    firstDayOfDate(dtIn) {
        const date = dtIn ? new Date(dtIn) : new Date();

        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        return firstDay.toISOString().slice(0, 10);
    },

    lastDayOfDate(dtIn) {
        const date = dtIn ? new Date(dtIn) : new Date();

        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return lastDay.toISOString().slice(0, 10);
    },

    /**
     * Cria formatos p/ data
     * @param {string} d data a ser tratada
     * @param {boolean} br BR=true / US=false
     * @returns retorna como:  .dt / .tm / .dttm
     */
    format(dtIn = "", formatType = "Sq-tm") {
        dtIn = setToAmericanFormat(dtIn); //:Prepara entrada de data

        //:Transforma p/ formato "Tue Jun 24 2025 00:00:00 GMT-0300 (Horário Padrão de Brasília)"
        const date = dtIn ? new Date(dtIn) : new Date(),
            dia = date.getDate().toString().padStart(2, "0"),
            mes = String(date.getMonth() + 1).padStart(2, "0"),
            Ano = date.getFullYear().toString(),
            hora = date.getHours().toString().padStart(2, "0"),
            minuto = date.getMinutes().toString().padStart(2, "0"),
            segundo = date.getSeconds().toString().padStart(2, "0");

        //:RETORNA APENAS HORA (HH:MM:SS)
        if (formatType == "tm") return `${hora}:${minuto}`;
        if (formatType == "tms") return `${hora}:${minuto}:00`;

        //:DATA
        let result = false; //.INICIA RESULTADO
        const x = formatType.includes("/") ? "/" : "-"; //.SEPARADOR DA DATA
        const ano = "BSU".includes(formatType.charAt(0)) ? Ano : Ano.slice(2); //.VERIFICA SE ANO É DE 4 DIGITOS
        const dt = formatType.toLowerCase(); //.PASSA TUDO P/ MINUSCULO
        //
        switch (dt.slice(0, 2)) {
            case "br":
                result = `${dia}${x}${mes}${x}${ano}`;
                break; //.(D/M/A)-DATA PADRÃO BRASIL
            case "sq":
                result = `${ano}${x}${mes}${x}${dia}`;
                break; //.(A/M/D)-DATA PADRÃO SQL
            case "us":
                result = `${mes}${x}${dia}${x}${ano}`;
                break; //.(M/D/A)-DATA PADRÃO AMERICANO
            default:
                return false; //.SE FORMATO ESTÁ ERRADO RETORNA FALSO
        }

        //:RETORNA (ADICIONANDO OU NÃO HORA)
        return dt.includes("tm") ? `${result} ${hora}:${minuto}:${segundo}` : result;

        //:Retorna no formato "2022-10-01 08:35:00"
        function setToAmericanFormat(el) {
            //:Se vier no padrão ".toString()" -> retorna el
            const regex = /^[A-Za-z]{3} [A-Za-z]{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \(.+\)$/;
            if (regex.test(el)) return el;

            el = el.trim();
            let date = "";
            let hour = "";

            if (el.includes("T")) return el; //:JA VEM EM FORMATO DE DATA (2023-01-18T12:00:00-03:00)

            //:SEPARA DATA E HORA
            if (el.includes(":")) {
                //:SE TIVER HORA
                date = el.split(" ")[0];
                hour = el.split(" ")[1];
            } else {
                //:SE FOR APENAS DATA
                date = el;
                hour = "00:00:00";
            }

            //:VERIFICA SE ESTÁ NO FORMATO BR E TRANSFORMA PARA US
            if (date.indexOf("/") > -1) {
                const split = date.split("/");
                split[2] = split[2].length != 4 ? "20" + split[2] : split[2];

                date = `${split[2]}-${split[1]}-${split[0]}`;
            }

            //:SE O MÊS NÃO TIVER A QUANTIDADE DE DIAS TROCA O DIA PELO ULTIMO DIA DO MÊS
            const split = date.split("-");
            const day = split[2];
            const daysInMonth = $date.daysInMonth(date);
            //+
            const newDay = day > daysInMonth ? daysInMonth : day;
            //+
            date = `${split[0]}-${split[1]}-${newDay}`;

            return date + " " + hour;
        }
    },
};

//-METODOS COM ARRAY
const $array = {
    /** ///REMOVE "remove" DA ARRAY
     * @param {array} arr array original
     * @param {array} remove array de valores a serem removidos
     * @returns {array}
     */
    remove(arr, remove) {
        remove.forEach((el) => (arr = arr.filter((item) => item !== el)));

        return arr;
    },

    /** ///REMOVE KEY QUE CONTEM "remove"
     * @param {array} arr array original
     * @param {string} remove valor a ser removido
     * @returns {array}
     */
    removeKey(arr, remove) {
        const key = arr.indexOf(remove);
        if (key >= 0) arr.splice(key, 1);
        return arr;
    },
};

//-LOCAL STORAGE
const ls = {
    /** ///SETA LOCAL STORAGE CASO "key" NÃO TENHA NENHUM VALOR
     * @param {string} key chave
     * @param {mix} val valor da chave
     */
    setStart(key, val) {
        if (!ls[key]) ls.set(key, val);
    },

    /** ///SETA LOCAL STORAGE
     * @param {string} key chave
     * @param {mix} val valor da chave
     * @param {string} storageName nome do localhost
     */
    set(key, val, storageName) {
        //SE O VALOR REFERE-SE A OUTRA TELA
        if (storageName && storageName != g.localhost) {
            storageName = `_${storageName}`;
            let lsData = ls.get(storageName);
            lsData[key] = val;
            localStorage.setItem(storageName.replace("__", "_"), JSON.stringify({ lsData }));
            return;
        }

        //ATRIBUI NOVO VALOR
        ls[key] = val;

        //CRIA OBJETO APENAS COM VALORES, REMOVENDO AS FUNÇÕES GET/SET e VIEW
        let lsData = {};
        Object.keys(ls).map(function (key) {
            if (key != "get" && key != "set" && key != "view") lsData[key] = ls[key];
        });

        //SALVA NO NAVEGADOR EM LOCALSTORAGE
        localStorage.setItem(`_${ls.view}`.replace("__", "_"), JSON.stringify({ lsData }));
    },

    /** ///BUSCA LOCAL STORAGE
     * @param {string} view nome da view para busca de cados
     * @returns
     */
    get(view = false) {
        let storageName = view ? `_${view}` : `_${ls.view}`;
        let result = JSON.parse(localStorage.getItem(storageName.replace("__", "_")))?.lsData || {};

        if (!view) {
            Object.keys(result).map(function (el) {
                ls[el] = result[el];
            });
        }

        return result;
    },

    /** ///PASSA PARA "ls.view" O VALOR DE "localhost"
     * @param {string} localhost
     */
    init(localhost) {
        ls.view = localhost;
        ls.get();
    },
};

const $go = {
    zap(number, text = false) {
        if (!number) return;

        number = number.replace(/[^0-9]/g, "");
        text = text ? `&text=${text}` : "";

        if (window.innerWidth > 768) {
            window.open(`https://web.whatsapp.com/send?phone=${number}${text}`);
        } else {
            window.open(`https://api.whatsapp.com/send?phone=${number}${text}`);
        }
    },
};

const dateNow = (tp, short) => {
    var data = new Date(),
        dia = data.getDate().toString(),
        diaF = dia.length == 1 ? "0" + dia : dia,
        mes = (data.getMonth() + 1).toString(),
        mesF = mes.length == 1 ? "0" + mes : mes,
        ano = data.getFullYear().toString(),
        anoF = short ? ano.slice(2) : ano;

    if (tp == "BR") {
        return diaF + "/" + mesF + "/" + anoF;
    } else {
        return anoF + "-" + mesF + "-" + diaF;
    }
};
