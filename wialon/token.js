import { env } from '../config.js'

export const token = env.token;

window.getToken = getToken;
export async function getToken() {
    if (token == '') {
        const dns = "http://rastreo.jornadadigitalgps.com/";
        let url = dns + "/login.html";              // your site DNS + "/login.html"
        url += "?client_id=" + "JornadaDigital";    // your application name
        url += "&access_type=" + 0xffff;              // access level, 0x100 = "Online tracking only"
        url += "&activation_time=" + 0;              // activation time, 0 = immediately; you can pass any UNIX time value
        url += "&duration=" + 900000;                // duration, 604800 = one week in seconds
        url += "&flags=" + 0x1;                       // options, 0x1 = add username in response
        url += "&redirect_uri=" + dns + "/post_token.html"; // if login succeeds - redirect to this page

        // Retornar una nueva promesa
        return new Promise((resolve, reject) => {
            const _getToken = (event) => {
                const msg = event.data;
                if (typeof msg === "string" && msg.indexOf("access_token=") >= 0) {
                    const _token = msg.replace("access_token=", "");
                    window.removeEventListener("message", _getToken);
                    resolve(_token);  // Resuelve la promesa con el token
                }
            };

            window.addEventListener("message", _getToken);
            window.open(url, "_blank", "width=760, height=500, top=300, left=500");

            setTimeout(() => {
                window.removeEventListener("message", _getToken);
                reject(new Error("Timeout: no token received."));
            }, 30000); 
        });
    } else {
        return token;  
    }
}
