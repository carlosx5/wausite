<?= isset($_SESSION["SbMenuOn"]) ? "\n\n</div><!-- ROW FIM -->\n" : ''; ?>

<div js="overlay"></div>
<div id="waitingOverlay" style="display:none">
    <div class="box">
        <div class="spinner-border"></div>
        <div style="font-weight:1000">Processando...</div>
    </div>
</div>

<!-- //:Toast de mensagem -->
<div class="toast-container position-fixed" id="bootstrap-toast">
    <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
            <img class="img-fluid" src="<?= $wauSmallLogo ?>" style="width: 50px; height: 18px" />
            <button class="btn-close ms-auto" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body py-4"></div>
    </div>
</div>

<!-- //:Modal de busca -->
<div class="modal fade" id="modalFind" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Template</h5>
                <button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body col-12">
                <div class="input-box">
                    <div class="input-group">
                        <input type="text" class="form-control inputFind" name="find" placeholder="" />
                        <button class="btn color-wau1"><i class="fa-light fa-folder-open"></i></button>
                    </div>
                </div>

                <div class="modal-table scrollbar mt-2">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style="width: 40px">Id</th>
                                <th scope="col" class="col2">Template</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- //:Modal de mensagem -->
<div class="modal fade" id="messageModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5"></h1>
                <button class="btn-close" data-dtback="exit" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p class="text1"></p>
                <p class="text2 mb-0"></p>
                <div class="html"></div>
            </div>
            <div class="modal-footer">...</div>
        </div>
    </div>
</div>

<?php if (isset($header['style'])): ?>
    <?php echo view('pages/templates/footer_page.html'); ?>
<?php endif; ?>

<?php if (isset($googleTag)): ?>
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-17980335-6"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());

        gtag('config', 'UA-17980335-6');
    </script>
<?php endif; ?>

<script src="https://kit.fontawesome.com/222ab7e352.js" crossorigin="anonymous"></script>

<script>
    window.varJS = <?= json_encode($varJS ?? []) ?>;
    window.CSRF_TOKEN = '<?= csrf_hash() ?>';
</script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js" integrity="sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q" crossorigin="anonymous"></script>

<?php
if (isset($js)) {
    foreach ($js as $j) {
        if (str_contains($j, '#m')) {
            $j = str_replace('#m', '', $j);
            echo "<script type='module' src=\"" . base_url($j) . "\"></script>\n";
        } else {
            echo "<script src=\"" . base_url($j) . "\"></script>\n";
        }
    }
}
?>

</body>

</html>