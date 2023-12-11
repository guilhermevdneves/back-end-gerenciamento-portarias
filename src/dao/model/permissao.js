class Permissao {
  constructor(data) {
    const {
      id, key, name, description, enabled, role,
    } = data;

    this.id = id;
    this.key = key;
    this.name = name;
    this.description = description;
    this.enabled = enabled;
    this.role = role;
  }

  toJSON() {
    return {
      id: this.id,
      key: this.key,
      name: this.name,
      description: this.description,
      enabled: this.enabled,
      role: this.role,
    };
  }
}

module.exports = Permissao;
