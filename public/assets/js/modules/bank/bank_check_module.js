const btnCheckStatement = {
    check: async function (bank, table) {
        if (!$permission([152]) || !bank || !table) return;

        await $fetch({
            url: 'statement/statement/set_check',
            par: {
                bank,
                table,
                user: cookie.get('log_userId')
            },
            fnName: 'EXECUTA CHECK #599',
        });

        this.callback();
    },

    reset: async function () {
        if (!$permission([9])) return;

        await $fetch({
            url: 'statement/statement/resset_check',
            fnName: 'RESSET CHECK #600',
        });

        this.callback();
    },

    init(callback, resset = null) {
        if (!$permission([152], 0)) return;

        this.callback = callback;

        if (resset) $(resset).onclick = () => btnCheckStatement.reset();
    },
};