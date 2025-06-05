export function loadLibraries(conexion) {
    conexion.loadLibrary("itemIcon"); 
    conexion.loadLibrary("itemCustomFields");
    conexion.loadLibrary("unitSensors");
    conexion.loadLibrary("unitGroups");
    conexion.loadLibrary("resourceAccounts");
    conexion.loadLibrary("resourceReports");
    conexion.loadLibrary("resourceNotifications");
    conexion.loadLibrary("resourceZones");
}
