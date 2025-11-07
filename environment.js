//const HOST = '192.168.0.30';
const HOST = 'cyf-backend.onrender.com';

//https://cyf-backend.onrender.com

// THIS IS IF WE ARE RUNNING LOCALLY (http and port 3000)
//export const HOST_WITH_PORT = `http://${HOST}:3000`;


// this is if we are running on render (httpS and no port 3000)
export const HOST_WITH_PORT = `https://${HOST}`;
console.log("HOST_WITH_PORT", HOST_WITH_PORT);

export const DEV_FLAG = true;