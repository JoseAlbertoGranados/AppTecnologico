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
import { error } from "console";

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
app.get("/crearConstancia/:numero_control", (req, res) => {
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

//Ruta para editar registros de promotores
app.get("/editarPromotor/:idActividad", (req, res) => {
  const idActividad = req.params.idActividad;

  conection.query(
    "SELECT * FROM actividades WHERE idActividad = ?",
    [idActividad],
    (error, results) => {
      if (error) {
        res.send("Error en la busqueda de datos");
      } else {
        res.render("editarPromotor", {
          results: results[0],
        });
      }
    }
  );
});

//Actualizar datos Promotor
app.post("/actualizaPromotor", (req, res) => {
  //Se reciben los datos del formulario POST
  const {
    idActividad,
    promotor,
    apellido_paterno,
    apellido_materno,
    actividad,
  } = req.body;

  //Conexión a la BASE DE DATOS y realizar UPDATE
  //Los datos a actualizar se enlistan como un objeto PROPIEDAD DE TABLA : CONST valor Recibido
  //Afuera del arreglo se anexa el dato de referencia para el where en este caso nc
  conection.query(
    "UPDATE actividades SET ? WHERE idActividad = ?",
    [
      {
        promotor: promotor,
        apellido_paterno: apellido_paterno,
        apellido_materno: apellido_materno,
        actividad,
      },
      idActividad,
    ],
    (error, results) => {
      if (error) {
        //Si ocurre un error en la ejecución, visualizalo
        console.log(error);
      } else if (results.affectedRows === 0) {
        //Si los registros afectados en la actualización en la ejecución en 0
        console.log("No se actualizaron registros");
      } else {
        //Redirecciona una vez ejecutado la actualización
        res.redirect("/listaPromotores");
      }
    }
  );
});

//Eliminar registros de Promotores
app.get("/eliminarPromotor/:id", (req, res) => {
  const id = req.params.id;
  conection.query(
    "DELETE FROM actividades WHERE idActividad = ?",
    [id],
    (error, results) => {
      if (error) {
        console.log(error);
      } else {
        res.redirect("/listaPromotores");
      }
    }
  );
});

app.post("/guardaPromotor", (req, res) => {
  const { nombre, paterno, materno, idActividad, actividad } = req.body;

  conection.query(
    "INSERT INTO actividades VALUES (?, ?, ?, ?, ?)",
    [idActividad, nombre, paterno, materno, actividad],
    (error, results) => {
      if (error) {
        console.log(error);
        console.log("Actividades");
        res.render("registraPromotor", {
          login: true,
          name: req.session.name,
          alert: true,
          alertTitle: "Error",
          alertMessage: "La actividad y promotor ya están registrados",
          alertIcon: "danger",
          showConfirmButton: true,
          timer: false,
          ruta: "registraPromotor",
        });
      } else {
        //resPromotor = results;
        console.log("Lista Promotores");
        console.log("Alumno lista");
        res.render("registraPromotor", {
          login: true,
          name: req.session.name,
          alert: true,
          alertTitle: "Registrado",
          alertMessage: "La actividad ha sido registrada",
          alertIcon: "success",
          showConfirmButton: false,
          timer: 1500,
          ruta: "registraPromotor",
        });
      }
    }
  );
  // res.render("crearAlumnos", {
  //   login: true,
  //   name: req.session.name,
  // });
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
    console.log("Intentar desplegar");
    conection.query(
      //"SELECT * FROM alumnos, promotores WHERE idPromotor = actividad",
      "SELECT numero_control, nombre, alumnos.apellido_paterno, alumnos.apellido_materno, carrera, telefono, semestre, actividades.idActividad, actividades.actividad FROM alumnos, actividades WHERE actividades.idActividad = alumnos.actividad",
      (error, results) => {
        if (error) {
          return res.send("Error en la busqueda de datos");
          console.log(error);
        } else {
          return res.render("menuInicio", {
            results: results,
          });
        }
      }
    );
  } else {
    return res.render("loginJefe", {
      login: false,
      name: "Debes Iniciar Sesión",
    });
  }
  return res.end();
});

//Menu Inicio anterior
app.get("/menuInicioAnterior", (req, res) => {
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
    "SELECT numero_control, nombre, alumnos.apellido_paterno, alumnos.apellido_materno, carrera, telefono, semestre, actividades.idActividad, actividades.actividad FROM alumnos, actividades WHERE actividades.idActividad = alumnos.actividad",
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

//Prueba de inicio sesion
//Validar el inicio de sesión del jefe de departamento
app.post("/iniciaPrueba", (req, res) => {
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
          return res.render("loginJefe", {
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
          //req.session.name = results[0].usuario;
          console.log("Iniciando la sesión enviar menuInicio");
          console.log(results[0].usuario);
          return res.render("loginJefe", {
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

//Eliminar registros de alumnos
app.get("/eliminarAlumno/:nc", (req, res) => {
  const nc = req.params.nc;
  conection.query(
    "DELETE FROM alumnos WHERE numero_control = ?",
    [nc],
    (error, results) => {
      if (error) {
        console.log(error);
      } else {
        res.redirect("/prueba");
      }
    }
  );
});

//Regitrar a los alumnos del menu
//Incribir Alumnos
app.post("/guardaAlumno", (req, res) => {
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
                  res.render("registraAlumno", {
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
                    ruta: "registraAlumno",
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
                res.render("registraAlumno", {
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
                  ruta: "registraAlumno",
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

//Actualizar datos Alumno
app.post("/update", (req, res) => {
  //Se reciben los datos del formulario POST
  const {
    nc,
    nombre,
    apellido_paterno,
    apellido_materno,
    telefono,
    carrera,
    semestre,
  } = req.body;

  //Conexión a la BASE DE DATOS y realizar UPDATE
  //Los datos a actualizar se enlistan como un objeto PROPIEDAD DE TABLA : CONST valor Recibido
  //Afuera del arreglo se anexa el dato de referencia para el where en este caso nc
  conection.query(
    "UPDATE alumnos SET ? WHERE numero_control = ?",
    [
      {
        nombre: nombre,
        apellido_paterno: apellido_paterno,
        apellido_materno: apellido_materno,
        telefono: telefono,
        carrera: carrera,
        semestre: semestre,
      },
      nc,
    ],
    (error, results) => {
      if (error) {
        //Si ocurre un error en la ejecución, visualizalo
        console.log(error);
      } else if (results.affectedRows === 0) {
        //Si los registros afectados en la actualización en la ejecución en 0
        console.log("No se actualizaron registros");
      } else {
        //Redirecciona una vez ejecutado la actualización
        res.redirect("/prueba");
      }
    }
  );
});

//Lista De Promotores Para El Jefe de Departamento
app.get("/listaPromotores", (req, res) => {
  conection.query("SELECT * FROM actividades", (error, results) => {
    if (error) {
      res.send("Error en la busqueda de datos");
    } else {
      res.render("listaPromotores", {
        results: results,
        login: true,
        name: req.session.name,
      });
    }
  });
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
