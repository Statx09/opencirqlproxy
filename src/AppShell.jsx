import React from "react";
import LandingPage from "./LandingPage";
import { useUser } from "./hooks/useUser";

export default function AppShell() {
  const { user, login, logout } = useUser();

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <LandingPage
      user={user}
      onLogin={login}
      onLogout={logout}
    />
  );
}