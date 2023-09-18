import { FilesetResolver, PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [file, setFile] = useState("https://assets.codepen.io/9177687/woman-g1af8d3deb_640.jpg");
  const runningMode = "IMAGE";

  console.log("data", data);

  const handleChange = (e) => {
    const canvas = document.getElementById("canvas");
    if (canvas) {
      canvas.remove();
      setData(null);
    }
    console.log(e.target.files);
    setFile(URL.createObjectURL(e.target.files[0]));
  }

  const runMod = async () => {
    document.getElementById("load").style.visibility = "visible";
    if (data) {
      alert("results already added for current image");
      document.getElementById("load").style.visibility = "hidden";
      return;
    }
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );
  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: "GPU"
    },
    runningMode: runningMode,
    numPoses: 2
  });
  const image = document.getElementById("image");
  poseLandmarker.detect(image);
  const event = { target: image };

  poseLandmarker.detect(event.target, async (result) => {
    setData(result);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("id", "canvas");
    canvas.setAttribute("width", event.target.naturalWidth + "px");
    canvas.setAttribute("height", event.target.naturalHeight + "px");
    canvas.style =
      "left: 0px;" +
      "top: 0px;" +
      "width: " +
      event.target.width +
      "px;" +
      "height: " +
      event.target.height +
      "px;";

    event.target.parentNode.appendChild(canvas);
    const canvasCtx = canvas.getContext("2d");
    const drawingUtils = new DrawingUtils(canvasCtx);
    for (const landmark of result.landmarks) {
      drawingUtils.drawLandmarks(landmark, {
        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)
      });
      drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    }
    document.getElementById("load").style.visibility = "hidden";
  });
  }



  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", textAlign: "center" }}>
       <div>
        <h2>Add Image</h2>
        <input type="file" onChange={handleChange} />
       </div>
          <div style={{ display: "flex", width: "100%", height: "520px", margin: "0 auto", position: "relative", justifyContent: "center" }}>
            <img id="image" src={file} style={{ objectFit: "fill", position: "absolute", zIndex: "-1", maxHeight: "500px", maxWidth: "600px" }} crossOrigin="anonymous" title="Click to get detection!" />
          </div>
     <div>
     <button onClick={runMod} style={{ cursor: "pointer" }}>Run Detect</button>
     </div>

     <div id="load" style={{ position: "absolute", top: "0", left: "0", right: "0", bottom: "0", backgroundColor: "#d4c5c555", display: "flex", justifyContent: "center", alignItems: "center" }}>
       <span style={{ backgroundColor: "white", padding: "10px", borderRadius: "6px" }}>Please wait, loading data...</span>
     </div>
    </div>
  )
}

export default App;