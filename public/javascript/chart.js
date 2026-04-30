let barChart;
let doughnut;
function updateCharts(){
const isDark=document.documentElement.classList.contains("dark")
const newColor=isDark ? "#ffffff" : "#0F766E";

if(barChart){
  barChart.options.scales.x.ticks.color = newColor;
    barChart.options.scales.y.ticks.color = newColor;
    barChart.update();
}
if(doughnut){
  doughnut.options.plugins.legend.labels.color = newColor;
    doughnut.update();
}
}

window.updateCharts=updateCharts

document.addEventListener("DOMContentLoaded",function(){
    if(!window.dashboardData) return;


     const data = window.dashboardData;


      const isDark = document.documentElement.classList.contains("dark");
  const newColor = isDark ? "#ffffff" : "#0F766E";
  // Bar Chart
 barChart= new Chart(document.getElementById('deptChart'), {
    type: 'bar',
    data: {
      labels: data.deptLabels,
      datasets: [{
        data: data.deptValues,
        backgroundColor: '#14B8A6',
        borderRadius: 6,
        barThickness: 24
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x:{
         ticks:{
            color:newColor
         }
        },
        y: {
          beginAtZero: true,
          min: 0,
          max: 10,
          ticks: {
            color:newColor,
            stepSize: 1,
            precision: 0
          }
        }
      }
    }
  });

  // Doughnut Chart
  doughnut=new Chart(document.getElementById('libraryPieChart'), {
    type: 'doughnut',
    data: {
      labels: [
        'Total Books',
        'Online Readers',
        'Total Students',
        'Issued Books',
        'Fine Paid',
        'Fine Unpaid'
      ],
      datasets: [{
        data: [
          data.totalBooks,
          data.onlineReadersCount,
          data.totalStudents,
          data.issuedCount,
          data.finePaidCount,
          data.fineUnpaidCount
        ],
        backgroundColor: [
          '#0F766E',
          '#3B82F6',
          '#F59E0B',
          '#14B8A6',
          '#22C55E',
          '#EF4444'
        ],
        borderWidth:0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
     plugins: {
  legend: {
    labels: {
      color: newColor,
      boxWidth: 30,
      boxHeight: 12,
      padding: 15
    }
  }
}
    }
  });
})