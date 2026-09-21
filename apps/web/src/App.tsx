// Definição das rotas do protótipo.
import { Route, Routes } from 'react-router-dom';
import { RequireRole, Shell } from './components/Shell';
import { AdopterFeed } from './screens/AdopterFeed';
import { Chat } from './screens/Chat';
import { Login } from './screens/Login';
import { Matches } from './screens/Matches';
import { NewPet } from './screens/NewPet';
import { OngFeed } from './screens/OngFeed';
import { ProfileForm } from './screens/ProfileForm';

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Login />} />
        <Route path="cadastro" element={<ProfileForm />} />
        <Route path="matches" element={<Matches />} />
        <Route path="matches/:matchId" element={<Chat />} />
        <Route element={<RequireRole role="adopter" />}>
          <Route path="adotante" element={<AdopterFeed />} />
          <Route path="adotante/perfil" element={<ProfileForm />} />
        </Route>
        <Route element={<RequireRole role="ong" />}>
          <Route path="ong" element={<OngFeed />} />
          <Route path="ong/pets/novo" element={<NewPet />} />
        </Route>
      </Route>
    </Routes>
  );
}
