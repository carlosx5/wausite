const d = {
    //DATA
    clinic: {},
    list: [],
};

document.addEventListener("DOMContentLoaded", () => {
    dataset.get();
});

const dataset = {
    get() {
        (async function () {
            const clinicId = ls.clinicId;
            const getList = "register,list";

            const resp = await $fetch({
                url: "tools/config/partner/partner/get_data",
                par: { clinicId, getList },
                fnName: "BUSCA DADOS #582",
            });

            dataset.set.clinic(resp.clinic);
            dataset.set.list(resp.list);
            viewdom.all();
        })();
    },

    set: {
        //ATUALIZA DADOS COM INFORMAÇÕES DA CLÍNICA
        clinic(data) {
            d.clinic = data || {};
            ls.set("clinicId", d.clinic.id);
        },

        //ATUALIZA DADOS DA LISTA
        list(data) {
            d.list = data || [];
        },
    },
};

const viewdom = {
    all() {
        clinic.view();
        list.view();
        aport.view();
    },
};

const clinic = {
    view() {
        $j("clinicNm").value = d.clinic.name ?? "";
        $j("clinicId").value = d.clinic.id ?? "";
    },
};

const list = {
    changed: false,
    sumPc: 0,
    selectors: ".sidebarTools, .navbar, .f_clinic, .f_aporte",

    view() {
        let tpt = "";
        list.sumPc = 0;
        list.sumVl = 0;

        d.list
            .map(({ id_user, name, pc, vl }, key) => {
                list.sumPc += +pc;
                list.sumVl += +vl;
                pc = mask.currency.formatNow(pc, 2, "", " %");
                vl = mask.currency.formatNow(vl, 2, "");

                tpt += `
                <div>${id_user}</div>
                <div><i class="fa-light fa-user me-2 goUser" data-user="${id_user}"></i>${name}</div>
                <div><input class="pc" type="text" value="${pc}" data-key="${key}"></div>
                <div><input class="vl" type="text" value="${vl}" readonly></div>
                <div><button class="btn p-0" data-key="${key}"><i class="fa-light fa-trash-can ms-2 delete"></i></button></div>
            `;
            })
            .join("");

        tpt += `
            <div></div>
            <div style="justify-content:end;padding-right:20px">Total</div>
            <div><input class="pc" type="text" value="${mask.currency.formatNow(
                list.sumPc,
                2,
                "",
                " %"
            )}" readonly style="color:${list.sumPc == 100 ? "#fff" : "orangered"}"></div>
            <div><input class="vl" type="text" value="${mask.currency.formatNow(list.sumVl, 2)}" readonly></div>
            <div></div>
        `;

        $(".list").innerHTML = tpt;

        // BOTÕES
        $(".f_list .btnSave").disabled = list.changed && list.sumPc == 100 ? false : true;
        $(".f_list .btnCancel").disabled = list.changed ? false : true;
    },

    onValChange(e) {
        const key = e.target.dataset.key;
        const input = e.target.value;
        d.list[key].pc = $numberOnly(input);

        if (!list.changed) {
            list.changed = true;

            $classAdd(list.selectors, "disabledColor");
        }

        list.view();
    },

    onAddNewUser(data) {
        d.list.push({ id: "0", id_user: data.id, id_clinic: ls.clinicId, name: data.col2, pc: "0", vl: "0" });

        if (!list.changed) {
            list.changed = true;

            $classAdd(list.selectors, "disabledColor");
        }

        list.view();
    },

    onSaveBtnClick() {
        (async function () {
            const clinicId = ls.clinicId;
            const list = d.list;

            const resp = await $fetch({
                url: "tools/config/partner/partner/save_list",
                par: { clinicId, list },
                fnName: "SALVA LISTA #622",
            });

            dataset.set.list(resp.list);
            viewdom.all();
        })();

        list.changed = false;
        $classRemove(list.selectors, "disabledColor");
    },

    onCancelBtnClick() {
        list.changed = false;
        $classRemove(list.selectors, "disabledColor");

        dataset.get();
    },

    onDeleteBtnClick(target) {
        const key = target.closest("button").dataset.key;
        d.list[key].pc = "0";

        list.view();
    },

    eventClick(target) {
        if (target.closest("button")) {
            list.onDeleteBtnClick(target);
        } else if (target.closest(".goUser")) {
            const userId = target.dataset.user;
            go.userStatement(userId);
        }
    },

    init: (function () {
        $(".f_list .list").addEventListener("change", (e) => list.onValChange(e));
        $(".f_list .list").addEventListener("click", (e) => list.eventClick(e.target));
        $(".f_list .btnSave").addEventListener("click", () => list.onSaveBtnClick());
        $(".f_list .btnCancel").addEventListener("click", () => list.onCancelBtnClick());
    })(),
};

