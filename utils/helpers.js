let users = [];

// Join user to chat
function userJoin({ id, name, room }) {
  const user = { id, name, room };

  let alreadypresent = false;
  users.forEach((user) => {
    if (user.name === name && user.room === room) {
      alreadypresent = true;
    }
  });
  if (!alreadypresent) {
    users.push({ ...user, online: true });
  }

  return user;
}
// Get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

function fetchUsersWithSocketId(id) {
  let x = [];
  users.forEach((user, index) => {
    console.log("user to delete", user);
    console.log("socket id", id);
    if (user.id === id) {
      x.push(user);
      users.splice(index, 1);
    }
  });
  return x;
}
function toggleUserStatus(inputuser, status) {
  users.forEach((user) => {
    if (inputuser.id === user.id) {
      user["online"] = status;
    }
  });

  return users;
}

module.exports = {
  userJoin,
  getRoomUsers,
  getCurrentUser,
  users,
  fetchUsersWithSocketId,
  toggleUserStatus,
};
