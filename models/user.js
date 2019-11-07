'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    image: DataTypes.STRING
  }, {});
  User.associate = function (models) {
    User.hasMany(models.Comment)
    User.belongsToMany(models.Restaurant, { // 多對多關係
      through: models.Favorite,
      foreignKey: 'UserId',
      as: 'FavoritedRestaurants'
    })
    User.belongsToMany(models.Restaurant, { // 多對多關係
      through: models.Like,
      foreignKey: 'UserId',
      as: 'LikedRestaurants'
    })
  };
  return User;
};