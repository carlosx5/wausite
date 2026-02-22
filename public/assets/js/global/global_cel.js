document.addEventListener("DOMContentLoaded", () => {
    if ($(".btn_show_menu")) $sidebar.init();
});

const $sidebar = {
    showHide() {
        $(".sidebar").classList.toggle("sidebar_on");
    },

    dropSubmenu(e) {
        let target = $(e).data("submenutarget");

        $(`[data-subMenuName=${target}]`).slideToggle(300);
    },

    btns(btn, action) {
        const $parent = $(`.btn_sidebar.${btn}`).parent()[0];

        if (action) {
            $($parent).removeClass("disabledColor");
        } else {
            $($parent).addClass("disabledColor");
        }
    },

    init() {
        $$(".btn_show_menu").forEach((e) => e.addEventListener("click", () => $sidebar.showHide()));

        // $('.li_dropdown').onclick = e => $sidebar.dropSubmenu(e);
    },
};
