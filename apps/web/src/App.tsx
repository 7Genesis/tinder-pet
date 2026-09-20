// Definição das rotas do protótipo.
import { Route, Routes } from 'react-router-dom';
import { RequireRole, Shell } from './components/Shell';
import { AdopterFeed } from './screens/AdopterFeed';
import { Chat } from './screens/Chat';
import { Login } from './screens/Login';
import { Matches } from './screens/Matches';
import { OngFeed } from './screens/OngFeed';

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Login />} />
        <Route path="matches" element={<Matches />} />
        <Route path="matches/:matchId" element={<Chat />} />
        <Route element={<RequireRole role="adopter" />}>
          <Route path="adotante" element={<AdopterFeed />} />
        </Route>
        <Route element={<RequireRole role="ong" />}>
          <Route path="ong" element={<OngFeed />} />
        </Route>
      </Route>
    </Routes>
  );
}
