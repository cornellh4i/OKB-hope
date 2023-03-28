import React, { useRef, useState } from "react";
import { db } from "../../../backend/firebase/firebase";
import { collection, doc, addDoc, setDoc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";


const VideoChat: React.FC = () => {
  const webcamButton = useRef<HTMLButtonElement>(null);
  const callButton = useRef<HTMLButtonElement>(null);
  const answerButton = useRef<HTMLButtonElement>(null);
  const hangupButton = useRef<HTMLButtonElement>(null);

  const webcamVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const callInput = useRef<HTMLInputElement>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const servers = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  const pc = new RTCPeerConnection(servers);

  const setupMediaSources = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const remoteStream = new MediaStream();

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    setLocalStream(stream);
    setRemoteStream(remoteStream);

    if (webcamVideo.current) {
      webcamVideo.current.srcObject = stream;
    }

    if (remoteVideo.current) {
      remoteVideo.current.srcObject = remoteStream;
    }

    if (callButton.current && answerButton.current && webcamButton.current) {
      callButton.current.disabled = false;
      answerButton.current.disabled = false;
      webcamButton.current.disabled = true;
    }
  };

  const createOffer = async () => {
    const callDoc = doc(collection(db, 'calls'));
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    if (callInput.current) {
      callInput.current.value = callDoc.id;
    }

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDoc, { offer });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
    if (hangupButton.current) {
      hangupButton.current.disabled = false;
    }
  };

  const answerCall = async () => {
    const callId = callInput.current?.value;
    if (!callId) return;

    const callDoc = doc(db, 'calls', callId);
    const answerCandidates = collection(callDoc, 'answerCandidates');
    const offerCandidates = collection(callDoc, 'offerCandidates');

    pc.onicecandidate = (event) => {
      event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
    };

    const callDocSnapshot = await getDoc(callDoc);
    const callData = callDocSnapshot.data();

    if (!callData) return;

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    //create offer method as local description on peer connection
    // object contains sdp value (session description protocol)
    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type, // convert to ts object
      sdp: answerDescription.sdp, // convert to ts object
    };

    await updateDoc(callDoc, { answer }); // 

    onSnapshot(offerCandidates, (snapshot) => {
      const changes = snapshot.docChanges();
      changes.forEach((change) => {
        if (change.type === 'added') {
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  const hangupCall = () => {
    pc.close();

    if (webcamButton.current) {
      webcamButton.current.disabled = false;
    }

    if (callButton.current && answerButton.current && hangupButton.current) {
      callButton.current.disabled = true;
      answerButton.current.disabled = true;
      hangupButton.current.disabled = true;
    }

    if (callInput.current) {
      callInput.current.value = "";
    }

    setLocalStream(null);
    setRemoteStream(null);
    if (webcamVideo.current) {
      webcamVideo.current.srcObject = null;
    }

    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }
  };

  return (
    <div>
      <h1>Video Chat</h1>
      <video ref={webcamVideo} autoPlay muted playsInline></video>
      <video ref={remoteVideo} autoPlay playsInline></video>
      <button ref={webcamButton} onClick={setupMediaSources}>
        Start webcam
      </button>
      <div>
        <input
          ref={callInput}
          type="text"
          placeholder="Call ID"
        />
        <button ref={callButton} onClick={createOffer} disabled>
          Call
        </button>
        <button ref={answerButton} onClick={answerCall} disabled>
          Answer
        </button>
      </div>
      <button ref={hangupButton} onClick={hangupCall} disabled>
        Hangup
      </button>
    </div>
  );
};

export default VideoChat;
