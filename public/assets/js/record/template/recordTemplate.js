export const obj = {
    textarea: `
        <div class="mod-main shadow-sm textarea" id="{id}" data-index="{index}" data-type="{type}" data-height="{height}">
            <div class="title-main">
                <div class="left-box">
                    <h6>{title}</h6>
                    <span>{comment}</span>
                </div>

                <div class="right-box">
                    {rightBox}
                </div>
            </div>

            <div class="quillText"></div>
        </div>`,

    radio: `
        <div class="mod-main shadow-sm radio" id="{id}" data-index="{index}" data-type="{type}">
            <div class="title-main">
                <div class="left-box">
                    <h6>{title}</h6>
                    <span>{comment}</span>
                </div>

                <div class="right-box">
                    {rightBox}
                </div>
            </div>

            <div class="content">
                {content}
            </div>
        </div>`,

    check: `
        <div class="mod-main shadow-sm check" id="{id}" data-index="{index}" data-type="{type}">
            <div class="title-main">
                <div class="left-box">
                    <h6>{title}</h6>
                    <span>{comment}</span>
                </div>

                <div class="right-box">
                    {rightBox}
                </div>
            </div>

            <div class="content">
                {content}
            </div>
        </div>`,

    numberlist: `
        <div class="mod-main shadow-sm numberlist" id="{id}" data-index="{index}" data-type="{type}">
            <div class="title-main">
                <div class="left-box">
                    <h6>{title}</h6>
                    <span>{comment}</span>
                </div>

                <div class="right-box">
                    {rightBox}
                </div>
            </div>

            <div class="row content">
                {content}
            </div>
        </div>`,

    allergy: `
        <div class="mod-main shadow-sm textlist allergy" id="{id}" data-index="{index}" data-type="{type}">
            <div class="title-main">
                <div class="left-box">
                    <h6>{title}</h6>
                    <span>{comment}</span>
                </div>

                <div class="right-box">
                    {rightBox}
                </div>
            </div>

            <div class="content">
                <div class="col-5">
                    <div class="input-group">
                        <input class="form-control" list="allergy" placeholder="Digite a alergia..." />
                        <button class="btn color-wau1 add">
                            <i class="fa-light fa-folder-plus fa-lg"></i>
                        </button>
                    </div>
                    <datalist id="allergy"></datalist>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-2 py-2 border data" style="min-height:70px">
                </div>
            </div>
        </div>`,

    smoking: `
        <div class="mod-main shadow-sm smoking" id="{id}" data-index="{index}" data-type="{type}">
            <div class="title-main">
                <div class="left-box">
                    <h6>{title}</h6>
                    <span>{comment}</span>
                </div>

                <div class="right-box">
                    {rightBox}
                </div>
            </div>

            <div class="content">
                {content}
            </div>
        </div>`,

    quillModel: {
        1: ``,
        2: `<h3><strong>S</strong>&nbsp;-&nbsp;Subjetivo</h3><h3>Queixa principal (QP):</h3><h3><br></h3><h3>História da Doença Atual (HDA):</h3><h3><br></h3><h3>Sintomas associados:</h3><h3><br></h3><h3>Antecedentes pessoais/familiares:</h3><h3><br></h3><h3>Uso de medicamentos:</h3><h3><br></h3><h3>Hábitos de vida:</h3><h3><br></h3><h3>Alergias:</h3>`,
        3: `Teste 3`,
    },
};
