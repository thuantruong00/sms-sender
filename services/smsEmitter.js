const axios = require("axios")
const EventEmitter = require('events');
const { SerialPort } = require('serialport');
const { Readline } = require('@serialport/parser-readline');
const { autoDetect } = require('@serialport/bindings-cpp')
const status = require("./status")
const config = require("../config.json");
const { path } = require("express/lib/application");

// setup
// sms sender status
// is_active_sender==true message-sender is not busy
let is_active_sender = true;
// let response_code = "1003";
let sms_id;
let info_arr = []
const port_name = config.port_name;
let port;
// axios
axios.defaults.baseURL = config.base_url;
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/json';


try {
    if(port_name.length>1){
        port = new SerialPort({
            path: port_name,
            baudRate: 115200,
        })
    }

} catch (error) {
    console.log(error)
}



//  |||||   |||||   |||||   |||||   |||||
//      |||||   |||||   |||||   |||||


const init = async () => {
    // console.log("init")
    // check and load config
    if (config.port_name.length < 1) {
        console.log("port_name: empty")
    }
    else {
        console.log("port_name: ", port_name);
        if (config.hotline.length > 1) {
            sendMessage({ id: "root", phone_number: config.hotline, text_content: "root, load config, test sms" })
        }

    }

}
const sendMessage = async (data) => {
    console.log("send message", data)
    // console.log(data)
    try {
        if (is_active_sender) {
            if(data.phone_number.length>9 && data.id.length>0 && data.text_content.length>0){
                console.log("port.write")
                is_active_sender = false;
                sms_id = data.id
                // Send AT command to set SMS text mode
                port.write('AT+CMGF=1\r\n');
                // response_code = "1006"
                // Wait for a moment before sending the actual SMS
                setTimeout(() => {
                    // Send SMS command, AT+CMGS="<phone-number>"\r\n
                    port.write(`AT+CMGS="${data.phone_number}"\r\n`);
                    // response_code = "1008"
    
                    // Wait for the module to respond with '>'
                    setTimeout(() => {
                        // Send the SMS text, replace 'Hello, World!' with your message
                        port.write(`${data.text_content}\x1A`);
                    }, 1000);
                }, 1000);
            }
            else{
                responseStatus({ ...status.getStatus("1009"), payload: { status: false, id: data.id } })
                return;
            }

        }
        else {
            responseStatus({ ...status.getStatus("1004"), payload: { status: false, id: data.id } })
            return;
        }
        console.log("processing")
        return;
    } catch (error) {
        console.log("error at trycatch sendMessage")
        console.log(error)
        responseStatus({ ...status.getStatus("1003"), payload: { status: false, id: data.id } })
        return;
    }
}




const getInfo = async () => {
    console.log("getInfo");
    try {
        if (is_active_sender) {
            port.write('AT+CSQ\r\n');
            port.write('AT+CPSI?\r\n');

        } else {
            return { ...status.getStatus("1004"), payload: { status: false } }
        }
    } catch (error) {
        console.log(error)
        return { ...status.getStatus("1001"), payload: { status: false } }
    }
}
const delayGetInfo = async () => {
    console.log('delayGetInfo')
    return new Promise(resolve => {
        setTimeout(() => {
            try {
                let csq_str = info_arr[0].toString();
                // console.log(csq_str)
                csq_str = csq_str.replaceAll('\r', "")
                // console.log(csq_str)
                let cpsi_str = info_arr[1]
                cpsi_str = cpsi_str.replaceAll('\r', "")
                let csq_temp = csq_str.split("\n")[1]
                csq_temp = csq_temp.split(" ")[1]
                csq_temp = csq_temp.split(",")
                let cpsi_temp = cpsi_str.split("\n")[1]
                cpsi_temp = cpsi_temp.split(" ")[1]
                cpsi_temp = cpsi_temp.split(",")
                // console.log(csq_temp)
                resolve(
                    {
                        ...status.getStatus("1020"), payload: {
                            status: true,
                            CSQ: {
                                RSSI: csq_temp[0],
                                BER: csq_temp[1]
                            },
                            CPSI: {
                                standard: cpsi_temp[0],
                                status: cpsi_temp[1],
                                country_code_netword_code: cpsi_temp[2],
                                TAC: cpsi_temp[3],
                                cell_id: cpsi_temp[4],
                                EARFCN: cpsi_temp[5],
                                eutrand: cpsi_temp[6],
                                eutrand_bandwidth: cpsi_temp[7],
                                PCI_TAC: cpsi_temp[8],
                                RSRP_RSRQ_SINR: cpsi_temp[9],
                                SCCS: cpsi_temp[1]
                            }
                        }
                    })
            } catch (error) {
                resolve({ ...status.getStatus("1021"), payload:{status:false}})
            }

        }, 1500);
    })
}
const scanPort = async () => {
    console.log("scanPort");
    try {
        let list = await SerialPort.list()
        // console.log(list)
        return { ...status.getStatus("1020"), payload: { status: true, list: list } };

    } catch (error) {
        console.log(error)
        return { ...status.getStatus("1021"), payload: { status: false } }
    }
}
const test = async () => {
    console.log("getInfoxxx");
    responseStatus({ ...status.getStatus("1004") })
    try {
        if (is_active_sender) {
            // port.write('AT+CPIN?\r\n');
            // port.write("AT+CGREG?\r\n")
            // port.write('AT+CPSI?\r\n');
            // port.write("AT+CFUN=1\r\n")

        } else {
            return { ...status.getStatus("1004"), payload: { status: false } }
        }
    } catch (error) {
        console.log(error)
        return { ...status.getStatus("1001"), payload: { status: false } }
    }
}


try {
if(port_name.length>1){
    port.on('data', function (data) {
        // console.log("on.serial-port: ")
        // console.log(data)

        const received_buffer = Buffer.from(data, 'hex');
        const decoded_string = received_buffer.toString('ascii');
        const regex = /\+CMGS:/g;
        const regex_ok = /OK/g;
        const regex_cms_err = /\+CMS ERROR/g;
        const regex_csq = /\+CSQ:/g;
        const regex_cpsi = /\+CPSI:/g;

        console.log(decoded_string)
        if (!is_active_sender) {
            if (decoded_string.match(regex_cms_err)) {
                reset_var();
                responseStatus({ ...status.getStatus("1003"), payload: { status: false, id: sms_id } })
            }
            if (decoded_string.match(regex)) {
                if (decoded_string.match(regex_ok)) {
                    reset_var();
                    responseStatus({ ...status.getStatus("1002"), payload: { status: true, id: sms_id } })
                }
            }
        }
        else {
            if (decoded_string.match(regex_csq)) {
                info_arr[0] = decoded_string
            }
            if (decoded_string.match(regex_cpsi)) {
                info_arr[1] = decoded_string
            }
        }
    })
}
}
catch (error) {
    console.log("try catch error, send message failure")
    console.log(error)
}


function reset_var() {
    is_active_sender = true;
    // console.log("is_active_sender ", is_active_sender)

}
const responseStatus = async (data) => {
    console.log('send status...', data)
    let path = '';
    // console.log(check.body)
    try {
        path = "webhook/sms/"+data.payload.id
        console.log(path)
        let check = await axios.get(path, {data:data})
        console.log(check.data)
    } catch (error) {
        console.log("error cannot send to ",path)
        // console.log(error)
    }
    return;
}



exports.init = init;
exports.test = test;
exports.getInfo = getInfo;
exports.delayGetInfo = delayGetInfo;
exports.scanPort = scanPort;
exports.sendMessage = sendMessage;
