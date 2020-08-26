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
Este proyecto también trabaja con XAMPP. De no tenerlo, se lo puede descargar e instalar de https://www.apachefriends.org/es/index.html
En el panel de control de este sistema, se requiere que los módulos Apache y MySQL esten activados para poder operar con la base de datos.
### 3. Configuración de datos de conexión a la base de datos
En el archivo config.js de la carpeta db se encuentran los datos de conexión a la base de datos. De ser necesario, pueden ser editados en ese archivo. Estos son:
```
NAME = 'delilahresto';    // database name
USER = 'root';            // user name
PASSWORD = '';            // password
HOST = 'localhost';       // host
PORT = '3306';            // database port number
```
