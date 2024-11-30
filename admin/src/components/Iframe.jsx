import React from "react";

export default function Iframe() {
  return (
    <>
      <div style={{ width: "100%", height: "800px" }}>
        <iframe
          src="http://127.0.0.1:8050/"
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Dash App"
        />
      </div>
    </>
  );
}
