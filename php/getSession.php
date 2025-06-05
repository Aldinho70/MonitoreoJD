<?php
require 'ConexionBD.php';

$conexion = new ConexionBD();
$conexion->conectar();

// Ejecutar una consulta
$sql = "SELECT * FROM session";
$resultado = $conexion->ejecutarConsulta($sql);

// Procesar resultados
$monitoristas = array();
if ($resultado->num_rows > 0) {
    while ($row = $resultado->fetch_assoc()) {
        $monitoristas[] = $row;
    }
}

// Devolver resultados como JSON
echo json_encode($monitoristas);

// Desconectar
$conexion->desconectar();
?>
