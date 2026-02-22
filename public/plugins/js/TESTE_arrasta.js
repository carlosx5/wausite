setTimeout(() => {
    const draggables = document.querySelectorAll(".draggable");
    let draggedItem = null;

    draggables.forEach((item) => {
        item.addEventListener("dragstart", () => {
            draggedItem = item;
            item.classList.add("dragging");
        });

        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
        });

        item.addEventListener("dragover", (e) => {
            e.preventDefault();
            if (item !== draggedItem) {
                item.classList.add("drag-over");
            }
        });

        item.addEventListener("dragleave", () => {
            item.classList.remove("drag-over");
        });

        item.addEventListener("drop", () => {
            if (item !== draggedItem) {
                item.classList.remove("drag-over");
                const list = item.parentNode;
                const draggedIndex = [...list.children].indexOf(draggedItem);
                const targetIndex = [...list.children].indexOf(item);

                if (draggedIndex < targetIndex) {
                    list.insertBefore(draggedItem, item.nextSibling);
                } else {
                    list.insertBefore(draggedItem, item);
                }
            }
        });
    });
}, 2000);
