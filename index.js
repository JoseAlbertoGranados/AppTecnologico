//Importar modulos
import express, { json } from "express";
import dotenv from "dotenv";
import session from "express-session";
import bcryptjs from "bcryptjs";
import { dirname } from "path";

//Definirlos en una constante
const app = express();

app.use("/resources", express.static("public"));
app.use("/resources", express.static(dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

dotenv.config({ path: "./env/.env" });

//Definiendo variable de entorno PORT
const port = process.env.PORT || 3000;
//Motor de plantillas ejs
app.set("view engine", "ejs");

//DOCXTemplater

//Variable de sesion
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

//Invocar conecxión a la base de datos
import conection from "./database/db.js";
import { name, render } from "ejs";

//Rutas
app.get("/loginJefe", (req, res) => {
  res.render("loginJefe");
});

/*app.get("/prueba", (req, res) => {
  var pass = "Amanecer";
  var salt = bcryptjs.genSaltSync(10);
  var passHaas = bcryptjs.hashSync(pass, salt);

  res.send(passHaas);
});
*/

//Edicion de documentos
app.get("/documentos/:numero_control", (req, res) => {
  const numero_control = req.params.numero_control;

  conection.query(
    "SELECT * FROM alumnos WHERE numero_control = ?",
    [numero_control],
    (error, results) => {
      if (error) {
        res.send("Error en la busqueda de datos");
      } else {
        res.render("documentos", {
          results: results[0],
        });
      }
    }
  );
});

app.get("/loginPromotor", (req, res) => {
  res.render("loginPromotor");
});

//Mostrar mi ejemplo
app.get("/ejemplo", (req, res) => {
  res.render("ejemplo");
});

//Registra Promotores
app.get("/registraPromotor", (req, res) => {
  res.render("registraPromotor");
});

//Registrar alumnos
app.get("/registraAlumno", (req, res) => {
  conection.query("SELECT * FROM actividades", (error, resultados) => {
    if (error) {
      res.send("Error en la conexión");
    } else {
      res.render("registraAlumno", {
        listaPromotor: resultados,
      });
    }
  });
});

app.get("/inscripcion", (req, res) => {
  conection.query("SELECT * FROM actividades", (error, resultados) => {
    if (error) {
      res.send("Error en la conexión");
    } else {
      res.render("inscripcion", {
        listaPromotor: resultados,
      });
    }
  });
});

//Incribir Alumnos
app.post("/inscribir", (req, res) => {
  const {
    numero,
    nombre,
    paterno,
    materno,
    telefono,
    carrera,
    semestre,
    actividad,
  } = req.body;

  conection.query(
    "INSERT INTO alumnos VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [numero, nombre, paterno, materno, carrera, telefono, semestre, actividad],
    (error, results) => {
      if (error) {
        console.log(error);
        conection.query("SELECT * FROM alumnos", (errorAlumno, alumnos) => {
          if (errorAlumno) {
            console.log(errorAlumno);
          } else {
            console.log("Promotores");
            conection.query(
              "SELECT * FROM actividades",
              (errorPromo, promotores) => {
                if (errorPromo) {
                  console.log(errorPromo);
                } else {
                  res.render("inscripcion", {
                    listaPromotor: promotores,
                    listaAlumnos: alumnos,
                    login: true,
                    name: req.session.name,
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El alumno ya está registrado",
                    alertIcon: "danger",
                    showConfirmButton: true,
                    timer: false,
                    ruta: "inscripcion",
                  });
                }
              }
            );
          }
        });
      } else {
        conection.query("SELECT * FROM actividades", (error, promotores) => {
          if (error) {
            console.log(error);
          } else {
            //resPromotor = results;
            console.log("Lista Promotores");
            conection.query("SELECT * FROM alumnos", (error, alumnos) => {
              if (error) {
                console.log(error);
              } else {
                console.log("Alumno lista");
                res.render("inscripcion", {
                  login: true,
                  name: req.session.name,
                  listaPromotor: promotores,
                  listaAlumnos: alumnos,
                  alert: true,
                  alertTitle: "Registrado",
                  alertMessage: "El alumno ha sido registrado",
                  alertIcon: "success",
                  showConfirmButton: false,
                  timer: 1500,
                  ruta: "inscripcion",
                });
              }
            });
          }
        });
        // res.render("crearAlumnos", {
        //   login: true,
        //   name: req.session.name,
        // });
      }
    }
  );
});

//Recibir los datos ingresados en la inscripción de un alumno y guardarlos en la base de datos
app.post("/saveAlumno", (req, res) => {
  const {
    numero,
    nombre,
    paterno,
    materno,
    telefono,
    carrera,
    semestre,
    actividad,
  } = req.body;

  if (req.session.loggedin) {
    conection.query(
      "INSERT INTO alumnos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        numero,
        nombre,
        paterno,
        materno,
        carrera,
        email,
        telefono,
        semestre,
        actividad,
      ],
      (error, results) => {
        if (error) {
          conection.query("SELECT * FROM alumnos", (errorAlumno, alumnos) => {
            if (errorAlumno) {
              console.log(errorAlumno);
            } else {
              console.log("Promotores");
              conection.query(
                "SELECT * FROM promotores",
                (errorPromo, promotores) => {
                  if (errorPromo) {
                    console.log(errorPromo);
                  } else {
                    res.render("crearAlumnos", {
                      resultados: promotores,
                      listaAlumnos: alumnos,
                      login: true,
                      name: req.session.name,
                      alert: true,
                      alertTitle: "Error",
                      alertMessage: "El alumno ya está registrado",
                      alertIcon: "danger",
                      showConfirmButton: true,
                      timer: false,
                      ruta: "crearAlumnos",
                    });
                  }
                }
              );
            }
          });
        } else {
          conection.query("SELECT * FROM promotores", (error, promotores) => {
            if (error) {
              console.log(error);
            } else {
              //resPromotor = results;
              console.log("Lista Promotores");
              conection.query("SELECT * FROM alumnos", (error, alumnos) => {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Alumno lista");
                  res.render("crearAlumnos", {
                    login: true,
                    name: req.session.name,
                    resultados: promotores,
                    listaAlumnos: alumnos,
                    alert: true,
                    alertTitle: "Registrado",
                    alertMessage: "El alumno ha sido registrado",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: "crearAlumnos",
                  });
                }
              });
            }
          });
          // res.render("crearAlumnos", {
          //   login: true,
          //   name: req.session.name,
          // });
        }
      }
    );
  } else {
    res.render("loginJefe", {
      login: false,
      name: "Debe Iniciar Sesion",
    });
  }
});

