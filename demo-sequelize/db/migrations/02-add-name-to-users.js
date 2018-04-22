export default {
  up: async (query, DataTypes) => query.addColumn(
    'Users',
    'name',
    {
      type: DataTypes.TEXT,
    }
  ),

  down: async query => query.removeColumn('Users', 'name')
}
