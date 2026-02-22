window.addEventListener("DOMContentLoaded", function () {
    //:Valores iniciais para cropper
    cropper.par_aspectRatio = NaN;
    cropper.par_viewMode = 2;
    cropper.factory = new Cropper($("#image"), {
        aspectRatio: cropper.par_aspectRatio,
        viewMode: cropper.par_viewMode,
    });

    //:Eventos
    $event(".cropper-tools", false, "click,change", (event) => cropper.events(event), false);

    //:Exibe container da imagem (está oculta por padrão)
    $(".cropper-img").style.display = "flex";
});

const cropper = {
    events(event) {
        const target = event.target;

        //:Evento "change"
        if (event.type == "change") {
            //:Imagem alterada
            if (target.closest("#cropperInputImage")) {
                const file = target.files[0];
                const image = $("#image");
                if (file) {
                    const url = URL.createObjectURL(file);
                    image.src = url;
                    image.style.display = "block";

                    //:Remove "factory" atual
                    if (cropper.factory) {
                        cropper.factory.destroy();
                    }

                    //:Cria "factory" com imagem atual
                    image.onload = () => {
                        cropper.factory = new Cropper(image, {
                            aspectRatio: cropper.par_aspectRatio,
                            viewMode: cropper.par_viewMode,
                        });
                    };
                }
            }
        }

        //:Evento "click"
        if (event.type == "click") {
            //:Webcan inicia
            if (target.closest("#webcanStart")) {
                const video = document.getElementById("webcam");

                //:Inicia a webcam
                navigator.mediaDevices
                    .getUserMedia({ video: true })
                    .then((stream) => {
                        video.srcObject = stream;
                    })
                    .catch((err) => {
                        console.error("Erro ao acessar a webcam:", err);
                    });
            }

            //:Webcan captura frame
            if (target.closest("#webcanCapture")) {
                const canvas = document.getElementById("snapshot");
                const image = document.getElementById("image");
                const video = document.getElementById("webcam");
                const context = canvas.getContext("2d");

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL("image/png");
                image.src = dataUrl;
                image.style.display = "block";

                //:Para a webcam
                const stream = video.srcObject;
                if (stream) {
                    stream.getTracks().forEach((track) => track.stop());
                    video.srcObject = null;
                }

                //:Remove "factory" atual
                if (cropper.factory) {
                    cropper.factory.destroy();
                }

                //:Cria "factory" com imagem atual
                image.onload = () => {
                    cropper.factory = new Cropper(image, {
                        aspectRatio: cropper.par_aspectRatio,
                        viewMode: cropper.par_viewMode,
                    });
                };
            }

            //:Recorta imagem selecionada
            if (target.closest("#cropButton")) {
                if (cropper.factory) {
                    const canvasResult = $("#croppedResult");
                    const croppedCanvas = cropper.factory.getCroppedCanvas();

                    canvasResult.getContext("2d").clearRect(0, 0, canvasResult.width, canvasResult.height);
                    canvasResult.width = croppedCanvas.width;
                    canvasResult.height = croppedCanvas.height;
                    canvasResult.getContext("2d").drawImage(croppedCanvas, 0, 0);
                }
            }

            //:Envia imagem
            if (target.closest("#sendImage")) {
                //:Enviar via fetch
                (async () => {
                    try {
                        const canvas = cropper.factory.getCroppedCanvas();
                        if (!canvas) {
                            throw new Error("Não foi possível obter o canvas da imagem.");
                        }

                        const croppedBase64 = canvas.toDataURL("image/jpeg");
                        // return cl(g.callback);

                        const response = await $fetch({
                            // url: "tools/teste/teste/setImage",
                            url: g.callback,
                            par: { image: croppedBase64 },
                            // overlay: false,
                        });

                        console.log(response);
                    } catch (error) {
                        console.error("Erro ao enviar a imagem:", error);
                    }
                })();
            }

            //:Teste
            if (target.closest("#teste")) {
                //:Enviar via fetch
                (async () => {
                    fetch("tools/teste/teste/getTeste")
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error("Erro ao carregar o código JS");
                            }
                            return response.text();
                        })
                        .then((codigo) => {
                            cropper.teste = eval(codigo);
                            console.log(cropper.teste());
                        })
                        .catch((error) => {
                            console.error("Erro na requisição:", error);
                        });
                })();
            }
        }
    },
};
