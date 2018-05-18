var express = require('express');         //copiado de https://gist.github.com/gabmontes/e496a41f835bca65e99b
var bodyParser = require("body-parser")     //copiado de https://github.com/expressjs/body-parser
var app = express();
// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var fs = require("fs")
var listaTareas = [];


fileExists("tareas.json", (err, exists) => {
  if (err) {
    // manejar otro tipo de error
    console.log("Error al acceder al fichero");
  }
  if (exists) {
    // hacer algo si existe
    var data = fs.readFileSync("tareas.json", "UTF-8");
    listaTareas = JSON.parse(data);
  } else {
    // hacer algo si no existe
    listaTareas = [];
  }
});

app.use(jsonParser);
app.use(urlencodedParser);

app.use(express.static('www/Tareas'));

app.get("/", function (req, res) {
  fs.readFile("./www/Tareas/tarea.html", "utf8", function (err, text) {
    var fila = cargarTareas(listaTareas);
    text = text.replace("[sustituir]", fila);
    res.send(text);
  });
});

app.get("/eliminar/:id?", function (req, res) {
  listaTareas.splice(parseInt(req.query.id), 1);  //borrar un registro(req.body.nº del registro, cantidad de registro)
  fs.writeFile("tareas.json", JSON.stringify(listaTareas), function () {
    console.log("Fichero de datos actualizado");
  });
  res.redirect("/");
});

app.post('/', function (req, res) {       //recibir peticiones en /datos usando method=get (debe coincidir con el method del index.html de tareas)
  console.log("petición recibida");
  var nom = req.body.nombre || "";
  var tar = req.body.tarea || "";
  var nuevaTarea = { nombre: nom, tarea: tar }
  listaTareas.push(nuevaTarea); //acumula los valores en un array para pintarlas todas en la web
  // fs.writeFile("Prueba.txt","Hola, mundo")     //aunque no haya terminado de escribir, el programa sigue.
  // // fs.writeFileSync ("Prueba.txt,"Hola mundo")    // //hasta que termina de escribir el programa no sigue.

  fs.writeFile("tareas.json", JSON.stringify(listaTareas), function () {
    console.log("Fichero de datos actualizado");
  });
  res.redirect("/")
});

var server = app.listen(80, function () {    //arranca servidor (puerto 80)
  console.log('Servidor web iniciado');
});


function cargarTareas(tareas) {
  var lista = "";
  for (var indice in tareas) {
    var fila = `
<tr>
<td>[id]</td>
<td>[nombre]</td>
<td>[tarea]</td>
<td><a href="/eliminar?id=[id]">Eliminar</a>
<a href="/editar?id=[id]">Editar</a></td>
</tr>
`;

    fila = fila.split("[id]").join(indice)
    fila = fila.replace("[id]", indice)
    fila = fila.replace("[nombre]", tareas[indice].nombre);
    fila = fila.replace("[tarea]", tareas[indice].tarea);
    lista += fila;
  }
  return lista;
}


app.get("/editar/:id?", function (req, res) {

  fs.readFile("./www/Tareas/tarea.html", "utf8", function (err, text) {
    var fila = cargarTareas(listaTareas);
    var nombre = listaTareas[req.query.id].nombre;
    var tarea = listaTareas[req.query.id].tarea;
    text = text.replace("[sustituir]", fila);
    text = text.replace('action="/"', 'action="/editar"');
    text = text.replace("[id_tarea]", req.query.id);
    text = text.replace('placeholder="Nombres del usuario"', 'value="' + nombre + '"');
    text = text.replace('placeholder="Nombre de la tarea"', 'value="' + tarea + '"');
    res.send(text);
  });
});

app.post("/editar/:id?", function (req, res) {
  var nom = req.body.nombre || "";
  var tar = req.body.tarea || "";
  var id = req.body.id;
  listaTareas[id].tarea = tar;
  listaTareas[id].nombre = nom;
  fs.writeFile("tareas.json", JSON.stringify(listaTareas), function () {
    console.log("Fichero de datos actualizado");
  });
  res.redirect('/');
});



function fileExists(file, cb) {
  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return cb(null, false);
      } else { // en caso de otro error
        return cb(err);
      }
    }
    // devolvemos el resultado de `isFile`.
    return cb(null, stats.isFile());
  });
};