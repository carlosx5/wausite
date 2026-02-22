document.addEventListener("DOMContentLoaded", () => {
    $a(".title_div").backColor('#fff');
});


//https://medium.com/tableless/construindo-sua-propria-bliblioteca-javascript-17b0f7ccbd71
//https://github.com/clovisdasilvaneto/blJs/blob/master/biblioteca.html
(function () {
    var blJs = function (arg) {
        if (!(this instanceof blJs)) {
            return new blJs(arg);
        }
        this.myArg = arg;
    }

    blJs.fn = blJs.prototype = {
        esconde: function () { document.querySelector(this.myArg).setAttribute("style", "display: none"); },
        color: function (cor) { document.querySelector(this.myArg).setAttribute("style", `color: ${cor}`); },
        backColor: function (cor) {
            const el = document.querySelector(this.myArg);
            el.setAttribute("style", `background-color: ${cor}`);

            return el;
        },
    }

    window.blJs = blJs, window.$a = blJs;
})();