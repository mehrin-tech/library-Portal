document.addEventListener("DOMContentLoaded",function(){
    const toggleBtn=document.getElementById("themeToggle")
    const html=document.documentElement;

    if(!toggleBtn) return;

      // Set correct icon on load
  if (html.classList.contains("dark")) {
    toggleBtn.textContent = "☀️";
  }

  toggleBtn.addEventListener("click", () => {
    html.classList.toggle("dark");

    if (html.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      toggleBtn.textContent = "☀️";
    } else {
      localStorage.setItem("theme", "light");
      toggleBtn.textContent = "🌙";
    }
  });
})