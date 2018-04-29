export default {
  up: (query, DataTypes) => query.addColumn(
    'Users',
    'name',
    {
      type: DataTypes.TEXT,
    }
  ),

  down: query => query.removeColumn('Users', 'name')
}
