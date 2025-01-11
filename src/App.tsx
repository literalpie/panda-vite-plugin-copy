import { useState } from "react";
import { css } from "../styled-system/css";
import { a, b, c, d } from "./test";

console.log("a", a, "b", b, "c", c, "d", d);
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  // test!!!!
  return (
    <>
      <div
        className={css({
          display: "flex",
          justifyContent: "center",
          backgroundColor: "pink",
        })}
      >
        blue blue
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
