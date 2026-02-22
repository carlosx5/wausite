const data = { userList: [] };

document.addEventListener("DOMContentLoaded", () => {
    ls.clinicId || ls.set("clinicId", 0);
    ls.clinicStatus ?? ls.set("clinicStatus", 1);
    ls.userStatus ?? ls.set("userStatus", 1);

    //:Eventos
    $event(".container", "change,keyup,click", (event) => events(event));

    database.get();
});

const database = {
    get: async function () {
        const find = ls.find || "";
        const clinicId = +ls.clinicId;
        const clinicStatus = +ls.clinicStatus;
        const userStatus = +ls.userStatus;

        const resp = await $fetch({
            url: `loginDebugger/getUserList`,
            par: { find, clinicId, clinicStatus, userStatus },
            fnName: "BUSCA LISTA WAU-0026",
        });

        this.set(resp);
    },

    set(resp) {
        data.userList = resp.userList;

        this.dom();
    },

    dom() {
        left.dom.renderList();
        right.dom.renderList();

        left.dom.clinicName();
        left.dom.clinicStatus();
        left.dom.userName();
        left.dom.userStatus();
    },

    startDebugger: async function () {
        const userId = +ls.userId;

        const resp = await $fetch({
            url: `loginDebugger/startDebugger`,
            par: { userId },
            fnName: "INICIA DEBUGGER WAU-0027",
        });

        if (resp.status == 200) window.location.href = `${baseURL}home`;
    },
};

const left = {
    dom: {
        renderList() {
            const tpt = data.userList.map(({ userId, userName, userStatus, clinicName, clinicStatus }) => {
                const userIcon = userStatus == 1 ? "-check" : "-xmark";
                const userColor = userStatus == 1 ? "text-success" : "text-danger";
                const clinicIcon = clinicStatus == 1 ? "-check" : "-xmark";
                const clinicColor = clinicStatus == 1 ? "text-success" : "text-danger";

                return `
                <tr data-user_id="${userId}">
                    <th scope="row">${userId}</th>
                    <td class="${userColor}"><i class="fa-regular fa-user${userIcon} me-3"></i>${userName}</td>
                    <td class="${clinicColor}"><i class="fa-regular fa-house-medical-circle${clinicIcon} me-3"></i>${clinicName}</td>
                    <td><button class="btn ${userColor} goRegister" title="Cadastro de usuário"><i class="fa-regular fa-address-card fa-xl"></i></button></td>
                </tr>`;
            });

            $(".table tbody").innerHTML = tpt.join("");
        },

        clinicName() {
            $n(".left .filter, clinicName").value = ls.clinicId ? ls.clinicName : "Todas";
        },

        clinicStatus() {
            let icon = "";
            switch (+ls.clinicStatus) {
                case 0:
                    icon = `<i class="fa-regular fa-house-medical-circle-xmark text-danger"></i>`;
                    break;
                case 1:
                    icon = `<i class="fa-regular fa-house-medical-circle-check text-success"></i>`;
                    break;
                case 2:
                    icon = `<i class="fa-regular fa-house-chimney-medical text-secondary"></i>`;
                    break;
            }

            $(".left .clinicStatus").innerHTML = icon;
        },

        userName() {
            $n(".left .filter, userName").value = ls.find || "";
        },

        userStatus() {
            let icon = "";
            switch (+ls.userStatus) {
                case 0:
                    icon = `<i class="fa-regular fa-user-xmark text-danger"></i>`;
                    break;
                case 1:
                    icon = `<i class="fa-regular fa-user-check text-success"></i>`;
                    break;
                case 2:
                    icon = `<i class="fa-regular fa-users text-secondary"></i>`;
                    break;
            }

            $(".left .userStatus").innerHTML = icon;
        },
    },

    events(event) {
        const target = event.target;

        switch (event.type) {
            case "keyup":
                //:Filtrar por nome do usuário
                if (target.closest(".filter .user input")) return find();
                return;

            case "click":
                //:Vai p/ cadastro de usuário
                if (target.closest(".goRegister")) return goRegister();
                //:Filtrar clínica
                if (target.closest(".btn.filterClinic")) return filter.clinic();
                //:Todas as clínicas
                if (target.closest(".btn.setAllClinics")) return setAllClinics();
                //:Status da clínica (0=inativo/1=ativo/2=todos)
                if (target.closest(".btn.clinicStatus")) return clinicStatus();
                //:Todos os usuários
                if (target.closest(".btn.setAllUsers")) return setAllUsers();
                //:Status do usuário (0=inativo/1=ativo/2=todos)
                if (target.closest(".btn.userStatus")) return userStatus();
                //:Selecionar usuário
                if (target.closest(".table tr")) return userSelect();
                return;

            default:
                return;
        }

        function find() {
            const name = target.closest(".filter .user input").value;
            ls.set("find", name);

            database.get();
        }

        function setAllClinics() {
            ls.set("clinicId", 0);
            ls.set("clinicName", "Todas");

            left.dom.clinicName();
            database.get();
        }

        function clinicStatus() {
            let clinicStatus = +ls.clinicStatus + 1;
            if (clinicStatus > 2) clinicStatus = 0;

            ls.set("clinicStatus", clinicStatus);
            ls.set("clinicId", 0);
            ls.set("clinicName", "Todas");

            left.dom.clinicStatus();
            database.get();
        }

        function setAllUsers() {
            ls.set("userId", 0);
            ls.set("find", "");

            left.dom.userName();
            database.get();
        }

        function userStatus() {
            let userStatus = +ls.userStatus + 1;
            if (userStatus > 2) userStatus = 0;

            ls.set("userStatus", userStatus);

            left.dom.userStatus();
            database.get();
        }

        function userSelect() {
            const userId = target.closest("tr").dataset.user_id;
            ls.set("userId", userId);

            //:Busca dados do usuário selecionado
            const userData = data.userList.find((item) => item.userId == userId);

            //:Salva memo no localStorage
            renderMemo();

            database.startDebugger();
            return;
            //* * * * * * * * * * * * * * * * * * * *

            function renderMemo() {
                //:Prepara newData
                const newData = `${userData.userId}-${userData.userName}-${userData.clinicName}`;

                //:Prepara memo

                const memo = ls.memo ? JSON.parse(ls.memo) : [];
                memo.unshift(newData);
                if (memo.length > 5) memo.pop();

                //:Salva memo
                ls.set("memo", JSON.stringify(memo));
            }
        }

        function goRegister() {
            const userId = target.closest("tr").dataset.user_id;
            ls.set("userId", userId, "user");
            window.location.href = `${baseURL}usuarios`;
        }
    },
};

