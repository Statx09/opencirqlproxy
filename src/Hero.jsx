export default function Hero() {
  return (
    <div className="hero">
      <h1>Welcome to Cirql</h1>
      <iframe
        src="https://meet.jit.si/YourRoomName"
        allow="camera; microphone; fullscreen; display-capture"
        style={{ width: "100%", height: "500px", border: "0" }}
      />
    </div>
  );
}
