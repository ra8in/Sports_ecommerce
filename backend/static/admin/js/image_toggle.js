document.addEventListener('DOMContentLoaded', function () {
    function truncateLongTexts(row) {
        // Truncate any "Currently" links (for both File uploads and URL fields)
        row.querySelectorAll('a').forEach(link => {
            if (link.innerText.length > 30 && !link.dataset.truncated) {
                link.dataset.truncated = 'true';
                link.title = link.innerText; // Keep full text in hover tooltip
                link.innerText = link.innerText.substring(0, 30) + '...';
            }
        });
    }

    function toggleFields(row) {
        const fileInput = row.querySelector('input[type="file"][name$="-image"]');
        const urlInput = row.querySelector('input[type="url"][name$="-image_url"]');

        const fileWrapper = fileInput ? fileInput.closest('.fieldBox') || fileInput.parentElement : null;
        const urlWrapper = urlInput ? urlInput.closest('.fieldBox') || urlInput.parentElement : null;

        const currentFileValue = row.querySelector('.file-upload') !== null || (fileInput && fileInput.value) || row.querySelector('a[href*="/media/products/"]') !== null;

        if (fileInput && urlInput && urlWrapper && fileWrapper) {
            const fileFilled = fileInput.value !== '' || currentFileValue;
            const urlFilled = urlInput.value.trim() !== '';

            if (fileFilled) {
                urlWrapper.style.visibility = 'hidden';
                fileWrapper.style.visibility = 'visible';
            } else if (urlFilled) {
                fileWrapper.style.visibility = 'hidden';
                urlWrapper.style.visibility = 'visible';
            } else {
                fileWrapper.style.visibility = 'visible';
                urlWrapper.style.visibility = 'visible';
            }
        }
    }

    function init() {
        document.querySelectorAll('.dynamic-images, .inline-related').forEach(row => {
            toggleFields(row);
            truncateLongTexts(row);
        });

        // Auto-increment the order field when a new row is added
        document.addEventListener('click', function(e) {
            if (e.target.matches('.add-row a')) {
                setTimeout(() => {
                    const rows = Array.from(document.querySelectorAll('.dynamic-images, .inline-related:not(.empty-form)'));
                    if (rows.length > 0) {
                        const newRow = rows[rows.length - 1];
                        const prevRow = rows[rows.length - 2];
                        const newOrderInput = newRow.querySelector('input[type="number"][name$="-order"]');
                        if (newOrderInput && prevRow) {
                            const prevOrderInput = prevRow.querySelector('input[type="number"][name$="-order"]');
                            if (prevOrderInput && prevOrderInput.value !== '') {
                                newOrderInput.value = parseInt(prevOrderInput.value || 0) + 1;
                            } else {
                                newOrderInput.value = rows.length - 1;
                            }
                        } else if (newOrderInput && !prevRow) {
                            newOrderInput.value = 0;
                        }
                    }
                }, 50);
            }
        });

        document.addEventListener('change', function (e) {
            if (e.target.matches('input[type="file"][name$="-image"], input[type="url"][name$="-image_url"]')) {
                const row = e.target.closest('tr') || e.target.closest('.inline-related');
                if (row) toggleFields(row);
            }
        });

        document.addEventListener('input', function (e) {
            if (e.target.matches('input[type="url"][name$="-image_url"]')) {
                const row = e.target.closest('tr') || e.target.closest('.inline-related');
                if (row) toggleFields(row);
            }
        });
    }

    setTimeout(init, 300);
});
