const genereateMessage = (username, text)=>{
    return {
        text, 
        createdAt : new Date().getTime(),
        username : username
    }    
}

const genereateLocationMessage = (username, url)=>{
    return {
        url, 
        createdAt : new Date().getTime(),
        username
    }    
}

module.exports = {
    genereateMessage,
    genereateLocationMessage
}