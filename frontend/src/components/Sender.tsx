import { useEffect, useState } from "react"

export const Sender = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: "sender",
            }))
        }
    }, [])

    const sendVideoToReceiver = async () => {
        if(!socket) {
            console.log("insider vidfa");
            return;
        }
        
        const pc = new RTCPeerConnection();
        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.send(JSON.stringify({
                type: 'create-offer',
                sdp: pc.localDescription,
            }))
        }

        pc.onicecandidate = (event) => {
            if(event.candidate) {
                socket.send(JSON.stringify({
                    type: "ice-candidate",
                    candidate: event.candidate,
                }))
            }
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);

            if(message.type === 'create-answer') {
                pc.setRemoteDescription(message.sdp);
            } else if(message.type === 'ice-candidate') {
                pc.addIceCandidate(message.candidate);
            }
        }

        const stream = navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })

        pc.addTrack((await stream).getVideoTracks()[0]);
    }

    return <div>
        sender
        <button onClick={sendVideoToReceiver}>send video</button>
    </div>
}