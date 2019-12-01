const socket = io()

// elements 
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages");


//templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML


const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix : true})

const autoScroll = ()=>{
    // New Message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far I have to scroll
    const scrollOffset = $messages.scrollTop + visibleHeight
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight 
    }

}
socket.on('welcome', (msg)=>{
    console.log(msg)
})
//locationMessage
socket.on('locationMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        url : message.url,
        createdAt : moment(message.createdAt).format("h:mm a"),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
socket.on('message', (message)=>{
    
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message : message.text,
        createdAt : moment(message.createdAt).format("h:mm a"),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on("roomData", ({room, users})=>{
 
    const html = Mustache.render(sideBarTemplate, {
        room, 
        users
    })
    document.querySelector("#sidebar").innerHTML = html

})

$messageForm.addEventListener("submit", (e)=>{
    e.preventDefault()
    //disable
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value

    socket.emit("sendMessage", message, (error)=>{
        //Enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log("Message delievered!")
    })

})

$locationButton.addEventListener("click", ()=>{
    if(!navigator.geolocation){
        return alert("Geolocation is not Supported by your browser!")
    }
    $locationButton.setAttribute("disabled", "disabled")

    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit("sendLocation", {
            latitude :position.coords.latitude,
            longitude : position.coords.longitude
        }, ()=>{
            
            console.log("Location Shared!")
        })

        $locationButton.removeAttribute("disabled")
    })
})

socket.emit("join", {
    username,
    room
}, (error)=>{
    if(error){
        alert(error)
        location.href= "/"
    }

})