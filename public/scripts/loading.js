const loadingTexts = document.querySelectorAll('.loading-text');
let animationStep = 0;

function updateLoadingText() {
    if (animationStep === 0) {
        loadingTexts.forEach(loadingText => {
            loadingText.textContent = 'Загрузка';
        })
        animationStep = 1;
    } else if (animationStep === 1) {
        loadingTexts.forEach(loadingText => {
            loadingText.textContent = 'Загрузка.';
        })
        animationStep = 2;
    } else if (animationStep === 2) {
        loadingTexts.forEach(loadingText => {
            loadingText.textContent = 'Загрузка..';
        })
        animationStep = 3;
    } else if (animationStep === 3) {
        loadingTexts.forEach(loadingText => {
            loadingText.textContent = 'Загрузка...';
        })
        animationStep = 0;
    }
}

setInterval(updateLoadingText, 200);
