
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import PlatoonBattleSimulator from './PlatoonBattleSimulator';

function App() {
  return (
    <div className="App">
      <h1>Click to continue</h1>
       <BrowserRouter>
       <Routes>
        <Route path='/war' element={<PlatoonBattleSimulator/>}></Route>
       </Routes>
       </BrowserRouter>
    </div>
  );
}

export default App;
