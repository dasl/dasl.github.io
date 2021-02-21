// Init
var init = e => {
    const user = $('#usuario')
    const data = JSON.parse(sessionStorage.getItem('data'));
    user.html(data.firstName + " " + data.lastName)
    if(data.profilePictureUrl){
        $('.avatar').html('<img class="img-avatar rounded-circle" src="'+data.profilePictureUrl+'" alt="'+data.firstName + ' ' + data.lastName+'">')
    }
    executeChart()
    getDevices()
}

init()

// Gráfico - API de Rendimiento de Equipos
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Rendimiento de Equipos',
            data: [],
            backgroundColor: '#469fffbd',
            borderWidth: 1
        }]
    },
    options: {
        legend: {
            labels: {
                // This more specific font property overrides the global property
                fontSize: 15
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

// updateChart: Ejecuta el ajax, obteniendo la data del API de Performance
function updateChart(){
    $.ajax({
        method: "GET",
        url: 'https://frontend-excercise.dt.timlabtesting.com/ops/device/performance',
      })
    .done( msg => {
        myChart.data.datasets[0].data = msg.values
        myChart.data.labels = msg.devices
        myChart.update()
    })
}

// Obtener data cada 5 segundos
function executeChart(){
    updateChart();
    setInterval(updateChart, 5000);
}


// getDevices: Obtiene un listado de los equipos disponibles desde la API
function getDevices(){
    $.ajax({
        method: "GET",
        url: 'https://frontend-excercise.dt.timlabtesting.com/ops/device/list',
      })
    .done( msg => {
        let devices = msg.devices;
        let nr_device = 0;
        devices.forEach(element => {
            $(`
            <li class="list-group-item">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${nr_device}" id="${nr_device}">
                <label class="form-check-label" for="${nr_device}">
                    ${element}
                </label>
                </div>
            </li>  
          `).insertAfter('#devicesTitle')
          nr_device++;
        });
    })
}

// Footer rigths
const rights = $('#dateRights')
const getFullYear = new Date().getFullYear()
rights.html(getFullYear)