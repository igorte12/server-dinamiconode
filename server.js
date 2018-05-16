var express = require('express');         //copiado de https://gist.github.com/gabmontes/e496a41f835bca65e99b
var bodyParser = require("body-parser")     //copiado de https://github.com/expressjs/body-parser
var app = express();
// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var fs = require("fs")
var listaTareas = [];

// //parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(jsonParser);
app.use(urlencodedParser);
//// parse application/json
//app.use(bodyParser.json())
app.use(express.static('www/Tareas'));

// app.get("/tareas1", function (req,res){
//   res.send("Recibido en tareas")
// });

app.get("/",function(req,res){
  fs.readFile("./www/Tareas/tarea.html", "utf8", function (err, text) {
    text = text.replace("[sustituir]", "");
    // console.log(text);
       res.send(text);
  });

});

app.get("/eliminar/:id?",function(req,res){
  listaTareas.splice(req.body.id,1);  //borrar un registro(req.body.nº del registro, cantidad de registro)

  fs.readFile("./www/Tareas/tarea.html", "utf8", function (err, text) {
    var fila = cargarTareas(listaTareas);
    // console.log(fila);
    text = text.replace("[sustituir]", fila);
    // console.log(text);
       res.send(text);
  });

});


app.post('/', function (req, res) {       //recibir peticiones en /datos usando method=get (debe coincidir con el method del index.html de tareas)
  console.log("petición recibida");
  var nom = req.body.nombre || "";
  var tar = req.body.tarea || "";

  listaTareas.push({ nombre: nom, tarea: tar }); //acumula los valores en un array para pintarlas todas en la web

  // console.log(nombre)


  // var nombre = req.body.nombre || '';   //crea una variable para recoger datos
  // var tarea = req.body.tarea || '';
  // res.send('hello ' + nombre + "" + tarea);
  // console.log(nombre, "" + tarea);   //pinta en consola los datos recogidos
  fs.readFile("./www/Tareas/tarea.html", "utf8", function (err, text) {  //utf8:es el tipo de texto(ortografía)
    //console.log("fichero leido");
    var fila = cargarTareas(listaTareas);
    // console.log(fila);
    text = text.replace("[sustituir]", fila);
    res.send(text);
    // `
    // <tr>
    // <td>[id]</td>
    // <td>[nombre]</td>
    // <td>[tarea]</td>
    // </tr>
    // `;
    // fila = fila.replace("[id]", 0)
    // fila = fila.replace("[nombre]", nom);
    // fila = fila.replace("[tarea]", tar);
    //  text = text.replace("[sustituir]", fila);
  })
});

var server = app.listen(80, function () {
  console.log('Servidor web iniciado');
});


function cargarTareas(tareas) {
  var lista="";
  for (var indice in tareas) {
    var fila = `
<tr>
<td>[id]</td>
<td>[nombre]</td>
<td>[tarea]</td>
<td><a href="/eliminar?id=[id]">Eliminar</a></td>
</tr>
`;
    fila = fila.replace("[id]", indice)
    fila = fila.replace("[id]", indice)
    fila = fila.replace("[nombre]", tareas[indice].nombre);
    fila = fila.replace("[tarea]", tareas[indice].tarea);
    lista += fila;
  }
  return lista;

}