const aport = {
    changed: false,
    selectors: ".sidebarTools, .navbar, .f_clinic, .f_list .pc",

    view() {
        const dt = $("@dtAport").value ? true : false;
        const vl = $("@vlAport").value ? true : false;

        $(".f_aporte .btnCancel").disabled = dt || vl ? false : true;
        $(".f_aporte .btnSave").disabled = dt && vl ? false : true;
    },

    onDateChange() {
        aport.formSaveMode_lock();
        aport.view();
    },

    onValueChange() {
        const vlAport = $("@vlAport").value;

        d.list.map(({ pc }, key) => (d.list[key].vl = vlAport * (pc / 100)));

        list.view();
        aport.view();

        aport.formSaveMode_lock();
        $classAdd(".f_list .pc", "disabledColor");
    },

    onSaveBtnClick() {
        (async function () {
            const clinicId = ls.clinicId;
            const date = $("@dtAport").value;
            const value = $("@vlAport").value;
            const list = d.list;

            const resp = await $fetch({
                url: "tools/config/partner/partner/save_entryes",
                par: { clinicId, date, value, list },
                fnName: "SALVA APORTE #623",
            });

            // dataset.set.list(resp.list);
            // viewdom.all();
        })();

        // list.changed = false;
        // $classRemove(list.selectors, 'disabledColor');
    },

    onCancelBtnClick() {
        $("@dtAport").value = "";
        $("@vlAport").value = "";
        d.list.map((el, key) => (d.list[key].vl = 0));

        list.view();
        aport.view();

        aport.formSaveMode_unlock();
    },

    formSaveMode_lock() {
        if (!aport.changed) {
            aport.changed = true;

            $classAdd(aport.selectors, "disabledColor");

            $(".btn_find_user").disabled = true;
        }
    },

    formSaveMode_unlock() {
        aport.changed = false;

        $classRemove(aport.selectors, "disabledColor");

        $(".btn_find_user").disabled = false;
    },

    init: (function () {
        $("@dtAport").addEventListener("change", () => aport.onDateChange());
        $("@vlAport").addEventListener("change", () => aport.onValueChange());
        $(".f_aporte .btnSave").addEventListener("click", () => aport.onSaveBtnClick());
        $(".f_aporte .btnCancel").addEventListener("click", () => aport.onCancelBtnClick());
    })(),
};

const find = {
    clinic: {
        callback(data) {
            ls.set("clinicId", data.id);
            dataset.get();
        },

        start() {
            if (!$permission(9)) return;

            $findModule.init({
                urn: "clinic/register/find/findClinic",
                title: "Busca Clínica",
                tptTexts: { col2: "Clínica" },
                columnsQuantity: 2,
                width: "450px",
                callback: (y) => this.callback(y),
            });
        },
    },

    user: {
        callback(data) {
            list.onAddNewUser(data);
        },

        start() {
            if (!$permission(53)) return;

            $findModule.init({
                urn: "user/register/find/findUser",
                title: "Busca Usuário",
                tptTexts: { col2: "Nome" },
                columnsQuantity: 3,
                parameter: "short",
                width: "550px",
                callback: (y) => this.callback(y),
            });
        },
    },

    init: (function () {
        $(".btn_find_clinic").addEventListener("click", () => find.clinic.start());
        $(".btn_find_user").addEventListener("click", () => find.user.start());
    })(),
};

const go = {
    userStatement(userId) {
        if (!$permission(112)) return;

        ls.set("user", userId, "statement");
        window.location.href = `${baseURL}user/user_statement`;
    },
};
