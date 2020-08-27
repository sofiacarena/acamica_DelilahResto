# Delilah Restó
Este es el Backend de Delilah Restó, tercer proyecto del curso de Desarrollo Web Full Stack(DWFS) de Acamica.

## Instalación
### 1. Node.js
Para la ejecución de este proyecto es necesario tener node.js instalado. De no ser así, se lo puede descargar e instalar de https://nodejs.org/es/download/.

#### 1.1 Instalación de paquetes
Previa instalación de node.js y de los archivos de este proyecto, las dependencias se instalan con el siguiente comando:
```
npm install
```

Verifique que cualquier comando se haga teniendo la carpeta raíz del proyecto como current directory.
### 2. XAMPP
Este proyecto también trabaja con XAMPP. De no tenerlo, se lo puede descargar e instalar de https://www.apachefriends.org/es/index.html.
En el panel de control de este sistema, se requiere que los módulos Apache y MySQL esten activados para poder operar con la base de datos.
### 3. Configuración de datos de conexión a la base de datos
En el archivo **config.js** de la carpeta **db** se encuentran los datos de conexión a la base de datos. De ser necesario, pueden ser editados en ese archivo. Estos son:
```
NAME = 'delilahresto';    // nombre de la base de datos
USER = 'root';            // usuario
PASSWORD = '';            // contraseña
HOST = 'localhost';       // host
PORT = '3306';            // numero del puerto
```
### 4. Instalación de base de datos
Acceder a http://localhost/phpmyadmin/ desde el navegador para poder crear la base de datos. 
En el panel de la izquierda, se debe seleccionar "Nueva" y en la sección que se abre crear una nueva base de datos con el nombre que se encuentra en el archivo **config.js**, mencionado en el paso anterior.
#### 4.1 Comando para crear las tablas
```
node db/tables.js
```
#### 4.2 Comando para crear dos usuarios admin
```
node db/user_admin.js
```
Los datos para poder acceder con los usuarios admin son:
```
Admin 1
  {
    username: "SuperAdmin",
    password: "pass"
  }
Admin 2
  {
    username: "SuperAdmin2",
    password: "pass"
  }
```
#### 4.3 Comando para crear cuatro productos (opcional)
```
node db/products.js
```
## Documentación 
Para más información sobre como interactuar con los endpoints de este proyecto, remitirse a la documentación que se encuentra en el archivo **spec.yaml** y puede abrirse en [Swagger Editor](https://editor.swagger.io/)
