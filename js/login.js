// Login.js
// Validaciones - Requests

// Init setups
// He creado una sesion para probar la persistencia de las credenciales.
var existSession = e => {
    let confirm = sessionStorage.hasOwnProperty('data')
    if(confirm){
        window.location.href = './'
    }
}
existSession()

var params = new URLSearchParams(window.location.search)
console.log(window.location.href)
if(params.has("error")){
    $('.custom-alert').addClass('show')
}

// DOM Elements
const login = $("#login")
const user = $("#user")
const password = $("#password")
const enviar = $("#enviar")
const myform = $("#myform")

// Functions - Validations
var sendForm = (e) => {
    if(!user.val()){
        if($("#userValidate").hasClass("d-none")){
            $("#userValidate").removeClass("d-none")
        }     
    }
    else{
        if(!$("#userValidate").hasClass("d-none")){
            $("#userValidate").addClass("d-none")
        }    
    }
    if(!password.val()){
        if($("#passValidate").hasClass("d-none")){
            $("#passValidate").removeClass("d-none")
        } 
        
    }
    else{
        if(!$("#passValidate").hasClass("d-none")){
            $("#passValidate").addClass("d-none")
        }    
    }   
    if(user.val() && password.val()){ 
    $.ajax({
        method: "POST",
        dataType: "json",
        url: "https://frontend-excercise.dt.timlabtesting.com/ops/login",
        contentType: 'json',
        statusCode: {
            403: function() { 
                window.location.href = "?error=1";
            }},
        data: JSON.stringify ({
            "email": user.val(),
            "password": password.val()
        })
      })
    .done( msg => {
        sessionStorage.setItem('data', JSON.stringify(msg));
        window.location.href = "./"
    })
    .fail( e => {
        $(".custom-alert").show()
    });}
}

// Listeners
enviar.on('click', sendForm)
