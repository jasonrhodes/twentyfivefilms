'use client';

import { AdminAuthenticatedPage } from '@/components/AuthenticatedPage';
import { getAllUsers } from '@/lib/db';
import { useState, useEffect } from 'react';

export default function AuthAdminUserListPage({ params: asyncParams }) {
  return (
    <AdminAuthenticatedPage asyncParams={asyncParams}>
      {({ params, user, session, router }) => (
        <AdminUserListPage
          params={params}
          user={user}
          session={session}
          router={router}
        />
      )}
    </AdminAuthenticatedPage>
  );
}

function AdminUserListPage({ params, user, session, router }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function retreive() {
      const allUsers = await getAllUsers({ orderBy: [{ id: 'asc' }] });
      setUsers(allUsers);
    }
    retreive();
  }, []);

  return (
    <div>
      <h1>Admin Only: User List</h1>
      <ol className="list-decimal">
        {users.map((user) => (
          <li key={user.id}>
            ({user.id}) {user.username} | {user.role}
          </li>
        ))}
      </ol>
    </div>
  );
}
