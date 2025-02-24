'use client';

import { AdminAuthenticatedPage } from '@/components/AuthenticatedPage';
import { getAllUsers } from '@/lib/db';
import { useState, useEffect } from 'react';
import { BasicTable } from '@/components/BasicTable';
import Link from 'next/link';
import { IconLink } from '@tabler/icons-react';

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

  const columns = [
    {
      key: 'id',
      label: 'ID',
      cellClasses: 'text-center'
    },
    {
      key: 'username',
      label: 'Username'
    },
    {
      key: 'role',
      label: 'Role'
    },
    {
      key: 'links',
      label: 'Rankings',
      cell: (row) => (
        <div>
          <Link
            className="text-blue-gray-800 hover:underline flex"
            href={`/admin/users/peek?username=${row.username}&ranking=all-time`}>
            <IconLink className="pt-1 mr-1" size={20} /> All Time
          </Link>
        </div>
      )
    }
  ];

  return (
    <div>
      <h1>Admin Only: User List</h1>
      <BasicTable
        columns={columns}
        rows={users}
        options={{ getRowKey: (row) => row.id }}
      />
    </div>
  );
}
