import "./App.css";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
  createCameraVideoTrack,
} from "@videosdk.live/react-sdk";
import { authToken, createMeeting } from "./API";
import ReactPlayer from "react-player";

function JoinScreen({ getMeetingAndToken }) {
  const [meetingId, setMeetingId] = useState(null);
  const onClick = async () => {
    await getMeetingAndToken(meetingId);
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Enter Meeting Id"
        onChange={(e) => {
          setMeetingId(e.target.value);
        }}
      />
      <button onClick={onClick}>Join</button>
      {" or "}
      <button onClick={onClick}>Create Meeting</button>
    </div>
  );
}

function ParticipantView(props) {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(props.participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div key={props.participantId}>
      <p>
        Participant: {displayName} | Webcam: {webcamOn ? "ON" : "OFF"} | Mic:{" "}
        {micOn ? "ON" : "OFF"}
      </p>
      <audio ref={micRef} autoPlay muted={isLocal} />
      {webcamOn && (
        <ReactPlayer
          //
          playsinline // very very imp prop
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          //
          url={videoStream}
          //
          height={"200px"}
          width={"300px"}
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
      )}
    </div>
  );
}

function Controls({ setFacingMode, facingMode }) {
  // const mMeetingRef = useRef();

  const { leave, toggleMic, changeWebcam, disableWebcam, enableWebcam } =
    useMeeting();

  // const mMeeting = useMeeting({});

  // useEffect(() => {
  //   mMeetingRef.current = mMeeting;
  // }, [mMeeting]);

  const toggleCam = async () => {
    try {
      disableWebcam();
      let willbeFacingMode = facingMode === "user" ? "environment" : "user";
      console.log("Fetching facing mode", { willbeFacingMode, facingMode });

      const track = await createCameraVideoTrack({
        facingMode: willbeFacingMode,
      });

      if (track) {
        console.log("Setting Track....", track);
        enableWebcam(track);
        setFacingMode((prevMode) =>
          prevMode === "user" ? "environment" : "user"
        );
      } else {
        console.error("TRACK NOT FOUND");
      }
    } catch (err) {
      console.error("Something went wrong while getting camera track", err);
    }
  };

  return (
    <div>
      {/* <button onClick={() => leave()}>Leave</button> */}
      {/* <button onClick={() => toggleMic()}>toggleMic</button> */}
      <button onClick={() => toggleCam()}>toggleWebcam</button>
    </div>
  );
}

function MeetingView(props) {
  const [joined, setJoined] = useState(null);
  const { join } = useMeeting();
  const { participants } = useMeeting({
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
    onMeetingLeft: () => {
      props.onMeetingLeave();
    },
  });
  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  return (
    <div className="container">
      <h3>Meeting Id: {props.meetingId}</h3>
      {joined && joined == "JOINED" ? (
        <div>
          <Controls
            setFacingMode={props.setFacingMode}
            facingMode={props.facingMode}
          />
          {[...participants.keys()].map((participantId) => (
            <ParticipantView
              participantId={participantId}
              key={participantId}
            />
          ))}
        </div>
      ) : joined && joined == "JOINING" ? (
        <p>Joining the meeting...</p>
      ) : (
        <button onClick={joinMeeting}>Join</button>
      )}
    </div>
  );
}

function App() {
  const [meetingId, setMeetingId] = useState(null);
  // const [track, setTrack] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  const getMeetingAndToken = async (id) => {
    const meetingId =
      id == null ? await createMeeting({ token: authToken }) : id;
    setMeetingId(meetingId);
  };

  const onMeetingLeave = () => {
    setMeetingId(null);
  };

  // useEffect(() => {
  //   async function fetchTrack() {
  //     const track = await createCameraVideoTrack({ facingMode: "user" });
  //     console.log("Setting Track.... in app", track);
  //     setTrack(track);
  //     setFacingMode("user");
  //   }
  //   fetchTrack();
  // }, []);

  console.log("facingMode", facingMode);

  return authToken && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: false,
        webcamEnabled: true,
        name: "C.V. Raman",
      }}
      token={authToken}
    >
      <MeetingConsumer>
        {() => (
          <MeetingView
            meetingId={meetingId}
            onMeetingLeave={onMeetingLeave}
            setFacingMode={setFacingMode}
            facingMode={facingMode}
          />
        )}
      </MeetingConsumer>
    </MeetingProvider>
  ) : (
    <JoinScreen getMeetingAndToken={getMeetingAndToken} />
  );
}

export default App;
