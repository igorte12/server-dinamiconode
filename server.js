var express = require('express');                                          //copiado de https://gist.github.com/gabmontes/e496a41f835bca65e99b
var bodyParser = require("body-parser");
var mysql = require('mysql');
var fs = require("fs");
var app = express();                                                      //copiado de https://github.com/expressjs/body-parser
var jsonParser = bodyParser.json()                                        // create application/json parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })         // create application/x-www-form-urlencoded parser
app.use(jsonParser);
app.use(urlencodedParser);
var listaTareas = [];
var connection = mysql.createConnection({                                 //Crear una conexion en la base de datos
  host: 'localhost',
  user: 'master',
  password: '1234',
  database: 'tareas db',
  port: 3306
})

connection.connect(function (err) {
  if (err) {
    console.log("Error al conectarse")
  }
  else {
    console.log("Conexión correcta")
  };
});

app.use(express.static('www/Tareas'));                                    //Convierte la página del server en la de la dirección www/Tareas
app.get("/", function (req, res) {

  connection.query('SELECT * FROM tareas', function (error, resultadoConsulta) {
    if (error) {
      throw error;
    }
    else {
      console.log(resultadoConsulta);
      fs.readFile("./www/Tareas/tarea.html", "utf8", function (err, text) {
        var fila = cargarTareas(resultadoConsulta);
        text = text.replace("[sustituir]", fila);
        res.send(text);
      });
    }
  });
});
app.get("/eliminar/:id?", function (req, res) {

  console.log("Fichero de datos actualizado" + req.query.id);
  connection.query("DELETE from tareas WHERE ID = ?", [req.query.id], function (err, resultadoConsulta) { //ID de base de datos, id de formulario
    console.log("Record Deleted!!");
    res.redirect("/");
  });
});
app.post('/', function (req, res) {                                      //recibir peticiones en /datos usando method=get (debe coincidir con el method del index.html de tareas)G
  console.log("petición recibida");
  var nom = req.body.nombre || "";
  var tar = req.body.tarea || "";
  var nuevaTarea = { nombre: nom, tarea: tar }
  actualizarBBDD(nuevaTarea);                                            //llama a la función actualizarBBD
  fs.writeFile("tareas.json", JSON.stringify(listaTareas), function () {
    console.log("Fichero de datos actualizado");
  });
  res.redirect("/")
});
app.get("/editar/:id?", function (req, res) {

  connection.query("Select * from tareas", function (err, resultadoConsulta) { //ID de base de datos, id de formulario

    console.log("resultadoConsulta");
    var registroEditar;
    for (const tarea of resultadoConsulta) {
      if (tarea.ID == req.query.id) {
        registroEditar = tarea;
      }
    }

    fs.readFile("./www/Tareas/tarea.html", "utf8", function (err, text) {
      var fila = cargarTareas(resultadoConsulta);
      var nombre = registroEditar.Nombre;
      var tarea = registroEditar.Tarea;

      text = text.replace("[sustituir]", fila);
      text = text.replace('action="/"', 'action="/editar"');
      text = text.replace("[id_tarea]", req.query.id);
      text = text.replace('placeholder="Nombres del usuario"', 'value="' + nombre + '"');
      text = text.replace('placeholder="Nombre de la tarea"', 'value="' + tarea + '"');
      res.send(text);
    });
  });
});
app.post("/editar", function (req, res) {
  var nom = req.body.nombre || "";
  var tar = req.body.tarea || "";
  var id = req.body.id;
  console.log(nom,tar,id);
  connection.query("UPDATE tareas SET Nombre = ?, Tarea = ? WHERE ID = ?", [nom, tar, id], function (error, resultadoConsulta) {
    //conectarse con base de datos y actualizar los datos
    if (error) {
      console.log(error);
    } else {

      console.log(resultadoConsulta);
      res.redirect("/");
    }
  });
});
app.get("/pruebas", function (req, res) {
  var nombre = "Pedro";
  connection.query('SELECT * FROM tareas', function (error, result) {
    if (error) {
      throw error;
    } else {
      console.log(result);
      nombre = result[0].Nombre;
      var registros = cargarTareas(result);
      console.log(registros)
      fs.readFile("./www/Tareas/tarea.html", "utf8", function (err, text) {
        text = text.replace("sustituir]", registros)
        // res.send("Funciona ok, hola " + nombre);
        res.send(text)
      });

    };

  });
});

var server = app.listen(8080, function () {    //arranca servidor (puerto 8080)
  console.log('Servidor web iniciado');
});

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

function actualizarBBDD(datos) {
  var query = connection.query('INSERT INTO tareas (nombre,tarea) VALUES(?,?)', [datos.nombre, datos.tarea],
    function (error, result) {
      if (error) {

        throw error;
      }
      else {
        console.log(result);
      }
    });
}
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

    fila = fila.split("[id]").join(tareas[indice].ID)
    fila = fila.replace("[nombre]", tareas[indice].Nombre);
    fila = fila.replace("[tarea]", tareas[indice].Tarea);
    lista += fila;
  }
  return lista;
}
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
  })
}