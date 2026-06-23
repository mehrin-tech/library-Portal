// document.addEventListener("DOMContentLoaded",function(){
//     const toggleBtn=document.getElementById("themeToggle")
//     const html=document.documentElement;

//     if(!toggleBtn) return;

//       // Set correct icon on load
//   if (html.classList.contains("dark")) {
//     toggleBtn.textContent = "☀️";
//   }

//   toggleBtn.addEventListener("click", () => {
//     html.classList.toggle("dark");


//     setTimeout(()=>{
//       if(window.updateCharts){
//         window.updateCharts()
//       }
//     },100)
//     if (html.classList.contains("dark")) {
//       localStorage.setItem("theme", "dark");
//       toggleBtn.textContent = "☀️";
//     } else {
//       localStorage.setItem("theme", "light");
//       toggleBtn.textContent = "🌙";
//     }
//   });
// })
document.addEventListener("DOMContentLoaded", () => {
 const toggleBtn = document.getElementById("themeToggle")
 const html = document.documentElement

 if(!toggleBtn) return

 function updateTheme(){
   const isDark = html.classList.contains("dark")

   toggleBtn.textContent = isDark ? "☀️" : "🌙"

   localStorage.setItem(
     "theme",
     isDark ? "dark" : "light"
   )

   if(window.updateCharts){
     setTimeout(()=>window.updateCharts(),100)
   }
 }

 updateTheme()

 toggleBtn.addEventListener("click",()=>{
   html.classList.toggle("dark")
   updateTheme()
 })
})