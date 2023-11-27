const listStatus = require('./status.json')
const getStatus = (code) => {
    // console.log(listStatus)
    let result = {};
    let temp = null;
    for (const key in listStatus) {
        if(listStatus[key].code==code){
            temp = key
        }
    }
    if(temp){
        result = {
            msg: listStatus[temp].msg,
            code: listStatus[temp].code
        };
    }
    else{
        result = {
            msg: listStatus[0].msg,
            code: listStatus[0].code
        };
    }
    // console.log(result)
    return result
}

exports.getStatus = getStatus;