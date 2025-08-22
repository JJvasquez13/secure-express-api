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
git clone -b Dev https://github.com/JJvasquez13/secure-express-api
cd secure-express-api


Instalar dependencias:
npm install


Configurar variables de entorno:Crea un archivo .env en la raíz del proyecto con el siguiente contenido:
MONGO_URI=mongodb://localhost:27017/Security_JJ
JWT_SECRET=6a106c6b37e40ffbe031bc99a51f0f37a9dc231d91d2d68b3a80e0de7df2e6bf
FRONTEND_URL=http://localhost:3001
PORT=5002
NODE_ENV=development


MONGO_URI: URL de tu base de datos MongoDB.
JWT_SECRET: Clave secreta para firmar JWT (cámbiala por una más segura en producción).
FRONTEND_URL: URL del frontend que consumirá la API.
PORT: Puerto donde correrá el servidor.
NODE_ENV: development o production.


Crear directorio de logs:
mkdir logs


Iniciar MongoDB:Asegúrate de que MongoDB esté corriendo localmente (mongod) o configura MONGO_URI para una instancia en la nube.


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





Pruebas

Usa Postman o curl para probar los endpoints.
Accede a http://localhost:5000/api-docs para interactuar con la API mediante Swagger UI.
Ejemplo de solicitud protegida:
Inicia sesión para obtener un JWT.
Usa el token en la cookie para acceder a /users/profile.



Solución de Problemas

Error de conexión a MongoDB: Verifica que MongoDB esté corriendo y que MONGO_URI sea correcto.
Error de validación: Revisa los logs en logs/error.log para errores de validación.
Login falla: Asegúrate de que el email y la contraseña coincidan con los usados en el registro. Elimina y registra el usuario nuevamente si es necesario:mongo
use Security_JJ
db.users.deleteOne({ email: "vjuanjose@gmail.com" })
curl -X POST http://localhost:5000/auth/register \
-H "Content-Type: application/json" \
-d '{"username":"Juan","email":"vjuanjose@gmail.com","password":"juanjuan123"}'



Contribuir

Haz un fork del repositorio.
Crea una rama para tu feature (git checkout -b feature/nueva-funcionalidad).
Realiza los cambios y haz commit (git commit -m 'Agregar nueva funcionalidad').
Sube los cambios (git push origin feature/nueva-funcionalidad).
Crea un Pull Request.
