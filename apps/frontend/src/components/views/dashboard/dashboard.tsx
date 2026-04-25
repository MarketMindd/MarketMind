import React from 'react';

export const Dashboard: React.FC = () => {
  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/signin';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
      <p className="text-muted-foreground mt-2">You are successfully logged in.</p>
      <button
        onClick={handleSignOut}
        className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Sign Out
      </button>
    </div>
  );
};
