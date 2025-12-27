function showContextMenu(event) {
    event.preventDefault();
    const menu = document.getElementById('contextMenu');

    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    menu.classList.add('active');

    setTimeout(() => {
        document.addEventListener('click', hideContextMenu);
    }, 100);
}

function hideContextMenu() {
    const menu = document.getElementById('contextMenu');
    if (!menu) return;

    menu.classList.remove('active');
    document.removeEventListener('click', hideContextMenu);
}
