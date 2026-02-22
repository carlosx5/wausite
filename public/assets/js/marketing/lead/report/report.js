const d = {//DATA
    list: [],
    status: {
        list: {},
        menu: {},
        height: false,
    },
};

const v = {//VARIÁVEIS
};

document.addEventListener("DOMContentLoaded", () => {
    database.get()
});

const database = {
    get: async function () {
        const resp = await $fetch({
            url: 'marketing/lead/report/report/getList',
            par: {},
            fnName: 'BUSCA DADOS #625',
        });

        database.set.all(resp);
        viewdom.list();
    },

    resset() {
        return;
    },

    set: {
        list(list) {
            d.list = list || {};
        },

        status(statusList) {
            d.status.list = statusList || {};

            d.status.menu = '<div>' + d.status.list.map(e => `<div data-id_status="${e.id}">- ${e.name}</div>`).join('') + '</div>';
            $append('.box1', d.status.menu, 'button');

            //ALTURA DO BOX
            d.status.height = $ocutObjectMeasurements('.box1').height;
        },

        all(data) {
            this.list(data.list);
            this.status(data.statusList);
        },
    },
};

const viewdom = {
    list() {
        let line = 0;

        const tpt = d.list.map(({ id, id_status, id_marketing, id_session, device, zap_clicked, name, cell, email, screen, date, state }) => {
            line++;
            const key = d.status.list.findIndex(el => el.id == id_status);
            const nm_status = d.status.list[key].name;
            const color = d.status.list[key].color;

            return `
                <tr data-id_lead="${id}">
                    <th scope="row">${line}</th>
                    <td>${id}</td>
                    <td class="status" style="color:${color}">
                        <div class="flex">
                            <div>${nm_status}</div>
                            <div><i class="fas fa-caret-right"></i></div>
                        </div>
                    </td>
                    <td>${id_marketing}</td>
                    <td>${id_session}</td>
                    <td>${device}</td>
                    <td>${zap_clicked}</td>
                    <td>${name}</td>
                    <td>${cell}<i class="fab fa-whatsapp ps-2"></i></td>
                    <td>${email}</td>
                    <td>${screen}</td>
                    <td>${date}</td>
                    <td>${state}</td>
                </tr>`
        }).join('');

        $('tbody').innerHTML = tpt;
    },
};

const events = {
    click(event) {
        const target = event.target;

        //WHATSAPP
        if (target.closest('.fa-whatsapp')) return $go.zap(target.parentElement.textContent);

        //ABRE STATUS
        if (target.closest('.status')) {
            if (!$permission(160)) return;

            const top = (event.clientY < (window.innerHeight / 2)) ? event.clientY : event.clientY - d.status.height;
            const el = $('.box1');

            el.style.display = 'block';
            el.style.top = top + 'px';
            el.dataset.id_lead = target.closest('tr').dataset.id_lead;
            $('main').style.overflow = "hidden";

            return;
        };

        //ALTERA STATUS
        if (target.closest('.box1')) {
            const id_lead = target.closest('.box1').dataset.id_lead;
            const id_status = target.dataset.id_status;

            if (target.closest('.btnExit')) return exit();

            if (id_status) {
                (async function () {
                    const resp = await $fetch({
                        url: 'marketing/lead/report/report/updateStatus',
                        par: {
                            id_lead: id_lead,
                            id_status: id_status,
                        },
                        fnName: 'UPDATE STATUS #626',
                    });

                    database.set.list(resp.list);
                    viewdom.list();

                    return exit();
                }());
            };

            function exit() {
                $('.box1').style.display = 'none';
                $('main').style.overflow = "auto";
            };

            return;
        };
    },

    init: (function () {
        $('.container').addEventListener('click', event => events.click(event));
    }())
};