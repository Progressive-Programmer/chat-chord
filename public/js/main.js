const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL 
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix:true
});

const socket = io();

//  Join chatroom

socket.emit('joinRoom', {username, room})

// Get room and users
socket.on('roomUsers', ({room, users})=> {
    outputRoomName(room);
    outputUsers(users); 
})

socket.on('message', message=>{
    console.log(message)
    // const divElement = document.createElement('div');
    // divElement.setAttribute('class', 'message');

    // const text = document.createTextNode(message)
    // divElement.appendChild(text)
    // console.log(divElement)
    // const msgBox = document.querySelector('.chat-messages');
    // msgBox.append(divElement)
    // console.log(msgBox)

    // ========== Vanilla Javascript ============
    outputMessage(message)

    //  Scroll down 
    chatMessage.scrollTop = chatMessage.scrollHeight;
})

chatForm.addEventListener('submit', (e)=> {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    // Emitting a message to server
    socket.emit('chatMessage',msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});


// output message to DOM 

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML =`<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
    ${message.text}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);
}

//  Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `${users.map(user=> `<li>${user.username}</li>`).join('')}`
}