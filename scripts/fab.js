let btn = document
            .getElementsByClassName("collapse");
            
for (let i = 0; i < btn.length; i++) {        
    btn[i].addEventListener("click", function () {
        let content = this.nextElementSibling;
        if (content.classList.contains("hidden")) {
            content.classList.remove("hidden");
            btn[i].textContent = "Hide Code";
        } else {
            content.classList.add("hidden");
            btn[i].textContent = "Show Code";
        }
    });
}