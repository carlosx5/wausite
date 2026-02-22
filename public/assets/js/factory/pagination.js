const Pagination = () => ({
    show() {
        let tpt = '';
        let disabled = '';

        tpt += '<li class="page_item"><button class="btn" onclick="pagination.onClick(\'first\')"><i class="fas fa-step-backward"></i></button></li>';
        tpt += '<li class="page_item"><button class="btn" onclick="pagination.onClick(\'previous\')"><i class="fas fa-caret-left"></i></button></li>';
        for (let i = 1; i <= this.totalPage; i++) {
            disabled = (i == this.pagInit) ? ' disabled' : '';
            tpt += `<li class="page_item"><button class="btn${disabled}" onclick="pagination.onClick(${i})">${i}</button></li>`;
        };
        tpt += '<li class="page_item"><button class="btn" onclick="pagination.onClick(\'next\')"><i class="fas fa-caret-right"></i></button></li>';
        tpt += '<li class="page_item"><button class="btn" onclick="pagination.onClick(\'last\')"><i class="fas fa-step-forward"></i></button></li>';

        $(this.f).innerHTML = tpt;
    },

    set(data) {
        pagination.totalRegisters = data.totalRegisters;
        pagination.balance = data.balance;
        pagination.totalPage = data.totalPage > 20 ? 20 : data.totalPage;
    },

    onClick(val) {
        if (this.pagInit == val) return;

        switch (val) {
            case 'previous':
                if (this.pagInit <= 1) return;
                val = this.pagInit - 1;
                break;
            case 'next':
                if (this.pagInit >= this.totalPage) return;
                val = this.pagInit + 1;
                break;
            case 'first':
                if (this.pagInit <= 1) return;
                val = 1;
                break;
            case 'last':
                if (this.pagInit >= this.totalPage) return;
                val = this.totalPage;
                break;
        };

        this.pagInit = val;
        this.callback();
    },

    init(data) {
        this.f = data.father;
        this.totalPage = data.totalPage;
        this.pagInit = data.pagInit;
        this.pagLimit = data.pagLimit;
        this.callback = data.callback;
        this.totalRegisters = data.totalRegisters;
        this.balance = data.balance;
    },
});