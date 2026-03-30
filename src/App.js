import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Box} from "@mui/material";
import Header from "./components/template/Header";
import HomePage from "./pages/HomePage";

export default function App()
{
  return (
    <BrowserRouter>
      <Box style={{display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden"}}>
        <Header />
        <Box style={{flex: 1, overflow: "hidden"}}>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}
