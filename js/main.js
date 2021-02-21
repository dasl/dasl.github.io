/*!
  * main.js 
  * Gestiona la lógica del sitio web, la conexión a las APIs y la modularización de objetos.
  * Author: Diego Sandoval Leiva - dasl.cl
  * Licensed under MIT 
  */


// Controladores
var devices_status_array = [] // Almacena los divs correspondientes de cada device 
var devices_logs = {} // Almacena los logs de cada device
var open_devices = [] // Almacena los devices abiertos. "seleccionados"

// Init - Ejecuta funciones iniciales
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

// executeChart: Obtener data cada 5 segundos
function executeChart(){
    updateChart();
    setInterval(updateChart, 5000);
}



// deviceTitle: Genera un elemento de lista asociado al device :dev.
var deviceTitle = (dev,nr_device) => {
    return `<li class="list-group-item">
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${nr_device}" id="${nr_device}">
            <label class="form-check-label" for="${nr_device}">
                ${dev} 
            </label>
        </div>
    </li> `;
}

// deviceStatus: Genera un elemento que muestra el status del device.
// dev: Nombre del device
// nr_device: Id asignado
var deviceStatus = (dev,nr_device) => {
    return `<div data-deviceID=${nr_device} data-deviceName="${dev}" class="card-device col-md-3 px-1 pb-2">
        <ul class="list-status list-group">
            <li class="tag-dev list-group-item list-group-item-success"><span class="font-weight-bold">${dev}</span> </li>
            <ul class="list-status list-group-item"></ul>
        </ul>
    </div>`
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
        // Agregamos los devices al listado junto a su ficha respectiva.        
        devices.forEach(element => {
            $(deviceTitle(element,nr_device)).insertAfter('#devicesTitle')
            devices_status_array.push(deviceStatus(element,nr_device))
            devices_logs[element] = [] // Se registra el device en el objeto que hace log
            nr_device++;
        });
    })
}


// setIcon: A partir del estado del device, retorna el icono.
// :status Estado del device
function setIcon(status){
    let icon = ''
    if(status.includes('OK')){
        icon = '<i class="bi bi-check-circle align-self-center mr-2"></i>';
    }
    else {
        icon = '<i class="bi bi-exclamation-triangle align-self-center mr-2"></i>'
    }
    return icon
}

// getLogs: Obtiene los logs de un device y los entrega como un elemento de lista.
// devName: Nombre del device
function getLogs(devName){
    let logs_temp = '';
    
    devices_logs[devName].forEach(element => {
        let icon_temp = setIcon(element);
        logs_temp = `<li class="list-group-item text-dark d-flex">${icon_temp + element}</li>` + logs_temp;
    });
    return logs_temp
}

// lastLog: Obtiene el log más reciente.
// devName: Nombre del device
// status: Estado del device
// time: Hora
function lastLog(devName,status ,time){
    let icon_temp = setIcon(status);
    logs_temp = `<li class="list-group-item text-dark d-flex">${icon_temp + time + " | " + status}</li>`;

    return logs_temp
}


// toggleDevice: Muestra/Oculta las fichas de los devices.
// dev: Id del device
// check: Estado del checkbox
function toggleDevice(dev, check){
    if(check){
        $('#deviceStatus').append(devices_status_array[dev])
        let name_temp = $('*[data-deviceID="'+dev+'"]').data('devicename')
        $('*[data-deviceID="'+dev+'"] ul > .list-status').prepend(getLogs(name_temp))
        open_devices.push(dev)
    }
    else{
        $('*[data-deviceID="'+dev+'"]').fadeOut('100', e => {
            $('*[data-deviceID="'+dev+'"]').remove()
        });
    }
    $('*[data-deviceID="'+dev+'"]').toggle(300);
}
$(document).on('change',':checkbox' , e => {
    toggleDevice(e.target.id,e.target.checked);
})


///////////////////////////////////////////////////////////////////////////////////

// Salir: Cerrar sesión
const salir = $('#salir')

salir.click( e => { // Cierra la sesión y redirecciona al login
    sessionStorage.clear()
    window.location.href = './'
})

///////////////////////////////////////////////////////////////////////////////////

// WebSocket: Obtiener los datos de la API de EventStream

// Crea una nueva conexión.
const socket = new WebSocket('wss://frontend-excercise.dt.timlabtesting.com/eventstream/connect');

// Abre la conexión
socket.addEventListener('open', function (event) {
    socket.send('Conexión al servidor');
});


// Escucha por mensajes
// Guarda en el log "devices_logs" el estado y la hora de cada device.
socket.addEventListener('message', function (event) {
    var temp_device_name = event.data.split("|")[0];
    var temp_device_status = event.data.split("|")[1];
    var time = new Date().toLocaleTimeString();
    devices_logs[temp_device_name].push(time + " | " + temp_device_status);
    $('*[data-deviceName="'+temp_device_name+'"] ul > .list-status').prepend(lastLog(temp_device_name, temp_device_status, time))
});

///////////////////////////////////////////////////////////////////////////////////

// Footer rigths
const rights = $('#dateRights')
const getFullYear = new Date().getFullYear()
rights.html(getFullYear)