//Index principal de la aplicación web
app.get("/", (req, res) => {
  try {
    conection.query("SELECT * FROM actividades", (error, results) => {
      res.render("index", {
        results: results,
      });
    });
  } catch (error) {
    res.send(error);
  }

  // conection.query("SELECT * FROM usuarios", (error, results) => {
  //   if (error) {
  //     throw error;
  //   } else {
  //     res.send(results);
  //   }
  // });
});

//Visualizar Horarios de actividades
app.get("/horarios", (req, res) => {
  try {
    conection.query(
      "SELECT * FROM actividades, promotores WHERE idPromotor = idActividad",
      (error, results) => {
        res.render("horarios", {
          results: results,
        });
      }
    );
  } catch (error) {
    res.send(error);
  }
});

//Visualizar Misión
app.get("/mision", (req, res) => {
  res.render("mision");
});

//Validar el inicio de sesión del jefe de departamento
app.post("/inicia", (req, res) => {
  const usuario = req.body.usuario;
  const pass = req.body.password;
  var salt = bcryptjs.genSaltSync(10);
  var passHaas = bcryptjs.hashSync(pass, salt);
  if (usuario && pass) {
    conection.query(
      "SELECT * FROM usuarios WHERE usuario = ?",
      [usuario],
      async (error, results) => {
        if (
          results == 0 ||
          !(await bcryptjs.compare(pass, results[0].password))
        ) {
          res.render("loginJefe", {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Usuario y/o contraseña incorrectos",
            alertIcon: "danger",
            showConfirmButton: true,
            timer: false,
            ruta: "loginJefe",
          });
        } else {
          req.session.loggedin = true;
          req.session.name = results[0].usuario;
          console.log(results[0].usuario);
          res.render("loginJefe", {
            alert: true,
            alertTitle: "Éxito",
            alertMessage: "Iniciando Sesión",
            alertIcon: "success",
            showConfirmButton: false,
            timer: 1500,
            ruta: "menuInicio",
          });
        }
      }
    );
  }
});

