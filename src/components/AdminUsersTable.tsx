type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  recipeTitles: string[];
};

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  return (
    <div className="admin-table-wrap">
      <table className="menu-table admin-table">
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Роль</th>
            <th>Сохраненные рецепты</th>
          </tr>
        </thead>
        <tbody>
          {users.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.name}</strong>
                <span>{item.email}</span>
              </td>
              <td>{item.role}</td>
              <td>{item.recipeTitles.length ? item.recipeTitles.join(", ") : "нет рецептов"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
