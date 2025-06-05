<?php
// Incluir la clase de conexión
require 'ConexionBD.php';

// Crear instancia de la clase ConexionBD
$conexion = new ConexionBD();

// Conectar a la base de datos
$conexion->conectar();

// Ejecutar una consulta
$sql = "SELECT * FROM notificaciones";
$resultado = $conexion->ejecutarConsulta($sql);

// Procesar resultados
if ($resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        var_dump($row);
    }
} else {
    echo "0 resultados";
}

// Desconectar
$conexion->desconectar();
?>
