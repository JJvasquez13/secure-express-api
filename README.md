Secure Express API
Descripción
Secure Express API es una API RESTful construida con Node.js, Express.js y MongoDB, diseñada para gestionar autenticación y perfiles de usuario de manera segura. Utiliza JSON Web Tokens (JWT) almacenados en cookies HTTP-only para autenticación, validación de entrada con express-validator, y medidas de seguridad como protección contra inyecciones NoSQL, XSS, y limitación de solicitudes.
Características

Autenticación: Registro, inicio de sesión y cierre de sesión con JWT.
Gestión de usuarios: Obtener y actualizar perfiles de usuario.
Seguridad:
Hashing de contraseñas con bcrypt (salts únicos para contraseñas iguales).
Cookies HTTP-only, seguras y con SameSite=Strict.
Protección contra CSRF, XSS, inyecciones NoSQL y ataques de fuerza bruta.


Documentación: Especificación OpenAPI (Swagger) disponible en /api-docs.
Logging: Registro de eventos y errores con Winston.

Requisitos Previos

Node.js: v22.13.1 o superior.
MongoDB: Instancia local o en la nube (por ejemplo, MongoDB Atlas).
NPM: Para instalar dependencias.
Git: Para clonar el repositorio (opcional).

Instalación

Clonar el repositorio (si usas Git):
git clone <repositorio>
cd secure-express-api


Instalar dependencias:
npm install


Configurar variables de entorno:Crea un archivo .env en la raíz del proyecto con el siguiente contenido:
MONGO_URI=mongodb://localhost:27017/Security_JJ
JWT_SECRET=6a106c6b37e40ffbe031bc99a51f0f37a9dc231d91d2d68b3a80e0de7df2e6bf
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development


MONGO_URI: URL de tu base de datos MongoDB.
JWT_SECRET: Clave secreta para firmar JWT (cámbiala por una más segura en producción).
FRONTEND_URL: URL del frontend que consumirá la API.
PORT: Puerto donde correrá el servidor.
NODE_ENV: development o production.


Crear directorio de logs:
mkdir logs


Iniciar MongoDB:Asegúrate de que MongoDB esté corriendo localmente (mongod) o configura MONGO_URI para una instancia en la nube.

Configurar .gitignore:Asegúrate de que el archivo .gitignore en la raíz del proyecto incluya:
node_modules/
.env
logs/
.idea/

Si node_modules/ o .idea/ ya están rastreados por Git, elimínalos del índice:
git rm -r --cached node_modules/
git rm -r --cached .idea/
git commit -m "Remove node_modules and .idea from git tracking"



Uso

Iniciar el servidor:

En modo producción:npm start


En modo desarrollo (con reinicio automático):npm run dev




Acceder a la documentación:

Abre http://localhost:5000/api-docs en tu navegador para ver la documentación Swagger de la API.


Endpoints disponibles:

POST /auth/register: Registrar un nuevo usuario.curl -X POST http://localhost:5000/auth/register \
-H "Content-Type: application/json" \
-d '{"username":"Juan","email":"vjuanjose@gmail.com","password":"juanjuan123"}'


POST /auth/login: Iniciar sesión y obtener un JWT.curl -X POST http://localhost:5000/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"vjuanjose@gmail.com","password":"juanjuan123"}'


POST /auth/logout: Cerrar sesión y eliminar la cookie JWT.curl -X POST http://localhost:5000/auth/logout


GET /users/profile: Obtener el perfil del usuario autenticado.curl -X GET http://localhost:5000/users/profile \
-H "Cookie: token=your_jwt_token"


PUT /users/profile: Actualizar el perfil del usuario autenticado.curl -X PUT http://localhost:5000/users/profile \
-H "Content-Type: application/json" \
-H "Cookie: token=your_jwt_token" \
-d '{"username":"JuanNuevo","email":"nuevo@email.com"}'





Seguridad

Contraseñas: Hasheadas con bcrypt usando salts únicos para garantizar que contraseñas iguales produzcan hashes diferentes.
JWT: Almacenados en cookies HTTP-only, seguras y con SameSite=Strict para prevenir CSRF.
Validación: Entradas validadas con express-validator para prevenir inyecciones.
Protección adicional:
helmet: Headers de seguridad HTTP.
express-mongo-sanitize: Prevención de inyecciones NoSQL.
xss-clean: Sanitización contra XSS.
express-rate-limit: Limitación de solicitudes para prevenir ataques de fuerza bruta.
cors: Configurado para permitir solo el origen especificado en FRONTEND_URL.



Estructura del Proyecto
secure-express-api/
├── config/
│   ├── db.js           # Configuración de MongoDB
│   └── env.js          # Validación de variables de entorno
├── controllers/
│   ├── authController.js  # Lógica de autenticación
│   └── userController.js  # Lógica de gestión de usuarios
├── middleware/
│   ├── authMiddleware.js  # Protección de rutas y roles
│   ├── errorMiddleware.js # Manejo de errores
│   └── validate.js       # Validación de entradas
├── models/
│   ├── User.js           # Modelo de usuario
│   └── Token.js          # Modelo de refresh tokens
├── routes/
│   ├── authRoutes.js     # Rutas de autenticación
│   └── userRoutes.js     # Rutas de usuarios
├── utils/
│   ├── crypto.js         # Hashing de contraseñas
│   ├── jwt.js            # Generación de JWT
│   └── logger.js         # Logging con Winston
├── logs/
│   ├── error.log         # Logs de errores
│   └── combined.log      # Logs generales
├── .env                  # Variables de entorno
├── .gitignore            # Archivos excluidos del control de versiones
├── server.js             # Entrada principal del servidor
├── swagger.yaml          # Especificación OpenAPI
├── package.json          # Dependencias y scripts
└── README.md             # Documentación del proyecto

Solución de Problemas

Error de conexión a MongoDB: Verifica que MongoDB esté corriendo y que MONGO_URI sea correcto.
Error de validación: Revisa los logs en logs/error.log para errores de validación.
Login falla con "Invalid credentials":
Asegúrate de que el email y la contraseña coincidan con los usados en el registro.
Si la contraseña no coincide (Password match: false en los logs), elimina y registra el usuario nuevamente:mongo
use Security_JJ
db.users.deleteOne({ email: "vjuanjose@gmail.com" })
curl -X POST http://localhost:5000/auth/register \
-H "Content-Type: application/json" \
-d '{"username":"Juan","email":"vjuanjose@gmail.com","password":"juanjuan123"}'


Intenta el login nuevamente:curl -X POST http://localhost:5000/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"vjuanjose@gmail.com","password":"juanjuan123"}'


Revisa logs/combined.log para verificar si Password match: true aparece.


Código 404 en login: Asegúrate de que la solicitud llegue a POST /auth/login. Revisa los logs y verifica que no haya middlewares sobrescribiendo el código de estado.

Contribuir

Haz un fork del repositorio.
Crea una rama para tu feature (git checkout -b feature/nueva-funcionalidad).
Realiza los cambios y haz commit (git commit -m 'Agregar nueva funcionalidad').
Sube los cambios (git push origin feature/nueva-funcionalidad).
Crea un Pull Request.

Licencia
Este proyecto está licenciado bajo la licencia ISC.
