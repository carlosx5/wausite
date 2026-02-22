document.addEventListener("DOMContentLoaded", () => {
    $$('.f_register .btn').forEach(e => e.onclick = e => btnClicked[e.currentTarget.dataset.target]());
});

const btnClicked = {
    procedure1() {
        window.location.href = `${baseURL}procedure/procedure`;
    },

    plan1() {
        window.location.href = `${baseURL}plan/plan_register`;
    },

    access1() {
        window.location.href = `${baseURL}tools/config/permission/permission`;
    },

    login1() {
        $fetch({
            url: 'tools/config/config/config/login1',
            fnName: '#login1',
        });
    },

    ls1() {
        localStorage.clear();
    },

    partner() {
        window.location.href = `${baseURL}tools/config/partner/partner`;
    },
};