const right = {
    dom: {
        renderList() {
            if (!ls.memo) return;

            const list = JSON.parse(ls.memo) || [];

            const tpt = list.map((item) => {
                const [userId, userName, clinicName] = item.split("-");

                return `
            <tr data-user_id="${userId}">
                <th scope="row">${userId}</th>
                <td>${userName}</td>
                <td>${clinicName}</td>
            </tr>`;
            });

            $(".right .table tbody").innerHTML = tpt.join("");
        },
    },

    events(event) {
        const target = event.target;

        switch (event.type) {
            case "click":
                //:Selecionar usuário
                if (target.closest(".table tr")) return userSelect();
                return;

            default:
                return;
        }

        function userSelect() {
            const userId = target.closest("tr").dataset.user_id;
            ls.set("userId", userId);

            database.startDebugger();
        }
    },
};

const filter = {
    clinic() {
        $findModule.init({
            urn: "loginDebugger/find_clinic",
            title: "Busca Clínica",
            tptTexts: { col2: "Clinica" },
            columnsQuantity: 2,
            width: "500px",
            callback,
        });

        function callback(par) {
            ls.set("clinicId", par.id);
            ls.set("clinicName", par.col2);

            $n(".left, clinicName").value = par.col2;

            //:busca lista atualizada
            database.get();
        }
    },
};

const events = (event) => {
    const target = event.target;

    //:Eventos da esquerda
    if (target.closest(".left")) return left.events(event);

    //:Eventos da direita
    if (target.closest(".right")) return right.events(event);
};
