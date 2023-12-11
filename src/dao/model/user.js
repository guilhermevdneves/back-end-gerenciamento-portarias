class User {
  constructor(data) {
    const {
      id,
      username,
      password,
      name,
      email,
      type,
    } = data;

    this.id = id;
    this.username = username;
    this.password = password;
    this.name = name;
    this.email = email;
    this.type = type;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      password: this.password,
      name: this.name,
      email: this.email,
      type: this.type,
    };
  }
}

module.exports = User;
