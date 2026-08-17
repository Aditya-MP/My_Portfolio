import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/* StrictMode is intentionally OFF.
 *
 * React 19 StrictMode mounts -> unmounts -> remounts every component. The
 * unmount disposes the WebGL context, and both @react-three/postprocessing and
 * drei's <Environment> can land their second mount on the dead one. That
 * produced two failures here: "Cannot read properties of null (reading
 * 'alpha')" from EffectComposer.addPass, and a race that left the canvas
 * showing an uncleared white buffer.
 *
 * Re-enable it only if the 3D scene is removed. */
createRoot(document.getElementById('root')).render(<App />)