//Menu principal para el jefe de departamento
app.get("/menuInicio", (req, res) => {
  if (req.session.loggedin) {
    res.render("menuInicio", {
      login: true,
      name: req.session.name,
    });
  } else {
    res.render("loginJefe", {
      login: false,
      name: "Debes Iniciar Sesión",
    });
  }
  res.end();
});

//Lista de alumnos para el jefe de departamento
app.get("/listaAlumnos", (req, res) => {
  if (req.session.loggedin) {
    conection.query(
      //"SELECT * FROM alumnos, promotores WHERE idPromotor = actividad",
      "SELECT * FROM alumnos",
      (error, results) => {
        if (error) {
          res.send("Error en la busqueda de datos");
        } else {
          res.render("listaAlumnos", {
            results: results,
            login: true,
            name: req.session.name,
          });
        }
      }
    );
  } else {
    res.render("loginJefe", {
      login: false,
      name: "Debes Iniciar Sesión",
    });
  }
});

//Prueba para tabla de alumnos
//Lista de alumnos para el jefe de departamento
app.get("/prueba", (req, res) => {
  conection.query(
    //"SELECT * FROM alumnos, promotores WHERE idPromotor = actividad",
    "SELECT * FROM alumnos, actividades WHERE idActividad = actividad",
    (error, results) => {
      if (error) {
        res.send("Error en la busqueda de datos");
        console.log(error);
      } else {
        res.render("prueba", {
          results: results,
          login: true,
          name: req.session.name,
        });
      }
    }
  );
});

//Lista De Promotores Para El Jefe de Departamento
app.get("/listaPromotor", (req, res) => {
  if (req.session.loggedin) {
    conection.query("SELECT * FROM promotores", (error, results) => {
      if (error) {
        res.send("Error en la busqueda de datos");
      } else {
        res.render("listaPromotor", {
          results: results,
          login: true,
          name: req.session.name,
        });
      }
    });
  } else {
    res.render("loginJefe", {
      login: false,
      name: "Debes Iniciar Sesión",
    });
  }
});

//Ruta para editar registros de alumnos
app.get("/editarAlumnos/:numero_control", (req, res) => {
  const numero_control = req.params.numero_control;

  conection.query(
    "SELECT * FROM alumnos WHERE numero_control = ?",
    [numero_control],
    (error, results) => {
      if (error) {
        res.send("Error en la busqueda de datos");
      } else {
        res.render("editarAlumnos", {
          results: results[0],
        });
      }
    }
  );
});

//Visualizar las actividades
app.get("/actividades", (req, res) => {
  if (req.session.loggedin) {
    conection.query(
      "SELECT * FROM alumnos, promotores WHERE idPromotor = actividad",
      (error, results) => {
        if (error) {
          res.send("Error en la busqueda de datos");
        } else {
          res.render("listaAlumnos", {
            results: results,
            login: true,
            name: req.session.name,
          });
        }
      }
    );
  } else {
    res.render("loginJefe", {
      login: false,
      name: "Debes Iniciar Sesión",
    });
  }
});

//Crear Alumnos Por Parte del Jefe
app.get("/crearAlumnos", (req, res) => {
  var consultaPromotores = "SELECT * FROM promotores";
  var consultaAlumnos = "SELECT * FROM alumnos";
  let resPromotor = 5;
  let resAlumnos = 5;
  //console.log(resPromotor);
  if (req.session.loggedin) {
    conection.query(consultaPromotores, (error, promotores) => {
      if (error) {
        console.log(error);
      } else {
        //resPromotor = results;
        //console.log(promotores);
        conection.query(
          "SELECT * FROM alumnos, promotores WHERE idPromotor = actividad",
          (error, alumnos) => {
            if (error) {
              console.log(error);
            } else {
              //console.log(alumnos);
              res.render("crearAlumnos", {
                login: true,
                name: req.session.name,
                resultados: promotores,
                listaAlumnos: alumnos,
              });
            }
          }
        );
      }
    });
  } else {
    res.render("loginJefe", {
      login: false,
      name: "Debes Iniciar Sesión",
    });
  }
});

app.get("/salidaJefe", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/loginJefe");
  });
});

app.listen(port, (req, res) => {
  console.log("Server live in port: ", port);
});
