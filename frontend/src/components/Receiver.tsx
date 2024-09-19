import { useEffect } from "react";

export const Receiver = () => {
    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        const pc = new RTCPeerConnection();

        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: "receiver",
            }))
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if(message.type === 'create-offer') {
                pc.setRemoteDescription(message.sdp);
                pc.onicecandidate = (event) => {
                    if(event.candidate) {
                        socket.send(JSON.stringify({
                            type: "ice-candidate",
                            candidate: event.candidate,
                        }))
                    }
                }
                
                pc.ontrack = (event) => {
                    const video = document.createElement("video");
                    video.srcObject = new MediaStream([event.track]);
                    document.body.appendChild(video);
                    video.controls = true;
                }

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({
                    type: "create-answer",
                    sdp: pc.localDescription,
                }))
            } else if(message.type === 'ice-candidate') {
                pc.addIceCandidate(message.candidate);
            }
        }
    }, [])

    return <div>
        receiver
    </div>
}