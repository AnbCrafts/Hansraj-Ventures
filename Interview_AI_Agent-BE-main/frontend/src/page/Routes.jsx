import { BrowserRouter, Route, Routes } from "react-router-dom";
import Join from "./Join/Join";
import Meeting from "./Meeting/Meeting";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Meeting />} />
				<Route path="/join" element={<Join />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
