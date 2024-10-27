// modal.js

const circuitModalScript = document.getElementById('circuitModalScript');
const closeModalButton = document.querySelector('.close-modalB');

function showModal() {
    circuitModalScript.style.display = 'block';
}

function closeModalB() {
    circuitModalScript.style.display = 'none';
}

if (closeModalButton) {
    closeModalButton.onclick = closeModalB;
}
function closeCircuitModal() {
    document.getElementById('circuitModalScript').style.display = 'none';
}


window.onclick = function(event) {
    if (event.target === circuitModal) {
        closeModalB();
    }
}

// Exibir modal ao carregar a página
window.onload = showModal;
