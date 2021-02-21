/*!
  * persistence.js 
  * Persistencia para realizar pruebas.
  * Author: Diego Sandoval Leiva - dasl.cl
  * Licensed under MIT 
  */

// Init setups
// He creado una sesion para probar la persistencia de las credenciales.
// Esto lo he hecho a modo de prueba.
var existSession = e => {
    let confirm = sessionStorage.hasOwnProperty('logged')
    if(confirm){
        if(window.location.toString().includes("login")){
            window.location.href = './'
        }
    }
    else {
        if(!window.location.toString().includes("login")){
            window.location.href = './login.html'
        }
    }
}

existSession()